import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useLogout } from '../LogoutBersama'; // Pastikan path ini benar
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../assets/css/UserDashboard.css'; // Impor file CSS kustom

export default function UserDashboard() {
    const [user, setUser] = useState(null);
    const [msg, setMsg] = useState('');
    const [pengajuan, setPengajuan] = useState([]);
    const logout = useLogout();
    const previousStatuses = useRef({});

    // Ambil data user
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setMsg('Silakan login terlebih dahulu.');
            return;
        }

        axios.get('http://localhost:8000/api/me', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => setUser(res.data))
        .catch(() => setMsg('Token tidak valid atau sudah kadaluarsa.'));
    }, []);

    // Fungsi untuk cek status pengajuan terbaru
    const fetchPengajuan = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8000/api/pengajuan', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPengajuan(res.data);

            // Cek perubahan status
            res.data.forEach(item => {
                const prevStatus = previousStatuses.current[item.id];
                if (prevStatus && prevStatus !== item.status) {
                    toast.info(`Status pengajuan "${item.bidang_magang}" berubah menjadi ${item.status}`, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        pauseOnHover: true,
                        draggable: true,
                    });
                }
                previousStatuses.current[item.id] = item.status;
            });
        } catch (error) {
            console.error("Error fetching pengajuan:", error);
        }
    };

    // Polling tiap 15 detik
    useEffect(() => {
        fetchPengajuan();
        const interval = setInterval(fetchPengajuan, 15000);
        return () => clearInterval(interval);
    }, []);

    if (msg) return (
        <div className="dashboard-loading-error-container">
            <p className="dashboard-error-message">{msg}</p>
        </div>
    );
    if (!user) return (
        <div className="dashboard-loading-error-container">
            <p className="dashboard-loading-message">Loading...</p>
        </div>
    );

    return (
        <div className="user-dashboard-container">
            <div className="user-dashboard-card">
                <h2 className="dashboard-title">Dashboard Mahasiswa</h2>

                {/* Info Selamat Datang */}
                <p className="welcome-message">Selamat datang, <strong className="user-name">{user.name}</strong>!</p>
                <p className="user-role">Role: <em className="italic">{user.role}</em></p>

                {/* Tombol Logout */}
                <div className="logout-button-container">
                    <button
                        onClick={logout}
                        className="logout-button"
                    >
                        Logout
                    </button>
                </div>

                {/* Navigasi Utama */}
                <nav className="dashboard-nav">
                    {user.role === 'mahasiswa' && (
                        <div className="dashboard-nav-links">
                            <Link
                                to="/pengajuan-baru"
                                className="nav-button primary-button"
                            >
                                Buat Pengajuan Magang
                            </Link>

                            <Link
                                to="/daftar-pengajuan"
                                className="nav-button secondary-button"
                            >
                                Daftar Pengajuan Saya
                            </Link>
                            
                            {/* Link ke Manajemen Logbook */}
                            <Link
                                to="/logbook"
                                className="nav-button logbook-button"
                            >
                                Manajemen Logbook
                            </Link>
                        </div>
                    )}

                    {/* Link Kalender Magang */}
                    <div className="calendar-link-container">
                        <Link
                            to="/kalender-magang"
                            className="nav-button calendar-button"
                        >
                            <span className="calendar-icon">📅</span> Lihat Kalender Magang
                        </Link>
                    </div>

                    {user.role === 'admin' && (
                        <p className="admin-message">Silakan gunakan menu admin di sidebar atau navigasi.</p>
                    )}
                </nav>

                {/* Statistik Pengajuan Singkat */}
                <div className="stats-grid">
                    <StatCard title="Total Pengajuan" value={pengajuan.length} />
                    <StatCard title="Pending" value={pengajuan.filter(p => p.status === 'pending').length} />
                    <StatCard title="Disetujui" value={pengajuan.filter(p => p.status === 'disetujui').length} />
                </div>

            </div>
            <ToastContainer />
        </div>
    );
}

// Komponen StatCard untuk reusable UI statistik
function StatCard({ title, value }) {
    return (
        <div className="stat-card">
            <h3 className="stat-title">{title}</h3>
            <p className="stat-value">{value}</p>
        </div>
    );
}