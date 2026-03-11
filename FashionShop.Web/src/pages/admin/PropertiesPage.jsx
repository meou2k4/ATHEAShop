import { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';

export default function PropertiesPage() {
    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [colorForm, setColorForm] = useState({ name: '', hex: '#000000' });
    const [sizeForm, setSizeForm] = useState({ name: '' });
    const [colorError, setColorError] = useState('');
    const [colorSuccess, setColorSuccess] = useState('');
    const [sizeError, setSizeError] = useState('');
    const [sizeSuccess, setSizeSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchAll = async () => {
        try {
            const [c, s] = await Promise.all([api.get('/Color'), api.get('/Size')]);
            setColors(c.data);
            setSizes(s.data);
        } catch (err) {
            console.error('Fetch error:', err);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const addColor = async (e) => {
        e.preventDefault();
        setColorError('');
        setColorSuccess('');
        
        // Kiểm tra trùng lặp local
        if (colors.some(c => c.name.toLowerCase() === colorForm.name.toLowerCase())) {
            setColorError(`Tên màu "${colorForm.name}" đã tồn tại.`); return;
        }
        if (colors.some(c => c.hex.toLowerCase() === colorForm.hex.toLowerCase())) {
            setColorError(`Mã màu HEX "${colorForm.hex}" đã tồn tại.`); return;
        }

        setIsSubmitting(true);
        try {
            await api.post('/Color', colorForm);
            setColorSuccess(`Đã thêm màu "${colorForm.name}" thành công!`);
            setColorForm({ name: '', hex: '#000000' });
            fetchAll();
            setTimeout(() => setColorSuccess(''), 3000);
        } catch (err) {
            setColorError(err.response?.data?.message || 'Lỗi khi thêm màu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const addSize = async (e) => {
        e.preventDefault();
        setSizeError('');
        setSizeSuccess('');

        // Kiểm tra trùng lặp local
        if (sizes.some(s => s.name.toLowerCase() === sizeForm.name.toLowerCase())) {
            setSizeError(`Kích thước "${sizeForm.name}" đã tồn tại.`); return;
        }

        setIsSubmitting(true);
        try {
            await api.post('/Size', sizeForm);
            setSizeSuccess(`Đã thêm kích thước "${sizeForm.name}" thành công!`);
            setSizeForm({ name: '' });
            fetchAll();
            setTimeout(() => setSizeSuccess(''), 3000);
        } catch (err) {
            setSizeError(err.response?.data?.message || 'Lỗi khi thêm size.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteColor = async (id, name) => {
        if (!window.confirm(`Bạn có chắc muốn xoá màu "${name}"?`)) return;
        setIsSubmitting(true);
        try {
            // Kiểm tra xem có sản phẩm nào đang dùng màu này không
            const { data: variants } = await api.get('/Product/variants-list'); // Giả sử có endpoint liệt kê variants
            const inUse = variants.filter(v => v.colorId === id);
            
            if (inUse.length > 0) {
                const productNames = [...new Set(inUse.map(v => v.productName))].join(', ');
                alert(`Không thể xóa! Màu "${name}" đang được sử dụng ở các sản phẩm: ${productNames}.\nVui lòng gỡ màu này khỏi các sản phẩm đó trước.`);
                setIsSubmitting(false);
                return;
            }

            await api.delete(`/Color/${id}`);
            // Optimistic UI
            setColors(prev => prev.filter(c => c.id !== id));
            setColorSuccess(`Đã xoá màu "${name}" thành công!`);
            fetchAll();
            setTimeout(() => setColorSuccess(''), 3000);
        } catch (err) {
            setColorError(err.response?.data?.message || 'Lỗi khi xoá màu.');
            setTimeout(() => setColorError(''), 5000);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSize = async (id, name) => {
        if (!window.confirm(`Bạn có chắc muốn xoá kích thước "${name}"?`)) return;
        setIsSubmitting(true);
        try {
            // Kiểm tra xem có sản phẩm nào đang dùng size này không
            const { data: variants } = await api.get('/Product/variants-list');
            const inUse = variants.filter(v => v.sizeId === id);

            if (inUse.length > 0) {
                const productNames = [...new Set(inUse.map(v => v.productName))].join(', ');
                alert(`Không thể xóa! Kích thước "${name}" đang được sử dụng ở các sản phẩm: ${productNames}.\nVui lòng gỡ kích thước này khỏi các sản phẩm đó trước.`);
                setIsSubmitting(false);
                return;
            }

            await api.delete(`/Size/${id}`);
            // Optimistic UI
            setSizes(prev => prev.filter(s => s.id !== id));
            setSizeSuccess(`Đã xoá kích thước "${name}" thành công!`);
            fetchAll();
            setTimeout(() => setSizeSuccess(''), 3000);
        } catch (err) {
            setSizeError(err.response?.data?.message || 'Lỗi khi xoá kích thước.');
            setTimeout(() => setSizeError(''), 5000);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h2 className="page-title">🎨 Màu sắc & Kích thước</h2>
            <div className="admin-properties-grid">

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">🎨 Màu sắc</h3>
                    </div>
                    {colorError && <div className="alert alert-danger">{colorError}</div>}
                    {colorSuccess && <div className="alert alert-success">{colorSuccess}</div>}

                    <form onSubmit={addColor} style={{ marginBottom: 20 }}>
                        <div className="form-group">
                            <label>Tên màu</label>
                            <input
                                className="form-control"
                                value={colorForm.name}
                                onChange={e => setColorForm({ ...colorForm, name: e.target.value })}
                                placeholder="Trắng"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Mã HEX</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input
                                    className="form-control"
                                    type="color"
                                    value={colorForm.hex}
                                    onChange={e => setColorForm({ ...colorForm, hex: e.target.value })}
                                    style={{ width: 60, height: 38, padding: 2 }}
                                />
                                <input
                                    className="form-control"
                                    value={colorForm.hex}
                                    onChange={e => setColorForm({ ...colorForm, hex: e.target.value })}
                                    placeholder="#ffffff"
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
                            {isSubmitting ? 'Đang tải...' : '+ Thêm màu'}
                        </button>
                    </form>
                    <hr className="divider" />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                        {colors.length === 0 ? (
                            <p className="text-muted">Chưa có màu nào</p>
                        ) : (
                            colors.map(c => (
                                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'var(--bg)', borderRadius: 20, border: '1px solid var(--border)' }}>
                                    <span style={{ width: 14, height: 14, borderRadius: '50%', background: c.hex, border: '1px solid #ddd' }} />
                                    <span style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</span>
                                    <button 
                                        type="button" 
                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, marginLeft: 4, display: 'flex', alignItems: 'center', color: 'var(--danger)', opacity: 0.6 }}
                                        onClick={() => handleDeleteColor(c.id, c.name)}
                                        disabled={isSubmitting}
                                        title="Xoá Màu"
                                        onMouseEnter={(e) => e.target.style.opacity = 1}
                                        onMouseLeave={(e) => e.target.style.opacity = 0.6}
                                    >✖</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">📏 Kích thước</h3>
                    </div>
                    {sizeError && <div className="alert alert-danger">{sizeError}</div>}
                    {sizeSuccess && <div className="alert alert-success">{sizeSuccess}</div>}

                    <form onSubmit={addSize} style={{ marginBottom: 20 }}>
                        <div className="form-group">
                            <label>Tên kích thước</label>
                            <input
                                className="form-control"
                                value={sizeForm.name}
                                onChange={e => setSizeForm({ name: e.target.value })}
                                placeholder="XL"
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
                            {isSubmitting ? 'Đang tải...' : '+ Thêm size'}
                        </button>
                    </form>
                    <hr className="divider" />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {sizes.length === 0 ? (
                            <p className="text-muted">Chưa có kích thước nào</p>
                        ) : (
                            sizes.map(s => (
                                <span key={s.id} style={{ padding: '6px 16px', border: '2px solid var(--primary)', color: 'var(--primary)', borderRadius: 8, fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {s.name}
                                    <button 
                                        type="button" 
                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: 'var(--danger)', opacity: 0.7, fontSize: 14 }}
                                        onClick={() => handleDeleteSize(s.id, s.name)}
                                        disabled={isSubmitting}
                                        title="Xoá Kích thước"
                                        onMouseEnter={(e) => e.target.style.opacity = 1}
                                        onMouseLeave={(e) => e.target.style.opacity = 0.7}
                                    >✖</button>
                                </span>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
