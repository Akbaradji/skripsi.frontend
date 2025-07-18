import { useState,  } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../assets/css/register.css';
import ReCAPTCHA from 'react-google-recaptcha';


export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [captcha, setCaptcha] = useState(null);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg('');
    if (!captcha) return setMsg('Tolong verifikasi captcha terlebih dahulu');

    try {
      const res = await axios.post('http://localhost:8000/api/login', {
        ...form,
        'g-recaptcha-response': captcha,
      });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('role', 'mahasiswa');
      navigate('/dashboard-user');
    } catch (error) {
      setMsg(error.response?.data?.message || 'Login gagal');
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        <ReCAPTCHA sitekey="6LdrBU4rAAAAAPaX0BJDce3KuWN1fQy3MlP1_Lfo" onChange={setCaptcha} />
        <button type="submit">Login</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
}
