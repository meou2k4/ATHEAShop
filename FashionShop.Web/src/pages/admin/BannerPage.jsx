import { useEffect, useRef, useState } from 'react';
import api from '../../api/axiosConfig';
import { getOptimizedImageUrl } from '../../utils/imageHelper';

export default function BannerPage() {
    const [settings, setSettings] = useState({
        BannerUrl: '',
        BannerSubtitle: 'Premium Collection',
        BannerTitle: 'ATHEA - Khơi nguồn cảm hứng',
        BannerBtnText: 'Khám phá ngay',
        BannerBtnLink: '/san-pham',
    });
    
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    
    const fileInputRef = useRef(null);

    // Fetch dữ liệu Banner và Danh mục sản phẩm
    useEffect(() => {
        Promise.all([
            api.get('/Settings'),
            api.get('/Category')
        ]).then(([sRes, cRes]) => {
            const map = {};
            (sRes.data || []).forEach(s => { map[s.key] = s.value; });
            setSettings(prev => ({
                ...prev,
                BannerUrl: map.BannerUrl || '',
                BannerSubtitle: map.BannerSubtitle || 'Premium Collection',
                BannerTitle: map.BannerTitle || 'ATHEA - Khơi nguồn cảm hứng',
                BannerBtnText: map.BannerBtnText || 'Khám phá ngay',
                BannerBtnLink: map.BannerBtnLink || '/san-pham',
            }));
            setCategories(Array.isArray(cRes.data) ? cRes.data : []);
        }).catch(() => {
            /* ignore */
        }).finally(() => setLoading(false));
    }, []);

    // Tải ảnh từ máy tính hoặc điện thoại
    const handleFileSelect = async (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn file hình ảnh (JPG, PNG, WEBP...).');
            return;
        }
        
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const { data } = await api.post('/Upload/image', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (data.url) {
                setSettings(prev => ({ ...prev, BannerUrl: data.url }));
            } else {
                alert('Tải ảnh thất bại, vui lòng thử lại.');
            }
        } catch (err) {
            alert('Có lỗi khi tải ảnh lên hệ thống!');
        } finally {
            setUploading(false);
        }
    };

    // Lưu cấu hình Banner
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccessMsg('');

        try {
            const payload = [
                { key: 'BannerUrl', value: settings.BannerUrl || '', description: 'URL Banner trang chủ' },
                { key: 'BannerSubtitle', value: settings.BannerSubtitle || '', description: 'Subtitle Banner' },
                { key: 'BannerTitle', value: settings.BannerTitle || '', description: 'Title Banner' },
                { key: 'BannerBtnText', value: settings.BannerBtnText || '', description: 'Tên nút bấm Banner' },
                { key: 'BannerBtnLink', value: settings.BannerBtnLink || '/san-pham', description: 'Trang chuyển đến khi bấm' },
            ];

            await api.post('/Settings', payload);
            setSuccessMsg('🎉 Đã cập nhật Banner Trang chủ thành công!');
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch {
            alert('Lỗi khi lưu thông tin Banner!');
        } finally {
            setSaving(false);
        }
    };

    const bannerPreviewUrl = settings.BannerUrl 
        ? getOptimizedImageUrl(settings.BannerUrl, 1600) 
        : '/Banner.jpg';

    if (loading) {
        return (
            <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
                ⏳ Đang tải thông tin Banner...
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 960 }}>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h2 className="page-title" style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
                    🖼️ Quản Lý Banner Trang Chủ
                </h2>
                <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
                    Thay đổi hình ảnh, tiêu đề quảng cáo và liên kết hiển thị ở ngay đầu trang chủ của cửa hàng.
                </p>
            </div>

            {successMsg && (
                <div className="alert alert-success" style={{ marginBottom: 20, fontSize: 14, fontWeight: 600 }}>
                    {successMsg}
                </div>
            )}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* 1. KHUNG TẢI ẢNH BANNER */}
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                        📸 1. Chọn Hình Ảnh Banner
                    </h3>

                    {/* Zone Kéo Thả / Upload Ảnh */}
                    <div 
                        onClick={() => !uploading && fileInputRef.current?.click()}
                        style={{
                            border: '2px dashed #cbd5e1',
                            borderRadius: 12,
                            padding: '30px 20px',
                            textAlign: 'center',
                            cursor: uploading ? 'not-allowed' : 'pointer',
                            background: '#f8fafc',
                            transition: 'all 0.2s ease',
                        }}
                        className="banner-dropzone"
                    >
                        {uploading ? (
                            <div style={{ color: 'var(--pub-accent)', fontWeight: 600 }}>
                                ⏳ Đang tối ưu dung lượng & tải ảnh lên hệ thống...
                            </div>
                        ) : (
                            <div>
                                <div style={{ fontSize: 36, marginBottom: 8 }}>🖼️</div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                                    Bấm vào đây để chọn ảnh Banner mới từ máy tính / điện thoại
                                </div>
                                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                                    Hỗ trợ file JPG, PNG, WEBP · Hệ thống tự động nén siêu nhẹ
                                </div>
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            hidden
                            accept="image/*"
                            onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                        />
                    </div>
                </div>

                {/* 2. CHỈNH SỬA CHỮ VÀ NÚT BẤM */}
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                        ✍️ 2. Nội Dung Khẩu Hiệu & Nút Bấm
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                        {/* Subtitle */}
                        <div className="form-group">
                            <label style={{ fontWeight: 600, fontSize: 13 }}>Dòng chữ phụ nhỏ (Subtitle)</label>
                            <input
                                className="form-control"
                                placeholder="Ví dụ: BỘ SƯU TẬP MỚI 2026"
                                value={settings.BannerSubtitle}
                                onChange={e => setSettings(s => ({ ...s, BannerSubtitle: e.target.value }))}
                            />
                        </div>

                        {/* Title */}
                        <div className="form-group">
                            <label style={{ fontWeight: 600, fontSize: 13 }}>Tên tiêu đề lớn chính (Title)</label>
                            <input
                                className="form-control"
                                placeholder="Ví dụ: ATHEA - Khơi nguồn cảm hứng"
                                value={settings.BannerTitle}
                                onChange={e => setSettings(s => ({ ...s, BannerTitle: e.target.value }))}
                            />
                        </div>

                        {/* Button Text */}
                        <div className="form-group">
                            <label style={{ fontWeight: 600, fontSize: 13 }}>Tên nút bấm hành động</label>
                            <input
                                className="form-control"
                                placeholder="Ví dụ: Khám phá ngay / Mua ngay"
                                value={settings.BannerBtnText}
                                onChange={e => setSettings(s => ({ ...s, BannerBtnText: e.target.value }))}
                            />
                        </div>

                        {/* Button Link - DROPDOWN CHỌN TRANG DỄ DÀNG */}
                        <div className="form-group">
                            <label style={{ fontWeight: 600, fontSize: 13 }}>Trang sẽ mở khi khách bấm vào Banner</label>
                            <select
                                className="form-control"
                                value={settings.BannerBtnLink}
                                onChange={e => setSettings(s => ({ ...s, BannerBtnLink: e.target.value }))}
                                style={{ height: 42, fontSize: 14 }}
                            >
                                <option value="/san-pham">🛍️ Trang Tất cả sản phẩm</option>
                                <option value="/san-pham?filter=new">🔥 Trang Sản phẩm Mới (New Arrival)</option>
                                <option value="/san-pham?filter=sale">💥 Trang Sản phẩm Giảm giá (Sale Off)</option>
                                <optgroup label="📂 Chọn theo Danh mục cụ thể:">
                                    {categories.map(cat => (
                                        <option key={cat.id} value={`/san-pham?categoryId=${cat.id}`}>
                                            👉 Danh mục: {cat.name}
                                        </option>
                                    ))}
                                </optgroup>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 3. XEM TRƯỚC HÌNH ẢNH BANNER THỰC TẾ */}
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                        👀 3. Xem Trước Banner Trên Trang Chủ
                    </h3>

                    <div style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '21/9',
                        borderRadius: 14,
                        overflow: 'hidden',
                        background: '#0f172a',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    }}>
                        <img
                            src={bannerPreviewUrl}
                            alt="Banner Live Preview"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.1))',
                        }} />
                        
                        {/* Overlay Content */}
                        <div style={{
                            position: 'absolute',
                            bottom: '10%',
                            left: '6%',
                            right: '6%',
                            color: '#ffffff',
                            textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                        }}>
                            <div style={{ fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', opacity: 0.9, fontWeight: 600 }}>
                                {settings.BannerSubtitle || 'PREMIUM COLLECTION'}
                            </div>
                            <h2 style={{ fontSize: 'clamp(18px, 3vw, 32px)', fontWeight: 800, margin: '8px 0 16px', lineHeight: 1.2 }}>
                                {settings.BannerTitle || 'ATHEA - Khơi nguồn cảm hứng'}
                            </h2>
                            <span style={{
                                display: 'inline-block',
                                background: '#ffffff',
                                color: '#000000',
                                padding: '10px 24px',
                                borderRadius: 30,
                                fontSize: 13,
                                fontWeight: 700,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                            }}>
                                {settings.BannerBtnText || 'Khám phá ngay'} →
                            </span>
                        </div>
                    </div>
                </div>

                {/* NÚT LƯU */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving || uploading}
                        style={{
                            padding: '14px 40px',
                            fontSize: 15,
                            fontWeight: 700,
                            borderRadius: 12,
                            boxShadow: '0 4px 14px rgba(200, 149, 108, 0.4)',
                        }}
                    >
                        {saving ? '🚀 Đang cập nhật Banner...' : '🚀 Lưu & Cập Nhật Banner Trang Chủ'}
                    </button>
                </div>
            </form>
        </div>
    );
}
