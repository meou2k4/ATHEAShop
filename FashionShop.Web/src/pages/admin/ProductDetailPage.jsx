import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axiosConfig';

const API_BASE = 'https://localhost:7299';

function DetailModal({ productId, colors, sizes, editColor, editImages, editVariants, onClose, onSaved }) {
    const isEdit = !!editColor;

    // --- State ảnh ---
    const [imgItems, setImgItems] = useState(
        isEdit ? editImages.map(i => ({ id: i.id, previewUrl: i.imageUrl, url: i.imageUrl, isMain: i.isMain, status: 'saved' })) : []
    );
    const [urlInput, setUrlInput] = useState('');
    const fileInputRef = useRef();

    // --- State biến thể ---
    const [selectedColor, setSelectedColor] = useState(isEdit ? editColor.id : '');
    const [sizeRows, setSizeRows] = useState(
        isEdit
            ? editVariants.map(v => ({ variantId: v.id, sizeId: v.sizeId, price: v.price || '', stock: v.stock || 0 }))
            : [{ variantId: null, sizeId: '', price: '', stock: 0 }]
    );
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState('');

    const addFiles = (files) => {
        const imgs = Array.from(files).filter(f => f.type.startsWith('image/'));
        const newItems = imgs.map(f => ({
            id: Math.random().toString(36).slice(2),
            type: 'file', file: f, previewUrl: URL.createObjectURL(f),
            url: '', isMain: false, status: 'pending',
        }));
        setImgItems(prev => {
            const merged = [...prev, ...newItems];
            if (!merged.some(i => i.isMain) && merged.length > 0)
                merged[0] = { ...merged[0], isMain: true };
            return merged;
        });
    };

    const addUrls = () => {
        const lines = urlInput.split('\n').map(s => s.trim()).filter(s => s.startsWith('http'));
        if (!lines.length) return;
        const newItems = lines.map(u => ({
            id: Math.random().toString(36).slice(2),
            type: 'url', previewUrl: u, url: u, isMain: false, status: 'pending',
        }));
        setImgItems(prev => {
            const merged = [...prev, ...newItems];
            if (!merged.some(i => i.isMain) && merged.length > 0)
                merged[0] = { ...merged[0], isMain: true };
            return merged;
        });
        setUrlInput('');
    };

    const [dragId, setDragId] = useState(null);
    const [mainDragOver, setMainDragOver] = useState(false);

    const setMain = (itemId) => {
        setImgItems(prev => prev.map(i => ({ ...i, isMain: i.id === itemId })));
    };

    const removeImg = async (item) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa ảnh này không?')) return;
        if (item.status === 'saved' && item.id) {
            try {
                await api.delete(`/Product/${productId}/images/${item.id}`);
            } catch {
                alert('Lỗi khi xoá ảnh');
                return;
            }
        }
        setImgItems(prev => prev.filter(i => i.id !== item.id));
    };

    const uploadFileToServer = async (file) => {
        const token = localStorage.getItem('token');
        const fd = new FormData(); fd.append('file', file);
        const res = await fetch(`${API_BASE}/api/Upload/image`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
        const data = await res.json();
        if (!data.url) throw new Error('Upload thất bại');
        return `${API_BASE}${data.url}`;
    };

    const handleSave = async () => {
        setErr(''); setSaving(true);
        try {
            if (!selectedColor) throw new Error('Vui lòng chọn màu.');
            if (sizeRows.some(r => !r.sizeId)) throw new Error('Vui lòng chọn size cho tất cả dòng.');
            if (imgItems.length > 0 && !imgItems.some(i => i.isMain))
                throw new Error('Vui lòng chọn 1 ảnh làm ảnh chính (kéo thumbnail vào ô bên trái).');

            const colorId = +selectedColor;
            const uploadedItems = [...imgItems];
            for (let i = 0; i < uploadedItems.length; i++) {
                const item = uploadedItems[i];
                if (item.status !== 'pending') continue;
                if (item.type === 'file') {
                    const url = await uploadFileToServer(item.file);
                    uploadedItems[i] = { ...item, url, status: 'uploaded' };
                } else {
                    uploadedItems[i] = { ...item, status: 'uploaded' };
                }
            }
            setImgItems(uploadedItems);

            for (const item of uploadedItems) {
                if (item.status === 'saved') continue;
                await api.post(`/Product/${productId}/images`, {
                    imageUrl: item.url,
                    colorId,
                    isMain: item.isMain,
                });
            }

            for (const item of uploadedItems.filter(i => i.status === 'saved')) {
                await api.put(`/Product/${productId}/images/${item.id}`, {
                    imageUrl: item.url, colorId, isMain: item.isMain,
                });
            }

            for (const row of sizeRows) {
                if (row.variantId) {
                    await api.put(`/Product/${productId}/variants/${row.variantId}`, {
                        price: row.price ? +row.price : null,
                        stock: +(row.stock || 0),
                    });
                } else {
                    await api.post(`/Product/${productId}/variants`, {
                        colorId, sizeId: +row.sizeId,
                        price: row.price ? +row.price : null, stock: +(row.stock || 0),
                    });
                }
            }
            onSaved();
            onClose();
        } catch (e) {
            setErr(e.response?.data?.message || e.message || 'Lỗi lưu dữ liệu.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 680, width: '95%' }}>
                <div className="modal-header">
                    <h3 className="modal-title">{isEdit ? '✏️ Sửa sản phẩm chi tiết' : '➕ Thêm sản phẩm chi tiết'}</h3>
                    <button className="modal-close" onClick={onClose}>✖</button>
                </div>
                {err && <div className="alert alert-danger" style={{ margin: '0 24px' }}>{err}</div>}
                <div className="modal-body">
                    <div className="form-group">
                        <label>Màu sắc *</label>
                        <select className="form-control" value={selectedColor} onChange={e => setSelectedColor(e.target.value)} disabled={isEdit}>
                            <option value="">— Chọn màu —</option>
                            {colors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <label style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>Kích thước</label>
                            {!isEdit && (
                                <button type="button" className="btn btn-outline btn-sm"
                                    onClick={() => setSizeRows(r => [...r, { variantId: null, sizeId: '', price: '', stock: 0 }])}>
                                    + Thêm size
                                </button>
                            )}
                        </div>
                        {sizeRows.map((row, idx) => (
                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr auto', gap: 8, marginBottom: 8, alignItems: 'flex-end' }}>
                                <div>
                                    {idx === 0 && <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Size *</label>}
                                    {row.variantId
                                        ? <div className="form-control" style={{ background: '#f5f6fa', color: '#6b7280', fontWeight: 600 }}>
                                            {sizes.find(s => s.id === row.sizeId)?.name || row.sizeId}
                                        </div>
                                        : <select className="form-control" value={row.sizeId}
                                            onChange={e => setSizeRows(rows => rows.map((r, i) => i === idx ? { ...r, sizeId: e.target.value } : r))}>
                                            <option value="">Chọn size</option>
                                            {sizes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    }
                                </div>
                                <div>
                                    {idx === 0 && <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Giá riêng (VND)</label>}
                                    <input className="form-control" type="number" placeholder="= giá gốc"
                                        value={row.price}
                                        onChange={e => setSizeRows(rows => rows.map((r, i) => i === idx ? { ...r, price: e.target.value } : r))} />
                                </div>
                                {!row.variantId && (
                                    <button type="button" className="btn btn-danger btn-sm"
                                        onClick={() => setSizeRows(rows => rows.filter((_, i) => i !== idx))}
                                        style={{ alignSelf: 'flex-end', height: 38 }}>🗑️</button>
                                )}
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 12, marginTop: 20 }}>
                        <div
                            onDragOver={e => { e.preventDefault(); setMainDragOver(true); }}
                            onDragLeave={() => setMainDragOver(false)}
                            onDrop={e => {
                                e.preventDefault(); setMainDragOver(false);
                                if (dragId) setMain(dragId);
                            }}
                            style={{
                                width: 160, height: 160, borderRadius: 14, overflow: 'hidden',
                                border: mainDragOver ? '3px dashed var(--primary)' : '3px dashed #d1d5db',
                                background: mainDragOver ? '#f0eeff' : '#f9fafb',
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                position: 'relative', transition: 'all 0.2s', cursor: 'default',
                                boxShadow: mainDragOver ? '0 0 0 4px #ede9ff' : 'none',
                            }}
                        >
                            {(() => {
                                const main = imgItems.find(i => i.isMain);
                                return main ? (
                                    <>
                                        <img src={main.previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.28)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: '10px' }}>
                                            <div style={{ background: 'var(--primary)', color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                ⭐ Ảnh chính
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#9ca3af', padding: 10 }}>
                                        <div style={{ fontSize: 32, marginBottom: 6 }}>📸</div>
                                        <div style={{ fontSize: 11, lineHeight: 1.4 }}>Kéo ảnh vào đây<br />để Đặt làm chính</div>
                                    </div>
                                );
                            })()}
                        </div>
                        <div className="image-manager-list" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div className="thumbnail-strip" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
                                {imgItems.map(item => (
                                    <div key={item.id} draggable onDragStart={() => setDragId(item.id)} onDragEnd={() => setDragId(null)}
                                        style={{ width: 60, height: 60, borderRadius: 8, overflow: 'hidden', position: 'relative', border: item.isMain ? '2px solid var(--primary)' : '1px solid #ddd', flexShrink: 0, cursor: 'grab' }}>
                                        <img src={item.previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button className="remove-img-btn" onClick={() => removeImg(item)} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(239,68,68,0.8)', color: 'white', border: 'none', borderRadius: '50%', width: 16, height: 16, fontSize: 10, cursor: 'pointer' }}>✖</button>
                                    </div>
                                ))}
                                <div className="add-img-box" onClick={() => fileInputRef.current.click()} style={{ width: 60, height: 60, border: '2px dashed #ddd', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    ➕
                                    <input type="file" hidden ref={fileInputRef} multiple accept="image/*" onChange={e => addFiles(e.target.files)} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <input className="form-control" placeholder="https://... (URL ảnh)"
                                    value={urlInput} onChange={e => setUrlInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addUrls()}
                                    style={{ flex: 1, fontSize: 12 }} />
                                <button type="button" className="btn btn-outline btn-sm" onClick={addUrls} style={{ whiteSpace: 'nowrap' }}>+</button>
                            </div>
                        </div>
                    </div>
                    {imgItems.length > 0 && <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>👉 Kéo thumbnail vào ô trái để đặt làm ảnh chính</p>}
                </div>
                <div className="modal-footer">
                    <button className="btn btn-outline" onClick={onClose}>Hủy</button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? '⏳ Đang lưu...' : '💾 Lưu'}</button>
                </div>
            </div>
        </div>
    );
}

export default function ProductDetailPage() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);

    const fetchProduct = useCallback(async () => {
        const { data } = await api.get(`/Product/${id}`);
        setProduct(data);
    }, [id]);

    useEffect(() => {
        const init = async () => {
            await fetchProduct();
            const [c, s] = await Promise.all([api.get('/Color'), api.get('/Size')]);
            setColors(c.data);
            setSizes(s.data);
        };
        init();
    }, [id, fetchProduct]);

    if (!product) return <div className="loading">⏳ Đang tải...</div>;

    const colorMap = {};
    (product.variants || []).forEach(v => {
        if (!colorMap[v.colorId]) colorMap[v.colorId] = { color: { id: v.colorId, name: v.colorName, hex: v.colorHex }, variants: [], images: [] };
        colorMap[v.colorId].variants.push(v);
    });
    (product.images || []).forEach(img => {
        if (img.colorId && colorMap[img.colorId]) colorMap[img.colorId].images.push(img);
    });
    const productDetails = Object.values(colorMap);

    const handleEdit = (detail) => {
        setEditTarget(detail);
        setShowModal(true);
    };

    const handleDeleteVariant = async (variantId) => {
        if (!window.confirm('Xóa biến thể (size) này?')) return;
        await api.delete(`/Product/${id}/variants/${variantId}`);
        fetchProduct();
    };

    return (
        <div>
            <h2 className="page-title">
                👗 Thuộc tính: {product.name}
            </h2>
            {productDetails.length === 0 ? (
                <div className="card">
                    <div className="empty-state" style={{ padding: '60px 20px' }}>
                        <div className="empty-icon">📂</div>
                        <p style={{ fontWeight: 600, marginBottom: 8 }}>Chưa có sản phẩm chi tiết nào</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>Thêm chi tiết sản phẩm (màu + size + ảnh) để bắt đầu</p>
                        <button className="btn btn-primary" onClick={() => { setEditTarget(null); setShowModal(true); }}>+ Thêm sản phẩm chi tiết đầu tiên</button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 16 }}>
                    {productDetails.map(detail => {
                        const mainImg = detail.images.find(i => i.isMain) || detail.images[0];
                        return (
                            <div key={detail.color.id} className="card">
                                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr auto', gap: 20, alignItems: 'start' }}>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ width: 100, height: 100, borderRadius: 10, overflow: 'hidden', background: '#f5f0eb', border: '2px solid var(--border)' }}>
                                            {mainImg
                                                ? <img src={mainImg.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: '#d1c4b5' }}>🖼️</div>
                                            }
                                        </div>
                                        {detail.images.length > 1 && (
                                            <div style={{ position: 'absolute', bottom: -6, right: -6, background: 'var(--primary)', color: 'white', fontSize: 10, fontWeight: 700, borderRadius: 10, padding: '2px 6px', border: '2px solid white' }}>
                                                +{detail.images.length - 1}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ width: 16, height: 16, borderRadius: '50%', background: detail.color.hex, border: '1px solid #ccc', display: 'inline-block', flexShrink: 0 }} />
                                                <strong style={{ fontSize: 15 }}>{detail.color.name}</strong>
                                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>• {detail.images.length} ảnh</span>
                                            </div>
                                            <div>
                                                <button className="btn btn-outline btn-sm" onClick={() => handleEdit(detail)}>✏️ Sửa / Ảnh</button>
                                            </div>
                                        </div>
                                        <div className="table-wrapper">
                                            <table style={{ fontSize: 13, width: '100%' }}>
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: '80px', textAlign: 'left' }}>Size</th>
                                                        <th style={{ textAlign: 'left' }}>Giá riêng</th>
                                                        <th style={{ width: '60px', textAlign: 'right' }}></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {detail.variants.map(v => (
                                                        <tr key={v.id}>
                                                            <td style={{ textAlign: 'left' }}><span className="badge badge-primary">{v.sizeName}</span></td>
                                                            <td style={{ textAlign: 'left' }}>
                                                                {v.price ? <strong style={{ color: 'var(--primary)' }}>{v.price.toLocaleString('vi-VN')}</strong> : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Giá gốc</span>}
                                                            </td>
                                                            <td style={{ textAlign: 'right' }}><button className="btn btn-danger btn-sm" onClick={() => handleDeleteVariant(v.id)}>🗑️</button></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            {showModal && (
                <DetailModal
                    productId={id} colors={colors} sizes={sizes}
                    editColor={editTarget?.color || null} editImages={editTarget?.images || []} editVariants={editTarget?.variants || []}
                    onClose={() => { setShowModal(false); setEditTarget(null); }} onSaved={() => fetchProduct()}
                />
            )}
        </div>
    );
}
