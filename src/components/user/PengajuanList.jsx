import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; // ⭐ Tambahkan useNavigate
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment'; 
import '../../assets/css/PengajuanList.css'; 

export default function PengajuanList() {
    const [pengajuan, setPengajuan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // ⭐ Inisialisasi useNavigate

    const fetchPengajuan = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Token tidak ditemukan. Silakan login.');
                setLoading(false);
                return;
            }
            const res = await axios.get('http://localhost:8000/api/pengajuan', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setPengajuan(res.data);
        } catch (err) {
            console.error("Error fetching pengajuan list:", err.response?.data || err.message);
            setError('Gagal memuat data pengajuan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPengajuan();
    }, []);

    const handleDelete = async (id, status) => {
        if (status !== 'pending') {
            toast.warn('Pengajuan yang sudah diproses tidak bisa dihapus.', { position: "top-right" });
            return;
        }

        if (!window.confirm('Yakin ingin menghapus pengajuan ini?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8000/api/pengajuan/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Pengajuan berhasil dihapus!', { position: "top-right" });
            fetchPengajuan(); // refresh data setelah hapus
        } catch (err) {
            console.error("Error deleting pengajuan:", err.response?.data || err.message);
            toast.error('Gagal menghapus pengajuan.', { position: "top-right" });
        }
    };

    if (loading) return (
        <div className="pengajuan-list-loading-error-container">
            <p className="pengajuan-list-loading-message">Loading...</p>
        </div>
    );
    if (error) return (
        <div className="pengajuan-list-loading-error-container">
            <p className="pengajuan-list-error-message">{error}</p>
        </div>
    );
    if (pengajuan.length === 0) return (
        <div className="pengajuan-list-container">
            <div className="pengajuan-list-card">
                <h2 className="pengajuan-list-title">Daftar Pengajuan Magang</h2>

                {/* ⭐ Container untuk tombol aksi (Buat Baru & Kembali) */}
                <div className="pengajuan-actions-container">
                    <Link
                        to="/pengajuan-baru"
                        className="pengajuan-list-create-button"
                    >
                        Buat Pengajuan Baru
                    </Link>
                    <button
                        onClick={() => navigate('/dashboard-user')} // ⭐ Tombol ini mengarah ke /dashboard-user
                        className="pengajuan-back-button"
                    >
                        Kembali
                    </button>
                </div>

                <div className="pengajuan-list-empty-container">
                    <div className="pengajuan-list-empty-card">
                        <p className="pengajuan-list-empty-message">Tidak ada pengajuan ditemukan.</p>
                        {/* Tombol di sini akan dihapus karena sudah ada di atas */}
                        {/* <Link
                            to="/pengajuan-baru"
                            className="pengajuan-list-create-button"
                        >
                            Buat Pengajuan Baru
                        </Link> */}
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );

    return (
        <div className="pengajuan-list-container">
            <div className="pengajuan-list-card">
                <h2 className="pengajuan-list-title">Daftar Pengajuan Magang</h2>

                {/* ⭐ Container untuk tombol aksi (Buat Baru & Kembali) */}
                <div className="pengajuan-actions-container">
                    <Link
                        to="/pengajuan-baru"
                        className="pengajuan-list-create-button"
                    >
                        Buat Pengajuan Baru
                    </Link>
                    <button
                        onClick={() => navigate('/dashboard-user')} // ⭐ Tombol ini mengarah ke /dashboard-user
                        className="pengajuan-back-button"
                    >
                        Kembali
                    </button>
                </div>

                {/* Tabel Responsif */}
                <div className="pengajuan-table-wrapper">
                    <table className="pengajuan-table">
                        <thead>
                            <tr>
                                <th className="table-header">Bidang Magang</th>
                                <th className="table-header">Tanggal Mulai</th>
                                <th className="table-header">Tanggal Selesai</th>
                                <th className="table-header">Status</th>
                                <th className="table-header">Tanggal Disetujui Magang</th>
                                <th className="table-header action-header">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pengajuan.map(item => (
                                <tr key={item.id} className="table-row">
                                    <td className="table-cell">{item.bidang_magang}</td>
                                    <td className="table-cell">{moment(item.tanggal_mulai).format('DD MMM YYYY')}</td>
                                    <td className="table-cell">{moment(item.tanggal_selesai).format('DD MMM YYYY')}</td>
                                    <td className="table-cell">
                                        <span className={`status-badge status-${item.status}`}>
                                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="table-cell">
                                        {item.tanggal_diterima ? moment(item.tanggal_diterima).format('DD MMM YYYY') : '-'}
                                    </td>
                                    <td className="table-cell action-cell">
                                        <div className="action-buttons-container">
                                            <Link
                                                to={`/pengajuan/${item.id}`}
                                                className="action-link"
                                            >
                                                Lihat Detail
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(item.id, item.status)}
                                                disabled={item.status !== 'pending'}
                                                className={`action-button delete-button ${item.status !== 'pending' ? 'disabled-button' : ''}`}
                                                title={item.status !== 'pending' ? 'Pengajuan yang sudah diproses tidak bisa dihapus' : 'Hapus pengajuan'}
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}
