import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
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
        try {
            await api.delete(`/Product/${id}`);
            fetchProducts();
        } catch { alert('Không thể xóa sản phẩm.'); }
    };

    return (
        <div>
            <div className="card-header">
                <h2 className="page-title" style={{ margin: 0 }}>👗 Quản lý Sản phẩm</h2>
                <button className="btn btn-primary" onClick={() => navigate('/admin/products/new')}>+ Thêm sản phẩm</button>
            </div>

            <div className="card">
                {loading ? <div className="loading">⏳ Đang tải...</div> : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Ảnh</th>
                                    <th>Tên sản phẩm</th>
                                    <th>Danh mục</th>
                                    <th>Giá gốc</th>
                                    <th>Nhãn</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center" style={{ padding: 40, color: 'var(--text-muted)' }}>Chưa có sản phẩm nào</td></tr>
                                ) : products.map(p => (
                                    <tr key={p.id}>
                                        <td>
                                            {p.mainImageUrl
                                                ? <img src={p.mainImageUrl} alt={p.name} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                                                : <div style={{ width: 50, height: 50, background: 'var(--bg)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🖼️</div>
                                            }
                                        </td>
                                        <td>
                                            <strong>{p.name}</strong>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.slug}</div>
                                        </td>
                                        <td>{p.categoryName || ''}</td>
                                        <td>
                                            <strong style={{ color: 'var(--primary)' }}>{p.basePrice?.toLocaleString('vi-VN')}</strong>
                                            {p.isOnSale && p.salePrice && (
                                                <div style={{ fontSize: 11, color: 'var(--danger)', textDecoration: 'line-through' }}>
                                                    Sale: {p.salePrice?.toLocaleString('vi-VN')}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                {p.isNew && <span className="badge badge-success">🆕 Mới</span>}
                                                {p.isOnSale && <span className="badge badge-warning">🔥 Sale</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${p.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                {p.isActive ? '🟢 Đang bán' : '🔴 Ẩn'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="td-actions">
                                                <button className="btn btn-primary btn-sm" onClick={() => navigate(`/admin/products/${p.id}/detail`)}>👁️ Chi tiết</button>
                                                <button className="btn btn-outline btn-sm" onClick={() => navigate(`/admin/products/${p.id}/edit`)}>✏️ Sửa</button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.name)}>🗑️ Xóa</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
