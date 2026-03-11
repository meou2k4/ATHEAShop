import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axiosConfig';

const emptyForm = {
    categoryId: '', name: '', slug: '', description: '', storageInstructions: '',
    basePrice: '', isActive: true, isNew: false, isOnSale: false, salePrice: '',
};

export default function ProductFormPage() {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();

    const [form, setForm] = useState(emptyForm);
    const [categories, setCategories] = useState([]);
    const [allProducts, setAllProducts] = useState([]); // Thêm để check trùng
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get('/Category').then(({ data }) => setCategories(data));
        api.get('/Product').then(({ data }) => setAllProducts(data)); // Fetch để check trùng
        if (isEdit) {
            api.get(`/Product/${id}`).then(({ data }) => {
                setForm({
                    categoryId: data.categoryId, name: data.name, slug: data.slug,
                    description: data.description || '', storageInstructions: data.storageInstructions || '',
                    basePrice: data.basePrice,
                    isActive: data.isActive, isNew: data.isNew, isOnSale: data.isOnSale,
                    salePrice: data.salePrice || '',
                });
            });
        }
    }, [id, isEdit]);

    const handleNameChange = (val) => {
        setForm(f => ({
            ...f, name: val,
            // Chỉ tự động tạo slug nếu đang thêm mới và slug chưa bị can thiệp thủ công nhiều
            slug: !isEdit
                ? val.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\u0111/g, 'd').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
                : f.slug,
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault(); 
        setError(''); 
        
        // 1. Kiểm tra lặp tên hoặc slug trên client
        const isDuplicateName = allProducts.some(p => 
            p.name.toLowerCase() === form.name.toLowerCase() && (!isEdit || p.id !== +id)
        );
        if (isDuplicateName) {
            setError(`Tên sản phẩm "${form.name}" đã tồn tại.`); return;
        }

        const isDuplicateSlug = allProducts.some(p => 
            p.slug.toLowerCase() === form.slug.toLowerCase() && (!isEdit || p.id !== +id)
        );
        if (isDuplicateSlug) {
            setError(`Slug "${form.slug}" đã tồn tại cho một sản phẩm khác.`); return;
        }

        setSaving(true);
        try {
            const payload = {
                ...form,
                categoryId: +form.categoryId,
                basePrice: +form.basePrice,
                salePrice: form.isOnSale && form.salePrice ? +form.salePrice : null,
            };
            if (isEdit) {
                await api.put(`/Product/${id}`, payload);
                alert('Cập nhật sản phẩm thành công!');
                navigate('/admin/products');
            } else {
                const { data } = await api.post('/Product', payload);
                alert('Thêm sản phẩm thành công!');
                navigate(`/admin/products/${data.id}/detail`);
            }
        } catch (err) { 
            setError(err.response?.data?.message || 'Lỗi server khi lưu sản phẩm.'); 
        } finally { 
            setSaving(false); 
        }
    };

    return (
        <div>
            <h2 className="page-title">{isEdit ? '✏️ Sửa sản phẩm' : '➕ Thêm sản phẩm'}</h2>
            <div className="card" style={{ maxWidth: 760 }}>
                <h3 className="card-title" style={{ marginBottom: 20 }}>Thông tin cơ bản</h3>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSave}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Danh mục *</label>
                            <select className="form-control" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} required>
                                <option value="">-- Chọn danh mục --</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Tên sản phẩm *</label>
                            <input className="form-control" value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="Váy đầm hoa nhí" required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Slug</label>
                        <input className="form-control" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                        <label>Chi tiết</label>
                        <textarea className="form-control" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} />
                    </div>
                    <div className="form-group">
                        <label>Hướng dẫn bảo quản</label>
                        <textarea className="form-control" value={form.storageInstructions} onChange={e => setForm(f => ({ ...f, storageInstructions: e.target.value }))} rows={4} />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Giá gốc (VND) *</label>
                            <input className="form-control" type="number" value={form.basePrice} onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))} placeholder="250000" required />
                        </div>
                        <div className="form-group">
                            <label>Giá sale (VND)</label>
                            <input className="form-control" type="number" value={form.salePrice} onChange={e => setForm(f => ({ ...f, salePrice: e.target.value }))} placeholder="Bỏ trống nếu không sale" disabled={!form.isOnSale} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 24, marginBottom: 20 }}>
                        <label className="form-check"><input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} /> Đang bán</label>
                        <label className="form-check"><input type="checkbox" checked={form.isNew} onChange={e => setForm(f => ({ ...f, isNew: e.target.checked }))} /> Sản phẩm mới</label>
                        <label className="form-check"><input type="checkbox" checked={form.isOnSale} onChange={e => setForm(f => ({ ...f, isOnSale: e.target.checked }))} /> Đang sale</label>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/products')}>Quay lại</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Lưu & quản lý chi tiết'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
