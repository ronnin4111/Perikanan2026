'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authenticatedFetch, getUser, clearAuth } from '@/lib/auth-client';

interface PelakuUsaha {
  id: string;
  nama: string;
  kelompok: string | null;
  kecamatan: string;
  desa: string | null;
  jenisUsaha: string | null;
  wadahBudidaya: string | null;
  jenisIkan: string | null;
  kolam: number;
  lahan: number;
  produksi: number;
  lat: number | null;
  lng: number | null;
  cbib: number;
  kusukaKelompok: number;
  createdAt: string;
  updatedAt: string;
}

export default function DataManagementPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PelakuUsaha[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingData, setEditingData] = useState<PelakuUsaha | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchData = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search })
      });

      const response = await authenticatedFetch(`/api/pelaku-usaha?${params}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const result = await response.json();
        setData(result.data || []);
        setTotalPages(result.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = getUser();

        if (!currentUser) {
          console.log('No user found, redirecting to login');
          router.push('/login');
          return;
        }

        setUser(currentUser);
        console.log('User loaded:', currentUser);

        fetchData();
      } catch (err) {
        console.error('Error checking auth:', err);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router, page, search]);

  const handleEdit = (item: PelakuUsaha) => {
    setEditingData(item);
    setShowEditModal(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingData) return;

    try {
      const response = await authenticatedFetch(`/api/pelaku-usaha/${editingData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editingData)
      });

      if (response.ok) {
        setShowEditModal(false);
        setEditingData(null);
        setMessage({ type: 'success', text: 'Data berhasil diupdate!' });
        fetchData();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: 'Gagal mengupdate data' });
      }
    } catch (err) {
      console.error('Error updating data:', err);
      setMessage({ type: 'error', text: 'Gagal mengupdate data' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    try {
      const response = await authenticatedFetch(`/api/pelaku-usaha/${deletingId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setDeletingId(null);
        setMessage({ type: 'success', text: 'Data berhasil dihapus!' });
        fetchData();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: 'Gagal menghapus data' });
      }
    } catch (err) {
      console.error('Error deleting data:', err);
      setMessage({ type: 'error', text: 'Gagal menghapus data' });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
                <h1 className="font-bold text-slate-900 dark:text-white">Kelola Data</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {user?.name} ({user?.role})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a href="/input" className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline">
                Input Data
              </a>
              {user?.role === 'ADMIN' && (
                <a href="/admin/dashboard" className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
                  Admin Panel
                </a>
              )}
              <button
                onClick={() => {
                  clearAuth();
                  router.push('/login');
                }}
                className="text-sm text-red-600 dark:text-red-400 hover:underline"
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
              message.type === 'success'
              ? 'text-green-700 dark:text-green-400'
              : 'text-red-700 dark:text-red-400'
            }`}>
              {message.text}
            </p>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Cari nama, kelompok, kecamatan, atau desa..."
              className="w-full px-4 py-3 pl-12 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400">
              🔍
            </span>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Kelompok
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Kecamatan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Desa
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Jenis Usaha
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
                      {item.nama}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {item.kelompok || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {item.kecamatan}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {item.desa || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {item.jenisUsaha || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {item.wadahBudidaya ? `${item.wadahBudidaya} m²` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {item.kolam ? `${item.kolam}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {item.lahan ? `${item.lahan} m²` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {item.produksi ? `${item.produksi} kg` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                      {item.lat || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                      {item.lng || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                      {item.cbib ? 'Ya' : 'Tidak'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                      {item.kusukaKelompok ? `${item.kusukaKelompok}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {formatDate(item.updatedAt)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-2 py-1 bg-cyan-100 hover:bg-cyan-200 text-cyan-700 rounded text-xs font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-medium transition-colors"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-3 text-center text-slate-500 dark:text-slate-400">
                      Data tidak ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center py-4 gap-3">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Sebelumnya
              </button>
              <span className="px-4 text-slate-600 dark:text-slate-400">
                Halaman {page} dari {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selanjutnya
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {showEditModal && editingData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Edit Data Pelaku Usaha
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-700 dark:hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label htmlFor="edit-nama" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Nama
                </label>
                <input
                  id="edit-nama"
                  type="text"
                  value={editingData.nama}
                  onChange={(e) => setEditingData({ ...editingData, nama: e.target.value })}
                  className="w-full px-4 py-3 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="edit-kelompok" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Kelompok
                </label>
                <input
                  id="edit-kelompok"
                  type="text"
                  value={editingData.kelompok || ''}
                  onChange={(e) => setEditingData({ ...editingData, kelompok: e.target.value })}
                  className="w-full px-4 py-3 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="edit-kecamatan" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Kecamatan
                </label>
                <input
                  id="edit-kecamatan"
                  type="text"
                  value={editingData.kecamatan}
                  onChange={(e) => setEditingData({ ...editingData, kecamatan: e.target.value })}
                  className="w-full px-4 py-3 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="edit-desa" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Desa
                </label>
                <input
                  id="edit-desa"
                  type="text"
                  value={editingData.desa || ''}
                  onChange={(e) => setEditingData({ ...editingData, desa: e.target.value })}
                  className="w-full px-4 py-3 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="edit-jenisUsaha" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Jenis Usaha
                </label>
                <input
                  id="edit-jenisUsaha"
                  type="text"
                  value={editingData.jenisUsaha || ''}
                  onChange={(e) => setEditingData({ ...editingData, jenisUsaha: e.target.value })}
                  className="w-full px-4 py-3 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="edit-wadahBudidaya" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Wadah Budidaya
                </label>
                <input
                  id="edit-wadahBudidaya"
                  type="text"
                  value={editingData.wadahBudidaya || ''}
                  onChange={(e) => setEditingData({ ...editingData, wadahBudidaya: e.target.value })}
                  className="w-full px-4 py-3 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="edit-kolam" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Jumlah Kolam
                </label>
                <input
                  id="edit-kolam"
                  type="number"
                  value={editingData.kolam || ''}
                  onChange={(e) => setEditingData({ ...editingData, kolam: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="edit-lahan" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Luas Lahan (m²)
                </label>
                <input
                  id="edit-lahan"
                  type="text"
                  value={editingData.lahan || ''}
                  onChange={(e) => setEditingData({ ...editingData, lahan: parseFloat(e.target.value) || null })}
                  className="w-full px-4 py-3 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="edit-produksi" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Produksi (kg)
                </label>
                <input
                  id="edit-produksi"
                  type="number"
                  value={editingData.produksi || ''}
                  onChange={(e) => setEditingData({ ...editingData, produksi: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="edit-lat" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Latitude
                </label>
                <input
                  id="edit-lat"
                  type="text"
                  value={editingData.lat || ''}
                  onChange={(e) => setEditingData({ ...editingData, lat: parseFloat(e.target.value) || null })}
                  className="w-full px-4 py-3 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="edit-lng" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Longitude
                </label>
                <input
                  id="edit-lng"
                  type="text"
                  value={editingData.lng || ''}
                  onChange={(e) => setEditingData({ ...editingData, lng: parseFloat(e.target.value) || null })}
                  className="w-full px-4 py-3 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="edit-cbib" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  CBIB (Ya/Tidak)
                </label>
                <select
                  id="edit-cbib"
                  value={editingData.cbib ? '1' : '0'}
                  onChange={(e) => setEditingData({ ...editingData, cbib: parseInt(e.target.value) ? 1 : 0 })}
                  className="w-full px-4 py-3 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="0">Tidak</option>
                  <option value="1">Ya</option>
                </select>
              </div>

              <div>
                <label htmlFor="edit-kusukaKelompok" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Skor KUSUKA Kelompok
                </label>
                <input
                  id="edit-kusukaKelompok"
                  type="number"
                  value={editingData.kusukaKelompok || ''}
                  onChange={(e) => setEditingData({ ...editingData, kusukaKelompok: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Konfirmasi Hapus
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
