// src/components/user/UserLogin.jsx

import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../assets/css/Login.css'; // Impor file CSS kustom

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [captcha, setCaptcha] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);

        if (!captcha) {
            toast.error('Tolong verifikasi captcha terlebih dahulu.', { position: "top-right" });
            setLoading(false);
            return;
        }

        try {
            const res = await axios.post('http://localhost:8000/api/login', {
                ...form,
                'g-recaptcha-response': captcha,
            });
            localStorage.setItem('token', res.data.access_token);
            localStorage.setItem('role', res.data.user.role);
            toast.success('Login berhasil!', { position: "top-right" });
            
            if (res.data.user.role === 'mahasiswa') {
                navigate('/dashboard-user');
            } else if (res.data.user.role === 'admin') {
                navigate('/dashboard-admin');
            } else {
                navigate('/');
            }

        } catch (error) {
            console.error("Login error:", error.response?.data || error.message);
            // ✅ PERBAIKAN: Akses properti message dari objek error
            const errorMessage = error.response?.data?.message || 'Login gagal. Silakan cek email dan password Anda.';
            // Jika ada error validasi spesifik (misalnya email sudah terdaftar), tampilkan itu juga
            if (error.response?.data?.errors) {
                const validationErrors = Object.values(error.response.data.errors).flat().join(' ');
                toast.error(`${errorMessage} ${validationErrors}`, { position: "top-right" });
            } else {
                toast.error(errorMessage, { position: "top-right" });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-container">
            <div className="login-card">
                <h2 className="login-title">Login Mahasiswa</h2>
                <form onSubmit={handleSubmit} className="login-form-content">
                    <div className="form-group">
                        <label htmlFor="email" className="sr-only">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
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
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="recaptcha-container">
                        <ReCAPTCHA sitekey="6LcA35crAAAAAFg9CBeXzMriMfeO3g0J1pjTkPG4" onChange={setCaptcha} />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="login-button"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <ToastContainer />
            </div>
        </div>
    );
}







