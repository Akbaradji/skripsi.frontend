import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-blue-600 p-4 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">
          PKL App
        </div>
        <div className="space-x-4">
          <Link to="/login-admin" className="hover:text-blue-200 transition-colors">Login Admin</Link>
          <Link to="/register-user" className="hover:text-blue-200 transition-colors">Registrasi</Link>
          <Link to="/login-user" className="hover:text-blue-200 transition-colors">Login Mahasiswa</Link>
          <Link to="/kalender-magang" className="hover:text-blue-200 transition-colors">Kalender Magang</Link>
          {/* Anda bisa menambahkan link lain di sini */}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
