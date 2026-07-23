/**
 * Tự động biến đổi URL ảnh sang kích thước tối ưu cho Web (Responsive CDN Image)
 * @param {string} url - URL gốc của ảnh (Cloudinary, Haravan/Shopify, Vercel Blob...)
 * @param {number} width - Kích thước chiều rộng mong muốn (Mặc định 600px cho Product Card)
 * @returns {string} - URL ảnh đã được nén & resize tối ưu
 */
export function getOptimizedImageUrl(url, width = 600) {
    if (!url || typeof url !== 'string') return url || '';

    // 1. Xử lý Cloudinary URL -> Chèn w_600,q_auto,f_auto
    if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
        // Kiểm tra xem đã có param transformation chưa
        if (!url.includes('/w_')) {
            return url.replace('/upload/', `/upload/w_${width},c_limit,q_auto,f_auto/`);
        }
        return url;
    }

    // 2. Xử lý Haravan / Shopify CDN (hstatic.net) -> Chèn _600x600
    if (url.includes('hstatic.net') || url.includes('cdn.shopify.com')) {
        if (!url.includes(`_${width}x`)) {
            return url.replace(/(\.[a-z]+)(\?.*)?$/i, `_${width}x${width}$1$2`);
        }
        return url;
    }

    return url;
}
