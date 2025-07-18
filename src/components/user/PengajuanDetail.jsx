import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function PengajuanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pengajuan, setPengajuan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:8000/api/pengajuan/${id}`, {
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

    fetchDetail();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!pengajuan) return <div>Data tidak ditemukan</div>;

  const downloadDokumen = () => {
    if (!pengajuan.dokumen) return alert('Tidak ada dokumen untuk diunduh');
    // Asumsikan dokumen disimpan di storage Laravel dengan url publik, sesuaikan base URL-nya
    const url = `http://localhost:8000/storage/${pengajuan.dokumen}`;
    window.open(url, '_blank');
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h2>Detail Pengajuan Magang</h2>
      <p><strong>Bidang Magang:</strong> {pengajuan.bidang_magang}</p>
      <p><strong>Tanggal Mulai:</strong> {pengajuan.tanggal_mulai}</p>
      <p><strong>Tanggal Selesai:</strong> {pengajuan.tanggal_selesai}</p>
      <p><strong>Status:</strong> {pengajuan.status}</p>
      <p><strong>Catatan Admin:</strong> {pengajuan.catatan || '-'}</p>
      <p><strong>Tanggal Diterima:</strong> {pengajuan.tanggal_diterima}</p>
      <p>
        <strong>Dokumen:</strong>{' '}
        {pengajuan.dokumen ? (
          <button onClick={downloadDokumen}>Download Dokumen</button>
        ) : (
          'Tidak ada dokumen'
        )}
      </p>

      <button onClick={() => navigate(-1)} style={{ marginTop: 20 }}>
        Kembali
      </button>
    </div>
  );
}
