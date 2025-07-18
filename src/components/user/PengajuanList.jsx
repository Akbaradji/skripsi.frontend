import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function PengajuanList() {
  const [pengajuan, setPengajuan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPengajuan = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8000/api/pengajuan', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPengajuan(res.data);
    } catch (err) {
      setError('Gagal memuat data pengajuan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPengajuan();
  }, []);

  const handleDelete = async (id, status) => {
    if (status !== 'pending') {
      alert('Pengajuan yang sudah diproses tidak bisa dihapus');
      return;
    }

    const confirm = window.confirm('Yakin ingin menghapus pengajuan ini?');
    if (!confirm) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/pengajuan/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Pengajuan berhasil dihapus');
      fetchPengajuan(); // refresh data setelah hapus
    } catch (err) {
      alert('Gagal menghapus pengajuan');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (pengajuan.length === 0) return <div>Tidak ada pengajuan ditemukan.</div>;

  return (
    <div style={{ maxWidth: 600, margin: 'auto' }}>
      <h2>Daftar Pengajuan Magang</h2>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Bidang Magang</th>
            <th>Tanggal Mulai</th>
            <th>Tanggal Selesai</th>
            <th>Status</th>
            <th>Catatan</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {pengajuan.map(item => (
            <tr key={item.id}>
              <td>{item.bidang_magang}</td>
              <td>{item.tanggal_mulai}</td>
              <td>{item.tanggal_selesai}</td>
              <td>{item.status}</td>
              <td>{item.catatan || '-'}</td>
              <td>
                <Link
                  to={`/pengajuan/${item.id}`}
                  style={{ marginRight: 10, textDecoration: 'underline', color: 'blue', cursor: 'pointer' }}
                >
                  Lihat Detail
                </Link>
                <button
                  onClick={() => handleDelete(item.id, item.status)}
                  disabled={item.status !== 'pending'}
                  style={{
                    backgroundColor: item.status === 'pending' ? '#d32f2f' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: 5,
                    padding: '6px 10px',
                    cursor: item.status === 'pending' ? 'pointer' : 'not-allowed',
                  }}
                  title={item.status !== 'pending' ? 'Tidak bisa dihapus' : 'Hapus pengajuan'}
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
