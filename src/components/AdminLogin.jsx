import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../assets/css/AdminLogin.css'; 

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post('http://localhost:8000/api/admin/login', { email, password });
            localStorage.setItem('token', res.data.access_token);
            localStorage.setItem('role', 'admin');
            toast.success('Login Admin berhasil!', { position: "top-right" });
            navigate('/dashboard-admin');
        } catch (error) {
            console.error("Admin Login error:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || 'Login Admin gagal. Silakan cek email dan password Anda.';
            toast.error(errorMessage, { position: "top-right" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page-container">
            <div className="admin-login-card">
                <h2 className="admin-login-title">Login Admin</h2>
                <form onSubmit={handleSubmit} className="admin-login-form-content">
                    <div className="form-group">
                        <label htmlFor="admin-email" className="sr-only">Email</label>
                        <input
                            type="email"
                            id="admin-email"
                            placeholder="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="admin-password" className="sr-only">Password</label>
                        <input
                            type="password"
                            id="admin-password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            className="form-input"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="admin-login-button"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <ToastContainer />
            </div>
        </div>
    );
}
