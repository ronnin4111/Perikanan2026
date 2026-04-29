# 🚀 Panduan Deployment - Vercel

Panduan langkah demi langkah untuk deploy Dashboard Perikanan Budidaya ke Vercel.

---

## 📋 Persiapan Sebelum Deploy

### 1. Generate JWT Secret

Jalankan perintah ini di terminal lokal Anda:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Simpan string yang dihasilkan - ini akan menjadi `JWT_SECRET` di production.

---

## 🌐 Deploy ke Vercel

### Langkah 1: Push Code ke GitHub

```bash
# Commit semua perubahan
git add .
git commit -m "Prepare for Vercel deployment"

# Push ke GitHub (pastikan remote sudah di-setup)
git push origin main
```

### Langkah 2: Buat Project di Vercel

1. Buka [vercel.com](https://vercel.com)
2. Login dengan akun GitHub
3. Klik **"Add New..."** → **"Project"**
4. Pilih repository Anda dari GitHub
5. Klik **"Import"**

Vercel akan otomatis:
- Mendeteksi framework Next.js
- Setup build command
- Setup environment variables default

### Langkah 3: Setup Database (Vercel Postgres)

#### 3.1 Buat Database

1. Di dashboard Vercel project, klik menu **Storage**
2. Klik **"Create Database"**
3. Pilih **Postgres**
4. Pilih region (Singapore - sin1 untuk Indonesia)
5. Klik **"Create"**

#### 3.2 Connect Database

Setelah database terbuat:
1. Klik database yang baru dibuat
2. Klik tab **"Connect"**
3. Scroll ke bawah ke bagian **"Connecting to Prisma"**

### Langkah 4: Add Environment Variables

#### 4.1 Copy Auto-Generated Variables

Vercel akan otomatis membuat environment variables ini (tidak perlu manual):

```
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
POSTGRES_USER=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=
```

#### 4.2 Add JWT Secret (Manual)

1. Di dashboard Vercel project:
   - Klik **Settings** → **Environment Variables**
2. Tambahkan variable baru:
   - Key: `JWT_SECRET`
   - Value: [paste string yang di-generate di Langkah 1]
   - Environment: Production, Preview, Development (pilih semua)
3. Klik **"Save"**

#### 4.3 (Optional) Google Sheets

Jika ingin sync ke Google Sheets:
```
GOOGLE_SHEETS_API_KEY=
GOOGLE_SHEETS_SPREADSHEET_ID=
```

### Langkah 5: Deploy!

Vercel akan otomatically redeploy setiap kali ada environment variable baru.

Tunggu beberapa menit, dan aplikasi akan live!

---

## 🗄️ Setup Database Setelah Deploy

Setelah deploy berhasil, Anda perlu setup database schema dan admin user.

### Option A: Via Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login ke Vercel
vercel login

# Link ke project
vercel link

# Push database schema
vercel env pull .env.local
bun run db:push

# Setup admin user
bun run db:seed:admin
```

### Option B: Via Database Studio

1. Buka Vercel Dashboard
2. Klik **Storage** → Pilih database
3. Klik **"Query"**
4. Jalankan SQL berikut:

```sql
-- Create admin user (password: admin123)
INSERT INTO "User" (email, password, role, "isActive", "createdAt", "updatedAt")
VALUES (
  'admin@dpkpp.go.id',
  '$2a$10$r5QzJqLhLzXk7Q5zJqLhLOzXk7Q5zJqLhLOzXk7Q5zJqLhLOzXk7Q',
  'ADMIN',
  true,
  datetime('now'),
  datetime('now')
);
```

### Option C: Via Prisma Studio (Local Development)

```bash
# Pull production database
vercel env pull .env.local

# Open Prisma Studio
bunx prisma studio
```

---

## 📝 Import Data Pelaku Usaha

### From CSV File

Buat script `scripts/import-csv.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import csv from 'csv-parser';

const prisma = new PrismaClient();

async function importCSV() {
  const results: any[] = [];

  fs.createReadStream('data-pelaku-usaha.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log(`Importing ${results.length} records...`);

      for (const row of results) {
        await prisma.pelakuUsaha.create({
          data: {
            nama: row.Nama,
            kelompok: row.Kelompok,
            kecamatan: row.Kecamatan,
            desa: row.Desa,
            jenisUsaha: row['Jenis Usaha'],
            produksi: parseFloat(row.Produksi) || 0,
            lahan: parseFloat(row.Lahan) || 0,
            kolam: parseInt(row.Kolam) || 0,
          }
        });
      }

      console.log('✅ Import complete!');
    });
}

