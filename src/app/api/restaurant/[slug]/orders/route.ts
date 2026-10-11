import { NextRequest, NextResponse } from 'next/server';
import { RestaurantService } from '@/lib/services/restaurant.service';
import { OrderService } from '@/lib/services/order.service';
import { AdminAuth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const restaurant = await RestaurantService.getBySlug(params.slug);
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const body = await request.json();
    const order = await OrderService.createOrder({
      restaurantId: restaurant.id,
      ...body,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to place order' }, { status: 400 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const restaurant = await RestaurantService.getBySlug(params.slug);
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const email = searchParams.get('email');
    const status = searchParams.get('status') || undefined;

    // Customer history query
    if (phone || email) {
      const history = await OrderService.getCustomerHistory(restaurant.id, (phone || email)!);
      return NextResponse.json(history);
    }

    // Admin order listing
    if (!AdminAuth.isAdminAuthenticated(params.slug)) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const orders = await OrderService.listAdminOrders(restaurant.id, status);
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
