'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('📝 [CLIENT] Login form submitted');
    console.log('📝 [CLIENT] Email:', formData.email);
    console.log('📝 [CLIENT] Password length:', formData.password?.length);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      console.log('📝 [CLIENT] Response status:', response.status);
      console.log('📝 [CLIENT] Response ok:', response.ok);

      const data = await response.json();
      console.log('📝 [CLIENT] Response data:', data);

      if (response.ok && data.success) {
        // Save token to localStorage
        localStorage.setItem('auth-token', data.token);
        localStorage.setItem('auth-user', JSON.stringify(data.user));

        console.log('✅ [CLIENT] Token saved to localStorage');
        console.log('✅ [CLIENT] User data:', data.user);

        // Redirect based on role
        if (data.user.role === 'ADMIN') {
          console.log('🔀 [CLIENT] Redirecting to admin dashboard...');
          window.location.href = '/admin/dashboard';
        } else {
          console.log('🔀 [CLIENT] Redirecting to input page...');
          window.location.href = '/input';
        }
      } else {
        console.log('❌ [CLIENT] Login failed');
        console.log('❌ [CLIENT] Error message:', data.error);
        setError(data.error || 'Login gagal');
      }
    } catch (err) {
      console.error('❌ [CLIENT] Login error:', err);
      setError('Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">DKP</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Sistem Input Data
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              DPKPP Kabupaten Mempawah
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-700 dark:text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="masukkan@email.com"
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="•••••••••••"
                required
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-cyan-500/30"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memuat...
                </span>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          {/* Back to Dashboard */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <a
              href="/dashboard"
              className="text-cyan-600 dark:text-cyan-400 hover:underline text-sm text-center block"
            >
              ← Kembali ke Dashboard Publik
            </a>
          </div>
        </div>

        {/* Footer Info */}
        <p className="text-center text-slate-600 dark:text-slate-400 text-sm mt-6">
          Hubungi admin untuk mendapatkan akun
        </p>
      </div>
    </div>
  );
}
