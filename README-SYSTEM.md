# Sistem Manajemen Data Pelaku Usaha Budidaya Perikanan

## Overview

Sistem ini adalah platform lengkap untuk manajemen data pelaku usaha budidaya perikanan di Kabupaten Mempawah. Sistem ini memiliki fitur input data, manajemen data, dashboard publik, dan integrasi dengan Google Sheets.

## Fitur Utama

### 1. Sistem Autentikasi
- Login dengan email dan password
- Role-based access control (ADMIN dan OPERATOR)
- Session-based authentication
- Log aktivitas login/logout

### 2. Input Data Pelaku Usaha
- Form input lengkap untuk data pelaku usaha
- Validasi input
- Auto-location dengan geolocation API
- Dropdown untuk kecamatan, jenis usaha, dan wadah budidaya
- Data tersimpan otomatis di database

**Access:** `/input`

### 3. Kelola Data (CRUD)
- View semua data pelaku usaha dalam bentuk tabel
- Edit data yang sudah ada
- Hapus data dengan konfirmasi
- Search functionality (cari nama, kelompok, kecamatan, desa)
- Pagination untuk handling data banyak

**Access:** `/data`

### 4. Admin Dashboard
- Ringkasan statistik (total users, aktivitas, data entries)
- Kelola pengguna (tambah, aktif/nonaktifkan)
- Lihat log aktivitas lengkap
- Monitoring siapa yang melakukan input/ubah/hapus data

**Access:** `/admin/dashboard` (Admin only)

### 5. Dashboard Publik
- Visualisasi data dengan grafik interaktif
- Peta sebaran dengan marker cluster
- Filter cascading untuk analisis mendalam
- Export data ke PDF dan Excel
- Dark mode support

**Access:** `/dashboard`

### 6. Integrasi Google Sheets (Opsional)
- Sinkronisasi data dengan Google Sheets
- Real-time sync saat create/update/delete
- Backup data otomatis ke Google Sheets
- Collaborative editing melalui Google Sheets

**Lihat panduan setup di:** `/docs/google-sheets-setup.md`

## Struktur Data

### User
- Email
- Name
- Role (ADMIN/OPERATOR)
- Active/Inactive status
- Created/Updated timestamp

### Pelaku Usaha
- Nama
- Kelompok
- Kecamatan
- Desa
- Jenis Usaha
- Wadah Budidaya
- Jenis Ikan
- Jumlah Kolam
- Luas Lahan (m²)
- Produksi (kg/tahun)
- Koordinat GPS (Latitude, Longitude)
- Sertifikasi CBIB
- Skor KUSUKA Kelompok
- Created/Updated timestamp

### Activity Log
- User
- Action (CREATE, UPDATE, DELETE, LOGIN, LOGOUT)
- Entity ID
- Entity Type (PELAKUUSAHA, USER)
- Old Values (JSON)
- New Values (JSON)
- IP Address
- Timestamp

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current session

### Pelaku Usaha
- `GET /api/pelaku-usaha` - List all data (supports pagination & search)
- `POST /api/pelaku-usaha` - Create new data
- `GET /api/pelaku-usaha/[id]` - Get single data
- `PUT /api/pelaku-usaha/[id]` - Update data
- `DELETE /api/pelaku-usaha/[id]` - Delete data

### Admin (Admin Only)
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create new user
- `PATCH /api/admin/users/[id]/toggle` - Toggle user active status
- `GET /api/admin/activity` - List activity logs

## Setup Awal

### 1. Install Dependencies
```bash
bun install
```

### 2. Setup Database
```bash
bun run db:push
```

### 3. Setup Admin User
Script seed sudah tersedia di `/scripts/seed-admin.ts`. Run script untuk membuat admin user pertama:
```bash
bun run scripts/seed-admin.ts
```

Default admin credentials:
- Email: `admin@dpkpp.mempawah.go.id`
- Password: `dpkpp123`

