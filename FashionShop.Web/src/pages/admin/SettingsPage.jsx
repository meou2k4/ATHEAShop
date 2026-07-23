import { useEffect, useRef, useState } from 'react';
import api from '../../api/axiosConfig';
import { getOptimizedImageUrl } from '../../utils/imageHelper';

const CONTACT_KEYS = [
    { key: 'Hotline', label: '📞 Hotline', placeholder: '0901234567' },
    { key: 'Zalo', label: '💬 Zalo', placeholder: 'https://zalo.me/...' },
    { key: 'Facebook', label: '👍 Facebook', placeholder: 'https://facebook.com/...' },
    { key: 'ContactEmail', label: '✉️ Email Liên Hệ', placeholder: 'cskh@athea.vn' },
    { key: 'CompanyAddress', label: '🏢 Địa chỉ Trụ sở', placeholder: 'Tầng 1, Toà nhà ATHEA...' },
    { key: 'GoogleMapHtml', label: '🗺️ Mã nhúng Google Map (Iframe)', placeholder: '<iframe src="..."></iframe>' },
];

const BANNER_KEYS = [
    { key: 'BannerSubtitle', label: 'Tiêu đề phụ (Subtitle)', placeholder: 'Premium Collection' },
    { key: 'BannerTitle', label: 'Tiêu đề chính (Title)', placeholder: 'ATHEA - Khơi nguồn cảm hứng' },
    { key: 'BannerBtnText', label: 'Nút hành động (Button)', placeholder: 'Khám phá ngay' },
    { key: 'BannerBtnLink', label: 'Liên kết khi bấm nút', placeholder: '/san-pham' },
];