importCSV();
```

Jalankan:
```bash
bun run scripts/import-csv.ts
```

---

## 🔍 Verifikasi Deployment

### 1. Cek Homepage

Buka URL Vercel (diberikan setelah deploy):
```
https://your-project.vercel.app
```

### 2. Cek Dashboard

```
https://your-project.vercel.app/dashboard
```

### 3. Cek Login Admin

```
https://your-project.vercel.app/login
```

Gunakan:
- Email: `admin@dpkpp.go.id`
- Password: `admin123`

### 4. Cek API

Test di browser atau curl:

```bash
curl https://your-project.vercel.app/api/pelaku-usaha
```

Harus mengembalikan JSON dengan data pelaku usaha.

---

## 🐛 Troubleshooting

### Error: Database Connection Failed

**Solusi:**
1. Pastikan Vercel Postgres sudah di-setup
2. Pastikan environment variables terisi
3. Redeploy dari Vercel dashboard

### Error: JWT_SECRET not set

**Solusi:**
1. Generate JWT secret
2. Add di Environment Variables
3. Redeploy

### Build Error: Prisma Client not found

**Solusi:**
```bash
# Install tsx
bun add -D tsx

# Regenerate Prisma
bun run db:generate

# Redeploy
git add .
git commit -m "fix: add tsx and regenerate prisma"
git push
```

### Error: 500 Server Error

**Cek Vercel Logs:**
1. Buka Vercel Dashboard
2. Klik project
3. Klik **Deployments** → Pilih deployment terbaru
4. Scroll ke bawah ke **Logs**

---

## 🔄 CI/CD Setup (Auto Deploy)

Vercel sudah otomatis setup:
- ✅ Deploy otomatis setiap push ke `main` branch
- ✅ Preview deployments untuk setiap pull request
- ✅ Environment variables otomatis ter-inject

### Custom Domain

1. Di Vercel Dashboard, klik **Settings** → **Domains**
2. Klik **"Add Domain"**
3. Masukkan domain Anda (contoh: `perikanan.mempawah.go.id`)
4. Follow instructions untuk update DNS

---

## 📊 Monitoring

### Vercel Analytics

1. Di Vercel Dashboard, klik **Analytics**
2. Enable untuk tracking:
   - Page views
   - Web Vitals
   - Custom Events

### Error Tracking

Vercel provides:
- Error logging otomatis
- Stack traces
- User info

---

## 💡 Tips & Best Practices

### 1. Environment Variables
- Selalu gunakan `.env.example` untuk dokumentasi
- Jangan commit `.env` atau `.env.local`

### 2. Database
- Gunakan Vercel Postgres untuk production
- Backup database secara rutin

### 3. Security
- Ganti password admin default
- Gunakan JWT secret yang kuat
- Enable HTTPS (Vercel otomatis)

### 4. Performance
- Gunakan image optimization (Next.js Image)
- Enable caching untuk API calls
- Monitor database query performance

---

## 📞 Support

Jika mengalami masalah:
1. Cek [Vercel Documentation](https://vercel.com/docs)
2. Cek [Next.js Documentation](https://nextjs.org/docs)
3. Cek [Prisma Documentation](https://www.prisma.io/docs)

---

## ✅ Checklist Deployment

- [ ] Code sudah push ke GitHub
- [ ] Project sudah di-import ke Vercel
- [ ] Vercel Postgres sudah dibuat
- [ ] Environment variables sudah diset:
  - [ ] POSTGRES_URL
  - [ ] JWT_SECRET
- [ ] Database schema sudah di-push (`bun run db:push`)
- [ ] Admin user sudah dibuat
- [ ] Homepage bisa diakses
- [ ] Dashboard bisa diakses
- [ ] Login admin bisa diakses
- [ ] API berfungsi

---

**Selamat! Dashboard Perikanan Budidaya Anda sekarang sudah live di Vercel! 🎉**
