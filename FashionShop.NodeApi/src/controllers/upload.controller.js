const cloudinary = require('../config/cloudinary');
const multer = require('multer');

// Dùng memoryStorage để upload thẳng lên Cloudinary, không lưu local
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Chỉ chấp nhận định dạng: jpg, jpeg, png, webp, gif'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

const uploadImage = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Không có file được gửi.' });

    try {
        // Upload buffer lên Cloudinary
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'fashionshop/products' },
                (error, result) => { if (error) reject(error); else resolve(result); }
            );
            stream.end(req.file.buffer);
        });

        res.json({
            fileName: result.public_id,
            url: result.secure_url, // URL public CDN của Cloudinary
            message: 'Upload thành công!',
        });
    } catch (err) {
        res.status(500).json({ message: 'Upload thất bại.', error: err.message });
    }
};

module.exports = { upload, uploadImage };
