import { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';

const DEFAULT_KEYS = [
    { key: 'Hotline', label: '📞 Hotline', placeholder: '' },
    { key: 'Zalo', label: '💬 Zalo', placeholder: 'https://zalo.me/...' },
    { key: 'Facebook', label: '👍 Facebook', placeholder: 'https://facebook.com/...' },
    { key: 'ContactEmail', label: '✉️ Email Liên Hệ', placeholder: 'cskh@athea.vn' },
    { key: 'CompanyAddress', label: '🏢 Địa chỉ Trụ sở', placeholder: 'Tầng 1, Toà nhà ATHEA...' },
    { key: 'GoogleMapHtml', label: '🗺️ Mã nhúng Google Map (Iframe)', placeholder: '<iframe src="..."></iframe>' },
];

export default function SettingsPage() {
    const [settings, setSettings] = useState({});
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/Settings');
            const map = {};
            data.forEach(s => { map[s.key] = s.value; });
            setSettings(map);
        } catch { /* ignore */ }
    };
    useEffect(() => { fetchSettings(); }, []);

    const handleSave = async (e) => {
        e.preventDefault(); setSaving(true); setSuccess('');
        try {
            const payload = DEFAULT_KEYS.map(item => ({
                key: item.key,
                value: settings[item.key] || '',
                description: item.label
            }));
            await api.post('/Settings', payload);

            setSuccess('Đã lưu cài đặt thành công!');
            setTimeout(() => setSuccess(''), 3000);
        } catch { /* ignore */ } finally { setSaving(false); }
    };

    return (
        <div>
            <h2 className="page-title">⚙️ Cài đặt Liên hệ</h2>
            <div className="card" style={{ maxWidth: 600 }}>
                {success && <div className="alert alert-success">{success}</div>}
                <form onSubmit={handleSave}>
                    {DEFAULT_KEYS.map(item => (
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
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? '💾 Đang lưu...' : '💾 Lưu cài đặt'}
                    </button>
                </form>
            </div>
        </div>
    );
}

