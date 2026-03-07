import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/Product');
            setProducts(data);
        } catch { /* ignore */ } finally { setLoading(false); }
    };
    useEffect(() => { fetchProducts(); }, []);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Xóa sản phẩm "${name}"?`)) return;
        setIsSubmitting(true);
        try {
            await api.delete(`/Product/${id}`);
            fetchProducts();
        } catch { alert('Không thể xóa sản phẩm.'); }
        finally { setIsSubmitting(false); }
    };

    return (
        <div>
            <div className="card-header">
                <h2 className="page-title" style={{ margin: 0 }}>👗 Quản lý Sản phẩm</h2>
                <button 
                    className="btn btn-primary" 
                    onClick={() => navigate('/admin/products/new')}
                    style={{ whiteSpace: 'nowrap' }}
                >
                    + Thêm sản phẩm
                </button>
            </div>

            <div className="card">
                {loading ? <div className="loading">⏳ Đang tải...</div> : (
                    <div className="data-list-container">
                        {/* Header - Hidden on Mobile */}
                        <div className="data-list-header grid-products">
                            <div className="data-list-cell text-center">ẢNH</div>
                            <div className="data-list-cell">SẢN PHẨM</div>
                            <div className="data-list-cell">DANH MỤC</div>
                            <div className="data-list-cell text-center">GIÁ</div>
                            <div className="data-list-cell text-center">NHÃN</div>
                            <div className="data-list-cell text-center">TRẠNG THÁI</div>
                            <div className="data-list-cell text-center">THAO TÁC</div>
                        </div>

                        {/* Body Rows */}
                        {products.length === 0 ? (
                            <div className="text-center" style={{ padding: 40, color: 'var(--text-muted)' }}>Chưa có sản phẩm nào</div>
                        ) : products.map(p => (
                            <div key={p.id} className="data-list-row grid-products">
                                {/* Mobile Hero Section - Enhanced with Category */}
                                <div className="data-list-card-main">
                                    <div className="admin-list-img-wrapper">
                                        {(() => {
                                            const imgUrl = p.mainImageUrl || p.images?.find(i => i.isMain)?.imageUrl || p.images?.[0]?.imageUrl;
                                            return imgUrl
                                                ? <img src={imgUrl} alt={p.name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 12, border: '1px solid var(--border)' }} />
                                                : <div style={{ width: 64, height: 64, background: 'var(--bg)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🖼️</div>
                                        })()}
                                    </div>
                                    <div className="data-list-card-info">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', background: 'var(--admin-bg)', borderRadius: 4, color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>
                                                {p.categoryName || 'No Cat'}
                                            </span>
                                        </div>
                                        <div className="name" style={{ marginTop: 2 }}>{p.name}</div>
                                        <div className="sub">{p.slug}</div>
                                    </div>
                                </div>

                                {/* Desktop Columns */}
                                <div className="data-list-cell desktop-only text-center">
                                    {(() => {
                                        const imgUrl = p.mainImageUrl || p.images?.find(i => i.isMain)?.imageUrl || p.images?.[0]?.imageUrl;
                                        return imgUrl
                                            ? <img src={imgUrl} alt={p.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                                            : <div style={{ width: 44, height: 44, background: 'var(--bg)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🖼️</div>
                                    })()}
                                </div>
                                <div className="data-list-cell desktop-only">
                                    <strong>{p.name}</strong>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.slug}</div>
                                </div>
                                <div className="data-list-cell desktop-only" data-label="Danh mục">
                                    <strong>{p.categoryName || '—'}</strong>
                                </div>

                                {/* Shared/Mobile Detailed Rows */}
                                <div className="data-list-cell text-center" data-label="Giá">
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        {p.isOnSale && p.salePrice ? (
                                            <>
                                                <strong style={{ color: 'var(--danger)' }}>{p.salePrice.toLocaleString('vi-VN')}₫</strong>
                                                <span style={{ fontSize: 11, color: 'var(--admin-text-muted)', textDecoration: 'line-through' }}>
                                                    {p.basePrice?.toLocaleString('vi-VN')}₫
                                                </span>
                                            </>
                                        ) : (
                                            <strong>{p.basePrice?.toLocaleString('vi-VN')}₫</strong>
                                        )}
                                  </div>
                                </div>
                                {/* Desktop NHÃN */}
                                <div className="data-list-cell desktop-only text-center" data-label="Nhãn">
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                        {p.isNew && <span className="badge badge-info" style={{ fontSize: 10 }}>Mới</span>}
                                        {p.isOnSale && <span className="badge badge-warning" style={{ fontSize: 10 }}>Sale</span>}
                                    </div>
                                </div>

                                {/* Desktop TRẠNG THÁI */}
                                <div className="data-list-cell desktop-only text-center" data-label="Trạng thái">
                                    {p.isActive ? <span className="badge badge-success">Active</span> : <span className="badge badge-danger">Hidden</span>}
                                </div>

                                {/* Mobile-only combined badges */}
                                <div className="data-list-cell mobile-only text-center" data-label="Nhãn/Trạng thái">
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', alignItems: 'center' }}>
                                        {p.isActive ? <span className="badge badge-success">🟢 Active</span> : <span className="badge badge-danger">🔴 Hidden</span>}
                                        {p.isNew && <span className="badge badge-info">🆕 Mới</span>}
                                        {p.isOnSale && <span className="badge badge-warning">🔥 Sale</span>}
                                    </div>
                                </div>

                                <div className="data-list-cell text-center" data-label="Thao tác">
                                    <div className="td-actions">
                                        <button className="btn btn-info btn-sm" onClick={() => navigate(`/admin/products/${p.id}/detail`)} disabled={isSubmitting}>👁️ Xem</button>
                                        <button className="btn btn-outline btn-sm" onClick={() => navigate(`/admin/products/${p.id}/edit`)} disabled={isSubmitting}>✏️ Sửa</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.name)} disabled={isSubmitting}>
                                            {isSubmitting ? '...' : '🗑️ Xóa'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
