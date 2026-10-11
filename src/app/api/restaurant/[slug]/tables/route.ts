import { NextRequest, NextResponse } from 'next/server';
import { RestaurantService } from '@/lib/services/restaurant.service';
import { TableService } from '@/lib/services/table.service';
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

    const tables = await TableService.listTables(restaurant.id);
    return NextResponse.json(tables);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    if (!AdminAuth.isAdminAuthenticated(params.slug)) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const restaurant = await RestaurantService.getBySlug(params.slug);
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const body = await request.json();
    const table = await TableService.createTable(restaurant.id, restaurant.slug, body);
    return NextResponse.json(table, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create table' }, { status: 400 });
  }
}
