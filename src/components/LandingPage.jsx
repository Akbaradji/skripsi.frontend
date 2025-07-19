import React from 'react';
import { Link } from 'react-router-dom';
import kominfoLogo from '../assets/kominfo_logo.png'; // Pastikan path ini sesuai
import '../assets/css/LandingPage.css'; // Impor file CSS kustom

export default function LandingPage() {
    return (
        <div className="landing-container">
            {/* Overlay untuk efek visual */}
            <div className="landing-overlay"></div>

            {/* Header kanan atas (Login & Registrasi) */}
            <div className="top-right-buttons">
                <Link to="/login-user" className="btn-mahasiswa-login">Login Mahasiswa</Link>
                <Link to="/register-user" className="btn-registrasi">Registrasi</Link>
            </div>

            {/* Konten Tengah Utama - ✅ DIHAPUS: main-content-card sebagai kotak */}
            <div className="main-content-wrapper"> {/* Gunakan wrapper biasa */}
                <img src={kominfoLogo} alt="Kominfo Pacitan" className="logo-kominfo" />
                <h1 className="main-title">
                    Selamat Datang di <br />
                    <span className="portal-magang-highlight">Portal Magang</span>
                </h1>
                <p className="subtitle">Diskominfo Kabupaten Pacitan</p>
                <p className="description">Platform digital untuk pengelolaan magang mahasiswa secara mudah dan transparan.</p>
            </div>

            {/* Footer Informasi Kontak */}
            <div className="contact-info-card">
                <h4 className="contact-title">Diskominfo Kabupaten Pacitan</h4>
                <p className="contact-address">Jl. Jaksa Agung Suprapto No.08, Pacitan, Jawa Timur 63512</p>
                <p className="contact-phone">
                    <span className="contact-icon">📞</span> <span className="contact-highlight">(0357) 882114</span>
                </p>
                <p className="contact-email">
                    <span className="contact-icon">✉️</span> <span className="contact-highlight">kominfo@pacitankab.go.id</span>
                </p>
            </div>

            {/* Link Login Admin (di pojok kiri bawah) */}
            <Link to="/login-admin" className="admin-login-link" title="Login Admin">
                Admin
            </Link>
        </div>
    );
}