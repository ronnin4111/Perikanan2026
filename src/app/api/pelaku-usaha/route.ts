import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, logActivity, getUserIP } from '@/lib/auth';
import { PelakuUsaha, LogAction } from '@prisma/client';
import { isSheetConfigured, addToSheet } from '@/lib/google-sheets';

// GET - List all pelaku usaha (public access)
export async function GET(request: NextRequest) {
  try {
    // Public access - no authentication required for GET
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { nama: { contains: search, mode: 'insensitive' } },
            { kelompok: { contains: search, mode: 'insensitive' } },
            { kecamatan: { contains: search, mode: 'insensitive' } },
            { desa: { contains: search, mode: 'insensitive' } }
          ]
        }
      : {};

    const [data, total] = await Promise.all([
      db.pelakuUsaha.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.pelakuUsaha.count({ where })
    ]);

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('GET pelaku-usaha error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}

// POST - Create new pelaku usaha
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const ipAddress = await getUserIP();
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['nama', 'kecamatan'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Field wajib: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const newData = await db.pelakuUsaha.create({
      data: {
        nama: body.nama,
        kelompok: body.kelompok || null,
        kecamatan: body.kecamatan,
        desa: body.desa || null,
        jenisUsaha: body.jenisUsaha || null,
        wadahBudidaya: body.wadahBudidaya || null,
        jenisIkan: body.jenisIkan || null,
        kolam: parseInt(body.kolam) || 0,
        lahan: parseFloat(body.lahan) || 0,
        produksi: parseFloat(body.produksi) || 0,
        lat: parseFloat(body.lat) || null,
        lng: parseFloat(body.lng) || null,
        cbib: parseInt(body.cbib) || 0,
        kusukaKelompok: parseInt(body.kusukaKelompok) || 0
      }
    });

    // Log activity
    await logActivity(
      user.id,
      LogAction.CREATE,
      newData.id,
      'PELAKUUSAHA',
      null,
      JSON.stringify(newData),
      ipAddress
    );

    // Sync with Google Sheets if configured
    if (isSheetConfigured()) {
      try {
        await addToSheet(
          {
            nama: newData.nama,
            kelompok: newData.kelompok || '',
            kecamatan: newData.kecamatan,
            desa: newData.desa || '',
            jenisUsaha: newData.jenisUsaha || '',
            wadahBudidaya: newData.wadahBudidaya || '',
            jenisIkan: newData.jenisIkan || '',
            kolam: newData.kolam,
            lahan: newData.lahan,
            produksi: newData.produksi,
            lat: newData.lat || 0,
            lng: newData.lng || 0,
            cbib: newData.cbib,
            kusukaKelompok: newData.kusukaKelompok,
            createdBy: user.email,
            createdAt: newData.createdAt.toISOString(),
            updatedAt: newData.updatedAt.toISOString()
          },
          newData.id
        );

        // Update Google Sheet row ID
        await db.pelakuUsaha.update({
          where: { id: newData.id },
          data: { googleSheetRowId: newData.id }
        });
      } catch (sheetError: any) {
        console.error('Google Sheets sync error:', sheetError);
        // Don't fail the request if sheet sync fails
      }
    }

    return NextResponse.json({
      success: true,
      data: newData
    }, { status: 201 });
  } catch (error: any) {
    console.error('POST pelaku-usaha error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menyimpan data' },
      { status: 500 }
    );
  }
}
