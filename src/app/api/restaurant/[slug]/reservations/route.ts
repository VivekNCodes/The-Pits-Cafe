import { NextRequest, NextResponse } from 'next/server';
import { RestaurantService } from '@/lib/services/restaurant.service';
import { ReservationService } from '@/lib/services/reservation.service';
import { AdminAuth } from '@/lib/auth';

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
    const date = searchParams.get('date');
    const time = searchParams.get('time');
    const guests = searchParams.get('guests');

    // 1. Availability check query for customer booking flow
    if (date && time && guests) {
      const guestCount = parseInt(guests, 10) || 2;
      const availableTables = await ReservationService.getAvailableTables(
        restaurant.id,
        date,
        time,
        guestCount
      );
      return NextResponse.json({ availableTables });
    }

    // 2. Admin reservation listing
    if (!AdminAuth.isAdminAuthenticated(params.slug)) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const reservations = await ReservationService.listReservations(restaurant.id, date || undefined);
    return NextResponse.json(reservations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const restaurant = await RestaurantService.getBySlug(params.slug);
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    if (!restaurant.reservationsEnabled) {
      return NextResponse.json({ error: 'Table reservations are currently closed for this restaurant.' }, { status: 403 });
    }

    const body = await request.json();
    const { tableId, customerName, customerPhone, customerEmail, guestCount, reservationDate, startTime, specialRequest } = body;

    if (!tableId || !customerName || !customerPhone || !reservationDate || !startTime) {
      return NextResponse.json({ error: 'All reservation details (Table, Name, Phone, Date, Time) are required' }, { status: 400 });
    }

    const reservation = await ReservationService.createReservation(restaurant.id, {
      tableId,
      customerName,
      customerPhone,
      customerEmail,
      guestCount: parseInt(guestCount, 10) || 2,
      reservationDate,
      startTime,
      specialRequest,
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Reservation failed' }, { status: 400 });
  }
}
