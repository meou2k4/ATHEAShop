import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function PublicFooter() {
    const [settings, setSettings] = useState({});

    useEffect(() => {
        api.get('/Settings').then(({ data }) => {
            const map = {};
            data.forEach(s => map[s.key] = s.value);
            setSettings(map);
        }).catch(() => { });
    }, []);

    return (
        <footer className="footer-athea">
            <div className="container">
                <div className="footer-athea-grid">
                    {/* Cột 1: SẢN PHẨM */}
                    <div className="footer-athea-col" style={{ alignItems: 'flex-start' }}>
                        <ul className="footer-athea-links" style={{ textAlign: 'center' }}>
                            <li style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 6 }}>SẢN PHẨM</li>
                            <li><Link to="/san-pham?filter=new">SẢN PHẨM MỚI</Link></li>
                            <li><Link to="/san-pham?filter=sale">SẢN PHẨM GIẢM GIÁ</Link></li>
                            <li><Link to="/san-pham">TẤT CẢ SẢN PHẨM</Link></li>
                        </ul>
                    </div>

                    <div className="footer-athea-col center-col" style={{ alignItems: 'center' }}>
                        <ul className="footer-athea-links" style={{ display: 'flex', flexDirection: 'column', textAlign: 'center', gap: 8 }}>
                            <li><Link to="/chinh-sach">CHÍNH SÁCH MUA SẮM</Link></li>
                            <li><Link to="/lien-he">LIÊN HỆ</Link></li>
                        </ul>
                    </div>

                    <div className="footer-athea-col right-col" style={{ alignItems: 'flex-end' }}>
                        <div className="footer-athea-social" style={{ marginBottom: 16 }}>
                            <a href={settings['Facebook'] || '#'} target="_blank" rel="noreferrer" title="Facebook" className="social-icon">f</a>
                            <a href={settings['Zalo'] || '#'} target="_blank" rel="noreferrer" title="Zalo" className="social-icon">Z</a>
                            <a href={settings['Hotline'] ? `tel:${settings['Hotline']}` : 'tel:19006650'} title="Gọi Điện" className="social-icon">📞</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

