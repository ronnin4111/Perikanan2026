# 🐟 Dashboard Perikanan Budidaya - Kabupaten Mempawah

Sistem interaktif untuk monitoring dan analisis data pelaku usaha budidaya perikanan di Kabupaten Mempawah.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css)

## 📋 Fitur Utama

- 📊 **Dashboard Publik** - Tampilan data dengan statistik, filter, dan tabel interaktif
- 🔍 **Filter Lanjutan** - Filter berdasarkan Kecamatan, Desa, Nama, dan Kelompok
- 📥 **Export Data** - Export ke PDF dan Excel (CSV)
- 🎨 **Modern UI** - Desain responsif dengan Dark Mode
- 🌐 **API Public** - RESTful API untuk akses data
- 👨‍💼 **Admin Panel** - Manajemen data dengan autentikasi
- 🗺️ **Visualisasi** - Peta sebaran pelaku usaha (coming soon)

## 🚀 Cara Deploy (Vercel - Recommended)

### Prasyarat

- Akun GitHub
- Akun Vercel (gratis)

### Langkah 1: Push ke GitHub

```bash
# Initialize git jika belum
git init

# Add semua file
git add .

# Commit
git commit -m "Initial commit: Dashboard Perikanan Budidaya"

# Buat repository baru di GitHub, lalu:
git branch -M main
git remote add origin https://github.com/username/nama-repo.git
git push -u origin main
```

### Langkah 2: Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com) dan login dengan GitHub
2. Klik **"Add New..."** → **"Project"**
3. Import repository Anda
4. Vercel akan otomatis mendeteksi Next.js

### Langkah 3: Setup Database

Vercel menyediakan **Vercel Postgres** gratis:

1. Di dashboard Vercel project, klik **Storage**
2. Klik **"Create Database"** → **Postgres**
3. Setelah database terbuat, klik **Connect**

### Langkah 4: Configure Environment Variables

Vercel akan otomatis menambahkan:
```
POSTGRES_URL
POSTGRES_PRISMA_URL
POSTGRES_URL_NON_POOLING
```

Tambahkan manual di Vercel dashboard:

```
# JWT Secret untuk autentikasi (generate random string)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Google Sheets (opsional - jika ingin sync ke Google Sheets)
GOOGLE_SHEETS_API_KEY=
GOOGLE_SHEETS_SPREADSHEET_ID=
```

**Generate JWT Secret:**
```bash
# Di terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Langkah 5: Install Prisma & Push Schema

Setelah deploy, buka **Deployments** → klik **Redeploy** atau jalankan di terminal:

```bash
# Install Prisma CLI
bun add -D prisma

# Push schema ke database
bunx prisma db push

# Generate Prisma Client
bunx prisma generate
```

### Langkah 6: Seed Admin User

Buka Vercel Dashboard → **Settings** → **Environment Variables** → **Redeploy**

Atau jalankan script ini secara lokal dengan production database:

```bash
bun run scripts/seed-admin.ts
```

**Admin Default:**
- Email: `admin@dpkpp.go.id`
- Password: `admin123`

---

## 💻 Cara Setup Lokal

### Prasyarat

- Node.js 18+ atau [Bun](https://bun.sh)
- Git

### Langkah-langkah

1. **Clone repository**
   ```bash
   git clone https://github.com/username/nama-repo.git
   cd nama-repo
   ```

2. **Install dependencies**
   ```bash
   # Menggunakan Bun (recommended)
   bun install

   # Atau npm
   npm install
   ```

3. **Setup environment variables**

   Buat file `.env`:
   ```bash
   # Untuk local development dengan SQLite (gratis, tidak perlu setup)
   DATABASE_URL="file:./db/dev.db"

   # JWT Secret (gunakan ini untuk local)
   JWT_SECRET="local-development-secret-key-32-chars-min"
   ```

4. **Setup database**
   ```bash
   # Push schema
   bun run db:push

   # Generate Prisma Client
   bun run db:generate
   ```

5. **Seed admin user**
   ```bash
   bun run scripts/seed-admin.ts
   ```

6. **Jalankan development server**
   ```bash
   bun run dev
   ```

7. **Buka browser**
   ```
   http://localhost:3000
   ```

---

## 📂 Struktur Proyek

```
my-project/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Homepage
│   │   ├── dashboard/         # Dashboard publik
│   │   ├── admin/             # Admin panel
│   │   ├── login/             # Halaman login
│   │   └── api/               # API routes
│   ├── components/ui/         # shadcn/ui components
│   ├── lib/                   # Utilities (auth, db, jwt, etc.)
│   └── hooks/                 # React hooks
├── prisma/
│   └── schema.prisma          # Database schema
├── public/                    # Static assets
├── scripts/                   # Seed & admin scripts
└── package.json               # Dependencies
```

---

## 🔐 Credential Admin

| Akses | URL | Email | Password |
|-------|-----|-------|----------|
| Dashboard Publik | `/` | - | - (Tidak perlu login) |
| Login Admin | `/login` | `admin@dpkpp.go.id` | `admin123` |

---

## 📡 API Endpoints

### Public Access (No Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pelaku-usaha` | List semua pelaku usaha |
| GET | `/api/pelaku-usaha?page=1&limit=50` | Pagination |
| GET | `/api/pelaku-usaha?search=nama` | Search data |

