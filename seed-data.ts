import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Check if data already exists
  const existingCount = await prisma.pelakuUsaha.count()
  if (existingCount > 0) {
    console.log(`Database already has ${existingCount} records. Skipping seed.`)
    return
  }

  const sampleData = [
    {
      nama: 'Ahmad Fauzi',
      kelompok: 'Mina Makmur',
      kecamatan: 'Sungai Pinyuh',
      desa: 'Desa Sungai Pinyuh',
      jenisUsaha: 'Budidaya Ikan Nila',
      wadahBudidaya: 'Kolam Tanah',
      jenisIkan: 'Ikan Nila',
      kolam: 3,
      lahan: 0.5,
      produksi: 500,
      lat: 0.123,
      lng: 109.456,
      cbib: 1,
      kusukaKelompok: 5
    },
    {
      nama: 'Budi Santoso',
      kelompok: 'Tani Mulya',
      kecamatan: 'Mempawah Hulu',
      desa: 'Desa Siamuk',
      jenisUsaha: 'Budidaya Ikan Lele',
      wadahBudidaya: 'Kolam Terpal',
      jenisIkan: 'Ikan Lele',
      kolam: 5,
      lahan: 0.8,
      produksi: 750,
      lat: 0.125,
      lng: 109.458,
      cbib: 2,
      kusukaKelompok: 10
    },
    {
      nama: 'Siti Rahayu',
      kelompok: 'Suka Maju',
      kecamatan: 'Sungai Kunyit',
      desa: 'Desa Sungai Kunyit',
      jenisUsaha: 'Budidaya Udang',
      wadahBudidaya: 'Kolam Tanah',
      jenisIkan: 'Udang Vanamei',
      kolam: 2,
      lahan: 1.2,
      produksi: 300,
      lat: 0.120,
      lng: 109.452,
      cbib: 1,
      kusukaKelompok: 8
    },
    {
      nama: 'Dedi Kurniawan',
      kelompok: 'Jaya Tani',
      kecamatan: 'Toho',
      desa: 'Desa Toho',
      jenisUsaha: 'Budidaya Ikan Mas',
      wadahBudidaya: 'Kolam Beton',
      jenisIkan: 'Ikan Mas',
      kolam: 4,
      lahan: 0.6,
      produksi: 600,
      lat: 0.118,
      lng: 109.460,
      cbib: 1,
      kusukaKelompok: 6
    },
    {
      nama: 'Eka Pratama',
      kelompok: 'Mina Sejahtera',
      kecamatan: 'Sungai Pinyuh',
      desa: 'Desa Sungai Bakau',
      jenisUsaha: 'Budidaya Ikan Patin',
      wadahBudidaya: 'Kolam Tanah',
      jenisIkan: 'Ikan Patin',
      kolam: 3,
      lahan: 0.7,
      produksi: 450,
      lat: 0.122,
      lng: 109.454,
      cbib: 1,
      kusukaKelompok: 7
    },
    {
      nama: 'Fitri Handayani',
      kelompok: 'Tani Berkah',
      kecamatan: 'Mempawah Hilir',
      desa: 'Desa Pasir Wan',
      jenisUsaha: 'Budidaya Ikan Nila',
      wadahBudidaya: 'Kolam Terpal',
      jenisIkan: 'Ikan Nila',
      kolam: 6,
      lahan: 1.0,
      produksi: 900,
      lat: 0.126,
      lng: 109.462,
      cbib: 2,
      kusukaKelompok: 12
    },
    {
      nama: 'Gunawan',
      kelompok: 'Makmur Jaya',
      kecamatan: 'Sadaniang',
      desa: 'Desa Sadaniang',
      jenisUsaha: 'Budidaya Ikan Lele',
      wadahBudidaya: 'Bioflok',
      jenisIkan: 'Ikan Lele',
      kolam: 8,
      lahan: 0.4,
      produksi: 1200,
      lat: 0.128,
      lng: 109.464,
      cbib: 3,
      kusukaKelompok: 15
    },
    {
      nama: 'Hendra Wijaya',
      kelompok: 'Tani Subur',
      kecamatan: 'Anjongan',
      desa: 'Desa Anjongan Melancar',
      jenisUsaha: 'Budidaya Ikan Nila',
      wadahBudidaya: 'Kolam Tanah',
      jenisIkan: 'Ikan Nila',
      kolam: 4,
      lahan: 0.9,
      produksi: 700,
      lat: 0.130,
      lng: 109.466,
      cbib: 2,
      kusukaKelompok: 9
    },
    {
      nama: 'Indah Permata',
      kelompok: 'Suka Tani',
      kecamatan: 'Segedong',
      desa: 'Desa Segedong',
      jenisUsaha: 'Budidaya Udang',
      wadahBudidaya: 'Kolam Tanah',
      jenisIkan: 'Udang Windu',
      kolam: 2,
      lahan: 1.5,
      produksi: 400,
      lat: 0.132,
      lng: 109.468,
      cbib: 1,
      kusukaKelompok: 8
    },
    {
      nama: 'Joko Susilo',
      kelompok: 'Mina Kencana',
      kecamatan: 'Sungai Kunyit',
      desa: 'Desa Kuala',
      jenisUsaha: 'Budidaya Ikan Mas',
      wadahBudidaya: 'Kolam Beton',
      jenisIkan: 'Ikan Mas',
      kolam: 5,
      lahan: 0.8,
      produksi: 800,
      lat: 0.134,
      lng: 109.470,
      cbib: 2,
      kusukaKelompok: 10
    }
  ]

  for (const data of sampleData) {
    await prisma.pelakuUsaha.create({
      data
    })
  }

  console.log(`Successfully created ${sampleData.length} records`)
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
