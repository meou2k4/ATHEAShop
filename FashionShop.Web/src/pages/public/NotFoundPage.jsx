import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFoundPage() {
    return (
        <div style={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
        }}>
            <Helmet>
                <title>404 - Trang không tồn tại | ATHEA</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            {/* Background Ambient Glow */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(200, 149, 108, 0.25) 0%, rgba(0,0,0,0) 70%)',
                borderRadius: '50%',
                pointerEvents: 'none',
            }} />

            <div style={{
                position: 'relative',
                zIndex: 2,
                maxWidth: 520,
                background: 'rgba(255, 255, 255, 0.04)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '48px 32px',
                borderRadius: 24,
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
            }}>
                <div style={{
                    fontSize: 'clamp(72px, 12vw, 110px)',
                    fontWeight: 900,
                    letterSpacing: -4,
                    background: 'linear-gradient(135deg, #c8956c 0%, #fef08a 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1,
                    marginBottom: 16,
                }}>
                    404
                </div>

                <h1 style={{
                    fontSize: 'clamp(20px, 4vw, 26px)',
                    fontWeight: 700,
                    marginBottom: 12,
                    color: '#f8fafc',
                    fontFamily: 'Playfair Display, Georgia, serif',
                }}>
                    Trang Không Tồn Tại
                </h1>

                <p style={{
                    color: '#94a3b8',
                    fontSize: 14,
                    lineHeight: 1.6,
                    marginBottom: 32,
                }}>
                    Đường dẫn bạn đang tìm kiếm có thể đã bị di chuyển, xóa bỏ hoặc không tồn tại trên hệ thống của ATHEA.
                </p>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link
                        to="/"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            background: 'var(--pub-accent, #c8956c)',
                            color: '#ffffff',
                            padding: '12px 28px',
                            borderRadius: 30,
                            fontWeight: 700,
                            fontSize: 14,
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 4px 14px rgba(200, 149, 108, 0.3)',
                        }}
                    >
                        🏠 Quay lại Trang chủ
                    </Link>

                    <Link
                        to="/san-pham"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            background: 'rgba(255, 255, 255, 0.08)',
                            color: '#f8fafc',
                            padding: '12px 24px',
                            borderRadius: 30,
                            fontWeight: 600,
                            fontSize: 14,
                            textDecoration: 'none',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        🛍️ Bộ sưu tập sản phẩm
                    </Link>
                </div>
            </div>
        </div>
    );
}
