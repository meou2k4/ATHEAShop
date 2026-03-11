import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive
    const [labelFilter, setLabelFilter] = useState('all'); // all, new, sale
    const navigate = useNavigate();

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const [pRes, cRes] = await Promise.all([
                api.get(`/Product?t=${Date.now()}`),
                api.get(`/Category?t=${Date.now()}`)
            ]);
            setProducts(pRes.data);
            setCategories(cRes.data);
        } catch (err) { 
            console.error('Fetch products error:', err);
        } finally { 
            setLoading(false); 
        }
    };
    useEffect(() => { fetchProducts(); }, []);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = !searchTerm || 
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                (p.slug && p.slug.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesCategory = !selectedCategory || p.categoryId === +selectedCategory;
            
            const matchesStatus = statusFilter === 'all' || 
                (statusFilter === 'active' && p.isActive) || 
                (statusFilter === 'inactive' && !p.isActive);

            const matchesLabel = labelFilter === 'all' || 
                (labelFilter === 'new' && p.isNew) || 
                (labelFilter === 'sale' && p.isOnSale);

            return matchesSearch && matchesCategory && matchesStatus && matchesLabel;
        });
    }, [products, searchTerm, selectedCategory, statusFilter, labelFilter]);

    const handleReset = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setStatusFilter('all');
        setLabelFilter('all');
    };

    const handleDelete = async (p) => {
        if ((p.variants && p.variants.length > 0) || (p.images && p.images.length > 0)) {
            alert(`Sản phẩm "${p.name}" hiện có dữ liệu chi tiết (màu sắc, kích thước hoặc hình ảnh).\nVui lòng xóa hết các chi tiết này trước khi xóa sản phẩm chính.`);
            return;
        }

        if (!window.confirm(`⚠️ XÁC NHẬN XÓA: Bạn có chắc chắn muốn xóa sản phẩm "${p.name}" không?\n\nHành động này không thể hoàn tác.`)) return;
        setIsSubmitting(true);
        try {
            await api.delete(`/Product/${p.id}`);
            // Optimistic UI: Gỡ sản phẩm khỏi state ngay lập tức
            setProducts(prev => prev.filter(item => item.id !== p.id));
            // Vẫn gọi fetchProducts để đồng bộ hoàn toàn với server (nhưng UI đã mất sản phẩm rồi)
            fetchProducts(); 
            alert('Đã xóa sản phẩm thành công.');
        } catch (err) { 
            console.error('Delete product error:', err);
            alert('Không thể xóa sản phẩm. Có lỗi xảy ra trong quá trình xóa.'); 
        } finally { 
            setIsSubmitting(false); 
        }
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

            <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', padding: '16px' }}>
                    <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }}>🔍</span>
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Tìm kiếm theo tên hoặc mã sản phẩm..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: 36, height: 42, borderRadius: 10 }}
                        />
                    </div>
                    <div style={{ minWidth: '180px' }}>
                        <select 
                            className="form-control" 
                            value={selectedCategory} 
                            onChange={e => setSelectedCategory(e.target.value)}
                            style={{ height: 42, borderRadius: 10 }}
                        >
                            <option value="">-- Danh mục --</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div style={{ minWidth: '130px' }}>
                        <select 
                            className="form-control" 
                            value={statusFilter} 
                            onChange={e => setStatusFilter(e.target.value)}
                            style={{ height: 42, borderRadius: 10 }}
                        >
                            <option value="all">-- Trạng thái --</option>
                            <option value="active">Đang bán</option>
                            <option value="inactive">Tạm ẩn</option>
                        </select>
                    </div>
                    <div style={{ minWidth: '130px' }}>
                        <select 
                            className="form-control" 
                            value={labelFilter} 
                            onChange={e => setLabelFilter(e.target.value)}
                            style={{ height: 42, borderRadius: 10 }}
                        >
                            <option value="all">-- Nhãn SP --</option>
                            <option value="new">Mới</option>
                            <option value="sale">Sale</option>
                        </select>
                    </div>
                    <button 
                        className="btn btn-outline" 
                        onClick={handleReset}
                        style={{ height: 42, borderRadius: 10, padding: '0 16px', fontSize: 13 }}
                    >
                        🔄 Đặt lại
                    </button>
                </div>
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
                        {filteredProducts.length === 0 ? (
                            <div className="text-center" style={{ padding: 40, color: 'var(--text-muted)' }}>
                                {products.length === 0 ? 'Chưa có sản phẩm nào' : 'Không tìm thấy sản phẩm phù hợp'}
                            </div>
                        ) : filteredProducts.map(p => (
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
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p)} disabled={isSubmitting}>
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
