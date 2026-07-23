import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/axiosConfig';
import { getOptimizedImageUrl } from '../utils/imageHelper';

/**
 * Helper xóa dấu tiếng Việt phục vụ tìm kiếm thông minh
 */
function normalizeString(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd')
        .trim();
}

export default function PublicHeader() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    
    // Cache danh sách sản phẩm để gợi ý tức thì
    const productsCache = useRef(null);
    const searchRef = useRef(null);

    const filter = new URLSearchParams(location.search).get('filter');
    const isProductPage = location.pathname === '/san-pham';

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Pre-fetch sản phẩm để tìm kiếm tức thì
    const loadProductsCache = useCallback(async () => {
        if (productsCache.current) return productsCache.current;
        try {
            const { data } = await api.get('/Product/variants-list');
            const list = Array.isArray(data) ? data : [];
            productsCache.current = list;
            return list;
        } catch {
            return [];
        }
    }, []);

    // Close menu/suggestions on route change
    useEffect(() => { 
        setIsMobileMenuOpen(false); 
        setShowSuggestions(false);
        setSearchQuery('');
    }, [location]);

    // Handle click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced & Fast Search Logic (Hỗ trợ từ 1 ký tự)
    useEffect(() => {
        const qRaw = searchQuery.trim();
        if (!qRaw || qRaw.length < 1) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const list = await loadProductsCache();
                const qNormalized = normalizeString(qRaw);
                const qLower = qRaw.toLowerCase();

                const filtered = list.filter(p => {
                    const nameNorm = normalizeString(p.productName);
                    const catNorm = normalizeString(p.categoryName || '');
                    const slugLower = (p.slug || '').toLowerCase();

                    return (
                        nameNorm.includes(qNormalized) ||
                        catNorm.includes(qNormalized) ||
                        slugLower.includes(qLower) ||
                        (p.colorName && normalizeString(p.colorName).includes(qNormalized))
                    );
                });

                // Lọc sản phẩm trùng lặp variant
                const uniqueProducts = [];
                const seen = new Set();
                for (const item of filtered) {
                    if (!seen.has(item.productId)) {
                        seen.add(item.productId);
                        uniqueProducts.push(item);
                    }
                    if (uniqueProducts.length >= 6) break;
                }

                setSuggestions(uniqueProducts);
                setShowSuggestions(true);
                setSelectedIndex(-1);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsSearching(false);
            }
        }, 150); // Phản hồi cực nhanh 150ms

        return () => clearTimeout(timer);
    }, [searchQuery, loadProductsCache]);

    const handleSearchSubmit = (e) => {
        e?.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/san-pham?search=${encodeURIComponent(searchQuery.trim())}`);
            setShowSuggestions(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, -1));
        } else if (e.key === 'Enter') {
            if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                const p = suggestions[selectedIndex];
                navigate(`/san-pham/${p.slug}${p.colorId ? `?color=${p.colorId}` : ''}`);
                setShowSuggestions(false);
            } else {
                handleSearchSubmit();
            }
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    const navClass = (active) => `pub-nav-link ${active ? 'active' : ''}`;

    return (
        <>
            <header className={`pub-header ${scrolled ? 'scrolled' : ''}`}>
                <div className="pub-header-inner">
                    <div className="pub-header-left">
                        <Link to="/" className="pub-logo">
                            <img src="/logo.png" alt="ATHEA" />
                        </Link>
                    </div>
                    <div className="pub-header-center">
                        <nav className="pub-nav-desktop">
                            <Link to="/" className={navClass(location.pathname === '/')}>Trang chủ</Link>
                            <Link to="/san-pham" className={navClass(isProductPage && !filter)}>Sản phẩm</Link>
                            <Link to="/san-pham?filter=new" className={navClass(isProductPage && filter === 'new')}>Mới</Link>
                            <Link to="/san-pham?filter=sale" className={navClass(isProductPage && filter === 'sale')}>Sale</Link>
                        </nav>
                    </div>

                    <div className="pub-search-wrapper" ref={searchRef}>
                        <form onSubmit={handleSearchSubmit} className="pub-search-form">
                            <input
                                type="text"
                                className="pub-search-input"
                                placeholder="Tìm sản phẩm..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => {
                                    loadProductsCache();
                                    if (searchQuery.trim().length >= 1) setShowSuggestions(true);
                                }}
                                onKeyDown={handleKeyDown}
                            />
                            <button type="submit" className="pub-search-btn">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" x2="16.65" y1="21" y2="16.65"></line>
                                </svg>
                            </button>
                        </form>

                        {showSuggestions && (
                            <div className="pub-search-dropdown">
                                {isSearching ? (
                                    <div className="search-results p-2 space-y-2">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} style={{ display: 'flex', gap: 10, padding: 8, alignItems: 'center' }}>
                                                <div style={{ width: 40, height: 50, background: '#e2e8f0', borderRadius: 6, animation: 'skeleton-pulse 1.5s infinite' }} />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ width: '70%', height: 14, background: '#e2e8f0', borderRadius: 4, marginBottom: 6, animation: 'skeleton-pulse 1.5s infinite' }} />
                                                    <div style={{ width: '40%', height: 12, background: '#e2e8f0', borderRadius: 4, animation: 'skeleton-pulse 1.5s infinite' }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : suggestions.length > 0 ? (
                                    <div className="search-results">
                                        {suggestions.map((p, index) => (
                                            <div
                                                key={p.productId}
                                                className={`search-item ${index === selectedIndex ? 'selected' : ''}`}
                                                onClick={() => navigate(`/san-pham/${p.slug}${p.colorId ? `?color=${p.colorId}` : ''}`)}
                                            >
                                                <div className="search-item-img">
                                                    <img src={getOptimizedImageUrl(p.mainImageUrl, 100)} alt="" />
                                                </div>
                                                <div className="search-item-info">
                                                    <div className="search-item-name">{p.productName}</div>
                                                    <div className="search-item-price">
                                                        {p.isOnSale && p.salePrice ? (
                                                            <>
                                                                <span className="sale">{p.salePrice.toLocaleString('vi-VN')}₫</span>
                                                                <span className="old">{p.basePrice.toLocaleString('vi-VN')}₫</span>
                                                            </>
                                                        ) : (
                                                            <span>{p.basePrice.toLocaleString('vi-VN')}₫</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="search-view-all" onClick={handleSearchSubmit}>
                                            Xem tất cả kết quả cho "{searchQuery}"
                                        </div>
                                    </div>
                                ) : searchQuery.trim().length >= 1 && (
                                    <div className="search-no-results">Không tìm thấy sản phẩm nào cho "{searchQuery}"</div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="pub-header-right">
                        <button
                            className={`pub-hamburger ${isMobileMenuOpen ? 'open' : ''}`}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <span /><span /><span />
                        </button>
                    </div>
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
