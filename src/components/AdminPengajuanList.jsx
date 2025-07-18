import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminPengajuanList() {
  const [pengajuan, setPengajuan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({ id: null, status: '', catatan: '' });
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [bidangMagangFilter, setBidangMagangFilter] = useState('');

  const fetchPengajuan = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8000/api/admin/pengajuan', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          status: statusFilter,
          bidang_magang: bidangMagangFilter,
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
  }, [statusFilter, bidangMagangFilter]);

  const handleStatusFilterChange = (e) => setStatusFilter(e.target.value);
  const handleBidangMagangFilterChange = (e) => setBidangMagangFilter(e.target.value);

  const handleSelectAll = () => {
    const newSelectedIds = pengajuan.map((item) => item.id);
    setSelectedIds(newSelectedIds);
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prevSelectedIds) =>
      prevSelectedIds.includes(id)
        ? prevSelectedIds.filter((itemId) => itemId !== id)
        : [...prevSelectedIds, id]
    );
  };

  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchRole = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:8000/api/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRole(res.data.role); // pastikan API `/me` return field `role`
      } catch (err) {
        console.error('Gagal mengambil role user:', err.response?.data || err.message);
      }
    };

    fetchRole();
  }, []);


  const handleBulkAction = async (status) => {
    if (selectedIds.length === 0) {
      alert('Pilih pengajuan terlebih dahulu');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:8000/api/admin/pengajuan/bulk-update-status',
        { ids: selectedIds, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Status pengajuan berhasil diperbarui');
      fetchPengajuan();
    } catch (err) {
      alert('Gagal memperbarui status pengajuan');
    }
  };

  const openUpdateForm = (id, currentStatus) => {
    setStatusUpdate({ id, status: currentStatus, catatan: '' });
  };

  const handleStatusChange = (e) => {
    setStatusUpdate((prev) => ({ ...prev, status: e.target.value }));
  };

  const handleCatatanChange = (e) => {
    setStatusUpdate((prev) => ({ ...prev, catatan: e.target.value }));
  };

  const submitStatusUpdate = async () => {
    if (!statusUpdate.status) {
      alert('Pilih status terlebih dahulu');
      return;
    }
    setUpdatingId(statusUpdate.id);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8000/api/pengajuan/${statusUpdate.id}/status`,
        { status: statusUpdate.status, catatan: statusUpdate.catatan },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Status berhasil diperbarui');
      setStatusUpdate({ id: null, status: '', catatan: '' });
      fetchPengajuan();
    } catch (err) {
      alert('Gagal memperbarui status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus pengajuan ini?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/pengajuan/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Pengajuan berhasil dihapus');
      fetchPengajuan();
    } catch (err) {
      alert('Gagal menghapus pengajuan: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (pengajuan.length === 0) return <div>Tidak ada pengajuan ditemukan.</div>;

  return (
    <div style={{ maxWidth: 900, margin: 'auto', padding: '20px' }}>
      <h2>Daftar Pengajuan Magang (Admin)</h2>

      <div style={{ marginBottom: 20 }}>
        <select onChange={handleStatusFilterChange} value={statusFilter}>
          <option value="all">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="disetujui">Disetujui</option>
          <option value="ditolak">Ditolak</option>
        </select>

        <input
          type="text"
          placeholder="Filter Bidang Magang"
          value={bidangMagangFilter}
          onChange={handleBidangMagangFilterChange}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <button onClick={() => handleBulkAction('disetujui')}>Setujui</button>
        <button onClick={() => handleBulkAction('ditolak')}>Tolak</button>
      </div>

      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectedIds.length === pengajuan.length}
              />
            </th>
            <th>Nama Pengaju</th>
            <th>Email Pengaju</th>
            <th>Bidang Magang</th>
            <th>Tanggal Mulai</th>
            <th>Tanggal Selesai</th>
            <th>Status</th>
            <th>Catatan</th>
            <th>File PDF</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {pengajuan.map((item) => (
            <tr key={item.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => handleSelectOne(item.id)}
                />
              </td>
              <td>{item.nama_pengaju}</td>
              <td>{item.email_pengaju}</td>
              <td>{item.bidang_magang}</td>
              <td>{item.tanggal_mulai}</td>
              <td>{item.tanggal_selesai}</td>
              <td>{item.status}</td>
              <td>{item.catatan || '-'}</td>
              <td>
                {item.pdf_pengajuan ? (
                  <a href={item.pdf_pengajuan} target="_blank" rel="noopener noreferrer">
                    Lihat PDF
                  </a>
                ) : (
                  'Tidak ada file'
                )}
              </td>
              <td>
                {statusUpdate.id === item.id ? (
                  <div>
                    <select value={statusUpdate.status} onChange={handleStatusChange}>
                      <option value="">Pilih Status</option>
                      <option value="disetujui">Disetujui</option>
                      <option value="ditolak">Ditolak</option>
                    </select>
                    <textarea
                      placeholder="Catatan (opsional)"
                      value={statusUpdate.catatan}
                      onChange={handleCatatanChange}
                      rows={3}
                      style={{ width: '100%', marginTop: 5 }}
                    />
                    <button onClick={submitStatusUpdate} disabled={updatingId === item.id}>
                      {updatingId === item.id ? 'Menyimpan...' : 'Simpan'}
                    </button>
                    <button
                      onClick={() => setStatusUpdate({ id: null, status: '', catatan: '' })}
                      style={{ marginLeft: 5 }}
                      disabled={updatingId === item.id}
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => openUpdateForm(item.id, item.status)}
                      style={{
                        color: 'blue',
                        border: 'none',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        borderRadius: '4px'
                      }}
                      title="Update Status"
                    >
                      ✏️ Update
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{
                        marginLeft: 5,
                        color: 'red',
                        border: 'none',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        borderRadius: '4px'
                      }}
                      title="Hapus Pengajuan"
                    >
                      🗑️ Hapus
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
