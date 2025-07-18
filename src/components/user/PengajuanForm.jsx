import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // Tambahkan ini

export default function PengajuanForm() {
  const [form, setForm] = useState({
    bidang_magang: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    dokumen: null,
  });
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();  // Inisialisasi useNavigate

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'dokumen') {
      setForm(prev => ({ ...prev, dokumen: files[0] }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('bidang_magang', form.bidang_magang);
      formData.append('tanggal_mulai', form.tanggal_mulai);
      formData.append('tanggal_selesai', form.tanggal_selesai);
      if (form.dokumen) formData.append('dokumen', form.dokumen);

      await axios.post('http://localhost:8000/api/pengajuan', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setMsg('Pengajuan berhasil dikirim!');
      setForm({ bidang_magang: '', tanggal_mulai: '', tanggal_selesai: '', dokumen: null });

      // Redirect ke dashboard user setelah submit sukses
      navigate('/dashboard-user');
    } catch (error) {
      setMsg(error.response?.data?.message || 'Gagal mengirim pengajuan');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto' }}>
      <h2>Form Pengajuan Magang</h2>
      <form onSubmit={handleSubmit}>
        <label>Bidang Magang</label><br />
        <input
          type="text"
          name="bidang_magang"
          value={form.bidang_magang}
          onChange={handleChange}
          required
        /><br /><br />

        <label>Tanggal Mulai</label><br />
        <input
          type="date"
          name="tanggal_mulai"
          value={form.tanggal_mulai}
          onChange={handleChange}
          required
        /><br /><br />

        <label>Tanggal Selesai</label><br />
        <input
          type="date"
          name="tanggal_selesai"
          value={form.tanggal_selesai}
          onChange={handleChange}
          required
        /><br /><br />

        <label>Upload Dokumen (WAJIB)</label><br />
        <input type="file" name="dokumen" onChange={handleChange} /><br /><br />

        <button type="submit">Kirim Pengajuan</button>
      </form>

      {msg && <p>{msg}</p>}
    </div>
  );
}
