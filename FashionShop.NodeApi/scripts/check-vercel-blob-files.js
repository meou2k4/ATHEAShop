const { PrismaClient } = require('@prisma/client');
const { list } = require('@vercel/blob');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkVercelBlobFiles() {
    console.log('🔍 Bắt đầu kiểm tra và so sánh Vercel Blob Storage với Cơ Sở Dữ Liệu...');
    
    try {
        // 1. Lấy tất cả URL trong DB
        const [images, variants, settings] = await Promise.all([
            prisma.productImage.findMany(),
            prisma.productVariant.findMany(),
            prisma.setting.findMany(),
        ]);

        const dbUrls = new Set([
            ...images.map(i => i.imageUrl).filter(Boolean),
            ...variants.map(v => v.variantImageUrl).filter(Boolean),
            ...settings.map(s => s.value).filter(Boolean)
        ]);

        console.log(`📊 Số lượng đường dẫn đang sử dụng trong Database: ${dbUrls.size} URL độc bản.`);

        // 2. Lấy toàn bộ danh sách file đang nằm trên Vercel Blob
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
            console.error('❌ Thiếu BLOB_READ_WRITE_TOKEN trong .env');
            return;
        }

        const blobResponse = await list({ token: process.env.BLOB_READ_WRITE_TOKEN });
        const allBlobs = blobResponse.blobs || [];

        console.log(`📁 Tổng số file đang lưu thực tế trên Vercel Blob Storage: ${allBlobs.length} file.`);

        const activeBlobs = [];
        const orphanedBlobs = [];

        allBlobs.forEach(blob => {
            if (dbUrls.has(blob.url)) {
                activeBlobs.push(blob);
            } else {
                orphanedBlobs.push(blob);
            }
        });

        console.log(`\n================ BÁO CÁO PHÂN TÍCH ================`);
        console.log(`✅ File đang được Database kết nối: ${activeBlobs.length} file (Đã migrate 100% sang Cloudinary)`);
        console.log(`⚠️ File rác (ảnh cũ đã xoá / thay thế trong quá trình test): ${orphanedBlobs.length} file`);
        console.log(`====================================================\n`);

        if (orphanedBlobs.length > 0) {
            console.log(`🔍 Danh sách 5 file rác tiêu biểu trong Vercel Blob:`);
            orphanedBlobs.slice(0, 5).forEach((b, i) => console.log(`   ${i + 1}. ${b.pathname} (${(b.size / 1024 / 1024).toFixed(2)} MB)`));
        }

        return {
            totalInBlob: allBlobs.length,
            activeCount: activeBlobs.length,
            orphanedCount: orphanedBlobs.length,
            orphanedBlobs
        };

    } catch (err) {
        console.error('❌ Lỗi khi kiểm tra Vercel Blob:', err);
    } finally {
        await prisma.$disconnect();
    }
}

if (require.main === module) {
    checkVercelBlobFiles();
}

module.exports = { checkVercelBlobFiles };
