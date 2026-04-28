import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Debug: check cookies
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    console.log('All cookies:', allCookies.map(c => ({ name: c.name, value: c.value })));

    const user = await getSession();

    if (!user) {
      console.log('No session found in /api/auth/me');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.log('Session found:', user.email);
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get session API error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}
