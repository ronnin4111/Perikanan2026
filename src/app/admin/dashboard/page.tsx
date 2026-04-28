'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authenticatedFetch, getUser, clearAuth, getToken } from '@/lib/auth-client';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'OPERATOR';
  isActive: boolean;
  createdAt: string;
}

interface ActivityLog {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  entity: string | null;
  entityType: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'activity'>('overview');

  const [users, setUsers] = useState<User[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalActivities: 0,
    totalDataEntries: 0,
    recentActivities: 0
  });

  // Add user modal
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    password: '',
    role: 'OPERATOR' as 'ADMIN' | 'OPERATOR'
  });

  const fetchUsers = async () => {
    try {
      const response = await authenticatedFetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const response = await authenticatedFetch('/api/admin/activity');
      if (response.ok) {
        const data = await response.json();
        setActivityLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Error fetching activity logs:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await authenticatedFetch('/api/pelaku-usaha');
      if (response.ok) {
        const data = await response.json();
        setStats(prev => ({
          ...prev,
          totalDataEntries: data.pagination?.total || 0
        }));
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = getToken();
      const userData = getUser();

      console.log('🔍 Admin Dashboard - Checking auth...');
      console.log('🔍 Token exists:', !!token);
      console.log('🔍 User data:', userData);

      if (!token || !userData) {
        console.log('⚠️ No auth found, redirecting to login...');
        router.push('/login');
        return;
      }

      console.log('✅ Auth found, loading dashboard...');
      // Set state and fetch initial data
      setUser(userData);
      setLoading(false);
      fetchUsers();
      fetchActivityLogs();
      fetchStats();
    };

    checkAuth();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await authenticatedFetch('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        setShowAddUser(false);
        setNewUser({ email: '', name: '', password: '', role: 'OPERATOR' });
        fetchUsers();
        fetchActivityLogs();
      }
    } catch (err) {
      console.error('Error adding user:', err);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await authenticatedFetch(`/api/admin/users/${userId}/toggle`, {
        method: 'PATCH'
      });

      if (response.ok) {
        fetchUsers();
        fetchActivityLogs();
      }
    } catch (err) {
      console.error('Error toggling user status:', err);
    }
  };

  const getActionBadge = (action: string) => {
    const badges = {
      CREATE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      UPDATE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      LOGIN: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      LOGOUT: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    };
    return badges[action as keyof typeof badges] || 'bg-gray-100 text-gray-700';
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
          <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">AD</span>
              </div>
              <div>
                <h1 className="font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {user?.name} ({user?.role})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a href="/input" className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline">
                Input Data
              </a>
              <a href="/data" className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
                Kelola Data
              </a>
              <a href="/dashboard" className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
                Dashboard Publik
              </a>
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
        {/* Tab Navigation */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-2 mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-purple-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            📊 Ringkasan
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            👥 Pengguna
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'activity'
                ? 'bg-purple-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            📋 Aktivitas
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Total Pengguna
                </h3>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{users.length}</p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📋</span>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Total Aktivitas
                </h3>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{activityLogs.length}</p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🐟</span>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Total Data Pelaku Usaha
                </h3>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalDataEntries}</p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🟢</span>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Pengguna Aktif
                </h3>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {users.filter(u => u.isActive).length}
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Aktivitas Terbaru
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activityLogs.slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                  >
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionBadge(log.action)}`}>
                      {log.action}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {log.user.name}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                        {log.entityType} {log.entity && `(${log.entity})`}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        {formatDate(log.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                {activityLogs.length === 0 && (
                  <p className="text-center text-slate-500 dark:text-slate-400 py-4">
                    Belum ada aktivitas
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Kelola Pengguna
              </h2>
              <button
                onClick={() => setShowAddUser(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                + Tambah Pengguna
              </button>
            </div>

            <div className="space-y-3">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                        <span className="text-lg">👤</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{u.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-13">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                          : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'
                      }`}>
                        {u.role}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.isActive
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {u.isActive ? 'Aktif' : 'Non-aktif'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleUserStatus(u.id, u.isActive)}
                    className="px-3 py-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                  >
                    {u.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                </div>
              ))}
              {users.length === 0 && (
                <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                  Belum ada pengguna
                </p>
              )}
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
              Log Aktivitas
            </h2>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                >
                  <span className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${getActionBadge(log.action)}`}>
                    {log.action}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {log.user.name}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {log.user.email}
                    </p>
                    {log.entityType && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {log.action === 'CREATE' && 'Membuat'}
                        {log.action === 'UPDATE' && 'Mengupdate'}
                        {log.action === 'DELETE' && 'Menghapus'}
                        {' '}
                        {log.entityType}
                        {log.entity && ` (${log.entity.slice(0, 8)}...)`}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      {formatDate(log.createdAt)}
                    </p>
                    {log.ipAddress && (
                      <p className="text-xs text-slate-400 dark:text-slate-600">
                        IP: {log.ipAddress}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {activityLogs.length === 0 && (
                <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                  Belum ada aktivitas tercatat
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Tambah Pengguna Baru
              </h3>
              <button
                onClick={() => setShowAddUser(false)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Nama
                </label>
                <input
                  id="name"
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Role
                </label>
                <select
                  id="role"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'ADMIN' | 'OPERATOR' })}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="OPERATOR">Operator</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="flex-1 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
