import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../assets/css/register.css'; 

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
    const [captcha, setCaptcha] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Handle perubahan input
    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Handle perubahan captcha
    const handleCaptchaChange = value => {
        setCaptcha(value);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);

        // Validasi captcha sudah terisi
        if (!captcha) {
            toast.error('Silakan verifikasi captcha terlebih dahulu.', { position: "top-right" });
            setLoading(false);
            return;
        }

        try {
            // Kirim form + token captcha ke backend
            await axios.post('http://localhost:8000/api/register', {
                ...form,
                'g-recaptcha-response': captcha,
            });

            toast.success('Registrasi berhasil! Silakan login.', { position: "top-right" });
            navigate('/login-user'); // Arahkan ke halaman login user
        } catch (error) {
            console.error("Registration error:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.';
            toast.error(errorMessage, { position: "top-right" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page-container">
            <div className="register-card">
                <h2 className="register-title">Registrasi Mahasiswa</h2>
                <form onSubmit={handleSubmit} className="register-form-content">
                    <div className="form-group">
                        <label htmlFor="name" className="sr-only">Nama lengkap</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Nama lengkap"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email" className="sr-only">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password" className="sr-only">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password_confirmation" className="sr-only">Konfirmasi Password</label>
                        <input
                            type="password"
                            id="password_confirmation"
                            name="password_confirmation"
                            placeholder="Konfirmasi Password"
                            value={form.password_confirmation}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </div>
                    
                    <div className="recaptcha-container">
                        <ReCAPTCHA
                            sitekey="6Ldnx6krAAAAAC-I-0WGOt0zj-ZOBEO05h8WaaDa" // Ganti dengan site key reCAPTCHA Anda
                            onChange={handleCaptchaChange}
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="register-button"
                    >
                        {loading ? 'Mendaftar...' : 'Daftar'}
                    </button>
                </form>
                <ToastContainer />
            </div>
        </div>
    );
}
