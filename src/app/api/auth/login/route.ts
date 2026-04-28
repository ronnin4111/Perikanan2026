import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/auth';
import { db } from '@/lib/db';
import { LogAction } from '@prisma/client';

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

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Akun tidak aktif' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
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
        newValues: null
      }
    });

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as 'ADMIN' | 'OPERATOR'
      }
    });

    // Set session cookie
    response.cookies.set('dpkpp_session', user.id, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat login' },
      { status: 500 }
    );
  }
}
