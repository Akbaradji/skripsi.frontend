import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import moment from 'moment'; 

// Impor file CSS kustom
import '../../assets/css/LogbookList.css'; 

export default function LogbookList() {
    const [logbooks, setLogbooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchLogbooks = async () => {
        try {
            const token = localStorage.getItem('token'); 
            if (!token) {
                setError('Anda belum login. Silakan login terlebih dahulu.');
                setLoading(false);
                return;
            }

            const response = await axios.get('http://localhost:8000/api/logbooks', { 
                headers: {
                    Authorization: `Bearer ${token}` 
                }
            });
            
            console.log('Data Logbook dari API:', response.data); 
            setLogbooks(response.data);
        } catch (err) {
            console.error('Error fetching logbooks:', err.response?.data || err.message);
            setError('Gagal memuat logbook. Silakan coba lagi nanti.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogbooks();
    }, []); 

    // ⭐ FUNGSI DENGAN PERUBAHAN: Menghapus status dari parameter
    const handleDelete = async (id) => {
        // ⭐ PERBAIKAN: Menghapus pengecekan status
        if (!window.confirm('Yakin ingin menghapus logbook ini?')) { 
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8000/api/logbooks/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Logbook berhasil dihapus!', { position: "top-right" });
            fetchLogbooks(); 
        } catch (err) {
            console.error("Error deleting logbook:", err.response?.data || err.message);
            toast.error('Gagal menghapus logbook.', { position: "top-right" });
        }
    };

    // ⭐ FUNGSI INI DIHAPUS
    /*
    const getStatusDisplay = (status) => {
        switch (status) {
            case 'pending':
                return { className: 'status-badge status-pending', text: '⏳ Pending' }; 
            case 'disetujui':
                return { className: 'status-badge status-disetujui', text: '✅ Disetujui' };
            case 'ditolak':
                return { className: 'status-badge status-ditolak', text: '❌ Ditolak' };
            default:
                return { className: 'status-badge status-default', text: status };
        }
    };
    */

    if (loading) {
        return (
            <div className="pengajuan-list-loading-error-container">
                <p className="pengajuan-list-loading-message">Memuat logbook...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pengajuan-list-loading-error-container">
                <p className="pengajuan-list-error-message pengajuan-error-card">{error}</p>
            </div>
        );
    }

    if (logbooks.length === 0) {
        return (
            <div className="pengajuan-list-container">
                <div className="pengajuan-list-card">
                    <h2 className="pengajuan-list-title">Daftar Logbook Mahasiswa</h2>
                    <div className="logbook-actions-container">
                        <Link to="/buat-logbook-baru" className="logbook-add-button">
                            + Buat Logbook Baru
                        </Link>
                        <button
                            onClick={() => navigate('/dashboard-user')}
                            className="logbook-back-button"
                        >
                            Kembali
                        </button>
                    </div>
                    <div className="pengajuan-list-empty-container">
                        <div className="pengajuan-list-empty-card">
                            <p className="pengajuan-list-empty-message">Tidak ada logbook ditemukan.</p>
                        </div>
                    </div>
                </div>
                <ToastContainer />
            </div>
        );
    }

    return (
        <div className="pengajuan-list-container">
            <div className="pengajuan-list-card">
                <h2 className="pengajuan-list-title">Daftar Logbook Mahasiswa</h2>
                <div className="logbook-actions-container">
                    <Link 
                        to="/buat-logbook-baru" 
                        className="logbook-add-button"
                    >
                        + Buat Logbook Baru
                    </Link>
                    <button
                        onClick={() => navigate('/dashboard-user')}
                        className="logbook-back-button"
                    >
                        Kembali
                    </button>
                </div>
                <div className="pengajuan-table-wrapper">
                    <table className="pengajuan-table">
                        <thead>
                            <tr>
                                <th className="table-header">Tanggal</th> 
                                <th className="table-header">Aktivitas</th> 
                                <th className="table-header">Pengaju</th> 
                                {/* ⭐ KOLOM STATUS DIHAPUS */}
                                <th className="table-header action-header">Aksi</th> 
                            </tr>
                        </thead>
                        <tbody>
                            {logbooks.map((logbook) => {
                                // ⭐ PANGGILAN getStatusDisplay DIHAPUS
                                return (
                                    <tr key={logbook.id} className="table-row">
                                        <td className="table-cell">{moment(logbook.tanggal).format('DD MMM YYYY')}</td> 
                                        <td className="table-cell">{logbook.aktivitas}</td>
                                        <td className="table-cell">{logbook.user && logbook.user.name ? logbook.user.name : 'N/A'}</td>
                                        {/* ⭐ BADGE STATUS DIHAPUS */}
                                        <td className="table-cell action-cell"> 
                                            <div className="action-buttons-container">
                                                <Link 
                                                    to={`/logbook/${logbook.id}`} 
                                                    className="action-link"
                                                >
                                                    Lihat Detail
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(logbook.id)} // ⭐ PERUBAHAN: Hanya mengirim ID
                                                    className={`action-button delete-button`} // ⭐ PERUBAHAN: Menghapus kelas disabled
                                                    title='Hapus logbook'
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            <ToastContainer /> 
        </div>
    );
}
