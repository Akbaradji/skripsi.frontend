import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export function useLogout(isAdmin = false) {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const url = isAdmin ? 'http://localhost:8000/api/admin/logout' : 'http://localhost:8000/api/logout';

      await axios.post(url, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // ✅ Tambahan: hapus role
      localStorage.removeItem('token');
      localStorage.removeItem('role'); // ✅ penting agar role tidak terbaca setelah logout

      // ✅ Arahkan ke landing page
      navigate('/'); // ✅ diubah dari '/login' ke '/'
    } catch (error) {
      console.error('Logout gagal', error);
    }
  };

  return logout;
}
