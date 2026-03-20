import React from 'react';
import '../../styles/PolicyPage.css';

const metaCards = [
    {
        label: 'Phiên bản áp dụng',
        value: '06/03/2026',
        detail: 'Áp dụng cho các kênh bán chính thức của Athea Design.',
    },
    {
        label: 'Khung hỗ trợ',
        value: '08:00 - 21:00',
        detail: 'Tiếp nhận tư vấn, xác nhận đơn và hỗ trợ sau mua mỗi ngày.',
    },
    {
        label: 'Phản hồi xử lý',
        value: '30 phút',
        detail: 'Áp dụng cho các yêu cầu phát sinh trong giờ làm việc.',
    },
];

const quickLinks = [
    {
        id: 'mua-hang',
        number: '01',
        label: 'Hình thức mua hàng',
        detail: 'Kênh bán chính thức và lưu ý kiểm tra hàng.',
    },
    {
        id: 'dat-hang',
        number: '02',
        label: 'Hướng dẫn đặt hàng',
        detail: 'Quy trình xác nhận đơn từ lúc chọn đến lúc nhận.',
    },
    {
        id: 'size-tu-van',
        number: '03',
        label: 'Bảng size và tư vấn',
        detail: 'Thông số size và hướng dẫn gửi số đo.',
    },
    {
        id: 'giat-bao-quan',
        number: '04',
        label: 'Giặt và bảo quản',
        detail: 'Cách chăm sóc sản phẩm để giữ màu và form.',
    },
    {
        id: 'doi-size',
        number: '05',
        label: 'Chính sách đổi size',
        detail: 'Điều kiện đổi và chi phí vận chuyển.',
    },
    {
        id: 'hoan-tien',
        number: '06',
        label: 'Hoàn tiền và đổi mới',
        detail: 'Trường hợp áp dụng và quy trình xử lý.',
    },
    {
        id: 'bao-hanh',
        number: '07',
        label: 'Bảo hành 90 ngày',
        detail: 'Phạm vi cam kết chất lượng sau mua.',
    },
    {
        id: 'giao-hang',
        number: '08',
        label: 'Thanh toán và giao hàng',
        detail: 'Phí ship, thời gian giao và lưu ý nhận hàng.',
    },
    {
        id: 'uu-dai',
        number: '09',
        label: 'Ưu đãi thành viên',
        detail: 'Quyền lợi theo hạng sau khi mua hàng.',
    },
    {
        id: 'cam-ket',
        number: '10',
        label: 'Cam kết dịch vụ',
        detail: 'Cam kết vận hành và hỗ trợ sau mua.',
    },
];

const purchaseChannels = [
    {
        icon: '📱',
        title: 'Fanpage',
        description: (
            <>
                Nhắn tin trực tiếp qua Facebook Fanpage <strong>Athea Design</strong>.
            </>
        ),
    },
    {
        icon: '💬',
        title: 'Zalo',
        description: (
            <>
                Nhắn Zalo số <strong>0933 184 999</strong> để được tư vấn và đặt hàng.
            </>
        ),
    },
    {
        icon: '🛍️',
        title: 'Shopee / TikTok',
        description: 'Đặt hàng qua sàn thương mại điện tử chính thức của Athea.',
    },
    {
        icon: '🏬',
        title: 'Showroom',
        description: 'Mua trực tiếp tại cửa hàng để xem chất liệu và form sản phẩm trước khi chốt đơn.',
    },
];

const orderSteps = [
    {
        number: '1',
        title: 'Chọn sản phẩm và size',
        description: 'Xem bảng size chi tiết hoặc nhắn Athea để được tư vấn theo số đo thực tế.',
    },
    {
        number: '2',
        title: 'Gửi thông tin xác nhận',
        description: 'Cung cấp tên, số điện thoại, địa chỉ, sản phẩm, size, màu và hình thức thanh toán.',
    },
    {
        number: '3',
        title: 'Athea xác nhận đơn',
        description: 'Đơn hàng được chốt lại qua tin nhắn và chuẩn bị giao trong 1-2 ngày làm việc.',
    },
    {
        number: '4',
        title: 'Nhận hàng và kiểm tra',
        description: 'Khách được mở kiện trước mặt shipper; nếu sai hoặc lỗi có thể từ chối nhận ngay.',
    },
];