### 4. Jalankan Development Server
```bash
bun run dev
```

Akses aplikasi di: `http://localhost:3000`

## Panduan Penggunaan

### Untuk Operator

1. **Login**: Gunakan email dan password yang diberikan admin
2. **Input Data**: Pergi ke `/input`, isi form, klik "Simpan Data"
3. **Kelola Data**: Pergi ke `/data` untuk melihat, edit, atau hapus data
4. **Dashboard Publik**: Pergi ke `/dashboard` untuk melihat visualisasi data

### Untuk Admin

1. **Login**: Gunakan admin credentials
2. **Kelola Users**: Pergi ke `/admin/dashboard` > tab "Pengguna"
   - Klik "Tambah Pengguna" untuk membuat user baru
   - Klik "Aktifkan/Nonaktifkan" untuk mengubah status user
3. **Monitoring**: Pergi ke `/admin/dashboard` > tab "Aktivitas"
   - Lihat semua aktivitas yang dilakukan oleh users
   - Filter berdasarkan action atau user
4. **Statistik**: Pergi ke `/admin/dashboard` > tab "Ringkasan"
   - Lihat overview statistik sistem

### Integrasi Google Sheets (Opsional)

Jika ingin mengaktifkan sinkronisasi dengan Google Sheets:

1. Ikuti panduan di `/docs/google-sheets-setup.md`
2. Setup Google Cloud Project dan service account
3. Buat Google Sheet dan share dengan service account
4. Konfigurasi environment variables di `.env`
5. Restart development server

Data akan otomatis tersinkronisasi dengan Google Sheets setiap kali:
- Data baru ditambahkan
- Data diupdate
- Data dihapus

## Kecamatan yang Didukung

- Mempawah Hilir
- Mempawah Hulu
- Sungai Pinyuh
- Toho
- Sungai Kunyit
- Sadaniang
- Anjongan
- Segedong
- Jongkat
- Siantan
- Mempawah Timur

## Jenis Usaha

- Pembenihan
- Pembesaran
- Pembesaran & Pembenihan
- Pembesaran & Pembenihan Pakan Alami

## Wadah Budidaya

- Kolam Tanah
- Kolam Semen
- Karamba
- Kolam Jaring Apung
- Bak Penampungan
- Sawah

## Security Features

1. **Password Hashing**: Semua password di-hash menggunakan bcrypt
2. **Session Management**: Secure HTTP-only cookies
3. **Role-Based Access**: Admin dan Operator memiliki hak akses berbeda
4. **Activity Logging**: Semua aktivitas tercatat lengkap dengan IP address
5. **Input Validation**: Validasi input di sisi server dan client
6. **CSRF Protection**: Built-in dengan Next.js

## Troubleshooting

### Tidak bisa login
- Pastikan email dan password benar
- Cek apakah user masih aktif
- Cek log server untuk error detail

### Data tidak muncul di dashboard
- Pastikan data sudah disimpan dengan benar
- Refresh halaman dashboard
- Cek browser console untuk error JavaScript

### Google Sheets tidak sync
- Pastikan `.env` variables sudah dikonfigurasi dengan benar
- Cek apakah service account email memiliki Editor access ke sheet
- Cek server logs untuk error detail

### Error saat mengupload data
- Pastikan semua field required diisi
- Cek format input (number, text, dll)
- Cek browser console untuk error detail

## Development

### Running Tests
```bash
bun run lint
```

### Database Operations
```bash
bun run db:push      # Push schema changes to database
bun run db:generate   # Generate Prisma Client
bun run db:migrate    # Run migrations
bun run db:reset      # Reset database
```

### Build Production
```bash
bun run build
bun run start
```

## Contact & Support

Untuk pertanyaan atau masalah teknis:
1. Cek documentation di `/docs/`
2. Lihat activity logs untuk debugging
3. Contact system administrator

## License

Internal System - Dinas Perikanan dan Kelautan Kabupaten Mempawah
