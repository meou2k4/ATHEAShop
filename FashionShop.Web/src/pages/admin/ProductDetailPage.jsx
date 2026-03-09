import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { sortSizes } from '../../utils/sizeHelper';

const API_BASE = 'https://www.athea.cloud';

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
        const currentCount = imgItems.length;
        const remainingSlot = 5 - currentCount;

        if (remainingSlot <= 0) {
            alert('Bạn chỉ có thể thêm tối đa 5 ảnh cho mỗi màu sắc.');
            return;
        }

        let imgs = Array.from(files).filter(f => f.type.startsWith('image/'));
        
        if (imgs.length > remainingSlot) {
            alert(`Giới hạn tối đa là 5 ảnh. Chỉ có ${remainingSlot} ảnh đầu tiên được thêm.`);
            imgs = imgs.slice(0, remainingSlot);
        }

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

    const addUrls = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        
        const currentCount = imgItems.length;
        const remainingSlot = 5 - currentCount;

        if (remainingSlot <= 0) {
            alert('Bạn chỉ có thể thêm tối đa 5 ảnh cho mỗi màu sắc.');
            return;
        }

        const rawLines = urlInput.split(/[,\n]/).map(s => s.trim()).filter(s => s.length > 5);
        if (!rawLines.length) return;

        let lines = rawLines.map(s => s.startsWith('http') ? s : `https://${s}`);
        
        if (lines.length > remainingSlot) {
            alert(`Giới hạn tối đa là 5 ảnh. Chỉ có ${remainingSlot} link đầu tiên được thêm.`);
            lines = lines.slice(0, remainingSlot);
        }

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
            setSaving(true);
            try {
                await api.delete(`/Product/${productId}/images/${item.id}`);
            } catch {
                alert('Lỗi khi xoá ảnh');
                setSaving(false);
                return;
            }
            setSaving(false);
        }
        setImgItems(prev => prev.filter(i => i.id !== item.id));
    };

    const processImageOnServer = async (item) => {
        const token = localStorage.getItem('token');
        if (item.type === 'file') {
            const fd = new FormData(); fd.append('file', item.file);
            const res = await fetch(`${API_BASE}/api/Upload/image`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: fd
            });
            const data = await res.json();
            if (!data.url) throw new Error(data.message || 'Upload file thất bại');
            return data;
        } else {
            // item.type === 'url'
            const res = await fetch(`${API_BASE}/api/Upload/image`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ imageUrl: item.url })
            });
            const data = await res.json();
            if (!data.url) throw new Error(data.message || 'Xử lý URL ảnh thất bại');
            return data;
        }
    };

    const handleSave = async () => {
        setErr(''); setSaving(true);
        try {
            if (!selectedColor) throw new Error('Vui lòng chọn màu.');
            if (sizeRows.some(r => !r.sizeId)) throw new Error('Vui lòng chọn size cho tất cả dòng.');
            if (imgItems.length > 0 && !imgItems.some(i => i.isMain))
                throw new Error('Vui lòng chọn 1 ảnh làm ảnh chính (kéo thumbnail vào ô bên trái).');

            const colorId = +selectedColor;
            
            // Xử lý từng ảnh một: Upload -> Lưu DB
            const currentImgItems = [...imgItems];
            for (let i = 0; i < currentImgItems.length; i++) {
                const item = currentImgItems[i];
                
                // Nếu là ảnh mới hoặc link mới (pending)
                if (item.status === 'pending') {
                    // Bước 1: Upload lên server (Vercel Blob / Cloudinary)
                    const uploadRes = await processImageOnServer(item);
                    
                    // Bước 2: Lưu ngay vào database
                    await api.post(`/Product/${productId}/images`, {
                        imageUrl: uploadRes.url,
                        publicId: uploadRes.publicId,
                        colorId,
                        isMain: item.isMain,
                    });

                    // Cập nhật trạng thái item trong mảng local
                    currentImgItems[i] = {
                        ...item,
                        id: uploadRes.publicId || item.id, // Dùng ID từ server nếu có
                        url: uploadRes.url,
                        previewUrl: uploadRes.url,
                        status: 'saved'
                    };
                } 
                // Nếu là ảnh đã có nhưng có thay đổi (ví dụ đổi isMain)
                else if (item.status === 'saved') {
                    await api.put(`/Product/${productId}/images/${item.id}`, {
                        imageUrl: item.url, 
                        colorId, 
                        isMain: item.isMain,
                    });
                }
            }
            setImgItems(currentImgItems);

            // Xử lý biến thể (size/price)
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
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.4)' }}>
            <div className="modal-premium">
                <div className="modal-header" style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ background: 'var(--admin-bg)', width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                            {isEdit ? '✏️' : '➕'}
                        </div>
                        <h3 className="modal-title" style={{ margin: 0 }}>{isEdit ? 'Sửa sản phẩm chi tiết' : 'Thêm sản phẩm chi tiết'}</h3>
                    </div>
                    <button className="modal-close" onClick={onClose} style={{ top: 20, right: 24 }}>✖</button>
                </div>

                <div className="modal-body-scroll">
                    {err && <div className="alert alert-danger" style={{ marginBottom: 20 }}>{err}</div>}
                    
                    {/* Section 1: Color Selection */}
                    <div className="form-group" style={{ marginBottom: 24 }}>
                        <label style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, display: 'block' }}>Màu sắc đại diện *</label>
                        <select className="form-control" value={selectedColor} onChange={e => setSelectedColor(e.target.value)} disabled={isEdit} style={{ height: 44, borderRadius: 10, background: isEdit ? '#f8fafc' : '#fff' }}>
                            <option value="">— Chọn màu —</option>
                            {colors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    {/* Section 2: Size & Price Grid */}
                    <div style={{ marginBottom: 32 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <label style={{ fontWeight: 700, fontSize: 13, margin: 0 }}>Kích thước & Giá riêng</label>
                            <button type="button" className="btn btn-primary btn-sm" style={{ padding: '6px 12px', fontSize: 11, borderRadius: 8 }}
                                onClick={() => setSizeRows(r => [...r, { variantId: null, sizeId: '', price: '', stock: 0 }])}>
                                + Thêm dòng
                            </button>
                        </div>
                        
                        {sizeRows.map((row, idx) => (
                            <div key={idx} className="size-row-item">
                                <div style={{ minWidth: 0 }}>
                                    {row.variantId
                                        ? <div className="form-control" style={{ background: '#fff', color: 'var(--admin-primary)', fontWeight: 700, border: 'none', height: 40, display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                                            {sizes.find(s => s.id === row.sizeId)?.name || row.sizeId}
                                          </div>
                                        : <select className="form-control" value={row.sizeId} style={{ height: 40, borderRadius: 8 }}
                                            onChange={e => setSizeRows(rows => rows.map((r, i) => i === idx ? { ...r, sizeId: e.target.value } : r))}>
                                            <option value="">Size</option>
                                            {sortSizes(sizes).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                          </select>
                                    }
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <input className="form-control" type="number" placeholder="= giá mặc định"
                                        value={row.price} style={{ height: 40, borderRadius: 8, paddingRight: 35 }}
                                        onChange={e => setSizeRows(rows => rows.map((r, i) => i === idx ? { ...r, price: e.target.value } : r))} />
                                    <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#94a3b8', pointerEvents: 'none' }}>₫</span>
                                </div>
                                <button type="button" className="btn btn-danger btn-sm"
                                    onClick={() => setSizeRows(rows => rows.filter((_, i) => i !== idx))}
                                    style={{ width: 40, height: 40, padding: 0, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>🗑️</button>
                            </div>
                        ))}
                    </div>

                    {/* Section 3: Image Studio */}
                    <div className="image-studio">
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, width: '100%', alignItems: 'flex-start' }}>
                            <div className="main-image-zone"
                                onDragOver={e => { e.preventDefault(); setMainDragOver(true); }}
                                onDragLeave={() => setMainDragOver(false)}
                                onDrop={e => {
                                    e.preventDefault(); setMainDragOver(false);
                                    if (dragId) setMain(dragId);
                                }}
                                style={{
                                    borderStyle: mainDragOver ? 'dashed' : 'solid',
                                    borderColor: mainDragOver ? 'var(--admin-primary)' : '#fff',
                                    background: '#f8fafc'
                                }}
                            >
                                {(() => {
                                    const main = imgItems.find(i => i.isMain);
                                    return main ? (
                                        <>
                                            <img src={main.previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <div className="main-image-badge">⭐ Ảnh chính</div>
                                        </>
                                    ) : (
                                        <div style={{ textAlign: 'center', color: '#94a3b8', padding: 10, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                            <div style={{ fontSize: 24, marginBottom: 4 }}>📸</div>
                                            <div style={{ fontSize: 9, lineHeight: 1.2, fontWeight: 600 }}>KÉO ẢNH<br/>VÀO ĐÂY</div>
                                        </div>
                                    );
                                })()}
                            </div>
                            
                            <div style={{ flex: 1, minWidth: 'min(100%, 300px)' }}>
                                <label style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, display: 'block' }}>Bộ sưu tập ảnh</label>
                                <div className="thumb-list">
                                    {imgItems.map(item => (
                                        <div key={item.id} draggable onDragStart={() => setDragId(item.id)} onDragEnd={() => setDragId(null)}
                                            className={`thumb-item ${item.isMain ? 'active' : ''}`}
                                            onClick={() => setMain(item.id)}
                                        >
                                            <img src={item.previewUrl} alt="" />
                                            <button onClick={(e) => { e.stopPropagation(); removeImg(item); }} style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: 18, height: 18, fontSize: 10, cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✖</button>
                                        </div>
                                    ))}
                                    <div onClick={() => fileInputRef.current.click()} style={{ width: 64, height: 64, border: '2px dashed #cbd5e1', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#fff', color: '#94a3b8', fontSize: 20, flexShrink: 0 }}>
                                        ➕
                                        <input type="file" hidden ref={fileInputRef} multiple accept="image/*" onChange={e => addFiles(e.target.files)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="url-add-bar">
                            <input className="form-control" placeholder="Dán link ảnh (Cloudinary, Vercel Blob...)"
                                value={urlInput} onChange={e => setUrlInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addUrls(e)} />
                            <button type="button" className="btn-url-add" onClick={addUrls}>
                                ✨ Thêm link
                            </button>
                        </div>
                        <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, textAlign: 'center' }}>💡 Mẹo: Kéo thả các ảnh nhỏ vào khung bên trái để đặt làm ảnh đại diện chính cho màu này.</p>
                    </div>
                </div>

                <div className="modal-footer-sticky">
                    <button className="btn btn-outline" onClick={onClose} style={{ borderRadius: 10, padding: '10px 24px', fontWeight: 600 }}>Hủy bỏ</button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ borderRadius: 10, padding: '10px 32px', fontWeight: 700, minWidth: 120 }}>
                        {saving ? '⏳ Đang lưu...' : '🚀 Lưu thay đổi'}
                    </button>
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
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        setIsSubmitting(true);
        try {
            await api.delete(`/Product/${id}/variants/${variantId}`);
            fetchProduct();
        } catch { alert('Lỗi khi xoá'); }
        finally { setIsSubmitting(false); }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 className="page-title" style={{ margin: 0 }}>
                    👗 Thuộc tính: {product.name}
                </h2>
                <button className="btn btn-primary" onClick={() => { setEditTarget(null); setShowModal(true); }}>
                    + Thêm màu & chi tiết
                </button>
            </div>
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 20 }}>
                    {productDetails.map(detail => {
                        const mainImg = detail.images.find(i => i.isMain) || detail.images[0];
                        return (
                            <div key={detail.color.id} className="variant-card">
                                <div style={{ display: 'flex', gap: 20, alignItems: 'start' }}>
                                    {/* Left: Image Preview */}
                                    <div className="variant-img-preview" style={{ position: 'relative' }}>
                                        {mainImg
                                            ? <img src={mainImg.imageUrl} alt="" />
                                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: '#cbd5e1' }}>🖼️</div>
                                        }
                                        {detail.images.length > 1 && (
                                            <div style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: 'white', fontSize: 10, fontWeight: 700, borderRadius: 6, padding: '2px 8px', border: '1px solid rgba(255,255,255,0.2)' }}>
                                                {detail.images.length} ảnh
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Info & SKU Grid */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div className="variant-header-info" style={{ borderBottom: 'none', marginBottom: 12 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                                                <div className="variant-color-dot" style={{ background: detail.color.hex }} />
                                                <strong style={{ fontSize: 16 }}>{detail.color.name}</strong>
                                                <span style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>• {detail.variants.length} SKU</span>
                                            </div>
                                            <button className="btn btn-outline btn-sm" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => handleEdit(detail)}>
                                                ✏️ Sửa / Ảnh
                                            </button>
                                        </div>

                                        <div className="sku-grid">
                                            {sortSizes(detail.variants, 'sizeName').map(v => (
                                                <div key={v.id} className="sku-item">
                                                    <span className="variant-size-badge">{v.sizeName}</span>
                                                    {v.price 
                                                        ? <span className="variant-price-tag">{v.price.toLocaleString('vi-VN')}₫</span> 
                                                        : <span className="variant-price-default">Mặc định</span>
                                                    }
                                                    <button className="sku-delete-btn" title="Xóa" onClick={() => handleDeleteVariant(v.id)} disabled={isSubmitting}>
                                                        ✖
                                                    </button>
                                                </div>
                                            ))}
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
