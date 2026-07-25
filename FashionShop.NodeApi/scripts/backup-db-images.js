const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function runBackup() {
    console.log('🔄 Đang bắt đầu sao lưu dữ liệu đường dẫn hình ảnh...');
    
    try {
        const [images, variants, settings] = await Promise.all([
            prisma.productImage.findMany(),
            prisma.productVariant.findMany(),
            prisma.setting.findMany(),
        ]);

        const backupData = {
            timestamp: new Date().toISOString(),
            totalProductImages: images.length,
            totalVariants: variants.length,
            totalSettings: settings.length,
            data: {
                productImages: images.map(i => ({ id: i.id, productId: i.productId, colorId: i.colorId, imageUrl: i.imageUrl, publicId: i.publicId, isMain: i.isMain })),
                productVariants: variants.filter(v => v.variantImageUrl).map(v => ({ id: v.id, productId: v.productId, variantImageUrl: v.variantImageUrl })),
                settings: settings.filter(s => s.key.includes('Banner') || s.key.includes('Image') || s.value?.startsWith('http')).map(s => ({ id: s.id, key: s.key, value: s.value, description: s.description })),
            }
        };

        const backupDir = path.join(__dirname, '..', 'backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(backupDir, `backup-images-${dateStr}.json`);

        fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf8');

        console.log(`✅ Sao lưu thành công! File lưu tại:\n   ${backupPath}`);
        console.log(`📊 Thống kê: ${images.length} ảnh sản phẩm, ${variants.filter(v => v.variantImageUrl).length} ảnh biến thể, ${backupData.data.settings.length} ảnh cấu hình.`);
        
        return backupPath;
    } catch (error) {
        console.error('❌ Lỗi khi sao lưu dữ liệu:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

if (require.main === module) {
    runBackup();
}

module.exports = { runBackup };
