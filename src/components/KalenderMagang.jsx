import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { useNavigate } from 'react-router-dom';
import 'react-calendar/dist/Calendar.css';
import '../assets/css/kalender.css';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function KalenderMagang() {
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const navigate = useNavigate();
  const formatDate = d => d.toISOString().split('T')[0];

  useEffect(() => {
    const mode = sessionStorage.getItem('mode');

    const fetchData = async () => {
      try {
        const url = role === 'admin'
          ? 'http://localhost:8000/api/admin/pengajuan'
          : 'http://localhost:8000/api/pengajuan';

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setData(res.data);
      } catch (err) {
        console.error('Gagal mengambil data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token && role) fetchData();

    return () => {
      if (mode === 'kalender') {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        sessionStorage.removeItem('mode');
        console.log('🔒 Logout otomatis karena keluar dari mode kalender');
      }
    };
  }, [role, token]);

  const handleDateChange = (newDate) => setDate(newDate);

  if (!token || !role) {
    return (
      <div className="kalender-container">
        <h2>Kalender Kominfo Pacitan</h2>
        <p>Silakan login terlebih dahulu:</p>
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          <Link to="/login-user" className="calendar-login-btn">Login Mahasiswa</Link>
          <Link to="/login-admin" className="calendar-login-btn">Login Admin</Link>
        </div>
      </div>
    );
  }

  const magangMap = {};
  data.forEach((item) => {
    const tgl = item.tanggal_mulai;
    if (!tgl) return;
    if (!magangMap[tgl]) magangMap[tgl] = [];
    magangMap[tgl].push(item.nama_pengaju);
  });

  return (
    <div className="kalender-container">
      <h2>Kalender Kominfo Pacitan</h2>

      {/* 🔘 Tombol Logout Manual */}
      <button
        onClick={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          sessionStorage.removeItem('mode');
          navigate('/');
        }}
        className="calendar-logout-btn"
      >
        🔓 Logout
      </button>

      {loading ? <p>Memuat data...</p> : (
        <>
          {role === 'mahasiswa' && (
            <p>📅 Anda dijadwalkan magang pada: <strong>{data[0]?.tanggal_mulai || '-'}</strong></p>
          )}
          {role === 'admin' && (
            <p>👥 Klik tanggal untuk melihat siapa saja yang magang.</p>
          )}

          <div className="calendar-wrapper">
            <Calendar
              onChange={handleDateChange}
              value={date}
              tileContent={({ date }) => {
                const key = formatDate(date);
                if (magangMap[key]?.length > 0) {
                  return <div className="dot">{role === 'admin' ? '🔵' : '🟢'}</div>;
                }
                return null;
              }}
            />
          </div>

          {role === 'admin' && magangMap[formatDate(date)] && (
            <div className="detail-box">
              <h4>Mahasiswa magang pada {formatDate(date)}:</h4>
              <ul>
                {magangMap[formatDate(date)].map((nama, idx) => (
                  <li key={idx}>{nama}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
