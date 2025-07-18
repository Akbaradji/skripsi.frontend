import React from 'react';
import { Link } from 'react-router-dom';
import kominfoLogo from '../assets/kominfo_logo.png'; // ganti path sesuai folder kamu
import '../assets/css/LandingPage.css';


export default function LandingPage() {
    return (
        <div className="landing-container">
            {/* Header kanan atas */}
            <div className="top-right-buttons">
                <Link to="/login-user" className="btn-primary">Login Mahasiswa</Link>
                <Link to="/register-user" className="btn-secondary">Registrasi</Link>
            </div>

            {/* Konten tengah */}
            <img src={kominfoLogo} alt="Kominfo Pacitan" className="logo-kominfo" />
            <h1>
                Selamat Datang di <br />
                <span>Portal Magang</span>
            </h1>
            <p className="subtitle">Diskominfo Kabupaten Pacitan</p>
            <p className="desc">Platform digital untuk pengelolaan magang mahasiswa secara mudah dan transparan.</p>

            {/* Footer kontak */}
            <div className="contact-info">
                <h4>Diskominfo Kabupaten Pacitan</h4>
                <p className="highlight">Jl. Jaksa Agung Suprapto No.08, Pacitan, Jawa Timur 63512</p>
                <p>
                    <span className="icon">📞</span> <span className="highlight">(0357) 882114</span>
                </p>
                <p>
                    <span className="icon">✉️</span> <span className="highlight">kominfo@pacitankab.go.id</span>
                </p>
            </div>

            <Link
                to="/login-admin"
                className="admin-login-link"
                title="Login Admin"
            >
                Admin
            </Link>

        </div>
    );
}
