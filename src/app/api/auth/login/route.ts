import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/auth';
import { db } from '@/lib/db';
import { LogAction } from '@prisma/client';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('Login attempt for email:', email);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      console.log('User not found');
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      console.log('User not active');
      return NextResponse.json(
        { error: 'Akun tidak aktif' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      console.log('Invalid password');
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Log login activity
    await db.activityLog.create({
      data: {
        userId: user.id,
        action: LogAction.LOGIN,
        entity: null,
        entityType: null,
        oldValues: null,
        newValues: null,
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] ||
                 request.headers.get('x-real-ip') ||
                 undefined
      }
    });

    // Set session cookie in response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as 'ADMIN' | 'OPERATOR'
      }
    });

    response.cookies.set('dpkpp_session', user.id, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/'
    });

    console.log('Login successful, cookie set for user:', user.email);
    return response;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat login' },
      { status: 500 }
    );
  }
}
