import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, logActivity, getUserIP } from '@/lib/auth';
import { LogAction } from '@prisma/client';

// PATCH - Toggle user active status (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    const ipAddress = await getUserIP();

    // Check if user exists
    const existing = await db.user.findUnique({
      where: { id: params.id }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Prevent admin from deactivating themselves
    if (existing.id === admin.id) {
      return NextResponse.json(
        { error: 'Tidak dapat menonaktifkan diri sendiri' },
        { status: 400 }
      );
    }

    // Toggle active status
    const updatedUser = await db.user.update({
      where: { id: params.id },
      data: {
        isActive: !existing.isActive
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    });

    // Log activity
    await logActivity(
      admin.id,
      LogAction.UPDATE,
      params.id,
      'USER',
      JSON.stringify({ isActive: existing.isActive }),
      JSON.stringify({ isActive: updatedUser.isActive }),
      ipAddress
    );

    return NextResponse.json({
      success: true,
      data: updatedUser
    });
  } catch (error: any) {
    console.error('PATCH admin/users/[id]/toggle error:', error);
    if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupdate status user' },
      { status: 500 }
    );
  }
}
