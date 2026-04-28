import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, logActivity, getUserIP, hashPassword } from '@/lib/auth';
import { LogAction } from '@prisma/client';

// GET - List all users (Admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin();

    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        password: false // Don't send password hash
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('GET admin/users error:', error);
    if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}

// POST - Create new user (Admin only)
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const ipAddress = await getUserIP();
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['email', 'name', 'password', 'role'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Field wajib: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await db.user.findUnique({
      where: { email: body.email.toLowerCase() }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(body.password);

    // Create user
    const newUser = await db.user.create({
      data: {
        email: body.email.toLowerCase(),
        name: body.name,
        password: hashedPassword,
        role: body.role
      }
    });

    // Log activity
    await logActivity(
      admin.id,
      LogAction.CREATE,
      newUser.id,
      'USER',
      null,
      JSON.stringify({
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }),
      ipAddress
    );

    return NextResponse.json({
      success: true,
      data: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('POST admin/users error:', error);
    if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat user' },
      { status: 500 }
    );
  }
}
