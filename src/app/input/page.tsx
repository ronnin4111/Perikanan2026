'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authenticatedFetch, getUser, clearAuth } from '@/lib/auth-client';

export default function InputDataPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    nama: '',
    kelompok: '',
    kecamatan: '',
    desa: '',
    jenisUsaha: '',
    wadahBudidaya: '',
    jenisIkan: '',
    kolam: '',
    lahan: '',
    produksi: '',
    lat: '',
    lng: '',
    cbib: '0',
    kusukaKelompok: ''
  });

  const kecamatanList = [
    'Mempawah Hilir', 'Mempawah Hulu', 'Sungai Pinyuh', 'Toho', 'Sungai Kunyit',
    'Sadaniang', 'Anjongan', 'Segedong', 'Jongkat', 'Siantan', 'Mempawah Timur'
  ];

  const jenisUsahaList = [
    'Pembenihan', 'Pembesaran', 'Pembesaran & Pembenihan', 'Pembesaran & Pembenihan Pakan Alami'
  ];

  const wadahBudidayaList = [
    'Kolam Tanah', 'Kolam Semen', 'Karamba', 'Kolam Jaring Apung', 'Bak Penampungan', 'Sawah'
  ];

  // Fetch user session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = getUser();
        setUser(currentUser);
        console.log('Current user:', currentUser);
        
        if (!currentUser) {
          console.log('No user found, redirecting to login');
          router.push('/login');
          return;
        }
        setLoading(false);
      } catch (err) {
        console.error('Error checking auth:', err);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  // Get current location
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            lat: position.coords.latitude.toString(),
            lng: position.coords.longitude.toString()
          });
          setMessage({ type: 'success', text: 'Lokasi berhasil didapatkan' });
        },
        (error) => {
          console.error('Geolocation error:', error);
          setMessage({ type: 'error', text: 'Gagal mendapatkan lokasi otomatis. Silakan input manual.' });
        }
      );
    } else {
      setMessage({ type: 'error', text: 'Browser tidak mendukung geolocation' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await authenticatedFetch('/api/pelaku-usaha', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Data berhasil disimpan!' });

        // Reset form
        setFormData({
          nama: '',
          kelompok: '',
          kecamatan: '',
          desa: '',
          jenisUsaha: '',
          wadahBudidaya: '',
          jenisIkan: '',
          kolam: '',
          lahan: '',
          produksi: '',
          lat: '',
          lng: '',
          cbib: '0',
          kusukaKelompok: ''
        });

        // Clear message after 3 seconds
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Gagal menyimpan data' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat menyimpan data' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    clearAuth();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">DKP</span>
              </div>
              <div>
                <h1 className="font-bold text-slate-900 dark:text-white">Input Data Pelaku Usaha</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {user?.name} ({user?.role})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a href="/data" className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
                Kelola Data
              </a>
              <a href="/dashboard" className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline">
                Dashboard Publik
              </a>
              {user?.role === 'ADMIN' && (
                <a href="/admin/dashboard" className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
                  Admin Panel
                </a>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <p className={`text-sm ${
              message.type === 'success' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
            }`}>
              {message.text}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
            Form Input Data
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Nama */}
            <div className="lg:col-span-2">
              <label htmlFor="nama" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Nama Pelaku Usaha <span className="text-red-500">*</span>
              </label>
              <input
                id="nama"
                type="text"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="Nama pelaku usaha atau petani"
                required
                disabled={submitting}
              />
            </div>

            {/* Kelompok */}
            <div>
              <label htmlFor="kelompok" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Nama Kelompok
              </label>
              <input
                id="kelompok"
                type="text"
                value={formData.kelompok}
                onChange={(e) => setFormData({ ...formData, kelompok: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="Nama kelompok"
                disabled={submitting}
              />
            </div>

            {/* Kecamatan */}
            <div>
              <label htmlFor="kecamatan" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Kecamatan <span className="text-red-500">*</span>
              </label>
              <select
                id="kecamatan"
                value={formData.kecamatan}
                onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                required
                disabled={submitting}
              >
                <option value="">Pilih Kecamatan</option>
                {kecamatanList.map(kec => (
                  <option key={kec} value={kec}>{kec}</option>
                ))}
              </select>
            </div>

            {/* Desa */}
            <div>
              <label htmlFor="desa" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Desa
              </label>
              <input
                id="desa"
                type="text"
                value={formData.desa}
                onChange={(e) => setFormData({ ...formData, desa: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="Nama desa"
                disabled={submitting}
              />
            </div>

            {/* Jenis Usaha */}
            <div>
              <label htmlFor="jenisUsaha" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Jenis Usaha
              </label>
              <select
                id="jenisUsaha"
                value={formData.jenisUsaha}
                onChange={(e) => setFormData({ ...formData, jenisUsaha: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                disabled={submitting}
              >
                <option value="">Pilih Jenis Usaha</option>
                {jenisUsahaList.map(jenis => (
                  <option key={jenis} value={jenis}>{jenis}</option>
                ))}
              </select>
            </div>

            {/* Wadah Budidaya */}
            <div>
              <label htmlFor="wadahBudidaya" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Wadah Budidaya
              </label>
              <select
                id="wadahBudidaya"
                value={formData.wadahBudidaya}
                onChange={(e) => setFormData({ ...formData, wadahBudidaya: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                disabled={submitting}
              >
                <option value="">Pilih Wadah Budidaya</option>
                {wadahBudidayaList.map(wadah => (
                  <option key={wadah} value={wadah}>{wadah}</option>
                ))}
              </select>
            </div>

            {/* Jenis Ikan */}
            <div className="lg:col-span-2">
              <label htmlFor="jenisIkan" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Jenis Ikan
              </label>
              <input
                id="jenisIkan"
                type="text"
                value={formData.jenisIkan}
                onChange={(e) => setFormData({ ...formData, jenisIkan: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="Contoh: Lele, Nila, Mas, Patin"
                disabled={submitting}
              />
            </div>

            {/* Jumlah Kolam */}
            <div>
              <label htmlFor="kolam" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Jumlah Kolam
              </label>
              <input
                id="kolam"
                type="number"
                value={formData.kolam}
                onChange={(e) => setFormData({ ...formData, kolam: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="0"
                min="0"
                disabled={submitting}
              />
            </div>

            {/* Luas Lahan */}
            <div>
              <label htmlFor="lahan" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Luas Lahan (m²)
              </label>
              <input
                id="lahan"
                type="number"
                step="0.01"
                value={formData.lahan}
                onChange={(e) => setFormData({ ...formData, lahan: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="0"
                min="0"
                disabled={submitting}
              />
            </div>

            {/* Produksi */}
            <div>
              <label htmlFor="produksi" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Produksi (Kg)
              </label>
              <input
                id="produksi"
                type="number"
                step="0.01"
                value={formData.produksi}
                onChange={(e) => setFormData({ ...formData, produksi: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="0"
                min="0"
                disabled={submitting}
              />
            </div>

            {/* Location */}
            <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    placeholder="-0.123"
                    disabled={submitting}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    placeholder="108.456"
                    disabled={submitting}
                  />
                </div>
                <button
                  type="button"
                  onClick={getLocation}
                  disabled={submitting}
                  className="mt-6 px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl transition-colors self-end"
                >
                  📍 Auto Lokasi
                </button>
              </div>
            </div>

            {/* CBIB */}
            <div>
              <label htmlFor="cbib" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Sertifikasi CBIB
              </label>
              <select
                id="cbib"
                value={formData.cbib}
                onChange={(e) => setFormData({ ...formData, cbib: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                disabled={submitting}
              >
                <option value="0">Tidak</option>
                <option value="1">Ya</option>
              </select>
            </div>

            {/* KUSUKA Kelompok */}
            <div>
              <label htmlFor="kusukaKelompok" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Skor KUSUKA Kelompok
              </label>
              <input
                id="kusukaKelompok"
                type="number"
                value={formData.kusukaKelompok}
                onChange={(e) => setFormData({ ...formData, kusukaKelompok: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="0"
                min="0"
                max="100"
                disabled={submitting}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-cyan-500/30"
            >
              {submitting ? 'Menyimpan...' : '💾 Simpan Data'}
            </button>
            <button
              type="button"
              onClick={() => setFormData({
                nama: '',
                kelompok: '',
                kecamatan: '',
                desa: '',
                jenisUsaha: '',
                wadahBudidaya: '',
                jenisIkan: '',
                kolam: '',
                lahan: '',
                produksi: '',
                lat: '',
                lng: '',
                cbib: '0',
                kusukaKelompok: ''
              })}
              disabled={submitting}
              className="px-6 py-4 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-colors hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
