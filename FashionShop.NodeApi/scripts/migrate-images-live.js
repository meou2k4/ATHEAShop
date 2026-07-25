const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;
const path = require('path');
require('dotenv').config();

const prisma = new PrismaClient();

// Cấu hình Cloudinary SDK
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

function extractFilenameWithoutExt(url) {
    if (!url) return '';
    let rawName = '';
    try {
        const urlObj = new URL(url);
        const basename = path.basename(urlObj.pathname);
        rawName = decodeURIComponent(basename.replace(/\.[^/.]+$/, ''));
    } catch {
        rawName = path.basename(url).replace(/\.[^/.]+$/, '');
    }
    return rawName.replace(/[^a-zA-Z0-9_-]/g, '_');
}

async function runLiveMigration() {
    console.log('🚀 Bắt đầu LIVE MIGRATION (Chuyển đổi dữ liệu sang Cloudinary B)...');
    console.log(`☁️ Cloudinary Account: ${process.env.CLOUDINARY_CLOUD_NAME}\n`);

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error('❌ Thiếu thông tin cấu hình CLOUDINARY trong file .env!');
        process.exit(1);
    }

    try {
        const images = await prisma.productImage.findMany({
            include: { product: { select: { name: true } } }
        });
        const settings = await prisma.setting.findMany();

        let successCount = 0;
        let skipCount = 0;
        let failCount = 0;

        // 1. Migrate ProductImages
        console.log(`📦 Đang xử lý ${images.length} ảnh sản phẩm...`);
        for (let i = 0; i < images.length; i++) {
            const img = images[i];
            const originalUrl = img.imageUrl;

            if (!originalUrl || originalUrl.includes('res.cloudinary.com')) {
                console.log(`[${i + 1}/${images.length}] ⏭️ Bỏ qua (Đã trên Cloudinary): ${img.product?.name || 'Sản phẩm'}`);
                skipCount++;
                continue;
            }

            const publicIdName = extractFilenameWithoutExt(originalUrl);
            console.log(`[${i + 1}/${images.length}] ⏳ Đang tải sang Cloudinary B: "${img.product?.name || 'Sản phẩm'}" (${publicIdName})...`);

            try {
                const res = await cloudinary.uploader.upload(originalUrl, {
                    folder: 'fashionshop/products',
                    public_id: publicIdName,
                    use_filename: true,
                    unique_filename: false,
                    overwrite: true,
                });

                // Cập nhật database với URL Cloudinary mới
                await prisma.productImage.update({
                    where: { id: img.id },
                    data: {
                        imageUrl: res.secure_url,
                        publicId: res.public_id,
                    }
                });

                console.log(`   ✅ Thành công! Link mới: ${res.secure_url}`);
                successCount++;
            } catch (err) {
                console.error(`   ❌ Lỗi khi đẩy ảnh ID ${img.id}:`, err.message);
                failCount++;
            }
        }

        // 2. Migrate Settings (Banner...)
        console.log(`\n⚙️ Đang xử lý các đường dẫn trong Settings...`);
        const bannerSettings = settings.filter(s => s.key.includes('Banner') || s.key.includes('Image') || s.value?.startsWith('http'));
        for (let i = 0; i < bannerSettings.length; i++) {
            const s = bannerSettings[i];
            const originalUrl = s.value;

            if (!originalUrl || originalUrl.includes('res.cloudinary.com')) {
                skipCount++;
                continue;
            }

            const publicIdName = extractFilenameWithoutExt(originalUrl);
            console.log(`[Setting: ${s.key}] ⏳ Đang tải sang Cloudinary B...`);

            try {
                const res = await cloudinary.uploader.upload(originalUrl, {
                    folder: 'fashionshop/settings',
                    public_id: publicIdName,
                    use_filename: true,
                    unique_filename: false,
                    overwrite: true,
                });

                await prisma.setting.update({
                    where: { id: s.id },
                    data: { value: res.secure_url }
                });

                console.log(`   ✅ Thành công! ${s.key} -> ${res.secure_url}`);
                successCount++;
            } catch (err) {
                console.error(`   ❌ Lỗi setting ${s.key}:`, err.message);
                failCount++;
            }
        }

        console.log(`\n🎉 HOÀN THÀNH LIVE MIGRATION!`);
        console.log(`📊 Thống kê:`);
        console.log(`   - Thành công: ${successCount} file`);
        console.log(`   - Bỏ qua (Đã trên Cloudinary): ${skipCount} file`);
        console.log(`   - Thất bại: ${failCount} file\n`);

    } catch (error) {
        console.error('❌ Lỗi trong quá trình Live Migration:', error);
    } finally {
        await prisma.$disconnect();
    }
}

if (require.main === module) {
    runLiveMigration();
}

module.exports = { runLiveMigration };
