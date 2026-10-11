import { NextRequest, NextResponse } from 'next/server';
import { RestaurantService } from '@/lib/services/restaurant.service';
import { TableService } from '@/lib/services/table.service';
import { AdminAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; tableId: string } }
) {
  try {
    const restaurant = await RestaurantService.getBySlug(params.slug);
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'png'; // 'png' or 'svg'

    const table = await TableService.getTableBySlug(restaurant.id, params.tableId);
    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const fullUrl = `${appUrl}/r/${restaurant.slug}/table/${table.slug}`;

    if (format === 'svg') {
      const svg = await TableService.generateQRSvg(fullUrl);
      return new NextResponse(svg, {
        headers: { 'Content-Type': 'image/svg+xml' },
      });
    }

    const dataUrl = await TableService.generateQRDataUrl(fullUrl);
    return NextResponse.json({
      tableNumber: table.tableNumber,
      url: fullUrl,
      dataUrl,
      isActive: table.qrCode?.isActive ?? true,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string; tableId: string } }
) {
  try {
    if (!AdminAuth.isAdminAuthenticated(params.slug)) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const restaurant = await RestaurantService.getBySlug(params.slug);
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const { isActive } = await request.json();
    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'isActive boolean required' }, { status: 400 });
    }

    await TableService.toggleQRStatus(restaurant.id, params.tableId, isActive);
    return NextResponse.json({ success: true, tableId: params.tableId, isActive });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
