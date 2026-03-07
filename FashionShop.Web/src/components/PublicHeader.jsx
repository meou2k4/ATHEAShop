import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function PublicHeader() {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const filter = new URLSearchParams(location.search).get('filter');
    const isProductPage = location.pathname === '/san-pham';

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menu on route change
    useEffect(() => { setIsMobileMenuOpen(false); }, [location]);

    const navClass = (active) => `pub-nav-link ${active ? 'active' : ''}`;

    return (
        <>
            <header className={`pub-header ${scrolled ? 'scrolled' : ''}`}>
                <div className="pub-header-inner">
                    <Link to="/" className="pub-logo">
                        <img src="/logo.png" alt="ATHEA" />
                    </Link>

                    <nav className="pub-nav-desktop">
                        <Link to="/" className={navClass(location.pathname === '/')}>Trang chủ</Link>
                        <Link to="/san-pham" className={navClass(isProductPage && !filter)}>Tất cả sản phẩm</Link>
                        <Link to="/san-pham?filter=new" className={navClass(isProductPage && filter === 'new')}>Sản phẩm mới</Link>
                        <Link to="/san-pham?filter=sale" className={navClass(isProductPage && filter === 'sale')}>Sale off</Link>
                    </nav>

                    <button
                        className={`pub-hamburger ${isMobileMenuOpen ? 'open' : ''}`}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span /><span /><span />
                    </button>
                </div>
            </header>

            {/* Mobile Menu Drawer */}
            {isMobileMenuOpen && (
                <div className="pub-mobile-backdrop" onClick={() => setIsMobileMenuOpen(false)} />
            )}
            <nav className={`pub-mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
                <Link to="/" className={navClass(location.pathname === '/')}>Trang chủ</Link>
                <Link to="/san-pham" className={navClass(isProductPage && !filter)}>Tất cả sản phẩm</Link>
                <Link to="/san-pham?filter=new" className={navClass(isProductPage && filter === 'new')}>Sản phẩm mới</Link>
                <Link to="/san-pham?filter=sale" className={navClass(isProductPage && filter === 'sale')}>Sale off</Link>
                <Link to="/chinh-sach" className={navClass(location.pathname === '/chinh-sach')}>Chính sách</Link>
                <Link to="/lien-he" className={navClass(location.pathname === '/lien-he')}>Liên hệ</Link>
            </nav>
        </>
    );
}
