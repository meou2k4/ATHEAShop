
const { put } = require('@vercel/blob');
const multer = require('multer');

// Dùng memoryStorage để lấy file buffer đẩy thẳng lên Vercel Blob
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Chỉ chấp nhận định dạng: jpg, jpeg, png, webp, gif'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

const uploadImage = async (req, res) => {
    try {
        let result;

        if (req.file) {
            // Trường hợp 1: Upload file từ máy tính
            const filename = `fashionshop/products/${Date.now()}-${req.file.originalname}`;
            result = await put(filename, req.file.buffer, {
                access: 'public',
                contentType: req.file.mimetype,
            });
            console.log('Vercel Blob Upload Success (File):', result.url);
        } else if (req.body.imageUrl) {
            // Trường hợp 2: Truyền URL từ bên ngoài, tải về rồi đẩy lên Blob
            const response = await fetch(req.body.imageUrl);
            if (!response.ok) throw new Error(`Không thể fetch ảnh từ URL: ${response.statusText}`);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
            const urlObj = new URL(req.body.imageUrl);
            const originalName = urlObj.pathname.split('/').pop() || 'image.jpg';
            const filename = `fashionshop/products/${Date.now()}-${originalName}`;

            result = await put(filename, buffer, {
                access: 'public',
                contentType: response.headers.get('content-type') || 'image/jpeg',
            });
            console.log('Vercel Blob Upload Success (URL):', result.url);
        } else {
            return res.status(400).json({ message: 'Không có file hoặc URL được gửi.' });
        }

        res.json({
            fileName: result.pathname,
            url: result.url,
            publicId: result.pathname,
            message: 'Đã lưu ảnh lên Vercel Blob!',
        });
    } catch (err) {
        console.error('Upload Error:', err);
        res.status(500).json({ message: 'Lỗi khi xử lý ảnh lên Vercel Blob.', error: err.message });
    }
};

module.exports = { upload, uploadImage };
