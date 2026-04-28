'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '2rem',
      padding: '1rem'
    }}>
      <div style={{
        position: 'relative',
        width: '6rem',
        height: '6rem'
      }}>
        <img
          src="/logo.svg"
          alt="Z.ai Logo"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
      </div>

      <div style={{
        textAlign: 'center',
        maxWidth: '600px'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          color: '#1e293b'
        }}>
          Dashboard Perikanan Budidaya
        </h1>
        <p style={{
          fontSize: '1rem',
          color: '#64748b',
          marginBottom: '2rem'
        }}>
          Sistem interaktif untuk monitoring dan analisis data pelaku usaha budidaya perikanan di Kabupaten Mempawah.
        </p>

        <Link
          href="/dashboard"
          style={{
            display: 'inline-block',
            padding: '0.75rem 2rem',
            backgroundColor: '#0891b2',
            color: 'white',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            textDecoration: 'none',
            transition: 'all 0.2s',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#0e7490'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#0891b2'
          }}
        >
          Buka Dashboard →
        </Link>

        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          backgroundColor: '#f0f9ff',
          borderRadius: '0.75rem',
          border: '1px solid #bae6fd'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#0c4a6e',
            marginBottom: '0.75rem'
          }}>
            Fitur Utama:
          </h3>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            textAlign: 'left',
            color: '#155e75'
          }}>
            <li style={{ marginBottom: '0.5rem' }}>📊 Visualisasi data dengan grafik interaktif</li>
            <li style={{ marginBottom: '0.5rem' }}>🗺️ Peta sebaran dengan marker cluster</li>
            <li style={{ marginBottom: '0.5rem' }}>🔍 Filter cascading untuk analisis mendalam</li>
            <li style={{ marginBottom: '0.5rem' }}>📥 Export data ke PDF dan Excel</li>
            <li style={{ marginBottom: '0.5rem' }}>🌙 Dark mode untuk kenyamanan visual</li>
            <li>📱 Desain responsif untuk desktop dan mobile</li>
          </ul>
        </div>

        <div style={{
          marginTop: '1.5rem',
          fontSize: '0.875rem',
          color: '#94a3b8'
        }}>
          <p>Admin Email: <strong>admin@dpkpp.go.id</strong></p>
          <p>Admin Password: <strong>admin123</strong></p>
        </div>
      </div>
    </div>
  )
}