import { NextRequest, NextResponse } from 'next/server';
import { RestaurantService } from '@/lib/services/restaurant.service';
import { TableService } from '@/lib/services/table.service';
import { ReservationService } from '@/lib/services/reservation.service';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const restaurant = await RestaurantService.getBySlug(params.slug);
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const { tableSlug, customerName, customerPhone } = await request.json();
    if (!tableSlug) {
      return NextResponse.json({ error: 'tableSlug is required' }, { status: 400 });
    }

    const table = await TableService.getTableBySlug(restaurant.id, tableSlug);
    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    // Check if table QR is active
    if (!table.qrCode || !table.qrCode.isActive) {
      return NextResponse.json({
        error: 'This table QR is currently inactive. Please ask restaurant staff for assistance.',
        inactive: true,
      }, { status: 403 });
    }

    // Start or restore table session
    const session = await TableService.getOrCreateTableSession(
      restaurant.id,
      table.id,
      customerName,
      customerPhone
    );

    // Check if there is an active reservation for this table today (Section 33 connection)
    const linkedReservation = await ReservationService.findActiveReservationForTable(
      restaurant.id,
      table.id
    );

    return NextResponse.json({
      session,
      table: {
        id: table.id,
        tableNumber: table.tableNumber,
        slug: table.slug,
        capacity: table.capacity,
        location: table.location,
      },
      reservation: linkedReservation
        ? {
            id: linkedReservation.id,
            guestName: linkedReservation.customerName,
            time: linkedReservation.startTime,
            status: linkedReservation.status,
          }
        : null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 400 });
  }
}
