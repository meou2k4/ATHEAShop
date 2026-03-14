import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function PublicFooter() {
    const [settings, setSettings] = useState({});

    useEffect(() => {
        api.get('/Settings')
            .then(({ data }) => {
                const map = {};
                data.forEach((s) => { map[s.key] = s.value; });
                setSettings(map);
            })
            .catch(() => { /* ignore */ });
    }, []);

    const hotline = settings['Hotline'] || '0881861533';

    return (
        <footer className="footer-athea">
            <div className="container">
                <div className="footer-athea-grid">
                    {/* Cột 1: Thương hiệu */}
                    <div className="footer-athea-col">
                        <div className="footer-logo">ATHEA<span>.</span></div>
                        <p className="footer-slogan">
                            Thời trang thiết kế cao cấp, tôn vinh vẻ đẹp hiện đại của phụ nữ Việt.
                        </p>
                    </div>

                    {/* Cột 2: Sản phẩm */}
                    <div className="footer-athea-col">
                        <ul className="footer-athea-links">
                            <li className="footer-athea-col-title">SẢN PHẨM</li>
                            <li><Link to="/san-pham?filter=new">SẢN PHẨM MỚI</Link></li>
                            <li><Link to="/san-pham?filter=sale">SẢN PHẨM GIẢM GIÁ</Link></li>
                            <li><Link to="/san-pham">TẤT CẢ SẢN PHẨM</Link></li>
                        </ul>
                    </div>

                    {/* Cột 3: Hỗ trợ */}
                    <div className="footer-athea-col">
                        <ul className="footer-athea-links">
                            <li className="footer-athea-col-title">HỖ TRỢ KHÁCH HÀNG</li>
                            <li><Link to="/chinh-sach">CHÍNH SÁCH MUA SẮM</Link></li>
                            <li><Link to="/lien-he">LIÊN HỆ VỚI CHÚNG TÔI</Link></li>
                        </ul>
                    </div>

                    {/* Cột 4: Kết nối */}
                    <div className="footer-athea-col right-col">
                        <li className="footer-athea-col-title">KẾT NỐI</li>
                        <div className="footer-athea-social">
                            <a
                                href={settings['Facebook'] || '#'}
                                target="_blank"
                                rel="noreferrer"
                                title="Facebook"
                                aria-label="Facebook"
                                className="social-icon fb"
                            >
                                f
                            </a>
                            <a
                                href={settings['Zalo'] || '#'}
                                target="_blank"
                                rel="noreferrer"
                                title="Zalo"
                                aria-label="Zalo"
                                className="social-icon zalo"
                            >
                                Z
                            </a>
                            <a
                                href={`tel:${hotline}`}
                                title={`Gọi ${hotline}`}
                                aria-label="Hotline"
                                className="social-icon phone"
                            >
                                ☎
                            </a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="footer-copyright-new">©2026 Athea.vn</div>
                </div>
            </div>
        </footer>
    );
}
