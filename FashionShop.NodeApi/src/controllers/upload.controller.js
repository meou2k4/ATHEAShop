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
    try {
        let result;
        if (req.file) {
            // Trường hợp 1: Upload file từ máy tính (Buffer)
            result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'fashionshop/products' },
                    (error, result) => {
                        if (error) {
                            console.error('Cloudinary Upload Error:', error);
                            reject(error);
                        } else {
                            console.log('Cloudinary Upload Success (File):', result.secure_url);
                            resolve(result);
                        }
                    }
                );
                stream.end(req.file.buffer);
            });
        } else if (req.body.imageUrl) {
            // Trường hợp 2: Truyền URL từ bên ngoài, Cloudinary sẽ fetch về lưu
            result = await cloudinary.uploader.upload(req.body.imageUrl, {
                folder: 'fashionshop/products'
            });
            console.log('Cloudinary Upload Success (URL):', result.secure_url);
        } else {
            return res.status(400).json({ message: 'Không có file hoặc URL được gửi.' });
        }

        res.json({
            fileName: result.public_id,
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            message: 'Đã lưu ảnh lên Cloudinary!',
        });
        console.log(`Image Details: ${result.width}x${result.height}, ${Math.round(result.bytes / 1024)}KB`);
    } catch (err) {
        console.error('Upload Error:', err);
        res.status(500).json({ message: 'Lỗi khi xử lý ảnh lên Cloudinary.', error: err.message });
    }
};

module.exports = { upload, uploadImage };
