import { NextRequest, NextResponse } from 'next/server';
import { AdminAuth } from '@/lib/auth';
import { RestaurantService } from '@/lib/services/restaurant.service';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const restaurant = await RestaurantService.getBySlug(params.slug);
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const { pin } = await request.json();
    if (!pin) {
      return NextResponse.json({ error: 'PIN is required' }, { status: 400 });
    }

    if (AdminAuth.verifyPin(pin)) {
      AdminAuth.setAdminSession(params.slug);
      return NextResponse.json({ success: true, message: 'Authenticated successfully' });
    }

    return NextResponse.json({ error: 'Invalid management PIN' }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  AdminAuth.clearAdminSession(params.slug);
  return NextResponse.json({ success: true, message: 'Logged out' });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const isAuth = AdminAuth.isAdminAuthenticated(params.slug);
  return NextResponse.json({ authenticated: isAuth });
}
