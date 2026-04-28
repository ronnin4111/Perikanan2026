import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('📥 [API-LOGIN] Login API called');

    const body = await request.json();
    const { email, password } = body;

    console.log('📥 [API-LOGIN] Received credentials');
    console.log('📥 [API-LOGIN] Email:', email);
    console.log('📥 [API-LOGIN] Password length:', password?.length);

    if (!email || !password) {
      console.log('❌ [API-LOGIN] Missing email or password');
      return NextResponse.json(
        { error: 'Email dan password wajib diisi' },
        { status: 400 }
      );
    }

    console.log('📥 [API-LOGIN] Calling login function...');
    const result = await login(email, password);

    console.log('📥 [API-LOGIN] Login result:', result);

    if (result.error) {
      console.log('❌ [API-LOGIN] Login failed:', result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    console.log('✅ [API-LOGIN] Login successful, returning user data');
    return NextResponse.json({
      success: true,
      user: result.user,
      token: result.user.token
    });
  } catch (error) {
    console.error('❌ [API-LOGIN] API error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat login' },
      { status: 500 }
    );
  }
}
