import { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';

export default function ContactPage() {
    const [settings, setSettings] = useState({});

    useEffect(() => {
        api.get('/Settings').then(({ data }) => {
            const map = {};
            data.forEach(s => map[s.key] = s.value);
            setSettings(map);
        }).catch(() => { });
    }, []);

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            message: formData.get('message')
        };

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            await api.post('/Contact', data);
            setStatus({ type: 'success', message: 'Cảm ơn bạn! Thông tin liên hệ đã được gửi thành công.' });
            e.target.reset();
        } catch (error) {
            console.error(error);
            setStatus({
                type: 'error',
                message: error.response?.data?.message || 'Có lỗi xảy ra khi gửi thông tin. Vui lòng thử lại sau.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '60px 15px', maxWidth: 800 }}>
            <h1 style={{ textAlign: 'center', marginBottom: 40, fontSize: 24, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>LIÊN HỆ VỚI CHÚNG TÔI</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40 }}>
                <div>
                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>THÔNG TIN LIÊN HỆ</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 15, color: '#333', fontSize: 15 }}>
                        <p><strong>CÔNG TY TNHH ATHEA</strong></p>
                        {settings['CompanyAddress'] && <p><strong>📍 Trụ sở:</strong> {settings['CompanyAddress']}</p>}
                        {settings['Hotline'] && (
                            <p>
                                <strong>📞 Hotline:</strong>{' '}
                                <a href={`tel:${settings['Hotline']}`} style={{ color: '#111', textDecoration: 'none', fontWeight: 600 }}>
                                    {settings['Hotline']}
                                </a>
                            </p>
                        )}
                        {settings['ContactEmail'] && (
                            <p>
                                <strong>✉️ Email:</strong> <a href={`mailto:${settings['ContactEmail']}`} style={{ color: '#111', textDecoration: 'none' }}>{settings['ContactEmail']}</a>
                            </p>
                        )}
                    </div>

                    <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 40, marginBottom: 20 }}>MẠNG XÃ HỘI</h3>
                    <div style={{ display: 'flex', gap: 15 }}>
                        {settings['Facebook'] && <a href={settings['Facebook']} target="_blank" rel="noreferrer" style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#1877F2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', fontSize: 20 }}>f</a>}
                        {settings['Zalo'] && <a href={settings['Zalo']} target="_blank" rel="noreferrer" style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#0068FF', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', fontSize: 20, fontWeight: 'bold' }}>Z</a>}
                    </div>
                </div>

                <div>
                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>GỬI TIN NHẮN</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                        {status.message && (
                            <div style={{
                                padding: '10px 15px',
                                backgroundColor: status.type === 'success' ? '#d4edda' : '#f8d7da',
                                color: status.type === 'success' ? '#155724' : '#721c24',
                                border: `1px solid ${status.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                                fontSize: 14
                            }}>
                                {status.message}
                            </div>
                        )}
                        <input name="name" className="form-control" type="text" placeholder="Họ và tên của bạn" required style={{ width: '100%', padding: '12px 15px', border: '1px solid #ccc', borderRadius: 0 }} disabled={loading} />
                        <input name="email" className="form-control" type="email" placeholder="Email của bạn" required style={{ width: '100%', padding: '12px 15px', border: '1px solid #ccc', borderRadius: 0 }} disabled={loading} />
                        <input name="phone" className="form-control" type="tel" placeholder="Số điện thoại" required style={{ width: '100%', padding: '12px 15px', border: '1px solid #ccc', borderRadius: 0 }} disabled={loading} />
                        <textarea name="message" className="form-control" placeholder="Nội dung tin nhắn..." rows={5} required style={{ width: '100%', padding: '12px 15px', border: '1px solid #ccc', borderRadius: 0, resize: 'vertical' }} disabled={loading}></textarea>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                backgroundColor: loading ? '#666' : '#111',
                                color: '#fff',
                                padding: '14px',
                                border: 'none',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: 1
                            }}
                        >
                            {loading ? 'Đang gửi...' : 'Gửi tin nhắn'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Google Map Section */}
            {settings['GoogleMapHtml'] && (
                <div style={{ marginTop: 60, width: '100%', height: 400, backgroundColor: '#f5f5f5' }}>
                    <div
                        style={{ width: '100%', height: '100%' }}
                        dangerouslySetInnerHTML={{ __html: settings['GoogleMapHtml'] }}
                    />
                </div>
            )}
        </div>
    );
}
