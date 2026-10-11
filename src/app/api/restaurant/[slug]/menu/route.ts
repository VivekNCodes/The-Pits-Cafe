import { NextRequest, NextResponse } from 'next/server';
import { RestaurantService } from '@/lib/services/restaurant.service';
import { MenuService } from '@/lib/services/menu.service';
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
    const isAdmin = searchParams.get('admin') === 'true';

    const menu = isAdmin
      ? await MenuService.getAdminMenu(restaurant.id)
      : await MenuService.getPublicMenu(restaurant.id);

    return NextResponse.json(menu);
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
    const { type, ...itemData } = body;

    if (type === 'CATEGORY') {
      const category = await MenuService.upsertCategory(restaurant.id, itemData);
      return NextResponse.json(category);
    } else {
      const foodItem = await MenuService.upsertFoodItem(restaurant.id, itemData);
      return NextResponse.json(foodItem);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
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

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const categoryId = searchParams.get('categoryId');

    if (itemId) {
      await MenuService.deleteFoodItem(restaurant.id, itemId);
      return NextResponse.json({ success: true, deleted: 'FOOD_ITEM' });
    } else if (categoryId) {
      await MenuService.deleteCategory(restaurant.id, categoryId);
      return NextResponse.json({ success: true, deleted: 'CATEGORY' });
    }

    return NextResponse.json({ error: 'itemId or categoryId required' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
