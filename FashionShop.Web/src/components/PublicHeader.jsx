import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function PublicHeader() {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const filter = new URLSearchParams(location.search).get('filter');
    const isProductPage = location.pathname === '/san-pham';

    const navClass = (active) => active ? 'active' : '';

    return (
        <header className="pub-header">
            <div className="container">
                <Link to="/" className="pub-logo" style={{ display: 'flex', alignItems: 'center', height: '60px' }}>
                    <img src="/logo.png" alt="ATHEA Logo" style={{ maxHeight: '120px', marginLeft: '-20px', marginTop: '7px', objectFit: 'contain', filter: 'brightness(0)' }} />
                </Link>

                <button 
                    className="mobile-menu-btn" 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? '✕' : '☰'}
                </button>

                <nav className={`pub-nav ${isMobileMenuOpen ? 'open' : ''}`}>
                    <Link to="/" className={navClass(location.pathname === '/')} onClick={() => setIsMobileMenuOpen(false)}>Trang chủ</Link>
                    <Link to="/san-pham" className={navClass(isProductPage && !filter)} onClick={() => setIsMobileMenuOpen(false)}>Tất cả sản phẩm</Link>
                    <Link to="/san-pham?filter=new" className={navClass(isProductPage && filter === 'new')} onClick={() => setIsMobileMenuOpen(false)}>Sản phẩm mới</Link>
                    <Link to="/san-pham?filter=sale" className={navClass(isProductPage && filter === 'sale')} onClick={() => setIsMobileMenuOpen(false)}>Sản phẩm giảm giá</Link>
                </nav>
            </div>
        </header>
    );
}
