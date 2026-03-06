import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosConfig';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await api.post('/Auth/login', { email, password });
            login(data.token, { email: data.email, fullName: data.fullName });
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.message || 'Email hoặc mật khẩu không đúng.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '140px', overflow: 'hidden', justifyContent: 'center', marginBottom: '12px' }}>
                    <img src="/logo.png" alt="ATHEA" style={{ height: '200px', filter: 'brightness(0)' }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p>Trang quản trị viên</p>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            className="form-control"
                            type="email"
                            placeholder="admin@fashionshop.vn"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Mật khẩu</label>
                        <input
                            className="form-control"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: '8px' }}
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? '⏳ Đang đăng nhập...' : '🔐 Đăng nhập'}
                    </button>
                </form>
            </div>
        </div>
    );
}
