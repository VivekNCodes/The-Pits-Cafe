import { NextRequest, NextResponse } from 'next/server';
import { RestaurantService } from '@/lib/services/restaurant.service';
import { BillingService } from '@/lib/services/billing.service';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const restaurant = await RestaurantService.getBySlug(params.slug);
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const { items, couponCode } = await request.json();
    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'items array is required' }, { status: 400 });
    }

    const bill = await BillingService.calculateBill(restaurant.id, items, couponCode);
    return NextResponse.json(bill);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Billing calculation error' }, { status: 400 });
  }
}
