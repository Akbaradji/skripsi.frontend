import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
    const [user, setUser] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();

    // Ambil data user dari API
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setMsg('Silakan login terlebih dahulu.');
            return;
        }

        // Ambil data user menggunakan token
        axios.get('http://localhost:8000/api/me', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setUser(res.data))
            .catch(() => setMsg('Token tidak valid atau sudah kadaluarsa.'));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const res = await axios.put('http://localhost:8000/api/profile', user, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setMsg('Profil berhasil diperbarui!');
        } catch (err) {
            console.error('Error detail:', err);  // Debug error lebih detail
            if (err.response) {
                setMsg(`Gagal memperbarui profil: ${err.response.data.message || 'Unknown error'}`);
            } else if (err.request) {
                setMsg('Gagal memperbarui profil: Tidak ada respon dari server');
            } else {
                setMsg(`Gagal memperbarui profil: ${err.message}`);
            }
        };
    }

    if (msg) return <p>{msg}</p>;

    return (
        <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
            <h2>Pengaturan Profil</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Nama:
                    <input
                        type="text"
                        name="name"
                        value={user.name}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px', margin: '8px 0' }}
                    />
                </label>
                <br />
                <label>
                    Email:
                    <input
                        type="email"
                        name="email"
                        value={user.email}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px', margin: '8px 0' }}
                    />
                </label>
                <br />
                <label>
                    Password:
                    <input
                        type="password"
                        name="password"
                        value={user.password}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', margin: '8px 0' }}
                    />
                </label>
                <br />
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#3f51b5', color: '#fff' }}>
                    Simpan Perubahan
                </button>
            </form>
        </div>
    );
}
