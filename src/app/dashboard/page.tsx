'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    totalProduksi: 0,
    byKecamatan: {} as Record<string, number>
  })
  const [filter, setFilter] = useState({
    kecamatan: '',
    desa: '',
    search: ''
  })
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/pelaku-usaha')
      const result = await response.json()
      setData(result.data || [])
      
      // Calculate stats
      const total = result.data?.length || 0
      const totalProduksi = result.data?.reduce((sum: number, item: any) => sum + (item.produksi || 0), 0)
      const byKecamatan = result.data?.reduce((acc: any, item: any) => {
        const kec = item.kecamatan || 'Unknown'
        acc[kec] = (acc[kec] || 0) + 1
        return acc
      }, {})
      
      setStats({ total, totalProduksi, byKecamatan })
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredData = data.filter((item: any) => {
    const matchKecamatan = !filter.kecamatan || item.kecamatan?.toLowerCase().includes(filter.kecamatan.toLowerCase())
    const matchDesa = !filter.desa || item.desa?.toLowerCase().includes(filter.desa.toLowerCase())
    const matchSearch = !filter.search || 
      item.nama?.toLowerCase().includes(filter.search.toLowerCase()) ||
      item.kelompok?.toLowerCase().includes(filter.search.toLowerCase())
    
    return matchKecamatan && matchDesa && matchSearch
  })

  const handleExportPDF = () => {
    window.print()
  }

  const handleExportExcel = () => {
    const csvContent = [
      ['Nama', 'Kelompok', 'Kecamatan', 'Desa', 'Jenis Usaha', 'Produksi (kg)', 'Lahan (ha)', 'Kolam'].join(','),
      ...filteredData.map((item: any) => [
        item.nama,
        item.kelompok || '',
        item.kecamatan,
        item.desa || '',
        item.jenisUsaha || '',
        item.produksi || 0,
        item.lahan || 0,
        item.kolam || 0
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `data_pelaku_usaha_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const kecamatanList = Array.from(new Set(data.map((item: any) => item.kecamatan))).sort()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">DKP</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Dashboard Publik</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">Data Pelaku Usaha Budidaya Perikanan</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
              >
                Login Admin
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Pelaku Usaha</h3>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                🏢
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Produksi</h3>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                📊
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalProduksi.toLocaleString()} kg</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Kecamatan</h3>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                🗺️
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{Object.keys(stats.byKecamatan).length}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Kelompok</h3>
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                👥
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {Array.from(new Set(data.map((item: any) => item.kelompok).filter(Boolean))).length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Filter Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Kecamatan
              </label>
              <select
                value={filter.kecamatan}
                onChange={(e) => setFilter({ ...filter, kecamatan: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="">Semua Kecamatan</option>
                {kecamatanList.map((kec) => (
                  <option key={kec} value={kec}>{kec}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Desa
              </label>
              <input
                type="text"
                value={filter.desa}
                onChange={(e) => setFilter({ ...filter, desa: e.target.value })}
                placeholder="Cari desa..."
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Pencarian
              </label>
              <input
                type="text"
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                placeholder="Cari nama atau kelompok..."
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setFilter({ kecamatan: '', desa: '', search: '' })
              }}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              Reset Filter
            </button>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              📥 Export PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              📊 Export Excel
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setShowMap(false)}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              !showMap
                ? 'bg-cyan-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            📋 Tabel Data
          </button>
          <button
            onClick={() => setShowMap(true)}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              showMap
                ? 'bg-cyan-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            🗺️ Peta Sebaran
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-600 border-t-transparent"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Memuat data...</p>
          </div>
        ) : showMap ? (
          /* Map View */
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Peta Sebaran Pelaku Usaha</h3>
            <div className="h-96 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <p className="text-slate-600 dark:text-slate-400">
                  {filteredData.length} lokasi pelaku usaha
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                  Tampilan peta akan ditambahkan
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Table View */
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kelompok</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kecamatan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Desa</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jenis Usaha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Produksi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lahan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kolam</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredData.map((item: any, index: number) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white font-medium">
                        {item.nama}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                        {item.kelompok || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                        {item.kecamatan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                        {item.desa || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                        {item.jenisUsaha || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white font-medium">
                        {item.produksi?.toLocaleString() || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white font-medium">
                        {item.lahan?.toLocaleString() || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white font-medium">
                        {item.kolam || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredData.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-600 dark:text-slate-400">Tidak ada data yang sesuai dengan filter</p>
              </div>
            )}
          </div>
        )}

        {/* Showing count */}
        <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
          Menampilkan {filteredData.length} dari {data.length} data
        </div>
      </main>
    </div>
  )
}