const sizeRows = [
    { size: 'S', height: '153-158cm', weight: '46-52kg', bust: '80-84cm', waist: '62-66cm' },
    { size: 'M', height: '156-162cm', weight: '51-57kg', bust: '84-88cm', waist: '66-70cm' },
    { size: 'L', height: '160-165cm', weight: '56-63kg', bust: '88-93cm', waist: '70-75cm' },
];

const sizeTips = [
    'Gửi số đo vòng ngực, vòng eo, vòng mông và chiều cao để được tư vấn chính xác hơn.',
    'Athea ưu tiên chốt size theo form dáng thực tế, không chỉ dựa vào cân nặng.',
    'Nếu phân vân giữa hai size, đội ngũ tư vấn sẽ gợi ý theo kiểu mặc ôm hoặc mặc thoải mái.',
];

const careInstructions = [
    { icon: '🌡️', label: 'Giặt nước lạnh không quá 30°C' },
    { icon: '🧤', label: 'Ưu tiên giặt tay nhẹ' },
    { icon: '🔄', label: 'Lộn trái khi giặt máy' },
    { icon: '☀️', label: 'Phơi nơi thoáng, tránh nắng gắt' },
    { icon: '🧴', label: 'Dùng nước xả vải nhẹ' },
    { icon: '🚫', label: 'Không giặt khô' },
    { icon: '💨', label: 'Là ở nhiệt độ thấp, lộn trái' },
    { icon: '⏳', label: 'Không ngâm quá 15 phút' },
];

const exchangeConditions = [
    'Trong vòng 7 ngày kể từ khi khách nhận hàng.',
    'Sản phẩm còn nguyên tem, chưa giặt và chưa qua sử dụng.',
    'Đổi sang size còn hàng hoặc sản phẩm khác có cùng giá trị.',
    'Mỗi sản phẩm được hỗ trợ đổi size một lần.',
];

const exchangeFees = [
    'Athea chịu phí ship chiều khách gửi lại.',
    'Khách thanh toán chiều nhận hàng mới, khoảng 25.000đ - 35.000đ.',
];

const refundCases = [
    'Sản phẩm lỗi sản xuất: rách, bung chỉ hoặc lỗi đường may.',
    'Màu sắc thực tế lệch rõ so với ảnh đăng bán.',
    'Giao sai sản phẩm hoặc sai size so với đơn khách đã xác nhận.',
];

const refundProcess = [
    'Phản hồi trong 30 phút giờ làm việc, từ 08:00 đến 21:00.',
    'Khách gửi ảnh hoặc video chứng minh lỗi qua Zalo hoặc Fanpage.',
    'Hoàn tất đổi mới hoặc hoàn tiền trong 3-5 ngày làm việc.',
];

const warrantyPromises = [
    'Không phai màu rõ rệt sau 15 lần giặt đúng hướng dẫn.',
    'Không bai dão hoặc mất form sau 30 lần mặc.',
    'Không bung chỉ, tuột đường may trong quá trình sử dụng thông thường.',
];

const shippingRows = [
    { area: 'Nội thành HN/HCM', carrier: 'GHN / GHTK', fee: '20.000đ', time: '1-2 ngày' },
    { area: 'Tỉnh thành khác', carrier: 'GHN / GHTK', fee: '30.000đ', time: '2-4 ngày' },
    { area: 'Vùng xa / hải đảo', carrier: 'Bưu điện', fee: '35.000đ', time: '4-7 ngày' },
];

const shippingNotes = [
    'Chốt đơn trước 14h để được xuất kho trong ngày.',
    'Khách được mở kiện trước khi thanh toán.',
    'Phí khu vực đặc thù sẽ được báo lại trước khi xác nhận đơn.',
];

const memberTiers = [
    {
        name: 'Member',
        threshold: 'Đã mua hàng',
        tone: 'member',
        benefits: 'Tặng voucher sinh nhật và nhận ưu đãi sớm theo từng đợt.',
    },
    {
        name: 'Silver',
        threshold: 'Từ 3 đơn hàng',
        tone: 'silver',
        benefits: 'Ưu tiên vào các đợt flash sale riêng và nhận thông tin khuyến mại trước.',
    },
    {
        name: 'Gold',
        threshold: 'Từ 7 đơn hàng',
        tone: 'gold',
        benefits: 'Quà tặng đặc biệt, preview bộ sưu tập mới và quyền lợi ưu tiên cao nhất.',
    },
];

