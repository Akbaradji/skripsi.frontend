import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useLogout } from '../LogoutBersama';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import styles react-toastify

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [msg, setMsg] = useState('');
  const [pengajuan, setPengajuan] = useState([]);
  const logout = useLogout(); // false karena ini user biasa
  const previousStatuses = useRef({}); // Simpan status pengajuan sebelumnya

  // Ambil data user
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMsg('Silakan login terlebih dahulu.');
      return;
    }

    axios.get('http://localhost:8000/api/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setUser(res.data))
      .catch(() => setMsg('Token tidak valid atau sudah kadaluarsa.'));
  }, []);

  // Fungsi untuk cek status pengajuan terbaru
  const fetchPengajuan = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8000/api/pengajuan', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPengajuan(res.data);

      // Cek perubahan status
      res.data.forEach(item => {
        const prevStatus = previousStatuses.current[item.id];
        if (prevStatus && prevStatus !== item.status) {
          toast.info(`Status pengajuan "${item.bidang_magang}" berubah menjadi ${item.status}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            pauseOnHover: true,
            draggable: true,
          });
        }
        previousStatuses.current[item.id] = item.status;
      });
    } catch {
      // Tangani error jika perlu
    }
  };

  // Polling tiap 15 detik
  useEffect(() => {
    fetchPengajuan();
    const interval = setInterval(fetchPengajuan, 15000);
    return () => clearInterval(interval);
  }, []);

  if (msg) return <p>{msg}</p>;
  if (!user) return <p>Loading...</p>;

  return (
    <div className="container" style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h2>Dashboard</h2>

      {/* Tombol Logout */}
      <button
        onClick={logout}
        style={{
          marginBottom: 20,
          padding: '8px 12px',
          backgroundColor: '#d32f2f',
          color: 'white',
          border: 'none',
          borderRadius: 5,
          cursor: 'pointer',
        }}
      >
        Logout
      </button>

      <p>Selamat datang, <strong>{user.name}</strong>!</p>
      <p>Role: <em>{user.role}</em></p>

      <nav style={{ marginTop: 30 }}>
        {/* Tampilkan navigasi hanya jika role mahasiswa */}
        {user.role === 'mahasiswa' && (
          <>
            <Link
              to="/pengajuan-baru"
              style={{
                display: 'inline-block',
                marginRight: 20,
                padding: '10px 15px',
                backgroundColor: '#3f51b5',
                color: '#fff',
                borderRadius: 5,
                textDecoration: 'none',
                fontWeight: 'bold',
              }}
            >
              Buat Pengajuan Magang
            </Link>

            <Link
              to="/daftar-pengajuan"
              style={{
                display: 'inline-block',
                padding: '10px 15px',
                backgroundColor: '#4caf50',
                color: '#fff',
                borderRadius: 5,
                textDecoration: 'none',
                fontWeight: 'bold',
              }}
            >
              Daftar Pengajuan Saya
            </Link>
          </>
        )}

        {/* Jika admin, bisa ditambahkan link lain di sini */}
        {user.role === 'admin' && (
          <p>Silakan gunakan menu admin di sidebar atau navigasi.</p>
        )}
      </nav>
      <Link to="/kalender-magang" className="calendar-btn">
        📅 Lihat Kalender Magang
      </Link>

      {/* Toast container */}
      <ToastContainer />
    </div>
  );
}
