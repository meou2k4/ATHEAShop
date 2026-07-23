import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOptimizedImageUrl } from '../utils/imageHelper';

export default function ProductCard({ item }) {
    const navigate = useNavigate();
    const [isLoaded, setIsLoaded] = useState(false);

    const displayPrice = item.isOnSale && item.salePrice ? item.salePrice : item.basePrice;
    const hasDiscount = item.isOnSale && item.salePrice;
    const discountPercent = hasDiscount ? Math.round(((item.basePrice - item.salePrice) / item.basePrice) * 100) : 0;

    const mainUrl = getOptimizedImageUrl(item.mainImageUrl, 600);
    const hoverUrl = getOptimizedImageUrl(item.hoverImageUrl, 600);

    const handleNavigate = () => {
        navigate(`/san-pham/${item.slug}${item.colorId ? `?color=${item.colorId}` : ''}`);
    };

    return (
        <div className="vcard" onClick={handleNavigate}>
            <div className="vcard-img" style={{ position: 'relative', overflow: 'hidden', background: '#f1f5f9' }}>
                {/* Skeleton Background nhấp nháy mượt khi ảnh đang tải từ mạng */}
                {!isLoaded && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 1,
                        background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'skeleton-pulse 1.5s infinite'
                    }} />
                )}

                {item.mainImageUrl ? (
                    <>
                        <img 
                            src={mainUrl} 
                            alt={item.productName} 
                            className="vcard-img-main" 
                            loading="lazy"
                            decoding="async"
                            onLoad={() => setIsLoaded(true)}
                            style={{ 
                                opacity: isLoaded ? 1 : 0, 
                                transition: 'opacity 0.3s ease-in-out' 
                            }}
                        />
                        {hoverUrl && (
                            <img 
                                src={hoverUrl} 
                                alt={`${item.productName} hover`} 
                                className="vcard-img-hover" 
                                loading="lazy" 
                                decoding="async"
                            />
                        )}
                    </>
                ) : (
                    <div className="vcard-placeholder">👗</div>
                )}
                
                <div className="vcard-labels" style={{ zIndex: 2 }}>
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
