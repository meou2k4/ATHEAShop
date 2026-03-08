import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';

// ─── Component VariantCard (Tái sử dụng cho đồng bộ với ProductListPage) ────
function VariantCard({ item }) {
        const navigate = useNavigate();
        const displayPrice = item.isOnSale && item.salePrice ? item.salePrice : item.basePrice;
        const hasDiscount = item.isOnSale && item.salePrice;
        const discountPercent = hasDiscount ? Math.round(((item.basePrice - item.salePrice) / item.basePrice) * 100) : 0;

        return (
                <div className="vcard" onClick={() => navigate(`/san-pham/${item.slug}`)}>
                        <div className="vcard-img">
                                {item.mainImageUrl
                                        ? <img src={item.mainImageUrl} alt={item.productName} loading="lazy" />
                                        : <div className="vcard-placeholder">👗</div>
                                }
                                <div className="vcard-labels">
                                        {item.isNew && <span className="label-new">NEW</span>}
                                        {item.isOnSale && <span className="label-sale">SALE</span>}
                                        {hasDiscount && discountPercent > 0 && <span className="label-percent">-{discountPercent}%</span>}
                                </div>
                        </div>
                        <div className="vcard-body">
                                <div className="vcard-price">
                                        {hasDiscount ? (
                                                <>
                                                        <span className="vcard-price-sale">{displayPrice.toLocaleString('vi-VN')}₫</span>
                                                        <span className="vcard-price-origin">{item.basePrice.toLocaleString('vi-VN')}₫</span>
                                                </>
                                        ) : (
                                                <span className="vcard-price-normal">{displayPrice?.toLocaleString('vi-VN')}₫</span>
                                        )}
                                </div>
                                <div className="vcard-name">{item.productName}</div>
                                {item.colorHex && (
                                        <div className="vcard-color-dot">
                                                <span style={{ background: item.colorHex }} title={item.colorName} />
                                        </div>
                                )}
                        </div>
                </div>
        );
}

