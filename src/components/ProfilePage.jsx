import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../assets/css/ProfilePage.css'; 

export default function ProfilePage() {
    const [user, setUser] = useState({
        name: '',
        email: '',
    });
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');

    // Fungsi untuk mendapatkan inisial nama dari string nama lengkap
    const getInitials = (name) => {
        if (!name) return '';
        const nameParts = name.split(' ').filter(part => part.length > 0);
        if (nameParts.length === 1) {
            return nameParts[0].charAt(0).toUpperCase();
        }
        return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
    };

    // Ambil data user dari API saat komponen dimuat
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setMsg('Silakan login terlebih dahulu.');
            setLoading(false);
            return;
        }

        axios.get('http://localhost:8000/api/me', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            setUser({
                name: res.data.name,
                email: res.data.email,
            });
            setLoading(false);
        })
        .catch(err => {
            setMsg('Token tidak valid atau sudah kadaluarsa.');
            setLoading(false);
            console.error('Error fetching user data:', err); // Log error untuk debugging
        });
    }, []);

    // Tampilkan pesan loading saat data sedang diambil
    if (loading) return (
        <div className="profile-loading-error-container">
            <p className="profile-loading-message">Loading profil...</p>
        </div>
    );

    // Tampilkan pesan error jika ada masalah atau user belum login
    if (msg) return (
        <div className="profile-loading-error-container">
            <p className="profile-error-message">{msg}</p>
        </div>
    );
    
    // Tampilkan pesan jika tidak ada data profil (setelah loading dan tidak ada error msg)
    if (!user.name) return (
        <div className="profile-loading-error-container">
            <p className="profile-loading-message">Data profil tidak tersedia.</p>
        </div>
    );

    return (
        <div className="profile-page-container">
            <div className="profile-card">
                <h2 className="profile-title">Profil Pengguna</h2>

                <div className="profile-info-section">
                    {/* Avatar Inisial: Menampilkan inisial nama pengguna di lingkaran */}
                    <div className="profile-avatar">
                        {getInitials(user.name)}
                    </div>
                    {/* Nama Pengguna */}
                    <p className="profile-name">{user.name}</p>
                    {/* Email Pengguna */}
                    <p className="profile-email">{user.email}</p>
                </div>
            </div>
        </div>
    );
}
