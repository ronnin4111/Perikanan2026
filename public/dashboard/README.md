# Dashboard Perikanan Budidaya

Web dashboard interaktif untuk menampilkan dan menganalisis data pelaku usaha budidaya perikanan. Dibuat khusus untuk dinas pemerintah daerah (contoh: DPKPP Kabupaten Mempawah, Kalimantan Barat).

## Fitur Utama

### 🔐 Sistem Autentikasi
- Password gate dengan desain glassmorphism
- Session management dengan durasi 8 jam
- Animasi halus saat login/logout

### 📊 Dashboard Analitik
- **4 Kartu Statistik**: Total Pelaku Usaha, Total Kelompok, Total Produksi, Total Luas Lahan
- **Grafik Distribusi**: Pie chart dan Bar chart untuk kategori berbeda
- **Grafik Kecamatan**: 6 mode visualisasi (Pelaku Usaha, Kelompok, Wadah, Jenis Usaha, Jenis Ikan, Produksi)

### 🗺️ Peta Interaktif
- Leaflet.js dengan tile layer Google Satellite
- MarkerCluster untuk performa dengan banyak titik
- Color-coded marker berdasarkan jenis usaha
- Popup dan tooltip interaktif
- GeoJSON overlay untuk batas kecamatan (opsional)
- Legend peta yang dapat di-toggle

### 🔍 Filter Cascading
- Filter bertingkat: Kecamatan → Desa → Kelompok → Jenis Usaha → Wadah Budidaya → Jenis Ikan
- Filter tambahan: CBIB (Ya/Tidak/Semua)
- Real-time update semua komponen saat filter berubah

### 📋 Tabel Data
- Search bar untuk pencarian cepat
- Sorting per kolom (ascending/descending)
- Pagination 15 baris per halaman
- Striping baris untuk keterbacaan
- Badge jenis usaha berwarna

### 📥 Export Data
- **Excel**: Export lengkap semua kolom data terfilter
- **PDF**: Laporan 3 halaman dengan:
  - Halaman 1: Ringkasan Eksekutif + grafik
  - Halaman 2: Analisis per Kecamatan (4 grafik)
  - Halaman 3: Tabel data lengkap + area tanda tangan

### 🌙 Dark Mode
- Toggle dark/light mode
- Auto-save ke localStorage
- Chart dan peta menyesuaikan tema

### 📱 Responsif
- Layout desktop dengan sidebar fixed
- Mobile drawer dengan hamburger menu
- Overlay gelap saat sidebar terbuka
- Breakpoints mobile-first

## Teknologi

| Pustaka | Versi | Fungsi |
|---------|-------|--------|
| Alpine.js | v3.14.1 | Reaktivitas UI |
| Tailwind CSS | CDN | Styling utility-first |
| Leaflet.js | v1.9.4 | Peta interaktif |
| Leaflet.markercluster | v1.5.3 | Cluster marker |
| Chart.js | v4.4.0 | Grafik |
| chartjs-plugin-datalabels | v2.2.0 | Label di grafik |
| jsPDF | v2.5.1 | Export PDF |
| jspdf-autotable | v3.8.2 | Tabel di PDF |
| SheetJS (XLSX) | v0.18.5 | Export Excel |
| PapaParse | v5.4.1 | Parsing CSV |

## Struktur File

```
dashboard/
├── index.html          # Halaman utama
├── app.js              # Logika aplikasi Alpine.js
├── auth.js             # Sistem autentikasi
├── sample-data.csv     # Contoh data CSV
├── geojson/            # Folder untuk GeoJSON (opsional)
│   └── [nama_kecamatan].geojson
└── README.md           # Dokumentasi ini
```

## Cara Menggunakan

### 1. Buka Dashboard
Buka file `index.html` di browser modern (Chrome, Firefox, Edge, Safari).

### 2. Login
Masukkan password default: `dpkpp123`

### 3. Navigasi
- **Desktop**: Sidebar di kiri menampilkan filter dan kontrol
- **Mobile**: Klik hamburger menu (☰) di pojok kiri atas

### 4. Menggunakan Filter
1. Klik "🔍 Filter Utama" untuk membuka panel filter
2. Pilih filter yang diinginkan (checkbox multi-select)
3. Klik "✅ Terapkan Filter" untuk menerapkan
4. Klik "🔄 Reset Filter" untuk mereset semua filter

### 5. Menggunakan Grafik
- **Grafik Distribusi**:
  - Pilih tipe chart: 🥧 Pie atau 📊 Bar
  - Pilih kategori dari dropdown
- **Grafik Kecamatan**:
  - Klik tombol mode di atas chart
  - Pilih: Pelaku Usaha, Kelompok, Wadah, Jenis Usaha, Jenis Ikan, atau Produksi

