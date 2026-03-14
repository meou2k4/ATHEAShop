import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { sortSizes } from '../../utils/sizeHelper';
import ProductCard from '../../components/ProductCard';

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
    const [openAccordions, setOpenAccordions] = useState({ details: true, storage: true });

    // Lightbox State
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIdx, setLightboxIdx] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef(null);
    const panTarget = useRef({ x: 0, y: 0 });
    const rafRef = useRef(null);
    const imgRef = useRef(null);
    const hasDragged = useRef(false);

    // Hover Zoom State
    const [isHovering, setIsHovering] = useState(false);
    const [lensPos, setLensPos] = useState({ x: 50, y: 50 });
    const [allowHover, setAllowHover] = useState(true);

    useEffect(() => {
        setAllowHover(window.matchMedia('(pointer: fine)').matches);
    }, []);

    useEffect(() => {
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    const handleMainMouseEnter = (e) => {
        if (!allowHover) return;
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        setLensPos({
            x: ((e.clientX - left) / width) * 100,
            y: ((e.clientY - top) / height) * 100,
        });
        setIsHovering(true);
    };

    const handleMainMouseMove = (e) => {
        if (!allowHover) return;
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const xProc = (e.clientX - left) / width;
        const yProc = (e.clientY - top) / height;
        setLensPos({ x: xProc * 100, y: yProc * 100 });
    };

    const resetPan = () => {
        panTarget.current = { x: 0, y: 0 };
        setPanOffset({ x: 0, y: 0 });
    };

    const schedulePan = () => {
        if (rafRef.current) return;
        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;
            setPanOffset({ x: panTarget.current.x, y: panTarget.current.y });
        });
    };

    const clampPan = (x, y) => {
        const scale = 1.9;
        const img = imgRef.current;
        if (!img) return { x, y };
        const baseW = img.clientWidth || 0;
        const baseH = img.clientHeight || 0;
        const maxX = (baseW * (scale - 1)) / 2;
        const maxY = (baseH * (scale - 1)) / 2;
        return {
            x: Math.max(-maxX, Math.min(maxX, x)),
            y: Math.max(-maxY, Math.min(maxY, y)),
        };
    };

    // --- Lightbox helpers ---
    const openLightbox = (idx) => {
        setLightboxIdx(idx);
        setIsZoomed(false);
        resetPan();
        setLightboxOpen(true);
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        setIsZoomed(false);
        resetPan();
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };

    // Keyboard navigation
    useEffect(() => {
        if (!lightboxOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') { closeLightbox(); return; }
            if (e.key === 'ArrowRight') {
                setIsZoomed(false);
                resetPan();
                setLightboxIdx(prev => (prev + 1) % (lightboxImages?.length || 1));
            }
            if (e.key === 'ArrowLeft') {
                setIsZoomed(false);
                resetPan();
                setLightboxIdx(prev => (prev - 1 + (lightboxImages?.length || 1)) % (lightboxImages?.length || 1));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxOpen]);

    useEffect(() => {
        Promise.all([
            api.get(`/Product/by-slug/${slug}`),
            api.get('/Settings').catch(() => ({ data: [] })),
        ]).then(([p, s]) => {
            const productData = p.data;
            setProduct(productData);

            const initColorId = searchParams.get('color') ? Number(searchParams.get('color')) : null;
            const validColors = [...new Set((productData.variants || []).map(v => v.colorId).filter(Boolean))];

            let targetColor = initColorId && validColors.includes(initColorId) ? initColorId : null;
            if (!targetColor && validColors.length > 0) targetColor = validColors[0];

            setSelectedColor(targetColor);
            setSelectedSize(null);

            const colorImages = targetColor ? (productData.images || []).filter(i => i.colorId === targetColor) : (productData.images || []);
            const mainImg = colorImages.find(i => i.isMain) || colorImages[0]
                || (productData.images || []).find(i => i.isMain) || productData.images?.[0] || null;

            setActiveImg(mainImg);

            const map = {};
            s.data.forEach(i => map[i.key] = i.value);
            setSettings(map);

            if (productData.categoryId) {
                api.get(`/Product/variants-list?categoryId=${productData.categoryId}`)
                    .then(({ data }) => {
                        const items = Array.isArray(data) ? data : [];
                        const seen = new Set();
                        const unique = items.filter(i => {
                            if (i.productId === productData.id) return false;
                            if (seen.has(i.productId)) return false;
                            seen.add(i.productId);
                            return true;
                        }).slice(0, 6);
                        setRelated(unique);
                    }).catch(() => { });
            }
        }).catch(() => navigate('/san-pham'))
            .finally(() => setLoading(false));
    }, [slug, navigate, searchParams]);

    if (loading) return <div className="loading" style={{ paddingTop: 100 }}>⏳ Đang tải...</div>;
    if (!product) return null;

    const toggleAccordion = (key) => {
        setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const colors = [...new Map(
        (product.variants || []).filter(v => v.colorId).map(v => [v.colorId, { id: v.colorId, name: v.colorName, hex: v.colorHex }])
    ).values()];

    const sizesForColor = selectedColor
        ? (product.variants || []).filter(v => v.colorId === selectedColor).map(v => ({ id: v.sizeId, name: v.sizeName, stock: v.stock }))
        : [...new Map((product.variants || []).map(v => [v.sizeId, { id: v.sizeId, name: v.sizeName, stock: v.stock }])).values()];

    const images = (product.images || []).sort((a, b) => (b.isMain ? 1 : 0) - (a.isMain ? 1 : 0));
    const displayImages = selectedColor ? images.filter(i => i.colorId === selectedColor) : images;
    const mainDisplayImg = activeImg || displayImages[0] || (product.mainImageUrl ? { imageUrl: product.mainImageUrl } : null);

    // Images available in lightbox = same as displayImages
    const lightboxImages = displayImages.length > 0 ? displayImages : (product.mainImageUrl ? [{ imageUrl: product.mainImageUrl, id: 'main' }] : []);

    const currentVariant = product.variants?.find(v => v.colorId === selectedColor && v.sizeId === selectedSize);
    const displayPrice = currentVariant?.price || (product.isOnSale && product.salePrice ? product.salePrice : null);
    const basePrice = product.basePrice;

    const buildContactMsg = () => {
        let msg = `Tôi muốn hỏi về sản phẩm: ${product.name}`;
        if (selectedColor) { const c = colors.find(c => c.id === selectedColor); msg += `, màu ${c?.name || ''}`; }
        if (selectedSize) { const s = sizesForColor.find(s => s.id === selectedSize); msg += `, size ${s?.name || ''}`; }
        return encodeURIComponent(msg);
    };

    const zaloUrl = settings['Zalo'] ? `${settings['Zalo']}?text=${buildContactMsg()}` : null;
    const fbUrl = settings['Facebook'] || null;
    const categoryPath = product.categorySlug ? `/danh-muc/${product.categorySlug}` : `/san-pham?categoryId=${product.categoryId}`;

    // --- Drag-to-pan handlers ---
    const handleImgMouseDown = (e) => {
        if (!isZoomed) return;
        e.preventDefault();
        setIsDragging(true);
        hasDragged.current = false;
        dragStart.current = { x: e.clientX - panTarget.current.x, y: e.clientY - panTarget.current.y };
    };

    const handleImgMouseMove = (e) => {
        if (!isDragging || !isZoomed) return;
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        const next = clampPan(dx, dy);
        if (Math.abs(next.x - panTarget.current.x) > 2 || Math.abs(next.y - panTarget.current.y) > 2) {
            hasDragged.current = true;
        }
        panTarget.current = next;
        schedulePan();
    };

    const handleImgMouseUp = () => {
        setIsDragging(false);
    };

    const handleImgClick = (e) => {
        e.stopPropagation();
        if (hasDragged.current) return; // don't toggle if dragged
        if (!isZoomed) {
            setIsZoomed(true);
            resetPan();
        } else {
            setIsZoomed(false);
            resetPan();
        }
    };

    const currentLightboxImg = lightboxImages[lightboxIdx];

    return (
        <>
            <div className="product-detail">
                <div className="container">
                    <div className="breadcrumb pdp-breadcrumb">
                        <Link to="/">Trang chủ</Link>
                        <span className="breadcrumb-sep">/</span>
                        <Link to="/san-pham">Sản phẩm</Link>
                        {product.categoryName && <>
                            <span className="breadcrumb-sep">/</span>
                            <Link to={categoryPath}>{product.categoryName}</Link>
                        </>}
                        <span className="breadcrumb-sep">/</span>
                        <span style={{ color: 'var(--pub-text)', fontWeight: 500 }}>{product.name}</span>
                    </div>

                    <div className="product-detail-grid">
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
                            <div
                                className={`gallery-main-athea ${allowHover && isHovering ? 'is-hovering' : ''}`}
                                style={{
                                    cursor: mainDisplayImg ? 'zoom-in' : 'default',
                                    '--zoom-origin-x': `${lensPos.x}%`,
                                    '--zoom-origin-y': `${lensPos.y}%`,
                                    '--zoom-scale': 1.6,
                                }}
                                onClick={() => {
                                    if (mainDisplayImg) {
                                        const idx = displayImages.findIndex(i => i.id === mainDisplayImg.id);
                                        openLightbox(idx >= 0 ? idx : 0);
                                    }
                                }}
                                onMouseEnter={handleMainMouseEnter}
                                onMouseMove={handleMainMouseMove}
                                onMouseLeave={() => setIsHovering(false)}
                            >
                                {mainDisplayImg ? (
                                    <img
                                        src={mainDisplayImg.imageUrl}
                                        alt={product.name}
                                        loading="lazy"
                                    />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, color: '#d1c4b5' }}>🖼️</div>
                                )}
                            </div>
                        </div>

                        <div className="product-detail-info-col" style={{ position: 'relative' }}>
                            <div className="product-info">
                                <div className="product-info-badges">
                                    {product.isNew && <span className="label-new">NEW</span>}
                                    {product.isOnSale && <span className="label-sale">SALE</span>}
                                </div>

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
                                                        const matchingImg = colorImages.find(i => i.isMain) || colorImages[0]
                                                            || images.find(i => i.isMain) || (images[0] ? images[0] : (product.mainImageUrl ? { imageUrl: product.mainImageUrl } : null));
                                                        setActiveImg(matchingImg);
                                                    }}
                                                    style={{
                                                        width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
                                                        backgroundColor: c.hex || '#000',
                                                        border: '1px solid #e1e1e1',
                                                        boxShadow: selectedColor === c.id ? '0 0 0 2px #fff, 0 0 0 4px #000' : 'none'
                                                    }}
                                                ></div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {sizesForColor.length > 0 && (
                                    <div>
                                        <div className="selector-label">SIZE :</div>
                                        <div className="size-options-box">
                                            {sortSizes(sizesForColor).map(s => (
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

                                <div className="product-actions-wrapper">
                                    <div className="product-actions-athea">
                                        {zaloUrl && (
                                            <a href={zaloUrl} target="_blank" rel="noreferrer" className="btn-contact-social btn-contact-zalo">
                                                <div className="social-icon-wrapper">
                                                    <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" alt="Zalo" />
                                                </div>
                                                <span>Liên Hệ Zalo</span>
                                            </a>
                                        )}
                                        {fbUrl && (
                                            <a href={fbUrl} target="_blank" rel="noreferrer" className="btn-contact-social btn-contact-fb">
                                                <div className="social-icon-wrapper">
                                                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                                        <path d="M12 2.03998C6.5 2.03998 2 6.52998 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.84998C10.44 7.33998 11.93 5.95998 14.22 5.95998C15.31 5.95998 16.45 6.14998 16.45 6.14998V8.61998H15.19C13.95 8.61998 13.56 9.38998 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C18.34 21.21 22 17.06 22 12.06C22 6.52998 17.5 2.03998 12 2.03998Z" />
                                                    </svg>
                                                </div>
                                                <span>Liên Hệ Facebook</span>
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="accordion-athea">
                                    <div className="acc-athea-item">
                                        <button className="acc-athea-header" onClick={() => toggleAccordion('details')}>
                                            CHI TIẾT <span className="acc-athea-icon">{openAccordions.details ? '-' : '+'}</span>
                                        </button>
                                        {openAccordions.details && (
                                            <div className="acc-athea-body">
                                                {product.description ? <div dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br/>') }} /> : <p>Chưa có mô tả.</p>}
                                            </div>
                                        )}
                                    </div>
                                    <div className="acc-athea-item">
                                        <button className="acc-athea-header" onClick={() => toggleAccordion('storage')}>
                                            HƯỚNG DẪN BẢO QUẢN <span className="acc-athea-icon">{openAccordions.storage ? '-' : '+'}</span>
                                        </button>
                                        {openAccordions.storage && (
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
            </div>

            {related.length > 0 && (
                <section className="related-section">
                    <div className="container">
                        <div className="section-header" style={{ marginBottom: 24, borderBottom: '1px solid var(--pub-border)', paddingBottom: 16 }}>
                            <div>
                                <div className="section-title" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>CÓ THỂ BẠN CŨNG THÍCH</div>
                            </div>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <button className="nav-arrow-btn left" onClick={() => { document.getElementById('related-grid').scrollBy({ left: -300, behavior: 'smooth' }) }}>{'<'}</button>
                            <button className="nav-arrow-btn right" onClick={() => { document.getElementById('related-grid').scrollBy({ left: 300, behavior: 'smooth' }) }}>{'>'}</button>
                            <div id="related-grid" className="related-grid-scroll">
                                {related.map(p => (
                                    <div key={`${p.productId}-${p.colorId}`} className="vcard-related">
                                        <ProductCard item={p} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ======= SIXDO-STYLE LIGHTBOX ======= */}
            {lightboxOpen && currentLightboxImg && (
                <div
                    className="sixdo-lightbox"
                    onClick={closeLightbox}
                >
                    {/* Close button */}
                    <button
                        className="sixdo-lb-close"
                        onClick={closeLightbox}
                        aria-label="Đóng"
                    >
                        ×
                    </button>

                    {/* Counter */}
                    {lightboxImages.length > 1 && (
                        <div className="sixdo-lb-counter">
                            {lightboxIdx + 1} / {lightboxImages.length}
                        </div>
                    )}

                    {/* Keyboard hint */}
                    <div className="sixdo-lb-hint">
                        {lightboxImages.length > 1 && <span>← → để chuyển ảnh</span>}
                        <span>Click ảnh để zoom</span>
                    </div>

                    {/* Image wrapper */}
                    <div
                        className={`sixdo-lb-img-wrap ${isZoomed ? 'zoomed' : ''}`}
                        onClick={e => e.stopPropagation()}
                        onMouseDown={handleImgMouseDown}
                        onMouseMove={handleImgMouseMove}
                        onMouseUp={handleImgMouseUp}
                        onMouseLeave={handleImgMouseUp}
                    >
                        <img
                            ref={imgRef}
                            src={currentLightboxImg.imageUrl}
                            alt={product.name}
                            className={`sixdo-lb-img ${isZoomed ? 'zoomed' : ''} ${isDragging ? 'dragging' : ''}`}
                            onClick={handleImgClick}
                            style={{
                                transform: isZoomed
                                    ? `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(1.9)`
                                    : 'translate3d(0, 0, 0) scale(1)',
                                cursor: isZoomed ? (isDragging ? 'grabbing' : 'zoom-out') : 'zoom-in',
                                transition: isDragging ? 'none' : 'transform 200ms cubic-bezier(0.2, 0.7, 0, 1)',
                                userSelect: 'none',
                            }}
                            draggable={false}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
