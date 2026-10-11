import { NextRequest, NextResponse } from 'next/server';
import { RestaurantService } from '@/lib/services/restaurant.service';
import { OrderService } from '@/lib/services/order.service';
import { AdminAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; orderId: string } }
) {
  try {
    const restaurant = await RestaurantService.getBySlug(params.slug);
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const order = await OrderService.getOrderDetails(restaurant.id, params.orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string; orderId: string } }
) {
  try {
    const restaurant = await RestaurantService.getBySlug(params.slug);
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const body = await request.json();
    const { status, paymentStatus, note } = body;

    // Check if updating payment status
    if (paymentStatus === 'PAID_AT_COUNTER') {
      if (!AdminAuth.isAdminAuthenticated(params.slug)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      await OrderService.markPaymentPaid(restaurant.id, params.orderId);
    }

    // Check if updating order preparation status
    if (status) {
      if (!AdminAuth.isAdminAuthenticated(params.slug)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const updated = await OrderService.updateOrderStatus(
        restaurant.id,
        params.orderId,
        status,
        'Staff',
        note
      );
      return NextResponse.json(updated);
    }

    const refreshed = await OrderService.getOrderDetails(restaurant.id, params.orderId);
    return NextResponse.json(refreshed);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Update failed' }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string; orderId: string } }
) {
  try {
    const restaurant = await RestaurantService.getBySlug(params.slug);
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const reason = searchParams.get('reason') || 'Cancelled by customer';

    const cancelled = await OrderService.cancelOrderByCustomer(
      restaurant.id,
      params.orderId,
      reason
    );
    return NextResponse.json(cancelled);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Cancellation rejected' }, { status: 400 });
  }
}
