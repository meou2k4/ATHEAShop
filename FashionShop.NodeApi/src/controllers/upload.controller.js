const { put } = require('@vercel/blob');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const sharp = require('sharp');

// Cấu hình Cloudinary SDK
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// MemoryStorage lấy buffer xử lý qua Sharp trước khi đẩy lên Cloud
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Chỉ chấp nhận định dạng: jpg, jpeg, png, webp, gif'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

/**
 * Tối ưu ảnh bằng sharp trước khi upload:
 * - Auto-rotate theo EXIF
 * - Resize về max 1200px chiều rộng
 * - Convert sang WebP chất lượng 80%
 */
const optimizeImage = async (buffer, isGif = false) => {
    if (isGif) {
        return { buffer, contentType: 'image/gif', ext: 'gif' };
    }

    const optimized = await sharp(buffer)
        .rotate()
        .resize({
            width: 1200,
            withoutEnlargement: true,
            fit: 'inside',
        })
        .webp({ quality: 80 })
        .toBuffer();

    return { buffer: optimized, contentType: 'image/webp', ext: 'webp' };
};

const uploadImage = async (req, res) => {
    try {
        let rawBuffer;
        let originalName;
        let isGif = false;

        if (req.file) {
            rawBuffer = req.file.buffer;
            originalName = req.file.originalname;
            isGif = req.file.mimetype === 'image/gif';
        } else if (req.body.imageUrl) {
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

        // ── Tối ưu ảnh với Sharp ──
        const { buffer: optimizedBuffer, contentType, ext } = await optimizeImage(rawBuffer, isGif);

        const sizeBefore = rawBuffer.length;
        const sizeAfter = optimizedBuffer.length;
        console.log(`Image optimized: ${(sizeBefore / 1024).toFixed(0)}KB → ${(sizeAfter / 1024).toFixed(0)}KB (${Math.round((1 - sizeAfter / sizeBefore) * 100)}% smaller)`);

        const baseName = originalName.replace(/\.[^/.]+$/, '');
        const cleanPublicId = `${Date.now()}-${baseName}`.replace(/[^a-zA-Z0-9_-]/g, '_');

        // ── Ưu tiên Upload lên Cloudinary ──
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
            const cloudResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        folder: 'fashionshop/products',
                        public_id: cleanPublicId,
                        use_filename: true,
                        unique_filename: false,
                        resource_type: 'image',
                        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
                    },
                    (err, result) => {
                        if (err || !result) reject(err || new Error('Upload lên Cloudinary thất bại'));
                        else resolve(result);
                    }
                ).end(optimizedBuffer);
            });

            console.log('Cloudinary Upload Success:', cloudResult.secure_url);

            return res.json({
                fileName: cloudResult.public_id,
                url: cloudResult.secure_url,
                publicId: cloudResult.public_id,
                message: `Đã lưu ảnh lên Cloudinary! (${(sizeAfter / 1024).toFixed(0)}KB)`,
            });
        }

        // ── Fallback Vercel Blob ──
        const filename = `fashionshop/products/${Date.now()}-${baseName}.${ext}`;
        const blobResult = await put(filename, optimizedBuffer, {
            access: 'public',
            contentType,
        });

        console.log('Vercel Blob Upload Success:', blobResult.url);

        res.json({
            fileName: blobResult.pathname,
            url: blobResult.url,
            publicId: blobResult.pathname,
            message: `Đã lưu ảnh lên Vercel Blob! (${(sizeAfter / 1024).toFixed(0)}KB)`,
        });
    } catch (err) {
        console.error('Upload Error:', err);
        res.status(500).json({ message: 'Lỗi khi xử lý tải ảnh.', error: err.message });
    }
};

module.exports = { upload, uploadImage };
