import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLogout } from './LogoutBersama';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPengajuan: 0,
    pending: 0,
    disetujui: 0,
    ditolak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const logout = useLogout(); // true karena ini admin

  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/admin/pengajuan/stats', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStats(res.data);
      } catch (err) {
        if (err.response) {
          setError(`Error ${err.response.status}: ${err.response.data.message || err.response.statusText}`);
        } else if (err.request) {
          setError('Error: Tidak ada respon dari server');
        } else {
          setError('Error: ' + err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchStats();
    } else {
      setError('Token tidak ditemukan. Silakan login.');
      setLoading(false);
    }
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ padding: '20px', maxWidth: 900, margin: 'auto' }}>
      <h1>Dashboard Admin</h1>

      {/* Tombol Logout */}
      <button
        onClick={logout}
        style={{
          marginBottom: 20,
          padding: '8px 12px',
          backgroundColor: '#d32f2f',
          color: 'white',
          border: 'none',
          borderRadius: 5,
          cursor: 'pointer',
        }}
      >
        Logout
      </button>

      {/* Navigasi ke halaman pengajuan */}
      <nav style={{ marginBottom: 30 }}>
        <Link
          to="/admin/pengajuan"
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            backgroundColor: '#1976d2',
            color: 'white',
            borderRadius: 5,
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          Kelola Pengajuan Magang
        </Link>

        <Link to="/kalender-magang" className="calendar-btn">
          📅 Lihat Kalender Magang
        </Link>

      </nav>

      {/* Statistik */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <StatCard title="Total Pengajuan" value={stats.totalPengajuan} />
        <StatCard title="Pending" value={stats.pending} />
        <StatCard title="Disetujui" value={stats.disetujui} />
        <StatCard title="Ditolak" value={stats.ditolak} />
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div
      style={{
        flex: 1,
        padding: '20px',
        borderRadius: '8px',
        backgroundColor: '#f0f0f0',
        textAlign: 'center',
        boxShadow: '0 0 5px rgba(0,0,0,0.1)',
      }}
    >
      <h3>{title}</h3>
      <p style={{ fontSize: '2rem', margin: '10px 0' }}>{value}</p>
    </div>

  );
}