const commitments = [
    {
        icon: '🛡️',
        title: 'Chính hãng 100%',
        description: 'Thiết kế và sản xuất độc quyền theo tiêu chuẩn của Athea.',
    },
    {
        icon: '📦',
        title: 'Đóng gói cẩn thận',
        description: 'Hộp carton chắc chắn, sạch và đi kèm thông tin bảo hành.',
    },
    {
        icon: '⚡',
        title: 'Phản hồi nhanh',
        description: 'Xử lý khiếu nại hoặc hỗ trợ sau mua trong 30-60 phút.',
    },
    {
        icon: '🔄',
        title: 'Đổi size linh hoạt',
        description: 'Quy trình rõ ràng, dễ theo dõi và có hỗ trợ vận chuyển hai chiều.',
    },
];

function PolicySection({ id, number, title, subtitle, children }) {
    return (
        <section id={id} className="policy-poster">
            <div className="policy-poster-header">
                <div className="policy-poster-number">{number}</div>
                <div className="policy-poster-copy">
                    <div className="policy-poster-eyebrow">ATHEA DESIGN</div>
                    <h2 className="policy-poster-title">{title}</h2>
                    <p className="policy-poster-subtitle">{subtitle}</p>
                </div>
            </div>
            <div className="policy-poster-body">{children}</div>
        </section>
    );
}

