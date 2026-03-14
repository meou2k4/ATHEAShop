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
        <div className="contact-page-wrapper container">
            <div className="page-header">
                <h1 className="page-title">LIÊN HỆ VỚI CHÚNG TÔI</h1>
            </div>

            <div className="contact-grid">
                <div className="contact-info">
                    <div className="contact-info-block">
                        <h3>THÔNG TIN LIÊN HỆ</h3>
                        <div className="contact-details">
                            <p><strong>CÔNG TY TNHH ATHEA</strong></p>
                            {settings['CompanyAddress'] && <p><strong>📍 Trụ sở:</strong> {settings['CompanyAddress']}</p>}
                            {settings['Hotline'] && (
                                <p>
                                    <strong>📞 Hotline:</strong>{' '}
                                    <a href={`tel:${settings['Hotline']}`}>{settings['Hotline']}</a>
                                </p>
                            )}
                            {settings['ContactEmail'] && (
                                <p>
                                    <strong>✉️ Email:</strong>{' '}
                                    <a href={`mailto:${settings['ContactEmail']}`}>{settings['ContactEmail']}</a>
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="contact-info-block">
                        <h3>MẠNG XÃ HỘI</h3>
                        <div className="contact-socials">
                            {settings['Facebook'] && (
                                <a href={settings['Facebook']} target="_blank" rel="noreferrer" className="social-icon fb">
                                    f
                                </a>
                            )}
                            {settings['Zalo'] && (
                                <a href={settings['Zalo']} target="_blank" rel="noreferrer" className="social-icon zalo">
                                    Z
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                <div className="contact-form-wrapper">
                    <h3>GỬI TIN NHẮN</h3>
                    <form onSubmit={handleSubmit} className="contact-form">
                        {status.message && (
                            <div className={`contact-status ${status.type}`}>
                                {status.message}
                            </div>
                        )}
                        <input name="name" className="form-input" type="text" placeholder="Họ và tên của bạn" required disabled={loading} />
                        <input name="email" className="form-input" type="email" placeholder="Email của bạn" required disabled={loading} />
                        <input name="phone" className="form-input" type="tel" placeholder="Số điện thoại" required disabled={loading} />
                        <textarea name="message" className="form-textarea" placeholder="Nội dung tin nhắn..." rows={5} required disabled={loading}></textarea>
                        <button type="submit" disabled={loading} className="btn-submit">
                            {loading ? 'Đang gửi...' : 'Gửi tin nhắn'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Google Map Section */}
            {settings['GoogleMapHtml']?.trim() && (
                <div 
                    className="map-section" 
                    dangerouslySetInnerHTML={{ __html: settings['GoogleMapHtml'] }} 
                />
            )}
        </div>
    );
}