### 6. Menggunakan Peta
- Klik marker untuk melihat popup detail
- Hover marker untuk melihat tooltip
- Gunakan dropdown filter untuk memfilter marker berdasarkan jenis usaha
- Toggle legend di mobile

### 7. Export Data
- **Export Excel**: Klik tombol "📊 Export Excel" di sidebar
- **Export PDF**: Klik tombol "📄 Export PDF" di sidebar

## Format Data CSV

### Kolom yang Diperlukan

| Kolom CSV | Deskripsi | Tipe |
|-----------|-----------|------|
| NAMA / NAMA PELAKU USAHA | Nama pelaku usaha | string |
| KELOMPOK / NAMA KELOMPOK | Nama kelompok | string |
| KECAMATAN | Nama kecamatan | string |
| DESA | Nama desa | string |
| JENIS USAHA | Jenis usaha (Pembenihan/Pembesaran) | string |
| WADAH BUDIDAYA | Jenis wadah (Kolam, Karamba, dll) | string |
| JENIS IKAN UTAMA | Jenis ikan utama | string |
| TAMBAHAN 1 | Jenis ikan tambahan (opsional) | string |
| TAMBAHAN 2 | Jenis ikan tambahan (opsional) | string |
| JUMLAH KOLAM | Jumlah kolam | number |
| LUAS LAHAN (m2) | Luas lahan dalam m² | number |
| PRODUKSI (Kg) | Produksi dalam Kg | number |
| LAT | Lintang (latitude) | float |
| LNG / LON / LON | Bujur (longitude) | float |
| CBIB | Status CBIB (0/1) | int |
| KUSUKA KELOMPOK | Kode Kusuka Kelompok | int |

### Contoh Baris Data

```
NAMA PELAKU USAHA,KELOMPOK,KECAMATAN,DESA,JENIS USAHA,WADAH BUDIDAYA,JENIS IKAN UTAMA,TAMBAHAN 1,JUMLAH KOLAM,LUAS LAHAN (m2),PRODUKSI (Kg),LAT,LNG,CBIB
Ahmad Fauzi,Mekar Jaya,Mempawah Hilir,Pasir Wan,Pembesaran,Kolam Tanah,Nila,Lele,5,2500,7500,0.345,108.90,1
```

## Konfigurasi

### Mengganti Password

Edit file `auth.js`:

```javascript
const AUTH_CONFIG = {
    PASSWORD: 'password_baru_anda', // Ganti dengan password yang diinginkan
    SESSION_KEY: 'dashboard_authenticated',
    SESSION_DURATION: 8 * 60 * 60 * 1000 // 8 jam
};
```

### Mengganti Warna Tema

Edit file `app.js`:

```javascript
jenisUsahaColors: {
    'Pembenihan': '#3B82F6',  // Ganti warna
    'Pembesaran': '#10B981',
    // dll...
}
```

### Menggunakan URL CSV Sendiri

Edit file `app.js` di fungsi `loadData()`:

```javascript
const csvUrl = 'URL_CSV_ANDA'; // Ganti dengan URL CSV Anda
```

### Menambah GeoJSON

1. Buat folder `geojson/`
2. Simpan file GeoJSON dengan format: `{nama_kecamatan}.geojson`
3. Contoh: `mempawah_hilir.geojson`

Dashboard akan otomatis mencoba memuat file GeoJSON per kecamatan.

## Host di GitHub Pages

### Cara Deploy

1. **Push ke GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/username/repo.git
   git push -u origin main
   ```

2. **Aktifkan GitHub Pages**
   - Buka repository di GitHub
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: main / (root)
   - Save

3. **Akses Dashboard**
   - URL: `https://username.github.io/repo/dashboard/`

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+

## Troubleshooting

### Data tidak muncul
- Pastikan file `sample-data.csv` ada di folder yang sama
- Cek console browser untuk error (F12 → Console)
- Pastikan format CSV sesuai dengan spesifikasi

### Peta tidak muncul
- Pastikan koneksi internet aktif (Leaflet perlu load tile dari internet)
- Cek apakah Leaflet CSS dan JS ter-load dengan benar

### Grafik tidak muncul
- Pastikan Chart.js dan plugin ter-load
- Cek apakah ada data di filtered array
- Coba refresh halaman

### Export PDF gagal
- Pastikan browser mendukung canvas
- Cek apakah jsPDF ter-load dengan benar
- Coba di browser lain (Chrome/Firefox)

### Export Excel gagal
- Pastikan SheetJS ter-load
- Cek apakah ada data untuk diexport
- Coba di browser lain

## Lisensi

Dashboard ini dibuat untuk keperluan pemerintahan dan dapat digunakan secara bebas.

## Kontak

Untuk pertanyaan atau dukungan, silakan hubungi:
- Dinas Perikanan dan Kelautan Perikanan Kabupaten Mempawah

---

**© 2025 Dinas Perikanan dan Kelautan Perikanan Kabupaten Mempawah**
