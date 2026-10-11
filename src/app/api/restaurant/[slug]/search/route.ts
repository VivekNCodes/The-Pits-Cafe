import { NextRequest, NextResponse } from 'next/server';
import { RestaurantService } from '@/lib/services/restaurant.service';
import { SearchService } from '@/lib/services/search.service';

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
    const query = searchParams.get('q') || '';

    const results = await SearchService.searchItems(restaurant.id, query);
    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
