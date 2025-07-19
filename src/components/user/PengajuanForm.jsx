import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../assets/css/PengajuanForm.css'; 

export default function PengajuanForm() {
    const [form, setForm] = useState({
        bidang_magang: '',
        tanggal_mulai: '',
        tanggal_selesai: '',
        dokumen: null,
    });
    const [msg, setMsg] = useState('');
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const navigate = useNavigate();

    const handleChange = e => {
        const { name, value, files } = e.target;
        if (name === 'dokumen') {
            setForm(prev => ({ ...prev, dokumen: files[0] }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setMsg('');
        setLoadingSubmit(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Anda belum login.', { position: "top-right" });
                setLoadingSubmit(false);
                return;
            }

            const formData = new FormData();
            formData.append('bidang_magang', form.bidang_magang);
            formData.append('tanggal_mulai', form.tanggal_mulai);
            formData.append('tanggal_selesai', form.tanggal_selesai);
            if (form.dokumen) formData.append('dokumen', form.dokumen);

            await axios.post('http://localhost:8000/api/pengajuan', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            toast.success('Pengajuan berhasil dikirim!', { position: "top-right" });
            setForm({ bidang_magang: '', tanggal_mulai: '', tanggal_selesai: '', dokumen: null });
            
            navigate('/dashboard-user');
        } catch (error) {
            console.error("Error submitting pengajuan:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || 'Gagal mengirim pengajuan. Silakan coba lagi.';
            toast.error(errorMessage, { position: "top-right" });
        } finally {
            setLoadingSubmit(false);
        }
    };

    return (
        <div className="pengajuan-form-container">
            <div className="pengajuan-form-card">
                <h2 className="pengajuan-form-title">Form Pengajuan Magang</h2>

                <form onSubmit={handleSubmit} className="pengajuan-form-content">
                    <div className="form-group">
                        <label htmlFor="bidang_magang" className="form-label">Bidang Magang:</label>
                        <input
                            type="text"
                            id="bidang_magang"
                            name="bidang_magang"
                            value={form.bidang_magang}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="tanggal_mulai" className="form-label">Tanggal Mulai:</label>
                        <input
                            type="date"
                            id="tanggal_mulai"
                            name="tanggal_mulai"
                            value={form.tanggal_mulai}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="tanggal_selesai" className="form-label">Tanggal Selesai:</label>
                        <input
                            type="date"
                            id="tanggal_selesai"
                            name="tanggal_selesai"
                            value={form.tanggal_selesai}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="dokumen" className="form-label">Upload Dokumen (PDF, Max 2MB):</label>
                        <input
                            type="file"
                            id="dokumen"
                            name="dokumen"
                            onChange={handleChange}
                            accept="application/pdf"
                            className="form-file-input"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loadingSubmit}
                        className="submit-button"
                    >
                        {loadingSubmit ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan'}
                    </button>
                </form>

                {msg && <p className="form-message error-message">{msg}</p>}
            </div>
            <ToastContainer />
        </div>
    );
}