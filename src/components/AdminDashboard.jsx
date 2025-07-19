import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLogout } from './LogoutBersama'; 
import { Link } from 'react-router-dom';
import '../assets/css/AdminDashboard.css';
export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalPengajuan: 0,
        pending: 0,
        disetujui: 0,
        ditolak: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const logout = useLogout();

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

    if (loading) return (
        <div className="admin-dashboard-loading-error-container">
            <p className="admin-dashboard-loading-message">Loading dashboard...</p>
        </div>
    );
    if (error) return (
        <div className="admin-dashboard-loading-error-container">
            <p className="admin-dashboard-error-message">{error}</p>
        </div>
    );

    return (
        <div className="admin-dashboard-container">
            <div className="admin-dashboard-card">
                <h1 className="admin-dashboard-title">Dashboard Admin</h1>

                {/* Tombol Logout */}
                <div className="admin-logout-button-container">
                    <button
                        onClick={logout}
                        className="admin-logout-button"
                    >
                        Logout
                    </button>
                </div>

                {/* Navigasi ke halaman pengajuan */}
                <nav className="admin-dashboard-nav">
                    <Link
                        to="/admin/pengajuan"
                        className="admin-nav-button primary-button"
                    >
                        Kelola Pengajuan Magang
                    </Link>

                    {/* Link Kalender Magang */}
                    <Link
                        to="/kalender-magang"
                        className="admin-nav-button calendar-button"
                    >
                        <span className="calendar-icon">📅</span> Lihat Kalender Magang
                    </Link>
                </nav>

                {/* Statistik */}
                <div className="admin-stats-grid">
                    <StatCard title="Total Pengajuan" value={stats.totalPengajuan} />
                    <StatCard title="Pending" value={stats.pending} />
                    <StatCard title="Disetujui" value={stats.disetujui} />
                    <StatCard title="Ditolak" value={stats.ditolak} />
                </div>
            </div>
        </div>
    );
}

// Komponen StatCard untuk reusable UI statistik
function StatCard({ title, value }) {
    return (
        <div className="admin-stat-card">
            <h3 className="admin-stat-title">{title}</h3>
            <p className="admin-stat-value">{value}</p>
        </div>
    );
}
