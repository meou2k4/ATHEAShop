import { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';

export default function PropertiesPage() {
    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [colorForm, setColorForm] = useState({ name: '', hexCode: '#000000' });
    const [sizeForm, setSizeForm] = useState({ name: '' });
    const [colorError, setColorError] = useState('');
    const [sizeError, setSizeError] = useState('');

    const fetchAll = async () => {
        const [c, s] = await Promise.all([api.get('/Color'), api.get('/Size')]);
        setColors(c.data); setSizes(s.data);
    };
    useEffect(() => {
        const loadData = async () => {
            await fetchAll();
        };
        loadData();
    }, []);

    const addColor = async (e) => {
        e.preventDefault(); setColorError('');
        try {
            await api.post('/Color', colorForm);
            setColorForm({ name: '', hexCode: '#000000' });
            fetchAll();
        } catch (err) { setColorError(err.response?.data?.message || 'Lỗi khi thêm màu.'); }
    };

    const addSize = async (e) => {
        e.preventDefault(); setSizeError('');
        try {
            await api.post('/Size', sizeForm);
            setSizeForm({ name: '' });
            fetchAll();
        } catch (err) { setSizeError(err.response?.data?.message || 'Lỗi khi thêm size.'); }
    };

    return (
        <div>
            <h2 className="page-title">🎨 Màu sắc & Kích thước</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">🎨 Màu sắc</h3>
                    </div>
                    {colorError && <div className="alert alert-danger">{colorError}</div>}
                    <form onSubmit={addColor} style={{ marginBottom: 20 }}>
                        <div className="form-group">
                            <label>Tên màu</label>
                            <input className="form-control" value={colorForm.name} onChange={e => setColorForm({ ...colorForm, name: e.target.value })} placeholder="Trắng" required />
                        </div>
                        <div className="form-group">
                            <label>Mã HEX</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input className="form-control" type="color" value={colorForm.hexCode} onChange={e => setColorForm({ ...colorForm, hexCode: e.target.value })} style={{ width: 60, height: 38, padding: 2 }} />
                                <input className="form-control" value={colorForm.hexCode} onChange={e => setColorForm({ ...colorForm, hexCode: e.target.value })} placeholder="#ffffff" required />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-sm">+ Thêm màu</button>
                    </form>
                    <hr className="divider" />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                        {colors.length === 0 ? <p className="text-muted">Chưa có màu nào</p> : colors.map(c => (
                            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'var(--bg)', borderRadius: 20, border: '1px solid var(--border)' }}>
                                <span style={{ width: 14, height: 14, borderRadius: '50%', background: c.hexCode, border: '1px solid #ddd' }} />
                                <span style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">📏 Kích thước</h3>
                    </div>
                    {sizeError && <div className="alert alert-danger">{sizeError}</div>}
                    <form onSubmit={addSize} style={{ marginBottom: 20 }}>
                        <div className="form-group">
                            <label>Tên kích thước</label>
                            <input className="form-control" value={sizeForm.name} onChange={e => setSizeForm({ name: e.target.value })} placeholder="XL" required />
                        </div>
                        <button type="submit" className="btn btn-primary btn-sm">+ Thêm size</button>
                    </form>
                    <hr className="divider" />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {sizes.length === 0 ? <p className="text-muted">Chưa có kích thước nào</p> : sizes.map(s => (
                            <span key={s.id} style={{ padding: '6px 16px', border: '2px solid var(--primary)', color: 'var(--primary)', borderRadius: 8, fontWeight: 600, fontSize: 13 }}>{s.name}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
