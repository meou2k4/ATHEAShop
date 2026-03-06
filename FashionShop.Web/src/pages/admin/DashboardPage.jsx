import { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';

export default function DashboardPage() {
    const [stats, setStats] = useState({ categories: 0, products: 0, colors: 0, sizes: 0 });

    useEffect(() => {
        Promise.all([
            api.get('/Category'),
            api.get('/Product'),
            api.get('/Color'),
            api.get('/Size'),
        ]).then(([cats, prods, colors, sizes]) => {
            setStats({
                categories: cats.data.length,
                products: prods.data.length,
                colors: colors.data.length,
                sizes: sizes.data.length,
            });
        }).catch(() => { /* ignore */ });
    }, []);

    const items = [
        { icon: '📁', label: 'Danh mục', value: stats.categories, color: '#6c63ff', bg: '#ede9ff' },
        { icon: '👗', label: 'Sản phẩm', value: stats.products, color: '#10b981', bg: '#d1fae5' },
        { icon: '🎨', label: 'Màu sắc', value: stats.colors, color: '#f59e0b', bg: '#fef3c7' },
        { icon: '📏', label: 'Kích thước', value: stats.sizes, color: '#ef4444', bg: '#fee2e2' },
    ];

    return (
        <div>
            <h2 className="page-title">📊 Dashboard</h2>
            <div className="stats-grid">
                {items.map((item) => (
                    <div key={item.label} className="stat-card">
                        <div className="stat-icon" style={{ background: item.bg, color: item.color }}>
                            {item.icon}
                        </div>
                        <div className="stat-info">
                            <h3 style={{ color: item.color }}>{item.value}</h3>
                            <p>{item.label}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="card">
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                    Chào mừng đến trang quản trị FashionShop! Sử dụng menu bên trái để quản lý nội dung.
                </p>
            </div>
        </div>
    );
}
