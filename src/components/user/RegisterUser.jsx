import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../assets/css/register.css';
import ReCAPTCHA from 'react-google-recaptcha';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [captcha, setCaptcha] = useState(null);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  // Handle perubahan input
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle perubahan captcha
  const handleCaptchaChange = value => {
    setCaptcha(value);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg('');

    // Validasi captcha sudah terisi
    if (!captcha) {
      setMsg('Silakan verifikasi captcha terlebih dahulu');
      return;
    }

    try {
      // Kirim form + token captcha ke backend
      await axios.post('http://localhost:8000/api/register', {
        ...form,
        'g-recaptcha-response': captcha,
      });

      setMsg('Registrasi berhasil! Silakan login.');
      navigate('/login-user'); // arahkan ke halaman login user yang benar
    } catch (error) {
      setMsg(error.response?.data?.message || 'Registrasi gagal');
    }
  };

  return (
    <div className="container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Nama lengkap" value={form.name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <input
          type="password"
          name="password_confirmation"
          placeholder="Konfirmasi Password"
          value={form.password_confirmation}
          onChange={handleChange}
          required
        />

        {/* Tambahkan reCAPTCHA */}
        <ReCAPTCHA
          sitekey="6LdrBU4rAAAAAPaX0BJDce3KuWN1fQy3MlP1_Lfo"  // Ganti dengan site key reCAPTCHA-mu
          onChange={handleCaptchaChange}
        />

        <button type="submit">Daftar</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
}
