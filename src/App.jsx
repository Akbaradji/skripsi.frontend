import './App.css'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
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
import KalenderMagang from './components/KalenderMagang'; // Import KalenderMagang
import LandingPage from './components/LandingPage';

// Navbar sebagai komponen terpisah
function Navbar() {
  return (
    <nav>
      <Link to="/login-admin">Login Admin</Link> |{' '}
      <Link to="/register-user">Register Mahasiswa</Link> |{' '}
      <Link to="/login-user">Login Mahasiswa</Link> |{' '}
      <Link to="/kalender-magang">Kalender Magang</Link> {/* Tambahkan link ke kalender magang */}
    </nav>
  );
}

// Layout mengontrol kapan navbar tampil berdasarkan path
function Layout() {
  const location = useLocation();

  // Path dimana navbar TIDAK tampil
  const hideNavbarPaths = [
    '/',
    '/login-user',
    '/register-user',
    '/login-admin',
    '/dashboard-admin',
    '/dashboard-user',
    '/pengajuan-baru',
    '/daftar-pengajuan',
    '/admin/pengajuan',
    '/kalender-magang', 
  ];

  // Gunakan pattern matching
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname)
    || location.pathname.startsWith('/pengajuan/');


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
        <Route path="/kalender-magang" element={<KalenderMagang />} /> {/* Tambahkan rute untuk KalenderMagang */}
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
