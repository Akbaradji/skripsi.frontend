import { useState , useEffect} from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/api/admin/login', { email, password });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('role', 'admin');
      navigate('/dashboard-admin');
    } catch (error) {
      setMsg('Login gagal: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login Admin</h2>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
        {msg && <p className="message">{msg}</p>}
      </form>
    </div>
  );
}
