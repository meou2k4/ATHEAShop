import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../../api/axiosConfig';

export default function ProductDetailPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);

    const [activeImg, setActiveImg] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [openAccordion, setOpenAccordion] = useState('details'); // details, storage

    // Zoom Modal State
    const [zoomImg, setZoomImg] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [panPos, setPanPos] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && zoomImg) {
                setZoomImg(null);
                setZoomLevel(1);
                setPanPos({ x: 0, y: 0 });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [zoomImg]);

    useEffect(() => {
        Promise.all([
            api.get(`/Product/by-slug/${slug}`),
            api.get('/Settings').catch(() => ({ data: [] })),
        ]).then(([p, s]) => {
            setProduct(p.data);

            const initColorId = searchParams.get('color') ? Number(searchParams.get('color')) : null;
            const validColors = [...new Set((p.data.variants || []).map(v => v.colorId).filter(Boolean))];

            let targetColor = initColorId && validColors.includes(initColorId) ? initColorId : null;
            if (!targetColor && validColors.length > 0) {
                targetColor = validColors[0];
            }

            setSelectedColor(targetColor);
            setSelectedSize(null);

            const colorImages = targetColor ? (p.data.images || []).filter(i => i.colorId === targetColor) : (p.data.images || []);
            const mainImg = colorImages.find(i => i.isMain) || colorImages[0] || (!targetColor ? p.data.images?.[0] : null);
            setActiveImg(mainImg);

            const map = {};
            s.data.forEach(i => map[i.key] = i.value);
            setSettings(map);

            // Sản phẩm cùng danh mục
            if (p.data.categoryId) {
                api.get(`/Product?categoryId=${p.data.categoryId}&pageSize=8`)
                    .then(({ data }) => {
                        const items = Array.isArray(data) ? data : (data.items || []);
                        setRelated(items.filter(i => i.id !== p.data.id).slice(0, 6));
                    }).catch(() => { });
            }
        }).catch(() => navigate('/san-pham'))
            .finally(() => setLoading(false));
    }, [slug, navigate, searchParams]);

    if (loading) return <div className="loading" style={{ paddingTop: 100 }}>⏳ Đang tải...</div>;
    if (!product) return null;

    // Danh sách màu (duy nhất) từ variants
    const colors = [...new Map(
        (product.variants || []).filter(v => v.colorId).map(v => [v.colorId, { id: v.colorId, name: v.colorName, hex: v.colorHex }])
    ).values()];

    // Danh sách size dựa theo màu đang chọn
    const sizesForColor = selectedColor
        ? (product.variants || []).filter(v => v.colorId === selectedColor).map(v => ({ id: v.sizeId, name: v.sizeName, stock: v.stock }))
        : [...new Map((product.variants || []).map(v => [v.sizeId, { id: v.sizeId, name: v.sizeName, stock: v.stock }])).values()];

    // Ảnh tất cả
    const images = product.images || [];
    const displayImages = selectedColor ? images.filter(i => i.colorId === selectedColor) : images;

    const mainDisplayImg = activeImg || displayImages[0] || null;

    // Giá theo biến thể đang chọn
    const currentVariant = product.variants?.find(v => v.colorId === selectedColor && v.sizeId === selectedSize);
    const displayPrice = currentVariant?.price || (product.isOnSale && product.salePrice ? product.salePrice : null);
    const basePrice = product.basePrice;

    const buildContactMsg = () => {
        let msg = `Tôi muốn hỏi về sản phẩm: ${product.name}`;
        if (selectedColor) {
            const c = colors.find(c => c.id === selectedColor);
            msg += `, màu ${c?.name || ''}`;
        }
        if (selectedSize) {
            const s = sizesForColor.find(s => s.id === selectedSize);
            msg += `, size ${s?.name || ''}`;
        }
        return encodeURIComponent(msg);
    };

    const zaloUrl = settings['ZaloUrl']
        ? `${settings['ZaloUrl']}?text=${buildContactMsg()}`
        : null;
    const fbUrl = settings['FacebookUrl'] || null;

    return (
        <>
            <div className="product-detail">
                <div className="container">
                    {/* Breadcrumb */}
                    <div className="breadcrumb">
                        <Link to="/">Trang chủ</Link>
                        <span className="breadcrumb-sep">/</span>
                        <Link to="/san-pham">Sản phẩm</Link>
                        {product.categoryName && <>
                            <span className="breadcrumb-sep">/</span>
                            <Link to={`/danh-muc/${product.categorySlug}`}>{product.categoryName}</Link>
                        </>}
                        <span className="breadcrumb-sep">:</span>
                        <span>{product.name}</span>
                    </div>

                    <div className="product-detail-grid">
                        {/* Gallery */}
                        <div className="gallery-athea">
                            {displayImages.length > 1 && (
                                <div className="gallery-thumbs-vert">
                                    {displayImages.map(img => (
                                        <div
                                            key={img.id}
                                            className="gallery-thumb-vert"
                                            style={{ opacity: activeImg?.id === img.id ? 1 : 0.6 }}
                                            onClick={() => setActiveImg(img)}
                                        >
                                            <img src={img.imageUrl} alt="" />
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="gallery-main-athea" style={{ cursor: 'zoom-in' }} onClick={() => {
                                if (mainDisplayImg) {
                                    setZoomImg(mainDisplayImg.imageUrl);
                                    setZoomLevel(1);
                                    setPanPos({ x: 0, y: 0 });
                                }
                            }}>
                                {mainDisplayImg
                                    ? <img src={mainDisplayImg.imageUrl} alt={product.name} />
                                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, color: '#d1c4b5' }}>🖼️</div>
                                }
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="product-info">
                            <div className="product-info-badges">
                                {product.isNew && <span className="label-new">NEW</span>}
                                {product.isOnSale && <span className="label-sale">SALE</span>}
                            </div>

                            {/* Title & Price */}
                            <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--pub-text)', marginBottom: 4 }}>{product.name}</h1>
                            <div className="product-sku">MSP: {product.slug?.toUpperCase().substring(0, 15) || 'SKU-001'}</div>

                            <div className="product-info-price">
                                {displayPrice ? (
                                    <>
                                        <span className="product-price-sale">{displayPrice.toLocaleString('vi-VN')}₫</span>
                                        <span className="product-price-origin">{basePrice.toLocaleString('vi-VN')}₫</span>
                                    </>
                                ) : (
                                    <span className="product-price-normal">{basePrice?.toLocaleString('vi-VN')}₫</span>
                                )}
                            </div>

                            {/* Chọn màu */}
                            {colors.length > 0 && (
                                <div>
                                    <div className="selector-label">COLOR : {selectedColor ? <strong>{colors.find(c => c.id === selectedColor)?.name}</strong> : ''}</div>
                                    <div className="color-options-text" style={{ display: 'flex', gap: 10 }}>
                                        {colors.map(c => (
                                            <div
                                                key={c.id}
                                                title={c.name}
                                                className={`color-circle-item ${selectedColor === c.id ? 'active' : ''}`}
                                                onClick={() => {
                                                    const newColor = c.id;
                                                    if (newColor === selectedColor) return;

                                                    setSelectedColor(newColor);
                                                    setSelectedSize(null);

                                                    const colorImages = images.filter(i => i.colorId === newColor);
                                                    const matchingImg = colorImages.find(i => i.isMain) || colorImages[0] || null;
                                                    setActiveImg(matchingImg);
                                                }}
                                                style={{
                                                    width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
                                                    backgroundColor: c.hex || '#000',
                                                    border: '1px solid #e1e1e1',
                                                    boxShadow: selectedColor === c.id ? '0 0 0 2px #fff, 0 0 0 4px #000' : 'none'
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Chọn size */}
                            {sizesForColor.length > 0 && (
                                <div>
                                    <div className="selector-label">SIZE :</div>
                                    <div className="size-options-box">
                                        {sizesForColor.map(s => (
                                            <div
                                                key={s.id}
                                                className={`size-box ${selectedSize === s.id ? 'active' : ''}`}
                                                onClick={() => setSelectedSize(s.id === selectedSize ? null : s.id)}
                                            >
                                                {s.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Nút liên hệ mua hàng */}
                            <div className="product-actions-athea" style={{ display: 'flex', gap: 12, marginTop: 32, paddingBottom: 16 }}>
                                {zaloUrl && (
                                    <a href={zaloUrl} target="_blank" rel="noreferrer" className="btn-contact-social btn-contact-zalo">
                                        <div className="social-icon-wrapper">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" alt="Zalo" />
                                        </div>
                                        <span>Zalo Mua Hàng</span>
                                    </a>
                                )}
                                {fbUrl && (
                                    <a href={fbUrl} target="_blank" rel="noreferrer" className="btn-contact-social btn-contact-fb">
                                        <div className="social-icon-wrapper">
                                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                                <path d="M12 2.03998C6.5 2.03998 2 6.52998 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.84998C10.44 7.33998 11.93 5.95998 14.22 5.95998C15.31 5.95998 16.45 6.14998 16.45 6.14998V8.61998H15.19C13.95 8.61998 13.56 9.38998 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C18.34 21.21 22 17.06 22 12.06C22 6.52998 17.5 2.03998 12 2.03998Z" />
                                            </svg>
                                        </div>
                                        <span>Facebook Mua Hàng</span>
                                    </a>
                                )}
                            </div>

                            {/* Accordion Chi tiết & Lưu ý & Đổi trả */}
                            <div className="accordion-athea">
                                <div className="acc-athea-item">
                                    <button className="acc-athea-header" onClick={() => setOpenAccordion(openAccordion === 'details' ? null : 'details')}>
                                        CHI TIẾT <span className="acc-athea-icon">{openAccordion === 'details' ? '-' : '+'}</span>
                                    </button>
                                    {openAccordion === 'details' && (
                                        <div className="acc-athea-body">
                                            {product.description ? <div dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br/>') }} /> : <p>Chưa có mô tả.</p>}

                                        </div>
                                    )}
                                </div>
                                <div className="acc-athea-item">
                                    <button className="acc-athea-header" onClick={() => setOpenAccordion(openAccordion === 'storage' ? null : 'storage')}>
                                        HƯỚNG DẪN BẢO QUẢN <span className="acc-athea-icon">{openAccordion === 'storage' ? '-' : '+'}</span>
                                    </button>
                                    {openAccordion === 'storage' && (
                                        <div className="acc-athea-body">
                                            {product.storageInstructions ? <div dangerouslySetInnerHTML={{ __html: product.storageInstructions.replace(/\n/g, '<br/>') }} /> : <p>Chưa có hướng dẫn bảo quản.</p>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sản phẩm cùng danh mục */}
            {related.length > 0 && (
                <section className="related-section">
                    <div className="container">
                        <div className="section-header" style={{ marginBottom: 24, borderBottom: '1px solid var(--pub-border)', paddingBottom: 16 }}>
                            <div>
                                <div className="section-title" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>CÓ THỂ BẠN CŨNG THÍCH</div>
                            </div>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <button onClick={() => { document.getElementById('related-grid').scrollBy({ left: -300, behavior: 'smooth' }) }} style={{ position: 'absolute', left: -20, top: '40%', transform: 'translateY(-50%)', zIndex: 10, background: '#fff', border: '1px solid #ddd', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>{'<'}</button>
                            <button onClick={() => { document.getElementById('related-grid').scrollBy({ left: 300, behavior: 'smooth' }) }} style={{ position: 'absolute', right: -20, top: '40%', transform: 'translateY(-50%)', zIndex: 10, background: '#fff', border: '1px solid #ddd', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>{'>'}</button>
                            <div id="related-grid" className="product-grid" style={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', gap: 20, paddingBottom: 20, scrollBehavior: 'smooth', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                                {related.map(p => (
                                    <div key={p.id} className="product-card" style={{ flex: '0 0 auto', width: '250px', scrollSnapAlign: 'start' }} onClick={() => navigate(`/san-pham/${p.slug}`)}>
                                        <div className="product-card-img">
                                            {p.mainImageUrl
                                                ? <img src={p.mainImageUrl} alt={p.name} loading="lazy" />
                                                : <div className="product-card-img-placeholder">🖼️</div>
                                            }
                                            <div className="product-labels">
                                                {p.isNew && <span className="label-new">NEW</span>}
                                                {p.isOnSale && <span className="label-sale">SALE</span>}
                                            </div>
                                        </div>
                                        <div className="product-card-body">
                                            <div className="product-card-name">{p.name}</div>
                                            <div className="product-card-price">
                                                {p.isOnSale && p.salePrice
                                                    ? <><span className="price-current">{p.salePrice.toLocaleString('vi-VN')}₫</span><span className="price-origin">{p.basePrice.toLocaleString('vi-VN')}₫</span></>
                                                    : <span className="price-tag">{p.basePrice?.toLocaleString('vi-VN')}₫</span>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Fullscreen Zoom Modal */}
            {zoomImg && (
                <div className="img-zoom-modal" onClick={() => { setZoomImg(null); setZoomLevel(1); setPanPos({ x: 0, y: 0 }); }}>
                    <button className="zoom-btn zoom-close" onClick={() => { setZoomImg(null); setZoomLevel(1); setPanPos({ x: 0, y: 0 }); }}>✖</button>
                    <div className="zoom-controls" onClick={e => e.stopPropagation()}>
                        <button className="zoom-btn" onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.5))}>-</button>
                        <span className="zoom-level-text">{Math.round(zoomLevel * 100)}%</span>
                        <button className="zoom-btn" onClick={() => setZoomLevel(z => Math.min(4, z + 0.5))}>+</button>
                        <button className="zoom-btn" style={{ width: 'auto', padding: '0 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '500' }} onClick={() => { setZoomLevel(1); setPanPos({ x: 0, y: 0 }); }}>Đặt lại</button>
                    </div>
                    <div
                        className="zoom-img-container"
                        onClick={e => e.stopPropagation()}
                        onMouseDown={e => {
                            if (zoomLevel > 1) {
                                setIsDragging(true);
                                setDragStart({ x: e.clientX - panPos.x, y: e.clientY - panPos.y });
                            }
                        }}
                        onMouseMove={e => {
                            if (isDragging && zoomLevel > 1) {
                                setPanPos({
                                    x: e.clientX - dragStart.x,
                                    y: e.clientY - dragStart.y
                                });
                            }
                        }}
                        onMouseUp={() => setIsDragging(false)}
                        onMouseLeave={() => setIsDragging(false)}
                        style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
                    >
                        <img
                            src={zoomImg}
                            alt="Phóng to"
                            style={{
                                transform: `translate(${panPos.x}px, ${panPos.y}px) scale(${zoomLevel})`,
                                transition: isDragging ? 'none' : 'transform 0.2s ease-out'
                            }}
                            draggable={false}
                        />
                    </div>
                </div>
            )}
        </>
    );
}