export default function SettingsPage() {
    const [settings, setSettings] = useState({});
    const [saving, setSaving] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('banner'); // 'banner' | 'contact'
    
    const bannerFileInputRef = useRef(null);

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/Settings');
            const map = {};
            data.forEach(s => { map[s.key] = s.value; });
            setSettings(map);
        } catch { /* ignore */ }
    };

    useEffect(() => { fetchSettings(); }, []);

    const handleUploadBannerFile = async (file) => {
        if (!file) return;
        setUploadingBanner(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const { data } = await api.post('/Upload/image', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (data.url) {
                setSettings(s => ({ ...s, BannerUrl: data.url }));
            }
        } catch {
            alert('Lỗi khi tải ảnh banner!');
        } finally {
            setUploadingBanner(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault(); 
        setSaving(true); 
        setSuccess('');
        
        try {
            const allKeys = [...BANNER_KEYS, ...CONTACT_KEYS, { key: 'BannerUrl', label: 'URL Banner' }];
            const payload = allKeys.map(item => ({
                key: item.key,
                value: settings[item.key] || '',
                description: item.label
            }));

            await api.post('/Settings', payload);
            setSuccess('🎉 Đã lưu cài đặt & Banner thành công!');
            setTimeout(() => setSuccess(''), 3500);
        } catch {
            alert('Có lỗi khi lưu cài đặt!');
        } finally { 
            setSaving(false); 
        }
    };

    const bannerPreviewUrl = settings.BannerUrl ? getOptimizedImageUrl(settings.BannerUrl, 1200) : '/Banner.jpg';

    return (
        <div style={{ maxWidth: 960 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 className="page-title" style={{ margin: 0 }}>⚙️ Cấu hình Website & Banner</h2>
                
                {/* Tabs */}
                <div style={{ display: 'flex', gap: 8, background: '#f1f5f9', padding: 4, borderRadius: 10 }}>
                    <button
                        className={`btn ${activeTab === 'banner' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('banner')}
                        style={{ borderRadius: 8, padding: '6px 16px', fontSize: 13 }}
                    >
                        🖼️ Banner Trang Chủ
                    </button>
                    <button
                        className={`btn ${activeTab === 'contact' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('contact')}
                        style={{ borderRadius: 8, padding: '6px 16px', fontSize: 13 }}
                    >
                        📞 Thông Tin Liên Hệ
                    </button>
                </div>
            </div>

            {success && <div className="alert alert-success" style={{ marginBottom: 20 }}>{success}</div>}

            <form onSubmit={handleSave}>
                {activeTab === 'banner' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Box Upload Banner */}
                        <div className="card">
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 0, marginBottom: 16 }}>🖼️ Hình Ảnh Banner Chính</h3>
                            
                            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    disabled={uploadingBanner}
                                    onClick={() => bannerFileInputRef.current?.click()}
                                >
                                    {uploadingBanner ? '⏳ Đang nén & Tải ảnh...' : '📤 Chọn ảnh từ máy tính'}
                                </button>
                                <input
                                    type="file"
                                    hidden
                                    ref={bannerFileInputRef}
                                    accept="image/*"
                                    onChange={e => e.target.files?.[0] && handleUploadBannerFile(e.target.files[0])}
                                />
                                <span style={{ color: '#94a3b8', fontSize: 13 }}>hoặc nhập URL trực tiếp bên dưới</span>
                            </div>

                            <div className="form-group">
                                <label>URL Ảnh Banner</label>
                                <input
                                    className="form-control"
                                    placeholder="https://athea.cloud/..."
                                    value={settings.BannerUrl || ''}
                                    onChange={e => setSettings(s => ({ ...s, BannerUrl: e.target.value }))}
                                />
                            </div>

                            {/* Live Preview Box */}
                            <div style={{ marginTop: 16 }}>
                                <label style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, display: 'block' }}>👀 Xem Trước Banner Trang Chủ Live</label>
                                <div style={{ 
                                    position: 'relative', 
                                    width: '100%', 
                                    aspectRatio: '21/9', 
                                    borderRadius: 12, 
                                    overflow: 'hidden', 
                                    background: '#1e293b' 
                                }}>
                                    <img 
                                        src={bannerPreviewUrl} 
                                        alt="Banner Preview" 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                    <div style={{ 
                                        position: 'absolute', 
                                        inset: 0, 
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' 
                                    }} />
                                    <div style={{ 
                                        position: 'absolute', 
                                        bottom: 24, 
                                        left: 24, 
                                        color: '#fff',
                                        textShadow: '0 2px 4px rgba(0,0,0,0.4)'
                                    }}>
                                        <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.9 }}>
                                            {settings.BannerSubtitle || 'PREMIUM COLLECTION'}
                                        </div>
                                        <div style={{ fontSize: 22, fontWeight: 700, margin: '4px 0 12px' }}>
                                            {settings.BannerTitle || 'ATHEA - Khơi nguồn cảm hứng'}
                                        </div>
                                        <span style={{ 
                                            background: '#fff', 
                                            color: '#000', 
                                            padding: '6px 16px', 
                                            borderRadius: 20, 
                                            fontSize: 12, 
                                            fontWeight: 700 
                                        }}>
                                            {settings.BannerBtnText || 'Khám phá ngay'} →
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Text fields for Banner */}
                        <div className="card">
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 0, marginBottom: 16 }}>✏️ Nội Dung Khẩu Hiệu & Nút Bấm Banner</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                                {BANNER_KEYS.map(item => (
                                    <div className="form-group" key={item.key}>
                                        <label>{item.label}</label>
                                        <input
                                            className="form-control"
                                            placeholder={item.placeholder}
                                            value={settings[item.key] || ''}
                                            onChange={e => setSettings(s => ({ ...s, [item.key]: e.target.value }))}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Contact Settings Tab */
                    <div className="card">
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 0, marginBottom: 16 }}>📞 Thông Tin Liên Hệ & Trụ Sở</h3>
                        {CONTACT_KEYS.map(item => (
                            <div className="form-group" key={item.key}>
                                <label>{item.label}</label>
                                {item.key === 'GoogleMapHtml' ? (
                                    <textarea
                                        className="form-control"
                                        placeholder={item.placeholder}
                                        value={settings[item.key] || ''}
                                        onChange={e => setSettings(s => ({ ...s, [item.key]: e.target.value }))}
                                        rows={4}
                                    />
                                ) : (
                                    <input
                                        className="form-control"
                                        placeholder={item.placeholder}
                                        value={settings[item.key] || ''}
                                        onChange={e => setSettings(s => ({ ...s, [item.key]: e.target.value }))}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ marginTop: 20 }}>
                    <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '12px 32px', fontSize: 14, fontWeight: 700, borderRadius: 10 }}>
                        {saving ? '💾 Đang lưu...' : '💾 Lưu tất cả cài đặt'}
                    </button>
                </div>
            </form>
        </div>
    );
}
