import React from 'react';

/**
 * Skeleton Card cho danh sách sản phẩm (HomePage, ProductListPage)
 */
export function ProductSkeleton() {
    return (
        <div className="vcard skeleton-vcard" style={{ pointerEvents: 'none' }}>
            <div className="vcard-img skeleton-box" style={{ 
                aspectRatio: '3/4', 
                background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
                backgroundSize: '200% 100%',
                animation: 'skeleton-pulse 1.5s infinite',
                borderRadius: '12px'
            }} />
            <div className="vcard-body" style={{ padding: '12px 4px' }}>
                <div style={{ 
                    height: 16, 
                    width: '50%', 
                    margin: '0 auto 8px', 
                    background: '#e2e8f0', 
                    borderRadius: 4,
                    animation: 'skeleton-pulse 1.5s infinite' 
                }} />
                <div style={{ 
                    height: 14, 
                    width: '80%', 
                    margin: '0 auto 8px', 
                    background: '#e2e8f0', 
                    borderRadius: 4,
                    animation: 'skeleton-pulse 1.5s infinite' 
                }} />
                <div style={{ 
                    width: '24px', 
                    height: '12px',
                    borderRadius: '50%',
                    margin: '0 auto', 
                    background: '#e2e8f0', 
                    animation: 'skeleton-pulse 1.5s infinite' 
                }} />
            </div>
        </div>
    );
}

/**
 * Skeleton cho trang Chi tiết sản phẩm
 */
export function ProductDetailSkeleton() {
    return (
        <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))', gap: 40 }}>
                {/* Khung ảnh chính */}
                <div>
                    <div style={{ 
                        aspectRatio: '3/4', 
                        width: '100%', 
                        background: '#e2e8f0', 
                        borderRadius: 16,
                        animation: 'skeleton-pulse 1.5s infinite',
                        marginBottom: 16 
                    }} />
                    <div style={{ display: 'flex', gap: 12 }}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{ 
                                width: 70, 
                                height: 90, 
                                background: '#e2e8f0', 
                                borderRadius: 8,
                                animation: 'skeleton-pulse 1.5s infinite' 
                            }} />
                        ))}
                    </div>
                </div>
                {/* Thông tin chi tiết */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ height: 32, width: '70%', background: '#e2e8f0', borderRadius: 8, animation: 'skeleton-pulse 1.5s infinite' }} />
                    <div style={{ height: 24, width: '30%', background: '#e2e8f0', borderRadius: 8, animation: 'skeleton-pulse 1.5s infinite' }} />
                    <div style={{ height: 1, background: '#cbd5e1', margin: '10px 0' }} />
                    <div style={{ height: 20, width: '40%', background: '#e2e8f0', borderRadius: 6, animation: 'skeleton-pulse 1.5s infinite' }} />
                    <div style={{ display: 'flex', gap: 8 }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', background: '#e2e8f0', animation: 'skeleton-pulse 1.5s infinite' }} />
                        ))}
                    </div>
                    <div style={{ height: 48, width: '100%', background: '#e2e8f0', borderRadius: 12, marginTop: 20, animation: 'skeleton-pulse 1.5s infinite' }} />
                </div>
            </div>
        </div>
    );
}

/**
 * Skeleton Bảng Dữ liệu Admin (ProductsPage, CategoriesPage, PropertiesPage)
 */
export function TableSkeleton({ rows = 5, cols = 5 }) {
    return (
        <div style={{ width: '100%', padding: '16px 0' }}>
            <div style={{ 
                height: 40, 
                background: '#f1f5f9', 
                borderRadius: 8, 
                marginBottom: 12,
                animation: 'skeleton-pulse 1.5s infinite'
            }} />
            {Array.from({ length: rows }).map((_, r) => (
                <div key={r} style={{ 
                    display: 'flex', 
                    gap: 16, 
                    marginBottom: 12, 
                    alignItems: 'center' 
                }}>
                    {Array.from({ length: cols }).map((_, c) => (
                        <div key={c} style={{ 
                            flex: c === 0 ? '0 0 50px' : 1, 
                            height: 32, 
                            background: '#e2e8f0', 
                            borderRadius: 6,
                            animation: 'skeleton-pulse 1.5s infinite' 
                        }} />
                    ))}
                </div>
            ))}
        </div>
    );
}

/**
 * Keyframes CSS Animation Pulse
 */
const styleElement = typeof document !== 'undefined' ? document.createElement('style') : null;
if (styleElement && !document.getElementById('skeleton-styles')) {
    styleElement.id = 'skeleton-styles';
    styleElement.innerHTML = `
        @keyframes skeleton-pulse {
            0% { opacity: 0.5; }
            50% { opacity: 1; }
            100% { opacity: 0.5; }
        }
    `;
    document.head.appendChild(styleElement);
}
