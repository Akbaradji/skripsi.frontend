// src/App.jsx

import './App.css'; // Tetap impor App.css
import './index.css'; // Tetap impor index.css
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/user/UserDashboard';
import Register from './components/user/RegisterUser';
import Login from './components/user/UserLogin';
import PengajuanForm from './components/user/PengajuanForm';
import PengajuanList from './components/user/PengajuanList';
import PengajuanDetail from './components/user/PengajuanDetail';
import AdminPengajuanList from './components/AdminPengajuanList';
import ProfilePage from './components/ProfilePage';
import KalenderMagang from './components/KalenderMagang';
import LandingPage from './components/LandingPage';
import LogbookList from './components/user/LogbookList';
import LogbookForm from './components/user/LogbookForm';

// Impor komponen Navbar dari file terpisah
import Navbar from './components/Navbar';

// Layout mengontrol kapan navbar tampil berdasarkan path
function Layout() {
  const location = useLocation();
  // State untuk memicu refresh LogbookList
  const [logbookRefreshKey, setLogbookRefreshKey] = useState(0);

  // Gunakan daftar pola untuk menyembunyikan Navbar
  const hiddenPathsPatterns = [
    '/',
    '/login',
    '/register',
    '/dashboard',
    '/admin/pengajuan',
    '/pengajuan',
    '/kalender-magang',
    '/profile',
    '/logbook',
  ];

  const shouldHideNavbar = hiddenPathsPatterns.some(pattern =>
    location.pathname.startsWith(pattern)
  );

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login-admin" element={<AdminLogin />} />
        <Route path="/login-user" element={<Login />} />
        <Route path="/register-user" element={<Register />} />
        <Route path="/dashboard-admin" element={<AdminDashboard />} />
        <Route path="/dashboard-user" element={<UserDashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin/pengajuan" element={<AdminPengajuanList />} />
        <Route path="/pengajuan-baru" element={<PengajuanForm />} />
        <Route path="/daftar-pengajuan" element={<PengajuanList />} />
        <Route path="/pengajuan/:id" element={<PengajuanDetail />} />
        <Route path="/kalender-magang" element={<KalenderMagang />} />

        {/* ⭐ Rute untuk Logbook (disesuaikan agar sesuai dengan Link di LogbookList.jsx) */}
        <Route path="/logbook" element={<LogbookList />} /> {/* Untuk menampilkan daftar logbook */}
        <Route path="/buat-logbook-baru" element={<LogbookForm />} /> {/* Untuk membuat logbook baru */}
        <Route path="/logbook/:id" element={<LogbookForm />} /> {/* Untuk mengedit/melihat detail logbook */}

        {/* Catatan: Rute /logbook/edit/:id dan /logbook/review/:id digabung menjadi /logbook/:id.
           Logika edit/review/create ditangani di dalam LogbookForm berdasarkan ada/tidaknya ID di useParams().
           Prop setLogbookRefreshKey dihapus karena navigate('/logbook') akan me-refresh LogbookList. */}
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