export default function HomePage() {
        const [newProducts, setNewProducts] = useState([]);
        const [saleProducts, setSaleProducts] = useState([]);
        const [categories, setCategories] = useState([]);
        const [settings, setSettings] = useState({});
        const [loading, setLoading] = useState(true);

        useEffect(() => {
                Promise.all([
                        api.get('/Product/variants-list?isNew=true'),
                        api.get('/Product/variants-list?isOnSale=true'),
                        api.get('/Category'),
                        api.get('/Settings'),
                ]).then(([n, s, c, st]) => {
                        setNewProducts(Array.isArray(n.data) ? n.data.slice(0, 8) : []);
                        setSaleProducts(Array.isArray(s.data) ? s.data.slice(0, 8) : []);
                        setCategories(c.data);
                        const map = {};
                        st.data.forEach(i => map[i.key] = i.value);
                        setSettings(map);
                }).catch(() => { }).finally(() => setLoading(false));
        }, []);

        if (loading) return <div className="loading" style={{ paddingTop: 100 }}>⏳ Đang tải...</div>;

        const heroImage = newProducts[0]?.mainImageUrl || '';

        return (
                <>
                        {/* HERO - ATHEA STYLE (Light, elegant) */}
                        <section className="hero-athea">
                                <div className="hero-athea-content container">
                                        <div className="hero-athea-text">
                                                <div className="hero-athea-badge">Bộ sưu tập mới</div>
                                                <h1>Định hình <span>phong cách</span> sang trọng</h1>
                                                <p>Thời trang nữ cao cấp - tinh tế, hiện đại và vượt thời gian. Cùng khám phá những thiết kế tôn vinh vẻ đẹp của bạn.</p>
                                                <div className="hero-athea-actions">
                                                        <Link to="/san-pham?filter=new" className="btn-athea-primary">Khám phá ngay →</Link>
                                                </div>
                                        </div>
                                        <div className="hero-athea-visual">
                                                <div className="hero-athea-img-wrap">
                                                        {heroImage ? (
                                                                <img src={heroImage} alt="Bộ sưu tập mới" />
                                                        ) : (
                                                                <div className="hero-athea-placeholder">👗</div>
                                                        )}
                                                </div>
                                        </div>
                                </div>
                        </section>

                        {/* DANH MỤC */}
                        {categories.length > 0 && (
                                <section className="section" style={{ paddingBottom: 24, paddingTop: 40 }}>
                                        <div className="container">
                                                <div className="section-header" style={{ justifyContent: 'center', textAlign: 'center', marginBottom: 24 }}>
                                                        <div>
                                                                <div className="section-title" style={{ fontSize: 22 }}>DANH MỤC SẢN PHẨM</div>
                                                        </div>
                                                </div>
                                                <div className="category-scroll-container">
                                                        {categories.map(c => (
                                                                <Link key={c.id} to={`/san-pham?categoryId=${c.id}`} className="category-pill">
                                                                        <span className="category-pill-name">{c.name}</span>
                                                                </Link>
                                                        ))}
                                                </div>
                                        </div>
                                </section>
                        )}

                        {/* HÀNG MỚI */}
                        {newProducts.length > 0 && (
                                <section className="section" style={{ background: 'var(--pub-surface)', paddingTop: 48, paddingBottom: 48 }}>
                                        <div className="container">
                                                <div className="section-header" style={{ marginBottom: 32, justifyContent: 'center' }}>
                                                        <div style={{ textAlign: 'center' }}>
                                                                <div className="section-title">NEW ARRIVAL</div>
                                                        </div>
                                                </div>
                                                <div className="vcard-grid-home">
                                                        {newProducts.map((p, i) => <VariantCard key={`${p.productId} - ${p.colorId ?? i}`} item={p} />)}
                                                </div>
                                                <div style={{ textAlign: 'center', marginTop: 32 }}>
                                                        <Link to="/san-pham?filter=new" className="btn-athea-outline" style={{ display: 'inline-flex' }}>Xem thêm</Link>
                                                </div>
                                        </div>
                                </section>
                        )}

                        {/* ĐANG SALE */}
                        {saleProducts.length > 0 && (
                                <section className="section" style={{ paddingTop: 48, paddingBottom: 48 }}>
                                        <div className="container">
                                                <div className="section-header" style={{ marginBottom: 32, justifyContent: 'center' }}>
                                                        <div style={{ textAlign: 'center' }}>
                                                                <div className="section-title">SALE OFF</div>
                                                        </div>
                                                </div>
                                                <div className="vcard-grid-home">
                                                        {saleProducts.map((p, i) => <VariantCard key={`${p.productId} - ${p.colorId ?? i}`} item={p} />)}
                                                </div>
                                                <div style={{ textAlign: 'center', marginTop: 32 }}>
                                                        <Link to="/san-pham?filter=sale" className="btn-athea-outline" style={{ display: 'inline-flex' }}>Xem thêm</Link>
                                                </div>
                                        </div>
                                </section>
                        )}

                        {/* POLICY BANNER (Dark Theme) */}
                        <section style={{ background: '#1c1c1c', color: 'white', padding: '40px 0' }}>
                                <div className="container">
                                        <div className="policy-grid">
                                                <div className="policy-item">
                                                        <div className="policy-icon">🔄</div>
                                                        <h4 className="policy-title">6 NGÀY ĐỔI SẢN PHẨM</h4>
                                                        <p className="policy-desc">Đổi sản phẩm trong 6 ngày</p>
                                                </div>
                                                <div className="policy-item">
                                                        <div className="policy-icon">📞</div>
                                                        <h4 className="policy-title">HOTLINE {settings['Hotline'] || ''}</h4>
                                                        <p className="policy-desc">8h00 - 17h00 | T2 - CN</p>
                                                </div>
                                                <div className="policy-item">
                                                        <div className="policy-icon">🏪</div>
                                                        <h4 className="policy-title">HỆ THỐNG CỬA HÀNG</h4>
                                                        <p className="policy-desc">60 chi nhánh toàn quốc</p>
                                                </div>
                                                <div className="policy-item">
                                                        <div className="policy-icon">🚚</div>
                                                        <h4 className="policy-title">VẬN CHUYỂN</h4>
                                                        <p className="policy-desc">Đồng giá 25k toàn quốc</p>
                                                </div>
                                        </div>
                                </div>
                        </section>
                </>
        );
}
