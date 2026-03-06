import { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', slug: '', displayOrder: 1 });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/Category');
            setCategories(data);
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
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Xóa danh mục "${name}"?`)) return;
        try {
            await api.delete(`/Category/${id}`);
            fetchCategories();
        } catch { alert('Không thể xóa danh mục này.'); }
    };

    return (
        <div>
            <div className="card-header">
                <h2 className="page-title" style={{ margin: 0 }}>📁 Quản lý Danh mục</h2>
                <button className="btn btn-primary" onClick={openCreate}>+ Thêm danh mục</button>
            </div>

            <div className="card">
                {loading ? <div className="loading">Đang tải...</div> : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Tên danh mục</th>
                                    <th>Slug</th>
                                    <th>Thứ tự</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center" style={{ padding: 40, color: 'var(--text-muted)' }}>Chưa có danh mục nào</td></tr>
                                ) : categories.map((cat, i) => (
                                    <tr key={cat.id}>
                                        <td>{i + 1}</td>
                                        <td><strong>{cat.name}</strong></td>
                                        <td><code style={{ fontSize: 12, background: 'var(--bg)', padding: '2px 6px', borderRadius: 4 }}>{cat.slug}</code></td>
                                        <td><span className="badge badge-primary">{cat.displayOrder}</span></td>
                                        <td>
                                            <div className="td-actions">
                                                <button className="btn btn-outline btn-sm" onClick={() => openEdit(cat)}>✏️ Sửa</button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat.id, cat.name)}>🗑️ Xóa</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="submit" className="btn btn-primary">{editing ? 'Cập nhật' : 'Thêm mới'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
