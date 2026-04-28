import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, requireAdmin, logActivity, getUserIP } from '@/lib/auth';
import { LogAction } from '@prisma/client';
import { isSheetConfigured, updateSheet, deleteFromSheet, findRowNumberById } from '@/lib/google-sheets';

// GET - Get single pelaku usaha by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    const data = await db.pelakuUsaha.findUnique({
      where: { id: params.id }
    });

    if (!data) {
      return NextResponse.json(
        { error: 'Data tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('GET pelaku-usaha/[id] error:', error);
    if (error.message === 'Unauthorized') {
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

// PUT - Update pelaku usaha
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const ipAddress = await getUserIP();
    const body = await request.json();

    // Check if exists
    const existing = await db.pelakuUsaha.findUnique({
      where: { id: params.id }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Data tidak ditemukan' },
        { status: 404 }
      );
    }

    // Update data
    const updatedData = await db.pelakuUsaha.update({
      where: { id: params.id },
      data: {
        nama: body.nama ?? existing.nama,
        kelompok: body.kelompok ?? existing.kelompok,
        kecamatan: body.kecamatan ?? existing.kecamatan,
        desa: body.desa ?? existing.desa,
        jenisUsaha: body.jenisUsaha ?? existing.jenisUsaha,
        wadahBudidaya: body.wadahBudidaya ?? existing.wadahBudidaya,
        jenisIkan: body.jenisIkan ?? existing.jenisIkan,
        kolam: body.kolam !== undefined ? parseInt(body.kolam) : existing.kolam,
        lahan: body.lahan !== undefined ? parseFloat(body.lahan) : existing.lahan,
        produksi: body.produksi !== undefined ? parseFloat(body.produksi) : existing.produksi,
        lat: body.lat !== undefined ? parseFloat(body.lat) : existing.lat,
        lng: body.lng !== undefined ? parseFloat(body.lng) : existing.lng,
        cbib: body.cbib !== undefined ? parseInt(body.cbib) : existing.cbib,
        kusukaKelompok: body.kusukaKelompok !== undefined ? parseInt(body.kusukaKelompok) : existing.kusukaKelompok
      }
    });

    // Log activity
    await logActivity(
      user.id,
      LogAction.UPDATE,
      params.id,
      'PELAKUUSAHA',
      JSON.stringify(existing),
      JSON.stringify(updatedData),
      ipAddress
    );

    // Sync with Google Sheets if configured
    if (isSheetConfigured() && updatedData.googleSheetRowId) {
      try {
        const rowNumber = await findRowNumberById(updatedData.googleSheetRowId);
        if (rowNumber !== null) {
          await updateSheet(
            {
              id: updatedData.googleSheetRowId,
              nama: updatedData.nama,
              kelompok: updatedData.kelompok || '',
              kecamatan: updatedData.kecamatan,
              desa: updatedData.desa || '',
              jenisUsaha: updatedData.jenisUsaha || '',
              wadahBudidaya: updatedData.wadahBudidaya || '',
              jenisIkan: updatedData.jenisIkan || '',
              kolam: updatedData.kolam,
              lahan: updatedData.lahan,
              produksi: updatedData.produksi,
              lat: updatedData.lat || 0,
              lng: updatedData.lng || 0,
              cbib: updatedData.cbib,
              kusukaKelompok: updatedData.kusukaKelompok,
              createdBy: user.email,
              createdAt: updatedData.createdAt.toISOString(),
              updatedAt: updatedData.updatedAt.toISOString()
            },
            rowNumber
          );
        }
      } catch (sheetError: any) {
        console.error('Google Sheets sync error:', sheetError);
        // Don't fail the request if sheet sync fails
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedData
    });
  } catch (error: any) {
    console.error('PUT pelaku-usaha/[id] error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupdate data' },
      { status: 500 }
    );
  }
}

// DELETE - Delete pelaku usaha
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const ipAddress = await getUserIP();

    // Check if exists
    const existing = await db.pelakuUsaha.findUnique({
      where: { id: params.id }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Data tidak ditemukan' },
        { status: 404 }
      );
    }

    // Delete data
    await db.pelakuUsaha.delete({
      where: { id: params.id }
    });

    // Log activity
    await logActivity(
      user.id,
      LogAction.DELETE,
      params.id,
      'PELAKUUSAHA',
      JSON.stringify(existing),
      null,
      ipAddress
    );

    // Sync with Google Sheets if configured
    if (isSheetConfigured() && existing.googleSheetRowId) {
      try {
        const rowNumber = await findRowNumberById(existing.googleSheetRowId);
        if (rowNumber !== null) {
          await deleteFromSheet(rowNumber);
        }
      } catch (sheetError: any) {
        console.error('Google Sheets sync error:', sheetError);
        // Don't fail the request if sheet sync fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Data berhasil dihapus'
    });
  } catch (error: any) {
    console.error('DELETE pelaku-usaha/[id] error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus data' },
      { status: 500 }
    );
  }
}
