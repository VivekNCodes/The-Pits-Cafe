import { NextRequest, NextResponse } from 'next/server';
import { RestaurantService } from '@/lib/services/restaurant.service';
import { MenuService } from '@/lib/services/menu.service';
import { AdminAuth } from '@/lib/auth';

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

    const { itemId, isAvailable } = await request.json();
    if (!itemId || typeof isAvailable !== 'boolean') {
      return NextResponse.json({ error: 'itemId and isAvailable (boolean) are required' }, { status: 400 });
    }

    await MenuService.toggleItemAvailability(restaurant.id, itemId, isAvailable);
    return NextResponse.json({ success: true, itemId, isAvailable });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
