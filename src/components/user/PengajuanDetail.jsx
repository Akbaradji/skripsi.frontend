import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment';
import '../../assets/css/PengajuanDetail.css'; 

export default function PengajuanDetail() {
    const { id } = useParams();
    const [pengajuan, setPengajuan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPengajuanDetail = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Token tidak ditemukan. Silakan login.');
                    setLoading(false);
                    return;
                }
                const res = await axios.get(`http://localhost:8000/api/pengajuan/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPengajuan(res.data);
            } catch (err) {
                console.error("Error fetching pengajuan detail:", err.response?.data || err.message);
                if (err.response && err.response.status === 404) {
                    setError('Pengajuan tidak ditemukan.');
                } else {
                    setError('Gagal memuat detail pengajuan. Silakan coba lagi.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPengajuanDetail();
    }, [id]);

    if (loading) return (
        <div className="detail-loading-error-container">
            <p className="detail-loading-message">Loading detail pengajuan...</p>
        </div>
    );
    if (error) return (
        <div className="detail-loading-error-container">
            <p className="detail-error-message">{error}</p>
        </div>
    );
    if (!pengajuan) return (
        <div className="detail-loading-error-container">
            <p className="detail-loading-message">Data pengajuan tidak tersedia.</p>
        </div>
    );

    return (
        <div className="pengajuan-detail-container">
            <div className="pengajuan-detail-card">
                <h2 className="pengajuan-detail-title">Detail Pengajuan Magang</h2>

                <div className="detail-content-wrapper">
                    <div className="detail-item">
                        <p className="detail-label">Nama Pengaju:</p>
                        <p className="detail-value">{pengajuan.user.name}</p>
                    </div>
                    <div className="detail-item">
                        <p className="detail-label">Email Pengaju:</p>
                        <p className="detail-value">{pengajuan.user.email}</p>
                    </div>
                    <div className="detail-item">
                        <p className="detail-label">Bidang Magang:</p>
                        <p className="detail-value">{pengajuan.bidang_magang}</p>
                    </div>
                    <div className="detail-item">
                        <p className="detail-label">Tanggal Mulai:</p>
                        <p className="detail-value">{moment(pengajuan.tanggal_mulai).format('DD MMMM YYYY')}</p>
                    </div>
                    <div className="detail-item">
                        <p className="detail-label">Tanggal Selesai:</p>
                        <p className="detail-value">{moment(pengajuan.tanggal_selesai).format('DD MMMM YYYY')}</p>
                    </div>
                    <div className="detail-item">
                        <p className="detail-label">Status:</p>
                        <p className="detail-value">
                            <span className={`status-badge status-${pengajuan.status}`}>
                                {pengajuan.status.charAt(0).toUpperCase() + pengajuan.status.slice(1)}
                            </span>
                        </p>
                    </div>
                    <div className="detail-item start-align">
                        <p className="detail-label">Catatan Admin:</p>
                        <p className="detail-value">{pengajuan.catatan || '-'}</p>
                    </div>
                    <div className="detail-item">
                        <p className="detail-label">Dokumen Pengajuan:</p>
                        <p className="detail-value">
                            {pengajuan.dokumen_url ? ( // ⭐ PERBAIKAN: Menggunakan properti dokumen_url
                                <a href={pengajuan.dokumen_url} target="_blank" rel="noopener noreferrer" className="pdf-link">
                                    Lihat Dokumen PDF
                                </a>
                            ) : (
                                <span className="no-file-text">Tidak ada dokumen</span>
                            )}
                        </p>
                    </div>
                    <div className="detail-item">
                        <p className="detail-label">Bukti Selesai Magang:</p>
                        <p className="detail-value">
                            {pengajuan.bukti_selesai_url ? ( // ⭐ PERBAIKAN: Menggunakan properti bukti_selesai_url
                                <a href={pengajuan.bukti_selesai_url} target="_blank" rel="noopener noreferrer" className="pdf-link">
                                    Unduh Bukti PDF
                                </a>
                            ) : (
                                <span className="no-file-text">Belum ada bukti diunggah</span>
                            )}
                        </p>
                    </div>
                </div>

                <div className="detail-back-button-container">
                    <Link
                        to="/daftar-pengajuan"
                        className="back-button"
                    >
                        Kembali ke Daftar Pengajuan
                    </Link>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

