import prisma from '@/lib/prisma';
import QRCodeGenerator from 'qrcode';

export class TableService {
  /**
   * Retrieves all tables for a restaurant with their QR codes and active sessions
   */
  static async listTables(restaurantId: string) {
    return prisma.table.findMany({
      where: { restaurantId },
      include: {
        qrCode: true,
        tableSessions: {
          where: { status: 'ACTIVE' },
          take: 1,
        },
      },
      orderBy: { tableNumber: 'asc' },
    });
  }

  /**
   * Retrieves a table by slug or ID with QR code status
   */
  static async getTableBySlug(restaurantId: string, slug: string) {
    return prisma.table.findFirst({
      where: {
        restaurantId,
        slug,
      },
      include: {
        qrCode: true,
        restaurant: true,
      },
    });
  }

  /**
   * Generates a Data URL QR code image (PNG base64) for a persistent table URL
   */
  static async generateQRDataUrl(fullUrl: string): Promise<string> {
    return QRCodeGenerator.toDataURL(fullUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0c0d0e',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });
  }

  /**
   * Generates an SVG string for clean vector printouts
   */
  static async generateQRSvg(fullUrl: string): Promise<string> {
    return QRCodeGenerator.toString(fullUrl, {
      type: 'svg',
      margin: 2,
      color: {
        dark: '#0c0d0e',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });
  }

  /**
   * Creates or activates a Table Session upon QR scanning
   */
  static async getOrCreateTableSession(
    restaurantId: string,
    tableId: string,
    customerName?: string,
    customerPhone?: string
  ) {
    // Check if table is inactive
    const table = await prisma.table.findFirst({
      where: { id: tableId, restaurantId },
      include: { qrCode: true },
    });

    if (!table) {
      throw new Error('Table does not exist');
    }
    if (!table.qrCode || !table.qrCode.isActive) {
      throw new Error('This table QR is currently inactive. Please ask restaurant staff for assistance.');
    }

    // Check for an active session
    let session = await prisma.tableSession.findFirst({
      where: {
        restaurantId,
        tableId,
        status: 'ACTIVE',
      },
    });

    if (!session) {
      const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      session = await prisma.tableSession.create({
        data: {
          restaurantId,
          tableId,
          sessionToken,
          customerName: customerName ?? null,
          customerPhone: customerPhone ?? null,
          status: 'ACTIVE',
        },
      });

      // Update table status to OCCUPIED
      await prisma.table.update({
        where: { id: tableId },
        data: { status: 'OCCUPIED' },
      });
    }

    // Increment QR scan count
    await prisma.qRCode.updateMany({
      where: { tableId },
      data: { scanCount: { increment: 1 } },
    });

    return session;
  }

  /**
   * Toggles table QR active status (deactivate/activate without deleting table)
   */
  static async toggleQRStatus(restaurantId: string, tableId: string, isActive: boolean) {
    return prisma.qRCode.updateMany({
      where: { tableId, restaurantId },
      data: { isActive },
    });
  }

  /**
   * Updates table details (number, capacity, location, status)
   */
  static async updateTable(
    restaurantId: string,
    tableId: string,
    data: { tableNumber?: string; capacity?: number; location?: string; status?: string }
  ) {
    return prisma.table.updateMany({
      where: { id: tableId, restaurantId },
      data,
    });
  }

  /**
   * Creates a new table and auto-generates its persistent QR Code
   */
  static async createTable(
    restaurantId: string,
    restaurantSlug: string,
    data: { tableNumber: string; capacity: number; location: string }
  ) {
    const slug = data.tableNumber.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const table = await prisma.table.create({
      data: {
        restaurantId,
        tableNumber: data.tableNumber,
        slug,
        capacity: data.capacity,
        location: data.location,
        status: 'AVAILABLE',
      },
    });

    const codeUrl = `/r/${restaurantSlug}/table/${table.slug}`;
    await prisma.qRCode.create({
      data: {
        restaurantId,
        tableId: table.id,
        codeUrl,
        isActive: true,
      },
    });

    return table;
  }
}
