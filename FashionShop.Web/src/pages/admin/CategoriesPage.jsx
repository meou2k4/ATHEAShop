import { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', slug: '', displayOrder: 1 });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchCategories = async () => {
        try {
            const [cRes, pRes] = await Promise.all([
                api.get(`/Category?t=${Date.now()}`),
                api.get(`/Product?t=${Date.now()}`)
            ]);
            setCategories(cRes.data);
            setProducts(pRes.data);
        } catch { /* ignore */ } finally { setLoading(false); }
    };

    useEffect(() => { fetchCategories(); }, []);

    const openCreate = () => {
        setEditing(null);
        setForm({ name: '', slug: '', displayOrder: categories.length + 1 });
        setError(''); setSuccess('');
        setShowModal(true);
    };

    const openEdit = (cat) => {
        setEditing(cat);
        setForm({ name: cat.name, slug: cat.slug, displayOrder: cat.displayOrder });
        setError(''); setSuccess('');
        setShowModal(true);
    };

    const handleNameChange = (val) => {
        setForm(f => ({
            ...f,
            name: val,
            slug: val.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim(),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // 1. Kiểm tra lặp tên hoặc slug
        const isDuplicateName = categories.some(c => 
            c.name.toLowerCase() === form.name.toLowerCase() && (!editing || c.id !== editing.id)
        );
        if (isDuplicateName) {
            setError(`Tên danh mục "${form.name}" đã tồn tại.`);
            return;
        }

        const isDuplicateSlug = categories.some(c => 
            c.slug.toLowerCase() === form.slug.toLowerCase() && (!editing || c.id !== editing.id)
        );
        if (isDuplicateSlug) {
            setError(`Slug "/${form.slug}" đã tồn tại cho một danh mục khác.`);
            return;
        }

        setIsSubmitting(true);
        try {
            if (editing) {
                await api.put(`/Category/${editing.id}`, form);
                setSuccess('Cập nhật thành công!');
            } else {
                await api.post('/Category', form);
                setSuccess('Thêm danh mục thành công!');
            }
            fetchCategories();
            setTimeout(() => { setShowModal(false); setSuccess(''); }, 1000);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Xóa danh mục "${name}"?`)) return;
        setIsSubmitting(true);
        try {
            // Kiểm tra xem danh mục có chứa sản phẩm nào không
            const { data: products } = await api.get('/Product'); // Lấy tất cả SP để check categoryId
            const productCount = products.filter(p => p.categoryId === id).length;
            
            if (productCount > 0) {
                alert(`Không thể xóa! Danh mục "${name}" đang chứa ${productCount} sản phẩm.\nVui lòng xóa hoặc di chuyển các sản phẩm này sang danh mục khác trước.`);
                setIsSubmitting(false);
                return;
            }

            await api.delete(`/Category/${id}`);
            // Optimistic UI: Gỡ khỏi state ngay lập tức
            setCategories(prev => prev.filter(cat => cat.id !== id));
            fetchCategories();
            alert(`Đã xóa danh mục "${name}" thành công.`);
        } catch { 
            alert('Không thể xóa danh mục này vào lúc này.'); 
        } finally { 
            setIsSubmitting(false); 
        }
    };

    return (
        <div>
            <div className="card-header">
                <h2 className="page-title" style={{ margin: 0 }}>📁 Quản lý Danh mục</h2>
                <button className="btn btn-primary" onClick={openCreate} disabled={isSubmitting}>+ Thêm danh mục</button>
            </div>

            <div className="card">
                {loading ? <div className="loading">Đang tải...</div> : (
                    <div className="data-list-container">
                        <div className="data-list-header grid-categories-v2">
                            <div className="data-list-cell text-center">STT</div>
                            <div className="data-list-cell">TÊN DANH MỤC</div>
                            <div className="data-list-cell">SLUG</div>
                            <div className="data-list-cell text-center">SẢN PHẨM</div>
                            <div className="data-list-cell text-center">THỨ TỰ</div>
                            <div className="data-list-cell text-center">THAO TÁC</div>
                        </div>
                        {categories.length === 0 ? (
                            <div className="text-center" style={{ padding: 40, color: 'var(--text-muted)' }}>Chưa có danh mục nào</div>
                        ) : categories.map((cat, i) => (
                            <div key={cat.id} className="data-list-row grid-categories-v2">
                                {/* Mobile Header - Premium Hero */}
                                <div className="data-list-card-main">
                                    <div className="data-list-card-info">
                                        <div className="name">{cat.name}</div>
                                        <div className="sub">{cat.slug}</div>
                                    </div>
                                </div>

                                {/* Desktop-only columns */}
                                <div className="data-list-cell desktop-only text-center" data-label="STT">{i + 1}</div>
                                <div className="data-list-cell desktop-only" data-label="Tên"><strong>{cat.name}</strong></div>
                                
                                {/* Desktop SLUG */}
                                <div className="data-list-cell desktop-only" data-label="Slug">
                                    <code style={{ fontSize: 11, background: 'var(--bg)', padding: '2px 6px', borderRadius: 4 }}>/{cat.slug}</code>
                                </div>

                                {/* Desktop PRODUCT COUNT */}
                                <div className="data-list-cell desktop-only text-center" data-label="Sản phẩm">
                                    <span className="badge badge-info" style={{ background: 'var(--admin-secondary-light)', color: 'var(--admin-secondary)', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>
                                        {products.filter(p => p.categoryId === cat.id).length} SP
                                    </span>
                                </div>


                                {/* Desktop ORDER */}
                                <div className="data-list-cell desktop-only text-center" data-label="Thứ tự">
                                    <span className="badge badge-primary">{cat.displayOrder}</span>
                                </div>

                                {/* Mobile-only combined cell */}
                                <div className="data-list-cell mobile-only" style={{ justifyContent: 'flex-start', borderBottom: 'none', paddingBottom: 0, display: 'flex' }}>
                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                        <span className="badge badge-primary" style={{ display: 'inline-flex', padding: '6px 12px', fontSize: 13, background: 'var(--admin-primary-light)', color: 'var(--admin-primary)' }}>Thứ tự: {cat.displayOrder}</span>
                                        <code style={{ fontSize: 13, background: 'var(--bg)', padding: '6px 12px', borderRadius: 6, color: 'var(--admin-text)' }}>/{cat.slug}</code>
                                    </div>
                                </div>

                                <div className="data-list-cell text-center" data-label="Thao tác" style={{ paddingTop: 16 }}>
                                    <div className="td-actions">
                                        <button className="btn btn-info btn-sm" onClick={() => openEdit(cat)} disabled={isSubmitting}>✏️ Sửa</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat.id, cat.name)} disabled={isSubmitting}>
                                            {isSubmitting ? '...' : '🗑️ Xóa'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {/* Summary Row */}
                        <div className="data-list-row category-summary-row" style={{ 
                            fontWeight: 700, 
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '18px 25px',
                            color: 'var(--admin-primary)',
                            fontSize: 15,
                            borderRadius: '0 0 12px 12px'
                        }}>
                            <span>📊 TỔNG CỘNG HỆ THỐNG:</span>
                            <div style={{ display: 'flex', gap: 20 }}>
                                <span>📂 {categories.length} Danh mục</span>
                                <span>👗 {products.length} Sản phẩm</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal">
                        <div className="modal-header">
                            <h3 className="modal-title">{editing ? '✏️ Sửa danh mục' : '➕ Thêm danh mục'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✖</button>
                        </div>
                        {error && <div className="alert alert-danger">{error}</div>}
                        {success && <div className="alert alert-success">{success}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Tên danh mục *</label>
                                <input className="form-control" value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="Váy đầm" required />
                            </div>
                            <div className="form-group">
                                <label>Slug (tự động)</label>
                                <input className="form-control" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="vay-dam" required />
                            </div>
                            <div className="form-group">
                                <label>Thứ tự hiển thị *</label>
                                <input className="form-control" type="number" min={1} value={form.displayOrder} onChange={e => setForm(f => ({ ...f, displayOrder: +e.target.value }))} required />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} disabled={isSubmitting}>Hủy</button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Đang xử lý...' : (editing ? 'Cập nhật' : 'Thêm mới')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
