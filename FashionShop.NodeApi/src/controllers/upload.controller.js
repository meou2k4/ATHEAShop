
const { put } = require('@vercel/blob');
const multer = require('multer');
const sharp = require('sharp');

// Dùng memoryStorage để lấy file buffer rồi xử lý trước khi đẩy lên Vercel Blob
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Chỉ chấp nhận định dạng: jpg, jpeg, png, webp, gif'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

/**
 * Tối ưu ảnh bằng sharp trước khi upload:
 * - Convert sang WebP (giảm 60–80% dung lượng so với PNG/JPG)
 * - Resize về max 1200px chiều rộng (giữ tỷ lệ, không phóng to)
 * - Chất lượng 82% — không nhìn thấy sự khác biệt trên web
 */
const optimizeImage = async (buffer, isGif = false) => {
    if (isGif) {
        // GIF giữ nguyên để bảo toàn animation
        return { buffer, contentType: 'image/gif', ext: 'gif' };
    }

    const optimized = await sharp(buffer)
        .rotate()                          // Auto-rotate theo EXIF để tránh ảnh bị lật
        .resize({
            width: 1800,
            withoutEnlargement: true,      // Không phóng to ảnh nhỏ hơn 1800px
            fit: 'inside',
        })
        .webp({ quality: 82 })             // Convert sang WebP, chất lượng 82%
        .toBuffer();

    return { buffer: optimized, contentType: 'image/webp', ext: 'webp' };
};

/**
 * Tạo tên file mới với extension đúng, loại bỏ extension cũ
 */
const buildFilename = (originalName, ext) => {
    const base = originalName.replace(/\.[^/.]+$/, '');  // Bỏ extension cũ
    return `fashionshop/products/${Date.now()}-${base}.${ext}`;
};

const uploadImage = async (req, res) => {
    try {
        let rawBuffer;
        let originalName;
        let isGif = false;

        if (req.file) {
            // Trường hợp 1: Upload file từ máy tính
            rawBuffer = req.file.buffer;
            originalName = req.file.originalname;
            isGif = req.file.mimetype === 'image/gif';
        } else if (req.body.imageUrl) {
            // Trường hợp 2: Truyền URL từ bên ngoài, tải về rồi xử lý
            const response = await fetch(req.body.imageUrl);
            if (!response.ok) throw new Error(`Không thể fetch ảnh từ URL: ${response.statusText}`);
            const arrayBuffer = await response.arrayBuffer();
            rawBuffer = Buffer.from(arrayBuffer);

            const urlObj = new URL(req.body.imageUrl);
            originalName = urlObj.pathname.split('/').pop() || 'image.jpg';
            const ct = response.headers.get('content-type') || '';
            isGif = ct.includes('gif');
        } else {
            return res.status(400).json({ message: 'Không có file hoặc URL được gửi.' });
        }

        // ── Tối ưu ảnh ──
        const { buffer: optimizedBuffer, contentType, ext } = await optimizeImage(rawBuffer, isGif);

        const sizeBefore = rawBuffer.length;
        const sizeAfter = optimizedBuffer.length;
        console.log(`Image optimized: ${(sizeBefore / 1024).toFixed(0)}KB → ${(sizeAfter / 1024).toFixed(0)}KB (${Math.round((1 - sizeAfter / sizeBefore) * 100)}% smaller)`);

        // ── Upload lên Vercel Blob ──
        const filename = buildFilename(originalName, ext);
        const result = await put(filename, optimizedBuffer, {
            access: 'public',
            contentType,
        });

        console.log('Vercel Blob Upload Success:', result.url);

        res.json({
            fileName: result.pathname,
            url: result.url,
            publicId: result.pathname,
            message: `Đã lưu ảnh lên Vercel Blob! (${(sizeAfter / 1024).toFixed(0)}KB)`,
        });
    } catch (err) {
        console.error('Upload Error:', err);
        res.status(500).json({ message: 'Lỗi khi xử lý ảnh lên Vercel Blob.', error: err.message });
    }
};

module.exports = { upload, uploadImage };
