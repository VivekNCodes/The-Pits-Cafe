import prisma from '@/lib/prisma';

export interface AvailableTableOption {
  id: string;
  tableNumber: string;
  slug: string;
  capacity: number;
  location: string;
}

export class ReservationService {
  /**
   * Calculates slot end time (default 90 minute dining window)
   */
  static calculateEndTime(startTime: string, durationMinutes: number = 90): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMins = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
  }

  /**
   * Helper to check time overlap between two windows [startA, endA] and [startB, endB]
   */
  private static isTimeOverlapping(startA: string, endA: string, startB: string, endB: string): boolean {
    return startA < endB && endA > startB;
  }

  /**
   * Reservation Availability Engine:
   * Finds all tables meeting capacity requirements that have no conflicting reservations.
   */
  static async getAvailableTables(
    restaurantId: string,
    reservationDate: string,
    startTime: string,
    guestCount: number,
    durationMinutes: number = 90
  ): Promise<AvailableTableOption[]> {
    const endTime = this.calculateEndTime(startTime, durationMinutes);

    // 1. Fetch tables with sufficient capacity that are not permanently inactive
    const candidateTables = await prisma.table.findMany({
      where: {
        restaurantId,
        capacity: { gte: guestCount },
        status: { not: 'INACTIVE' },
      },
      orderBy: { capacity: 'asc' },
    });

    if (candidateTables.length === 0) {
      return [];
    }

    const tableIds = candidateTables.map((t) => t.id);

    // 2. Fetch existing reservations for this date that are not cancelled
    const existingReservations = await prisma.reservation.findMany({
      where: {
        restaurantId,
        tableId: { in: tableIds },
        reservationDate,
        status: { in: ['PENDING', 'CONFIRMED', 'ARRIVED'] },
      },
    });

    // 3. Filter out tables with overlapping reservation slots
    const availableTables = candidateTables.filter((table) => {
      const tableBookings = existingReservations.filter((r) => r.tableId === table.id);
      const hasConflict = tableBookings.some((r) =>
        this.isTimeOverlapping(startTime, endTime, r.startTime, r.endTime)
      );
      return !hasConflict;
    });

    return availableTables.map((t) => ({
      id: t.id,
      tableNumber: t.tableNumber,
      slug: t.slug,
      capacity: t.capacity,
      location: t.location,
    }));
  }

  /**
   * Creates reservation inside an atomic transaction to prevent double bookings.
   */
  static async createReservation(
    restaurantId: string,
    data: {
      tableId: string;
      customerName: string;
      customerPhone: string;
      customerEmail?: string;
      guestCount: number;
      reservationDate: string;
      startTime: string;
      specialRequest?: string;
    }
  ) {
    const endTime = this.calculateEndTime(data.startTime);

    return prisma.$transaction(async (tx) => {
      // Re-verify availability inside transaction to prevent race conditions
      const conflicts = await tx.reservation.findMany({
        where: {
          restaurantId,
          tableId: data.tableId,
          reservationDate: data.reservationDate,
          status: { in: ['PENDING', 'CONFIRMED', 'ARRIVED'] },
        },
      });

      const hasConflict = conflicts.some((c) =>
        this.isTimeOverlapping(data.startTime, endTime, c.startTime, c.endTime)
      );

      if (hasConflict) {
        throw new Error('This table was just reserved by another guest for this time window. Please select another table.');
      }

      return tx.reservation.create({
        data: {
          restaurantId,
          tableId: data.tableId,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail,
          guestCount: data.guestCount,
          reservationDate: data.reservationDate,
          startTime: data.startTime,
          endTime,
          status: 'CONFIRMED',
          specialRequest: data.specialRequest,
        },
        include: {
          table: true,
          restaurant: true,
        },
      });
    });
  }

  /**
   * Connects QR scanning with an existing reservation (Section 33)
   */
  static async findActiveReservationForTable(restaurantId: string, tableId: string) {
    const today = new Date().toISOString().split('T')[0];

    return prisma.reservation.findFirst({
      where: {
        restaurantId,
        tableId,
        reservationDate: today,
        status: { in: ['CONFIRMED', 'ARRIVED'] },
      },
      include: {
        table: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  /**
   * Marks a reservation as ARRIVED
   */
  static async checkInReservation(reservationId: string) {
    return prisma.reservation.update({
      where: { id: reservationId },
      data: { status: 'ARRIVED' },
    });
  }

  /**
   * Admin lists all reservations
   */
  static async listReservations(restaurantId: string, filterDate?: string) {
    return prisma.reservation.findMany({
      where: {
        restaurantId,
        ...(filterDate ? { reservationDate: filterDate } : {}),
      },
      include: {
        table: true,
      },
      orderBy: [{ reservationDate: 'desc' }, { startTime: 'asc' }],
    });
  }

  /**
   * Updates reservation status
   */
  static async updateStatus(reservationId: string, status: string) {
    return prisma.reservation.update({
      where: { id: reservationId },
      data: { status },
    });
  }
}
