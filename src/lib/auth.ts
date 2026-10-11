import { cookies } from 'next/headers';

const ADMIN_PIN = process.env.ADMIN_PIN || '1234';

export class AdminAuth {
  /**
   * Verifies if entered PIN matches the restaurant admin credential
   */
  static verifyPin(pin: string): boolean {
    return pin === ADMIN_PIN;
  }

  /**
   * Sets admin session cookie for the restaurant
   */
  static setAdminSession(restaurantSlug: string) {
    const cookieStore = cookies();
    cookieStore.set(`admin_session_${restaurantSlug}`, 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
  }

  /**
   * Checks if current request has a valid admin session for the restaurant
   */
  static isAdminAuthenticated(restaurantSlug: string): boolean {
    const cookieStore = cookies();
    const session = cookieStore.get(`admin_session_${restaurantSlug}`);
    return session?.value === 'authenticated';
  }

  /**
   * Clears admin session cookie
   */
  static clearAdminSession(restaurantSlug: string) {
    const cookieStore = cookies();
    cookieStore.delete(`admin_session_${restaurantSlug}`);
  }
}
