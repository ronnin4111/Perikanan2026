import { NextResponse } from 'next/server';
import { logout } from '@/lib/auth';

export async function POST() {
  try {
    await logout();

    return NextResponse.json({
      success: true,
      message: 'Logout berhasil'
    });
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat logout' },
      { status: 500 }
    );
  }
}
