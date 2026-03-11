import { useEffect, useMemo, useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axiosConfig';


function VariantCard({ item }) {
    const navigate = useNavigate();
    const displayPrice = item.isOnSale && item.salePrice ? item.salePrice : item.basePrice;
    const hasDiscount = item.isOnSale && item.salePrice;
    const discountPercent = hasDiscount ? Math.round(((item.basePrice - item.salePrice) / item.basePrice) * 100) : 0;

    return (
        <div className="vcard" onClick={() => navigate(`/san-pham/${item.slug}${item.colorId ? `?color=${item.colorId}` : ''}`)}>
            <div className="vcard-img">
                {item.mainImageUrl
                    ? <img src={item.mainImageUrl} alt={item.productName} loading="lazy" />
                    : <div className="vcard-placeholder">🖼️</div>
                }
                <div className="vcard-labels">
                    {item.isNew && <span className="label-new">NEW</span>}
                    {item.isOnSale && <span className="label-sale">SALE</span>}
                    {hasDiscount && discountPercent > 0 && <span className="label-percent">-{discountPercent}%</span>}
                </div>
            </div>
            <div className="vcard-body">
                <div className="vcard-price">
                    {hasDiscount ? (
                        <>
                            <span className="vcard-price-sale">{displayPrice.toLocaleString('vi-VN')}₫</span>
                            <span className="vcard-price-origin">{item.basePrice.toLocaleString('vi-VN')}₫</span>
                        </>
                    ) : (
                        <span className="vcard-price-normal">{displayPrice?.toLocaleString('vi-VN')}₫</span>
                    )}
                </div>
                <div className="vcard-name">{item.productName}</div>
                {item.colorHex && (
                    <div className="vcard-color-dot">
                        <span style={{ background: item.colorHex }} title={item.colorName} />
                    </div>
                )}
            </div>
        </div>
    );
}


const SORT_OPTIONS = [
    { value: 'default', label: 'Mặc định' },
    { value: 'price-asc', label: 'Giá tăng dần' },
    { value: 'price-desc', label: 'Giá giảm dần' },
    { value: 'name-asc', label: 'Tên A - Z' },
];

export default function ProductListPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const filter = searchParams.get('filter');        // 'new' | 'sale' | null
    const categoryId = searchParams.get('categoryId');
    const searchQuery = searchParams.get('search');
    const sort = searchParams.get('sort') || 'default';

    const [allItems, setAllItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSort, setShowSort] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 20;

    const sortRef = useRef();

    useEffect(() => {
        api.get('/Category').then(({ data }) => setCategories(data)).catch(() => { });
    }, []);

    useEffect(() => {
        setLoading(true);
        let params = new URLSearchParams();
        if (categoryId) params.set('categoryId', categoryId);
        if (filter === 'new') params.set('isNew', 'true');
        if (filter === 'sale') params.set('isOnSale', 'true');

        api.get(`/Product/variants-list?${params}`)
            .then(({ data }) => {
                let list = Array.isArray(data) ? data : [];
                
                // Search Logic
                if (searchQuery) {
                    const q = searchQuery.toLowerCase().trim();
                    
                    // 1. Kiểm tra Slug khớp chuẩn trước
                    const slugMatch = list.filter(item => item.slug && item.slug.toLowerCase() === q);
                    
                    if (slugMatch.length > 0) {
                        list = slugMatch;
                    } else {
                        // 2. Nếu không khớp slug chuẩn, tìm theo tên liên quan
                        list = list.filter(item => 
                            item.productName.toLowerCase().includes(q) ||
                            (item.categoryName && item.categoryName.toLowerCase().includes(q))
                        );
                    }
                }

                setAllItems(list);
                setCurrentPage(1); // Reset về trang 1 khi load data mới
            })
            .catch(() => setAllItems([]))
            .finally(() => setLoading(false));
    }, [filter, categoryId, searchQuery]);

    // Close sort dropdown on outside click
    useEffect(() => {
        const handler = e => { if (sortRef.current && !sortRef.current.contains(e.target)) setShowSort(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const sortedItems = useMemo(() => {
        const list = [...allItems];
        if (sort === 'price-asc') list.sort((a, b) => (a.salePrice || a.basePrice) - (b.salePrice || b.basePrice));
        else if (sort === 'price-desc') list.sort((a, b) => (b.salePrice || b.basePrice) - (a.salePrice || a.basePrice));
        else if (sort === 'name-asc') list.sort((a, b) => a.productName.localeCompare(b.productName, 'vi'));
        return list;
    }, [allItems, sort]);

    // Logic Phân trang
    const totalItems = sortedItems.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const paginatedItems = sortedItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const setParam = (key, value) => {
        const next = new URLSearchParams(searchParams);
        if (value) next.set(key, value); else next.delete(key);
        setSearchParams(next);
        setCurrentPage(1); // Reset về trang 1 khi đổi sắp xếp
    };

    const activeCategory = categories.find(c => String(c.id) === categoryId);
    let pageTitle = activeCategory?.name
        ?? (filter === 'new' ? 'Sản phẩm mới' : filter === 'sale' ? 'Sản phẩm giảm giá' : 'Tất cả sản phẩm');
    
    if (searchQuery) {
        pageTitle = `Kết quả tìm kiếm cho: "${searchQuery}"`;
    }
    const sortLabel = SORT_OPTIONS.find(o => o.value === sort)?.label || 'Sắp xếp';

    const FILTERS = [
        { id: 'all', label: 'TẤT CẢ SẢN PHẨM' },
        { id: 'new', label: 'SẢN PHẨM MỚI' },
        { id: 'sale', label: 'SALE OFF' },
    ];
    const currentFilter = filter || 'all';
    const expanded = {
        all: !searchQuery && currentFilter === 'all',
        new: !searchQuery && currentFilter === 'new',
        sale: !searchQuery && currentFilter === 'sale'
    };

    const handleHeaderClick = (id) => {
        if (id === 'all') {
            setSearchParams({});
        } else {
            setSearchParams({ filter: id });
        }
        setCurrentPage(1);
    };

    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Close on location change
    useEffect(() => { setIsFilterOpen(false); }, [filter, categoryId]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="plp-wrapper">
            {/* Mobile Filter Backdrop */}
            {isFilterOpen && <div className="plp-filter-backdrop" onClick={() => setIsFilterOpen(false)} />}
            
            <aside className={`plp-sidebar ${isFilterOpen ? 'open' : ''}`}>
                <div className="plp-sidebar-mobile-header">
                    <h3>BỘ LỌC</h3>
                    <button onClick={() => setIsFilterOpen(false)}>✕</button>
                </div>
                
                {FILTERS.map(f => (
                    <div key={f.id} className="plp-sidebar-section">
                        <button className="plp-sidebar-header" onClick={() => handleHeaderClick(f.id)}>
                            {f.label}
                            <span className="plp-sidebar-icon">{expanded[f.id] ? '−' : '+'}</span>
                        </button>
                        {expanded[f.id] && (
                            <ul className="plp-sidebar-list">
                                <li>
                                    <Link
                                        to={f.id === 'all' ? '/san-pham' : `/san-pham?filter=${f.id}`}
                                        className={`plp-sidebar-link ${!categoryId && filter === (f.id === 'all' ? null : f.id) && (f.id === 'all' ? !filter : true) ? 'active' : ''}`}
                                    >
                                        Tất cả
                                    </Link>
                                </li>
                                {categories.map(c => (
                                    <li key={c.id}>
                                        <Link
                                            to={`/san-pham?categoryId=${c.id}${f.id !== 'all' ? `&filter=${f.id}` : ''}`}
                                            className={`plp-sidebar-link ${String(c.id) === categoryId && (filter === f.id || (f.id === 'all' && !filter)) ? 'active' : ''}`}
                                        >
                                            {c.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </aside>

            <main className="plp-main">
                <header className="plp-toolbar">
                    <div className="plp-toolbar-left">
                        <h1 className="plp-toolbar-name">
                            {pageTitle} <span className="plp-toolbar-count">({totalItems} sản phẩm)</span>
                        </h1>
                    </div>

                    <div className="plp-toolbar-right">
                        <button className="plp-filter-btn" onClick={() => setIsFilterOpen(true)}>
                            Bộ lọc
                        </button>
                        <div className="plp-sort" ref={sortRef}>
                            <button className="plp-sort-btn" onClick={() => setShowSort(s => !s)}>
                                {sortLabel} ▾
                            </button>
                            {showSort && (
                                <div className="plp-sort-menu">
                                    {SORT_OPTIONS.map(o => (
                                        <button
                                            key={o.value}
                                            className={`plp-sort-option ${sort === o.value ? 'active' : ''}`}
                                            onClick={() => { setParam('sort', o.value === 'default' ? null : o.value); setShowSort(false); }}>
                                            {o.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Grid */}
                {
                    loading ? (
                        <div className="loading" style={{ paddingTop: 80 }}>⏳ Đang tải...</div>
                    ) : totalItems === 0 ? (
                        <div className="empty-state" style={{ paddingTop: 80 }}>
                            <div className="empty-icon">📂</div>
                            <p>Không có sản phẩm nào</p>
                            <button onClick={() => setSearchParams({})}
                                style={{ color: 'var(--pub-accent)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 12 }}>
                                ← Xem tất cả
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="vcard-grid">
                                {paginatedItems.map((item, i) => <VariantCard key={`${item.productId}-${item.colorId ?? i}`} item={item} />)}
                            </div>

                            {/* Pagination UI */}
                            {totalPages > 1 && (
                                <div className="pagination-athea">
                                    <button 
                                        className="page-btn" 
                                        disabled={currentPage === 1}
                                        onClick={() => handlePageChange(currentPage - 1)}
                                    >
                                        ❮
                                    </button>
                                    
                                    {[...Array(totalPages)].map((_, i) => {
                                        const pageNum = i + 1;
                                        // Chỉ hiển thị tối đa 5 trang xung quanh trang hiện tại nếu quá nhiều trang
                                        if (totalPages > 7) {
                                            if (pageNum !== 1 && pageNum !== totalPages && (pageNum < currentPage - 1 || pageNum > currentPage + 1)) {
                                                if (pageNum === currentPage - 2 || pageNum === currentPage + 2) return <span key={pageNum}>...</span>;
                                                return null;
                                            }
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                                                onClick={() => handlePageChange(pageNum)}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    <button 
                                        className="page-btn" 
                                        disabled={currentPage === totalPages}
                                        onClick={() => handlePageChange(currentPage + 1)}
                                    >
                                        ❯
                                    </button>
                                </div>
                            )}
                        </>
                    )
                }
            </main >
        </div >
    );
}
