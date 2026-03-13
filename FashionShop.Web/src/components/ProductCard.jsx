import { useNavigate } from 'react-router-dom';

export default function ProductCard({ item }) {
    const navigate = useNavigate();
    const displayPrice = item.isOnSale && item.salePrice ? item.salePrice : item.basePrice;
    const hasDiscount = item.isOnSale && item.salePrice;
    const discountPercent = hasDiscount ? Math.round(((item.basePrice - item.salePrice) / item.basePrice) * 100) : 0;

    const handleNavigate = () => {
        navigate(`/san-pham/${item.slug}${item.colorId ? `?color=${item.colorId}` : ''}`);
    };

    return (
        <div className="vcard" onClick={handleNavigate}>
            <div className="vcard-img">
                {item.mainImageUrl ? (
                    <>
                        <img 
                            src={item.mainImageUrl} 
                            alt={item.productName} 
                            className="vcard-img-main" 
                            loading="lazy" 
                        />
                        {item.hoverImageUrl && (
                            <img 
                                src={item.hoverImageUrl} 
                                alt={`${item.productName} hover`} 
                                className="vcard-img-hover" 
                                loading="lazy" 
                            />
                        )}
                    </>
                ) : (
                    <div className="vcard-placeholder">👗</div>
                )}
                
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
