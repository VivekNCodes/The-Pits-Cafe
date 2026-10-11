import { NextRequest, NextResponse } from 'next/server';
import { RestaurantService } from '@/lib/services/restaurant.service';
import { ReservationService } from '@/lib/services/reservation.service';
import { AdminAuth } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string; reservationId: string } }
) {
  try {
    if (!AdminAuth.isAdminAuthenticated(params.slug)) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const restaurant = await RestaurantService.getBySlug(params.slug);
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const { status } = await request.json();
    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const updated = await ReservationService.updateStatus(params.reservationId, status);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
