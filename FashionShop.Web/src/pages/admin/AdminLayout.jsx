import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';

const navItems = [
    { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
    { to: '/admin/categories', label: 'Danh mục', icon: '🗂️' },
    { to: '/admin/products', label: 'Sản phẩm', icon: '👗' },
    { to: '/admin/properties', label: 'Màu & Kích thước', icon: '🎨' },
    { to: '/admin/settings', label: 'Cài đặt', icon: '⚙️' },
];

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };
    
    // Auto-generate a title based on the active path
    const getPageTitle = () => {
        const activeItem = navItems.find(item => item.to === location.pathname || (item.to !== '/admin' && location.pathname.startsWith(item.to)));
        return activeItem ? activeItem.label : 'Quản trị';
    };

    return (
        <div className="admin-wrapper">
            {/* 1. Mobile Top Navigation Bar */}
            <div className="admin-mobile-topbar">
                <button 
                    className="admin-hamburger" 
                    onClick={() => setIsMobileMenuOpen(true)}
                    aria-label="Menu"
                >
                    ☰
                </button>
                <div className="admin-mobile-brand">ATHEA Admin</div>
                <div style={{ width: 44 }}></div> {/* Spacer for symmetry */}
            </div>

            {/* 2. Backdrop for Mobile Drawer */}
            <div 
                className={`admin-backdrop ${isMobileMenuOpen ? 'active' : ''}`} 
                onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* 3. Sidebar (Fixed Desktop / Drawer Mobile) */}
            <aside className={`admin-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="admin-sidebar-header">
                    <img src="/logo.png" alt="ATHEA Logo" className="admin-sidebar-logo" />
                    <button 
                        className="admin-sidebar-close" 
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        ✕
                    </button>
                </div>
                
                <nav className="admin-nav-menu">
                    <div className="admin-nav-label">QUẢN LÝ CỬA HÀNG</div>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                        >
                            <span className="admin-nav-icon">{item.icon}</span>
                            <span className="admin-nav-text">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    <div className="admin-user-info">
                        <div className="admin-user-avatar">
                            {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'A'}
                        </div>
                        <div className="admin-user-details">
                            <div className="admin-user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{user?.fullName || 'Administrator'}</div>
                            <div className="admin-user-role" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{user?.email || 'admin@athea.cloud'}</div>
                        </div>
                    </div>
                    <button 
                        className="btn btn-danger btn-sm admin-mobile-logout" 
                        style={{ width: '100%', marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '8px', fontWeight: 600, borderRadius: 8 }} 
                        onClick={handleLogout}
                    >
                        <span>Đăng xuất</span> 🚪
                    </button>
                </div>
            </aside>

            {/* 4. Main Content Area */}
            <div className="admin-main-wrapper">
                {/* 4a. Desktop Header */}
                <header className="admin-desktop-header">
                    <div className="admin-header-title">
                        {getPageTitle()}
                    </div>
                </header>

                {/* 4b. Content Body */}
                <main className="admin-content-body">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