### Protected (Need Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/pelaku-usaha` | Tambah pelaku usaha baru |
| PUT | `/api/pelaku-usaha/[id]` | Update pelaku usaha |
| DELETE | `/api/pelaku-usaha/[id]` | Hapus pelaku usaha |
| GET | `/api/admin/users` | List admin users |
| POST | `/api/auth/login` | Login admin |

---

## 🛠️ Teknologi

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Database**: Prisma ORM
  - Local: SQLite
  - Production: PostgreSQL (Vercel Postgres)
- **UI Components**: shadcn/ui
- **Authentication**: JWT (JSON Web Token)
- **State Management**: React Hooks (useState, useEffect)
- **Icons**: Lucide React

---

## 📝 Environment Variables

### Required untuk Production

```env
# Database (otomatis dari Vercel Postgres)
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=

# JWT Secret (WAJIB generate sendiri)
JWT_SECRET=
```

### Optional (Google Sheets Integration)

```env
GOOGLE_SHEETS_API_KEY=
GOOGLE_SHEETS_SPREADSHEET_ID=
```

---

## 🚀 Deployment Options

### 1. Vercel (Recommended) ⭐

**Kelebihan:**
- Gratis untuk personal use
- Integrasi otomatis dengan GitHub
- Vercel Postgres gratis
- Deploy otomatis setiap push
- CDN global

**Cara:**
1. Push ke GitHub
2. Import ke Vercel
3. Setup Vercel Postgres
4. Done!

### 2. Railway.app

**Kelebihan:**
- Database PostgreSQL gratis
- Support custom domain

**Cara:**
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### 3. Render.com

**Kelebihan:**
- PostgreSQL gratis
- Support web service + database

**Cara:**
1. Connect GitHub repository di Render
2. Setup database PostgreSQL
3. Add environment variables
4. Deploy

---

## 📊 Database Schema

**Pelaku Usaha:**
- Nama pelaku usaha
- Kelompok
- Kecamatan & Desa
- Jenis usaha & Ikan
- Produksi (kg)
- Lahan (ha)
- Jumlah kolam
- Koordinat (lat/lng)
- CBIB & KUSUKA

**Admin User:**
- Email & Password
- Role (admin/user)
- Created/Updated timestamps

---

## 🐛 Troubleshooting

### Database Connection Error

**Local:**
```bash
# Pastikan file .env ada dengan DATABASE_URL
DATABASE_URL="file:./db/dev.db"
```

**Production (Vercel):**
- Pastikan Vercel Postgres sudah di-setup
- Pastikan environment variables terisi

### Prisma Error

```bash
# Regenerate Prisma Client
bun run db:generate

# Push schema ke database
bun run db:push
```

### Build Error di Vercel

1. Pastikan `package.json` scripts:
   ```json
   {
     "scripts": {
       "dev": "next dev -p 3000",
       "build": "next build",
       "start": "next start",
       "db:push": "prisma db push",
       "db:generate": "prisma generate"
     }
   }
   ```

2. Pastikan `tsconfig.json` dan `next.config.ts` ada

---

## 📄 License

MIT License - Dinas Perikanan dan Kelautan Kabupaten Mempawah

---

## 👨‍💻 Development

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Build untuk production
bun run build

# Lint code
bun run lint

# Push database changes
bun run db:push

# Generate Prisma Client
bun run db:generate
```

---

## 🆘 Dukungan

Jika ada pertanyaan atau masalah, silakan:
1. Buka [Issue](https://github.com/username/nama-repo/issues)
2. Hubungi tim Dinas Perikanan dan Kelautan Kabupaten Mempawah

---

## 🙏 Terima Kasih

- Next.js team
- Prisma team
- shadcn/ui components
- Dinas Perikanan dan Kelautan Kabupaten Mempawah
