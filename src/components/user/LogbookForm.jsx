import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment'; // Untuk format tanggal
import '../../assets/css/LogbookForm.css'; // Impor file CSS kustom

// Fungsi dummy untuk mendapatkan role user (ganti dengan logika autentikasi Anda)
const getCurrentUserRole = () => {
    return localStorage.getItem('role') || 'mahasiswa'; // Ambil role dari localStorage
};

export default function LogbookForm() {
    const { id } = useParams(); // Ambil ID logbook dari URL jika dalam mode edit
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(getCurrentUserRole());

    const [form, setForm] = useState({
        tanggal: moment().format('YYYY-MM-DD'), // Default tanggal hari ini
        aktivitas: '',
        status: 'pending', // Default untuk mahasiswa
        catatan_pembimbing: '', // Hanya untuk admin
    });
    const [loading, setLoading] = useState(true); // Untuk loading data saat edit/tinjau
    const [loadingSubmit, setLoadingSubmit] = useState(false); // Untuk loading saat submit
    const [error, setError] = useState(null);

    // Ambil data logbook jika dalam mode edit/tinjau
    useEffect(() => {
        console.log('useEffect triggered. ID:', id, 'User Role:', userRole); // ⭐ LOG 1

        if (id) { // Jika ada ID, berarti mode edit/tinjau
            const fetchLogbook = async () => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        setError('Token tidak ditemukan. Silakan login.');
                        setLoading(false);
                        return;
                    }
                    const endpoint = `/api/logbooks/${id}`; // ⭐ PERBAIKAN: Gunakan endpoint tunggal, logika admin/mahasiswa ada di backend
                    console.log('Fetching from endpoint:', endpoint); // ⭐ LOG 2
                    const res = await axios.get(`http://localhost:8000${endpoint}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    console.log('Fetched logbook data:', res.data); // ⭐ LOG 3

                    setForm({
                        tanggal: moment(res.data.tanggal).format('YYYY-MM-DD'),
                        aktivitas: res.data.aktivitas,
                        status: res.data.status,
                        catatan_pembimbing: res.data.catatan_pembimbing || '',
                    });
                    console.log('Form state updated with fetched data.'); // ⭐ LOG 4
                    setLoading(false);
                } catch (err) {
                    console.error("Error fetching logbook detail:", err.response?.data || err.message);
                    setError('Gagal memuat detail logbook.');
                    setLoading(false);
                }
            };
            fetchLogbook();
        } else {
            console.log('No ID found, initializing new logbook form.'); // ⭐ LOG 5
            setForm({ // Pastikan form direset untuk mode 'buat baru'
                tanggal: moment().format('YYYY-MM-DD'),
                aktivitas: '',
                status: 'pending',
                catatan_pembimbing: '',
            });
            setLoading(false); // Jika tidak ada ID, langsung siap untuk form baru
        }
    }, [id, userRole]); // Dependencies

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingSubmit(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Anda belum login.', { position: "top-right" });
            setLoadingSubmit(false);
            return;
        }

        try {
            let res;
            if (id) { // Mode Edit/Tinjau
                let dataToSubmit = {};
                // Admin bisa mengubah status dan catatan pembimbing
                if (userRole === 'admin') {
                    dataToSubmit = { status: form.status, catatan_pembimbing: form.catatan_pembimbing };
                } 
                // Mahasiswa hanya bisa mengubah tanggal dan aktivitas, dan hanya jika statusnya pending
                else if (userRole === 'mahasiswa' && form.status === 'pending') {
                    dataToSubmit = { tanggal: form.tanggal, aktivitas: form.aktivitas };
                } else {
                    toast.warn('Anda tidak diizinkan mengubah logbook ini.', { position: "top-right" });
                    setLoadingSubmit(false);
                    return;
                }

                res = await axios.put(`http://localhost:8000/api/logbooks/${id}`, dataToSubmit, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success('Logbook berhasil diperbarui!', { position: "top-right" });
            } else { // Mode Buat Baru (hanya mahasiswa)
                if (userRole !== 'mahasiswa') {
                    toast.error('Hanya mahasiswa yang bisa membuat logbook baru.', { position: "top-right" });
                    setLoadingSubmit(false);
                    return;
                }
                res = await axios.post('http://localhost:8000/api/logbooks', form, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success('Logbook berhasil dibuat!', { position: "top-right" });
            }
            navigate('/logbook'); // Kembali ke daftar logbook
        } catch (err) {
            console.error("Submit logbook error:", err.response?.data || err.message);
            const errorMessage = err.response?.data?.message || 'Gagal menyimpan logbook.';
            toast.error(errorMessage, { position: "top-right" });
        } finally {
            setLoadingSubmit(false);
        }
    };

    if (loading) return (
        <div className="logbook-form-loading-error-container">
            <p className="logbook-form-loading-message">Loading logbook...</p>
        </div>
    );
    if (error) return (
        <div className="logbook-form-loading-error-container">
            <p className="logbook-form-error-message">{error}</p>
        </div>
    );

    const isMahasiswa = userRole === 'mahasiswa';
    const isAdmin = userRole === 'admin';
    const isEditingMahasiswa = isMahasiswa && id; // Mahasiswa mengedit logbook yang sudah ada
    const isNewLogbook = isMahasiswa && !id; // Mahasiswa membuat logbook baru
    const isReviewingAdmin = isAdmin && id; // Admin meninjau logbook

    // Tentukan apakah field harus disabled
    const isTanggalAktivitasDisabled = (isEditingMahasiswa && form.status !== 'pending') || isAdmin;
    const isStatusCatatanDisabled = isMahasiswa; // Mahasiswa tidak bisa edit status/catatan

    return (
        <div className="logbook-form-container">
            <div className="logbook-form-card">
                <h2 className="logbook-form-title">
                    {isNewLogbook ? 'Buat Logbook Baru' : (isEditingMahasiswa ? 'Edit Logbook' : 'Tinjau Logbook')}
                </h2>

                <form onSubmit={handleSubmit} className="logbook-form-content">
                    {/* Field Tanggal */}
                    <div className="form-group">
                        <label htmlFor="tanggal" className="form-label">
                            Tanggal Kegiatan:
                        </label>
                        <input
                            type="date"
                            id="tanggal"
                            name="tanggal"
                            value={form.tanggal}
                            onChange={handleChange}
                            required
                            disabled={isTanggalAktivitasDisabled}
                            className={`form-input ${isTanggalAktivitasDisabled ? 'form-input-disabled' : ''}`}
                            max={moment().format('YYYY-MM-DD')}
                        />
                    </div>

                    {/* Field Aktivitas */}
                    <div className="form-group">
                        <label htmlFor="aktivitas" className="form-label">
                            Aktivitas:
                        </label>
                        <textarea
                            id="aktivitas"
                            name="aktivitas"
                            value={form.aktivitas}
                            onChange={handleChange}
                            required
                            rows={6}
                            disabled={isTanggalAktivitasDisabled}
                            className={`form-textarea ${isTanggalAktivitasDisabled ? 'form-input-disabled' : ''}`}
                            placeholder="Tuliskan ringkasan kegiatan Anda selama seminggu ini..."
                        ></textarea>
                    </div>

                    {/* Field Status (Hanya untuk Admin) */}
                    {isAdmin && (
                        <div className="form-group">
                            <label htmlFor="status" className="form-label">
                                Status Logbook:
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                className="form-select"
                                disabled={isStatusCatatanDisabled} // Admin bisa edit, mahasiswa tidak
                            >
                                <option value="pending">Pending</option>
                                <option value="disetujui">Disetujui</option>
                                <option value="ditolak">Ditolak</option>
                            </select>
                        </div>
                    )}

                    {/* Field Catatan Pembimbing (Hanya untuk Admin) */}
                    {isAdmin && (
                        <div className="form-group">
                            <label htmlFor="catatan_pembimbing" className="form-label">
                                Catatan Pembimbing (Opsional):
                            </label>
                            <textarea
                                id="catatan_pembimbing"
                                name="catatan_pembimbing"
                                value={form.catatan_pembimbing}
                                onChange={handleChange}
                                rows={3}
                                className="form-textarea"
                                placeholder="Berikan catatan atau umpan balik..."
                                disabled={isStatusCatatanDisabled} // Admin bisa edit, mahasiswa tidak
                            ></textarea>
                        </div>
                    )}

                    {/* Tombol Submit (Disembunyikan jika mahasiswa dan logbook sudah diproses) */}
                    {!(isEditingMahasiswa && form.status !== 'pending') && ( // Mahasiswa hanya bisa submit jika status pending atau ini logbook baru
                        <button
                            type="submit"
                            disabled={loadingSubmit}
                            className="submit-button"
                        >
                            {loadingSubmit ? 'Menyimpan...' : 'Simpan Logbook'}
                        </button>
                    )}
                    
                    {/* Tombol Kembali */}
                    <button
                        type="button"
                        onClick={() => navigate('/logbook')}
                        className="back-button"
                    >
                        Kembali
                    </button>
                </form>
            </div>
            <ToastContainer />
        </div>
    );
}
