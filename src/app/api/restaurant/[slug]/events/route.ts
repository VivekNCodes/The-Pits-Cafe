import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: params.slug },
  });

  if (!restaurant) {
    return new Response('Restaurant not found', { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId'); // Optional: listen for single order updates

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let isClosed = false;

      // Send initial heartbeat
      controller.enqueue(encoder.encode(`event: connected\ndata: ${JSON.stringify({ timestamp: Date.now() })}\n\n`));

      const intervalId = setInterval(async () => {
        if (isClosed) return;

        try {
          if (orderId) {
            // Poll specific order
            const order = await prisma.order.findUnique({
              where: { id: orderId },
              include: { orderItems: true, table: true },
            });
            if (order) {
              controller.enqueue(encoder.encode(`event: orderUpdate\ndata: ${JSON.stringify(order)}\n\n`));
            }
          } else {
            // General admin stream: recent active orders count and latest order
            const activeOrders = await prisma.order.findMany({
              where: {
                restaurantId: restaurant.id,
                status: { in: ['PENDING', 'ACCEPTED', 'PREPARING', 'READY'] },
              },
              orderBy: { createdAt: 'desc' },
              take: 5,
              include: { orderItems: true, table: true },
            });

            controller.enqueue(encoder.encode(`event: liveOrders\ndata: ${JSON.stringify(activeOrders)}\n\n`));
          }
        } catch (e) {
          // Stream error or client disconnected
        }
      }, 3000); // 3-second heartbeat pulse

      request.signal.addEventListener('abort', () => {
        isClosed = true;
        clearInterval(intervalId);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