const ShoppingPolicyPage = () => {
    return (
        <div className="policy-page-container" id="policy-top">
            <div className="policy-page-inner">
                <header className="policy-hero">
                    <div className="policy-hero-brandblock">
                        <div className="policy-hero-brandmark">
                            <span className="policy-hero-brand-main">ATHEA</span>
                            <span className="policy-hero-brand-sub">DESIGN</span>
                        </div>
                        <div className="policy-hero-rule" />
                        <p className="policy-hero-note">
                            Thông tin áp dụng cho đơn hàng tại fanpage, Zalo, showroom và các kênh bán chính thức của Athea Design.
                        </p>
                    </div>

                    <div className="policy-hero-content">
                        <span className="policy-hero-kicker">Chính sách mua sắm</span>
                        <h1 className="policy-page-title">Chính sách mua sắm và khuyến mại</h1>
                        <p className="policy-page-lead">
                            Tổng hợp thông tin mua hàng, đổi trả, bảo hành, giao nhận và quyền lợi thành viên để khách hàng dễ theo dõi trong suốt quá trình mua sắm.
                        </p>

                        <div className="policy-meta-grid">
                            {metaCards.map((card) => (
                                <article key={card.label} className="policy-meta-card">
                                    <span className="policy-meta-label">{card.label}</span>
                                    <strong className="policy-meta-value">{card.value}</strong>
                                    <p className="policy-meta-detail">{card.detail}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </header>

                <div className="policy-marquee" aria-label="Các điểm nổi bật">
                    <span>Kiểm tra hàng trước khi thanh toán</span>
                    <span>Đổi size trong 7 ngày</span>
                    <span>Bảo hành chất lượng 90 ngày</span>
                    <span>Ưu đãi thành viên theo hạng</span>
                </div>

                <nav className="policy-quick-nav" aria-label="Điều hướng nội dung">
                    <div className="policy-quick-nav-header">
                        <p className="policy-quick-nav-label">Mục lục</p>
                        <p className="policy-quick-nav-text">
                            Chọn nhanh phần thông tin cần xem.
                        </p>
                    </div>

                    <div className="policy-quick-nav-grid">
                        {quickLinks.map((item) => (
                            <a key={item.id} href={`#${item.id}`} className="policy-quick-link">
                                <span className="policy-quick-link-number">{item.number}</span>
                                <span className="policy-quick-link-copy">
                                    <span className="policy-quick-link-label">{item.label}</span>
                                    <span className="policy-quick-link-detail">{item.detail}</span>
                                </span>
                            </a>
                        ))}
                    </div>
                </nav>

                <div className="policy-stack">
                    <PolicySection
                        id="mua-hang"
                        number="01"
                        title="Hình thức mua hàng"
                        subtitle="Các kênh mua sắm chính thức và lưu ý kiểm tra hàng khi nhận đơn."
                    >
                        <div className="policy-channel-grid">
                            {purchaseChannels.map((item) => (
                                <article key={item.title} className="policy-feature-card">
                                    <div className="policy-feature-icon" aria-hidden="true">
                                        {item.icon}
                                    </div>
                                    <h3>{item.title}</h3>
                                    <p>{item.description}</p>
                                </article>
                            ))}
                        </div>

                        <div className="policy-callout">
                            <strong>Kiểm tra hàng trước khi thanh toán.</strong> Khách được mở kiện trước mặt shipper và có thể từ chối nếu giao sai hoặc có lỗi.
                        </div>
                    </PolicySection>

                    <PolicySection
                        id="dat-hang"
                        number="02"
                        title="Hướng dẫn đặt hàng"
                        subtitle="Quy trình xác nhận đơn từ lúc chọn sản phẩm đến khi khách nhận hàng."
                    >
                        <div className="policy-step-grid">
                            {orderSteps.map((step) => (
                                <article key={step.number} className="policy-step-card">
                                    <div className="policy-step-number">{step.number}</div>
                                    <div className="policy-step-copy">
                                        <h3>{step.title}</h3>
                                        <p>{step.description}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </PolicySection>

                    <PolicySection
                        id="size-tu-van"
                        number="03"
                        title="Bảng size và tư vấn"
                        subtitle="Bảng size tham khảo và hướng dẫn gửi số đo để được tư vấn phù hợp."
                    >
                        <div className="policy-split-grid">
                            <div className="policy-table-card">
                                <div className="policy-table-scroll">
                                    <table className="policy-table">
                                        <thead>
                                            <tr>
                                                <th>Size</th>
                                                <th>Chiều cao</th>
                                                <th>Cân nặng</th>
                                                <th>Vòng ngực</th>
                                                <th>Vòng eo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sizeRows.map((row) => (
                                                <tr key={row.size}>
                                                    <td>{row.size}</td>
                                                    <td>{row.height}</td>
                                                    <td>{row.weight}</td>
                                                    <td>{row.bust}</td>
                                                    <td>{row.waist}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <aside className="policy-side-panel">
                                <h3>Tư vấn size</h3>
                                <ul className="policy-list">
                                    {sizeTips.map((tip) => (
                                        <li key={tip}>{tip}</li>
                                    ))}
                                </ul>
                            </aside>
                        </div>
                    </PolicySection>

                    <PolicySection
                        id="giat-bao-quan"
                        number="04"
                        title="Giặt và bảo quản"
                        subtitle="Hướng dẫn chăm sóc sản phẩm để giữ màu, form và điều kiện bảo hành."
                    >
                        <div className="policy-care-grid">
                            {careInstructions.map((item) => (
                                <article key={item.label} className="policy-care-card">
                                    <div className="policy-care-icon" aria-hidden="true">
                                        {item.icon}
                                    </div>
                                    <p>{item.label}</p>
                                </article>
                            ))}
                        </div>

                        <div className="policy-callout policy-callout-soft">
                            Bảo quản đúng cách giúp sản phẩm giữ màu và form trong suốt <strong>thời gian bảo hành 90 ngày</strong>. Vi phạm hướng dẫn giặt sẽ không được áp dụng bảo hành.
                        </div>
                    </PolicySection>

                    <PolicySection
                        id="doi-size"
                        number="05"
                        title="Chính sách đổi size"
                        subtitle="Điều kiện đổi size và trách nhiệm vận chuyển của hai bên."
                    >
                        <div className="policy-dual-grid">
                            <div className="policy-side-panel">
                                <h3>Điều kiện đổi size</h3>
                                <ul className="policy-list">
                                    {exchangeConditions.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="policy-side-panel policy-side-panel-accent">
                                <h3>Chi phí vận chuyển</h3>
                                <ul className="policy-list">
                                    {exchangeFees.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </PolicySection>

                    <PolicySection
                        id="hoan-tien"
                        number="06"
                        title="Hoàn tiền và đổi mới"
                        subtitle="Điều kiện áp dụng hoàn tiền hoặc đổi mới khi phát sinh lỗi hoặc sai đơn."
                    >
                        <div className="policy-dual-grid">
                            <div className="policy-side-panel">
                                <h3>Các trường hợp áp dụng</h3>
                                <ul className="policy-list">
                                    {refundCases.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="policy-side-panel">
                                <h3>Quy trình xử lý</h3>
                                <ol className="policy-process-list">
                                    {refundProcess.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    </PolicySection>

                    <PolicySection
                        id="bao-hanh"
                        number="07"
                        title="Bảo hành chất lượng 90 ngày"
                        subtitle="Phạm vi cam kết chất lượng và chính sách hỗ trợ trong thời gian bảo hành."
                    >
                        <div className="policy-promise-grid">
                            {warrantyPromises.map((item) => (
                                <article key={item} className="policy-promise-card">
                                    <span className="policy-promise-badge">Cam kết</span>
                                    <p>{item}</p>
                                </article>
                            ))}
                        </div>

                        <div className="policy-callout">
                            <strong>Nếu phát sinh lỗi trong 90 ngày:</strong> Athea hỗ trợ đổi mới hoặc hoàn lại 50% giá trị sản phẩm theo từng trường hợp xác minh.
                        </div>
                    </PolicySection>

                    <PolicySection
                        id="giao-hang"
                        number="08"
                        title="Thanh toán và giao hàng"
                        subtitle="Thời gian giao dự kiến, phí vận chuyển và lưu ý khi nhận hàng."
                    >
                        <div className="policy-split-grid">
                            <div className="policy-table-card">
                                <div className="policy-table-scroll">
                                    <table className="policy-table">
                                        <thead>
                                            <tr>
                                                <th>Khu vực</th>
                                                <th>Đơn vị</th>
                                                <th>Phí ship</th>
                                                <th>Thời gian</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {shippingRows.map((row) => (
                                                <tr key={row.area}>
                                                    <td>{row.area}</td>
                                                    <td>{row.carrier}</td>
                                                    <td>{row.fee}</td>
                                                    <td>{row.time}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <aside className="policy-side-panel">
                                <h3>Ghi chú giao hàng</h3>
                                <ul className="policy-list">
                                    {shippingNotes.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </aside>
                        </div>
                    </PolicySection>

                    <PolicySection
                        id="uu-dai"
                        number="09"
                        title="Ưu đãi thành viên"
                        subtitle="Quyền lợi thành viên theo hạng và các ưu đãi áp dụng sau mua."
                    >
                        <div className="policy-member-grid">
                            {memberTiers.map((item) => (
                                <article key={item.name} className={`policy-member-card policy-member-${item.tone}`}>
                                    <div className="policy-member-tier">{item.name}</div>
                                    <div className="policy-member-threshold">{item.threshold}</div>
                                    <p>{item.benefits}</p>
                                </article>
                            ))}
                        </div>
                    </PolicySection>

                    <PolicySection
                        id="cam-ket"
                        number="10"
                        title="Cam kết dịch vụ"
                        subtitle="Cam kết vận hành của Athea với đơn hàng và trải nghiệm sau mua."
                    >
                        <div className="policy-commitment-grid">
                            {commitments.map((item) => (
                                <article key={item.title} className="policy-commitment-card">
                                    <div className="policy-commitment-icon" aria-hidden="true">
                                        {item.icon}
                                    </div>
                                    <h3>{item.title}</h3>
                                    <p>{item.description}</p>
                                </article>
                            ))}
                        </div>
                    </PolicySection>
                </div>

                <footer className="policy-footer">
                    <div>
                        <p className="policy-footer-tagline">ATHEA DESIGN</p>
                        <p className="policy-footer-copy">
                            Fanpage: Athea Design · Zalo: 0933 184 999 · Hỗ trợ mỗi ngày từ 08:00 đến 21:00
                        </p>
                    </div>
                    <a href="#policy-top" className="policy-footer-link">
                        Lên đầu trang
                    </a>
                </footer>
            </div>
        </div>
    );
};

export default ShoppingPolicyPage;
