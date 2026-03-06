import { useEffect, useMemo, useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axiosConfig';


function VariantCard({ item }) {
    const navigate = useNavigate();
    const displayPrice = item.isOnSale && item.salePrice ? item.salePrice : item.basePrice;
    const hasDiscount = item.isOnSale && item.salePrice;
    const discountPercent = hasDiscount ? Math.round(((item.basePrice - item.salePrice) / item.basePrice) * 100) : 0;

    return (
        <div className="vcard" onClick={() => navigate(`/san-pham/${item.productSlug}${item.colorId ? `?color=${item.colorId}` : ''}`)}>
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
                            <span className="vcard-price-sale">{displayPrice.toLocaleString('vi-VN')}</span>
                            <span className="vcard-price-origin">{item.basePrice.toLocaleString('vi-VN')}</span>
                        </>
                    ) : (
                        <span className="vcard-price-normal">{displayPrice?.toLocaleString('vi-VN')}</span>
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
    const sort = searchParams.get('sort') || 'default';

    const [allItems, setAllItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSort, setShowSort] = useState(false);
    const sortRef = useRef();

    useEffect(() => {
        api.get('/Category').then(({ data }) => setCategories(data)).catch(() => { });
    }, []);

    useEffect(() => {
        let params = new URLSearchParams();
        if (categoryId) params.set('categoryId', categoryId);
        if (filter === 'new') params.set('isNew', 'true');
        if (filter === 'sale') params.set('isOnSale', 'true');

        api.get(`/Product/variants-list?${params}`)
            .then(({ data }) => setAllItems(Array.isArray(data) ? data : []))
            .catch(() => setAllItems([]))
            .finally(() => setLoading(false));
    }, [filter, categoryId]);

    // Close sort dropdown on outside click
    useEffect(() => {
        const handler = e => { if (sortRef.current && !sortRef.current.contains(e.target)) setShowSort(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const items = useMemo(() => {
        const list = [...allItems];
        if (sort === 'price-asc') return list.sort((a, b) => (a.salePrice || a.basePrice) - (b.salePrice || b.basePrice));
        if (sort === 'price-desc') return list.sort((a, b) => (b.salePrice || b.basePrice) - (a.salePrice || a.basePrice));
        if (sort === 'name-asc') return list.sort((a, b) => a.productName.localeCompare(b.productName, 'vi'));
        return list;
    }, [allItems, sort]);

    const setParam = (key, value) => {
        const next = new URLSearchParams(searchParams);
        if (value) next.set(key, value); else next.delete(key);
        setSearchParams(next);
    };

    const activeCategory = categories.find(c => String(c.id) === categoryId);
    const pageTitle = activeCategory?.name
        ?? (filter === 'new' ? 'Sản phẩm mới' : filter === 'sale' ? 'Sản phẩm giảm giá' : 'Tất cả sản phẩm');
    const sortLabel = SORT_OPTIONS.find(o => o.value === sort)?.label || 'Sắp xếp';

    const FILTERS = [
        { id: 'all', label: 'TẤT CẢ SẢN PHẨM' },
        { id: 'new', label: 'SẢN PHẨM MỚI' },
        { id: 'sale', label: 'SALE OFF' },
    ];
    const currentFilter = filter || 'all';
    const expanded = {
        all: currentFilter === 'all',
        new: currentFilter === 'new',
        sale: currentFilter === 'sale'
    };

    const handleHeaderClick = (id) => {
        if (id === 'all') {
            setSearchParams({});
        } else {
            setSearchParams({ filter: id });
        }
    };

    return (
        <div className="plp-wrapper">
            <aside className="plp-sidebar">
                {FILTERS.map(f => (
                    <div key={f.id} className="plp-sidebar-section">
                        <button className="plp-sidebar-header" onClick={() => handleHeaderClick(f.id)}>
                            {f.label}
                            <span className="plp-sidebar-icon">{expanded[f.id] ? '−' : '+'}</span>
                        </button>
                        {expanded[f.id] && (
                            <ul className="plp-sidebar-list">
                                {f.id === 'all' && (
                                    <li>
                                        <Link to="/san-pham" className={`plp-sidebar-link ${!categoryId && !filter ? 'active' : ''}`}>
                                            Tất cả
                                        </Link>
                                    </li>
                                )}
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
                <header className="plp-header" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    borderBottom: '1px solid var(--pub-border)',
                    paddingBottom: 15,
                    marginBottom: 30
                }}>
                    <h1 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                        {pageTitle} <span style={{ fontWeight: 400, color: 'var(--pub-muted)', marginLeft: 8, textTransform: 'none' }}>({items.length} sản phẩm)</span>
                    </h1>

                    <div className="plp-sort" ref={sortRef} style={{ marginBottom: 0 }}>
                        <button className="plp-sort-btn" onClick={() => setShowSort(s => !s)}>
                            = {sortLabel}
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
                </header>

                {/* Grid */}
                {
                    loading ? (
                        <div className="loading" style={{ paddingTop: 80 }}>⏳ Đang tải...</div>
                    ) : items.length === 0 ? (
                        <div className="empty-state" style={{ paddingTop: 80 }}>
                            <div className="empty-icon">📂</div>
                            <p>Không có sản phẩm nào</p>
                            <button onClick={() => setSearchParams({})}
                                style={{ color: 'var(--pub-accent)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 12 }}>
                                ← Xem tất cả
                            </button>
                        </div>
                    ) : (
                        <div className="vcard-grid">
                            {items.map((item, i) => <VariantCard key={`${item.productId}-${item.colorId ?? i}`} item={item} />)}
                        </div>
                    )
                }
            </main >
        </div >
    );
}
