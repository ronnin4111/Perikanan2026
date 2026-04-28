import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi' },
        { status: 400 }
      );
    }

    const result = await login(email, password);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: result.user,
      token: result.user.token
    });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat login' },
      { status: 500 }
    );
  }
}
