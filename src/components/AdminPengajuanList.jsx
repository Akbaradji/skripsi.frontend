import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment'; 
import '../assets/css/AdminPengajuanList.css'; 

export default function AdminPengajuanList() {
    const [pengajuan, setPengajuan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusUpdate, setStatusUpdate] = useState({ id: null, status: '', catatan: '' });
    const [updatingId, setUpdatingId] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [bidangMagangFilter, setBidangMagangFilter] = useState('');

    const fetchPengajuan = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Token tidak ditemukan. Silakan login.');
                setLoading(false);
                return;
            }
            const res = await axios.get('http://localhost:8000/api/admin/pengajuan', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    status: statusFilter,
                    bidang_magang: bidangMagangFilter,
                },
            });
            setPengajuan(res.data);
        } catch (err) {
            console.error("Error fetching admin pengajuan list:", err.response?.data || err.message);
            setError('Gagal memuat data pengajuan.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPengajuan();
    }, [statusFilter, bidangMagangFilter]); // Re-fetch when filters change

    const handleStatusFilterChange = (e) => setStatusFilter(e.target.value);
    const handleBidangMagangFilterChange = (e) => setBidangMagangFilter(e.target.value);

    const handleSelectAll = () => {
        if (selectedIds.length === pengajuan.length) {
            setSelectedIds([]);
        } else {
            const newSelectedIds = pengajuan.map((item) => item.id);
            setSelectedIds(newSelectedIds);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedIds((prevSelectedIds) =>
            prevSelectedIds.includes(id)
                ? prevSelectedIds.filter((itemId) => itemId !== id)
                : [...prevSelectedIds, id]
        );
    };

    const handleBulkAction = async (status) => {
        if (selectedIds.length === 0) {
            toast.warn('Pilih pengajuan terlebih dahulu.', { position: "top-right" });
            return;
        }
        if (!window.confirm(`Yakin ingin memperbarui status ${selectedIds.length} pengajuan menjadi ${status}?`)) {
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                'http://localhost:8000/api/admin/pengajuan/bulk-update-status',
                { ids: selectedIds, status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Status pengajuan berhasil diperbarui secara massal!', { position: "top-right" });
            setSelectedIds([]); // Clear selection after bulk update
            fetchPengajuan();
        } catch (err) {
            console.error("Error bulk updating status:", err.response?.data || err.message);
            toast.error('Gagal memperbarui status pengajuan secara massal.', { position: "top-right" });
        }
    };

    const openUpdateForm = (id, currentStatus, currentCatatan) => {
        setStatusUpdate({ id, status: currentStatus, catatan: currentCatatan || '' });
    };

    const handleStatusChange = (e) => {
        setStatusUpdate((prev) => ({ ...prev, status: e.target.value }));
    };

    const handleCatatanChange = (e) => {
        setStatusUpdate((prev) => ({ ...prev, catatan: e.target.value }));
    };

    const submitStatusUpdate = async () => {
        if (!statusUpdate.status) {
            toast.warn('Pilih status terlebih dahulu.', { position: "top-right" });
            return;
        }
        setUpdatingId(statusUpdate.id);
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:8000/api/pengajuan/${statusUpdate.id}/status`,
                { status: statusUpdate.status, catatan: statusUpdate.catatan },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Status berhasil diperbarui!', { position: "top-right" });
            setStatusUpdate({ id: null, status: '', catatan: '' });
            fetchPengajuan();
        } catch (err) {
            console.error("Error updating single status:", err.response?.data || err.message);
            toast.error('Gagal memperbarui status.', { position: "top-right" });
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDelete = async (id, status) => {
        const userRole = localStorage.getItem('role'); 

        if (userRole === 'mahasiswa' && status !== 'pending') {
            toast.warn('Pengajuan yang sudah diproses tidak bisa dihapus oleh mahasiswa.', { position: "top-right" });
            return;
        }

        if (!window.confirm('Yakin ingin menghapus pengajuan ini?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8000/api/pengajuan/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Pengajuan berhasil dihapus!', { position: "top-right" });
            fetchPengajuan();
        } catch (err) {
            console.error("Error deleting pengajuan:", err.response?.data || err.message);
            toast.error('Gagal menghapus pengajuan: ' + (err.response?.data?.message || 'Unknown error'), { position: "top-right" });
        }
    };

    // ⭐ PERBAIKAN: Fungsi untuk mengunggah bukti selesai magang
    const handleUploadProof = async (pengajuanId) => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'application/pdf';
        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('pengajuan_id', pengajuanId);
            formData.append('bukti_selesai_file', file); // Perbaiki nama key menjadi 'bukti_selesai_file'

            try {
                const token = localStorage.getItem('token');
                // ⭐ PERBAIKAN: Ganti URL yang salah ketik
                await axios.post('http://localhost:8000/api/admin/upload-bukti-selesai', formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });
                toast.success('Bukti selesai magang berhasil diunggah!', { position: "top-right" });
                fetchPengajuan();
            } catch (error) {
                console.error("Error uploading proof:", error.response?.data || error.message);
                toast.error('Gagal mengunggah bukti selesai magang: ' + (error.response?.data?.message || 'Unknown error'), { position: "top-right" });
            }
        };
        fileInput.click();
    };


    if (loading) return (
        <div className="admin-pengajuan-list-loading-error-container">
            <p className="admin-pengajuan-list-loading-message">Loading...</p>
        </div>
    );
    if (error) return (
        <div className="admin-pengajuan-list-loading-error-container">
            <p className="admin-pengajuan-list-error-message">{error}</p>
        </div>
    );
    if (pengajuan.length === 0) return (
        <div className="admin-pengajuan-list-empty-container">
            <div className="admin-pengajuan-list-empty-card">
                <p className="admin-pengajuan-list-empty-message">Tidak ada pengajuan ditemukan.</p>
            </div>
        </div>
    );

    return (
        <div className="admin-pengajuan-list-container">
            <div className="admin-pengajuan-list-card">
                <h2 className="admin-pengajuan-list-title">Daftar Pengajuan Magang (Admin)</h2>
                <div className="admin-filter-bulk-container">
                    <div className="admin-filter-group">
                        <select
                            onChange={handleStatusFilterChange}
                            value={statusFilter}
                            className="admin-filter-select"
                        >
                            <option value="all">Semua Status</option>
                            <option value="pending">Pending</option>
                            <option value="disetujui">Disetujui</option>
                            <option value="ditolak">Ditolak</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Filter Bidang Magang"
                            value={bidangMagangFilter}
                            onChange={handleBidangMagangFilterChange}
                            className="admin-filter-input"
                        />
                    </div>
                    <div className="admin-bulk-action-group">
                        <button
                            onClick={() => handleBulkAction('disetujui')}
                            className="admin-bulk-button approve-button"
                            disabled={selectedIds.length === 0}
                        >
                            Setujui Dipilih
                        </button>
                        <button
                            onClick={() => handleBulkAction('ditolak')}
                            className="admin-bulk-button reject-button"
                            disabled={selectedIds.length === 0}
                        >
                            Tolak Dipilih
                        </button>
                    </div>
                </div>
                <div className="admin-pengajuan-table-wrapper">
                    <table className="admin-pengajuan-table">
                        <thead>
                            <tr>
                                <th className="admin-table-header checkbox-header">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={selectedIds.length === pengajuan.length && pengajuan.length > 0}
                                        className="admin-checkbox"
                                    />
                                </th>
                                <th className="admin-table-header">Nama Pengaju</th>
                                <th className="admin-table-header">Email Pengaju</th>
                                <th className="admin-table-header">Bidang Magang</th>
                                <th className="admin-table-header">Tanggal Mulai</th>
                                <th className="admin-table-header">Tanggal Selesai</th>
                                <th className="admin-table-header">Status</th>
                                <th className="admin-table-header">Catatan</th>
                                <th className="admin-table-header">Dokumen Pengajuan</th>
                                <th className="admin-table-header">Bukti Selesai</th>
                                <th className="admin-table-header action-header">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pengajuan.map((item) => (
                                <tr key={item.id} className="admin-table-row">
                                    <td className="admin-table-cell checkbox-cell">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(item.id)}
                                            onChange={() => handleSelectOne(item.id)}
                                            className="admin-checkbox"
                                        />
                                    </td>
                                    <td className="admin-table-cell">{item.nama_pengaju}</td>
                                    <td className="admin-table-cell">{item.email_pengaju}</td>
                                    <td className="admin-table-cell">{item.bidang_magang}</td>
                                    <td className="admin-table-cell">{moment(item.tanggal_mulai).format('DD MMM YYYY')}</td>
                                    <td className="admin-table-cell">{moment(item.tanggal_selesai).format('DD MMM YYYY')}</td>
                                    <td className="admin-table-cell">
                                        <span className={`status-badge status-${item.status}`}>
                                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="admin-table-cell">{item.catatan || '-'}</td>
                                    <td className="admin-table-cell">
                                        {item.pdf_pengajuan ? (
                                            <a href={item.pdf_pengajuan} target="_blank" rel="noopener noreferrer" className="pdf-link">
                                                Lihat PDF
                                            </a>
                                        ) : (
                                            <span className="no-file-text">Tidak ada file</span>
                                        )}
                                    </td>
                                    <td className="admin-table-cell">
                                        {item.bukti_selesai_path ? (
                                            <a href={item.bukti_selesai_path} target="_blank" rel="noopener noreferrer" className="pdf-link">
                                                Lihat Bukti
                                            </a>
                                        ) : (
                                            <button
                                                onClick={() => handleUploadProof(item.id)}
                                                className="upload-proof-button"
                                            >
                                                Upload Bukti
                                            </button>
                                        )}
                                    </td>
                                    <td className="admin-table-cell action-cell">
                                        {statusUpdate.id === item.id ? (
                                            <div className="admin-update-form-container">
                                                <select
                                                    value={statusUpdate.status}
                                                    onChange={handleStatusChange}
                                                    className="admin-update-select"
                                                >
                                                    <option value="">Pilih Status</option>
                                                    <option value="disetujui">Disetujui</option>
                                                    <option value="ditolak">Ditolak</option>
                                                </select>
                                                <textarea
                                                    placeholder="Catatan (opsional)"
                                                    value={statusUpdate.catatan}
                                                    onChange={handleCatatanChange}
                                                    rows={2}
                                                    className="admin-update-textarea"
                                                />
                                                <div className="admin-update-buttons">
                                                    <button
                                                        onClick={submitStatusUpdate}
                                                        disabled={updatingId === item.id}
                                                        className="admin-update-button save-button"
                                                    >
                                                        {updatingId === item.id ? 'Menyimpan...' : 'Simpan'}
                                                    </button>
                                                    <button
                                                        onClick={() => setStatusUpdate({ id: null, status: '', catatan: '' })}
                                                        disabled={updatingId === item.id}
                                                        className="admin-update-button cancel-button"
                                                    >
                                                        Batal
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="admin-action-buttons-container">
                                                <button
                                                    onClick={() => openUpdateForm(item.id, item.status, item.catatan)}
                                                    className="admin-action-button update-button"
                                                    title="Update Status"
                                                >
                                                    ✏️ Update
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id, item.status)}
                                                    className="admin-action-button delete-button"
                                                    title="Hapus Pengajuan"
                                                >
                                                    🗑️ Hapus
                                                </button>
                                            </div>
                                        )}
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

