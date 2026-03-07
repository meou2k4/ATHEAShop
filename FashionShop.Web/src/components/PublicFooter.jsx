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
                    <div className="footer-athea-col">
                        <ul className="footer-athea-links">
                            <li className="footer-athea-col-title">SẢN PHẨM</li>
                            <li><Link to="/san-pham?filter=new">SẢN PHẨM MỚI</Link></li>
                            <li><Link to="/san-pham?filter=sale">SẢN PHẨM GIẢM GIÁ</Link></li>
                            <li><Link to="/san-pham">TẤT CẢ SẢN PHẨM</Link></li>
                        </ul>
                    </div>

                    {/* Cột 2: Chính sách + Liên hệ */}
                    <div className="footer-athea-col center-col">
                        <ul className="footer-athea-links">
                            <li><Link to="/chinh-sach">CHÍNH SÁCH MUA SẮM</Link></li>
                            <li><Link to="/lien-he">LIÊN HỆ</Link></li>
                        </ul>
                    </div>

                    {/* Cột 3: Mạng xã hội */}
                    <div className="footer-athea-col right-col">
                        <div className="footer-athea-social">
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
