const prisma = require('../config/db');
const slugify = require('../utils/slugify');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ————— HELPERS —————
const productInclude = {
    category: true,
    variants: { include: { color: true, size: true } },
    images: { include: { color: true } },
};

const mapProduct = (p) => ({
    id: p.id,
    categoryId: p.categoryId,
    categoryName: p.category?.name,
    name: p.name,
    slug: p.slug,
    description: p.description,
    storageInstructions: p.storageInstructions,
    basePrice: +p.basePrice,
    salePrice: p.salePrice ? +p.salePrice : null,
    isActive: p.isActive,
    isNew: p.isNew,
    isOnSale: p.isOnSale,
    createdAt: p.createdAt,
    variants: (p.variants || []).map((v) => ({
        id: v.id,
        colorId: v.colorId,
        colorName: v.color?.name,
        colorHex: v.color?.hex,
        sizeId: v.sizeId,
        sizeName: v.size?.name,
        price: v.price ? +v.price : null,
        stock: v.stock,
    })),
    images: (p.images || []).map((img) => ({
        id: img.id,
        imageUrl: img.imageUrl,
        publicId: img.publicId,
        colorId: img.colorId,
        isMain: img.isMain,
    })),
});

// ————— CONTROLLERS —————

// GET /api/Product
const getAll = async (req, res) => {
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=30');
    const products = await prisma.product.findMany({
        include: productInclude,
        orderBy: { createdAt: 'desc' },
    });
    res.json(products.map(mapProduct));
};

// GET /api/Product/variants-list?categoryId=&isNew=&isOnSale=
const getVariantList = async (req, res) => {
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=30');
    const { categoryId, isNew, isOnSale } = req.query;

    const where = { isActive: true };
    if (categoryId) where.categoryId = +categoryId;
    if (isNew === 'true') where.isNew = true;
    if (isOnSale === 'true') where.isOnSale = true;

    const products = await prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: { createdAt: 'desc' },
    });

    // Tạo danh sách variant cards (FE dùng để hiển thị từng màu của sản phẩm)
    const result = [];
    for (const p of products) {
        const colorIds = [...new Set(p.variants.map((v) => v.colorId))];
        for (const colorId of colorIds) {
            const colorImages = p.images.filter((i) => i.colorId === colorId);
            const mainImg = colorImages.find((i) => i.isMain) || colorImages[0];
            const hoverImg = colorImages.find((i) => i.id !== mainImg?.id) || null;

            const colorInfo = p.variants.find((v) => v.colorId === colorId)?.color;
            const sizes = p.variants
                .filter((v) => v.colorId === colorId)
                .map((v) => ({ id: v.sizeId, name: v.size?.name }));

            result.push({
                productId: p.id,
                productName: p.name,
                slug: p.slug,
                categoryId: p.categoryId,
                categoryName: p.category?.name,
                colorId,
                colorName: colorInfo?.name,
                colorHex: colorInfo?.hex,
                basePrice: +p.basePrice,
                salePrice: p.salePrice ? +p.salePrice : null,
                isOnSale: p.isOnSale,
                isNew: p.isNew,
                mainImageUrl: mainImg?.imageUrl || null,
                hoverImageUrl: hoverImg?.imageUrl || null,
                sizes,
            });
        }
    }
    res.json(result);
};

// GET /api/Product/:id
const getById = async (req, res) => {
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=30');
    const product = await prisma.product.findUnique({
        where: { id: +req.params.id },
        include: productInclude,
    });
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
    res.json(mapProduct(product));
};

// GET /api/Product/by-slug/:slug
const getBySlug = async (req, res) => {
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=30');
    const product = await prisma.product.findUnique({
        where: { slug: req.params.slug },
        include: productInclude,
    });
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
    res.json(mapProduct(product));
};

// POST /api/Product
const create = async (req, res) => {
    const { name, categoryId, description, storageInstructions, basePrice, isActive, isNew, isOnSale, salePrice } = req.body;
    if (!name || !categoryId || basePrice === undefined)
        return res.status(400).json({ message: 'Tên, danh mục và giá gốc là bắt buộc.' });

    const slug = slugify(name) + '-' + Date.now();
    const product = await prisma.product.create({
        data: {
            name, categoryId: +categoryId, slug,
            description, storageInstructions,
            basePrice: +basePrice,
            isActive: isActive !== false,
            isNew: !!isNew, isOnSale: !!isOnSale,
            salePrice: salePrice ? +salePrice : null,
        },
        include: productInclude,
    });
    res.status(201).json(mapProduct(product));
};

// PUT /api/Product/:id
const update = async (req, res) => {
    const id = +req.params.id;
    const { name, categoryId, description, storageInstructions, basePrice, isActive, isNew, isOnSale, salePrice } = req.body;
    const existed = await prisma.product.findUnique({ where: { id } });
    if (!existed) return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });

    await prisma.product.update({
        where: { id },
        data: {
            ...(name && { name, slug: slugify(name) + '-' + id }),
            ...(categoryId && { categoryId: +categoryId }),
            description, storageInstructions,
            ...(basePrice !== undefined && { basePrice: +basePrice }),
            ...(isActive !== undefined && { isActive }),
            ...(isNew !== undefined && { isNew }),
            ...(isOnSale !== undefined && { isOnSale }),
            salePrice: salePrice ? +salePrice : null,
        },
    });
    res.status(204).send();
};

// DELETE /api/Product/:id
const remove = async (req, res) => {
    const id = +req.params.id;
    const existed = await prisma.product.findUnique({ where: { id } });
    if (!existed) return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
    await prisma.product.delete({ where: { id } });
    res.status(204).send();
};

// ————— VARIANTS —————

// POST /api/Product/:id/variants
const addVariant = async (req, res) => {
    const productId = +req.params.id;
    const { colorId, sizeId, price, stock } = req.body;
    if (!colorId || !sizeId) return res.status(400).json({ message: 'Màu và size là bắt buộc.' });
    try {
        const variant = await prisma.productVariant.create({
            data: { productId, colorId: +colorId, sizeId: +sizeId, price: price ? +price : null, stock: +(stock || 0) },
        });
        res.json({ message: 'Thêm biến thể thành công!', variantId: variant.id });
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

// PUT /api/Product/:id/variants/:variantId
const updateVariant = async (req, res) => {
    const variantId = +req.params.variantId;
    const { price, stock } = req.body;
    const existed = await prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!existed) return res.status(404).json({ message: 'Không tìm thấy biến thể.' });
    await prisma.productVariant.update({
        where: { id: variantId },
        data: { price: price ? +price : null, stock: +(stock || 0) },
    });
    res.status(204).send();
};

// DELETE /api/Product/:id/variants/:variantId
const deleteVariant = async (req, res) => {
    const variantId = +req.params.variantId;
    const existed = await prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!existed) return res.status(404).json({ message: 'Không tìm thấy biến thể.' });
    await prisma.productVariant.delete({ where: { id: variantId } });
    res.status(204).send();
};

// ————— IMAGES —————

// POST /api/Product/:id/images
const addImage = async (req, res) => {
    const productId = +req.params.id;
    const { imageUrl, colorId, isMain, publicId } = req.body;
    if (!imageUrl) return res.status(400).json({ message: 'URL ảnh là bắt buộc.' });
    
    try {
        // Kiểm tra xem đã có đủ 5 ảnh cho màu sắc này chưa
        const imageCount = await prisma.productImage.count({
            where: {
                productId: productId,
                colorId: colorId ? +colorId : null
            }
        });

        if (imageCount >= 5) {
            return res.status(400).json({ message: 'Đã đạt giới hạn tối đa 5 ảnh cho màu sắc này.' });
        }

        const image = await prisma.productImage.create({
            data: { productId, imageUrl, publicId, colorId: colorId ? +colorId : null, isMain: !!isMain },
        });
        res.json({ message: 'Thêm hình ảnh thành công!', imageId: image.id });
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

// PUT /api/Product/:id/images/:imageId
const updateImage = async (req, res) => {
    const imageId = +req.params.imageId;
    const { imageUrl, colorId, isMain } = req.body;
    const existed = await prisma.productImage.findUnique({ where: { id: imageId } });
    if (!existed) return res.status(404).json({ message: 'Không tìm thấy ảnh.' });
    await prisma.productImage.update({
        where: { id: imageId },
        data: { imageUrl, colorId: colorId ? +colorId : null, isMain: !!isMain },
    });
    res.status(204).send();
};

// DELETE /api/Product/:id/images/:imageId
const deleteImage = async (req, res) => {
    const imageId = +req.params.imageId;
    const existed = await prisma.productImage.findUnique({ where: { id: imageId } });
    if (!existed) return res.status(404).json({ message: 'Không tìm thấy ảnh.' });
    
    // Tự động xoá file ảnh tương ứng trên Cloudinary nếu có publicId
    if (existed.publicId && existed.imageUrl?.includes('cloudinary.com')) {
        try {
            await cloudinary.uploader.destroy(existed.publicId);
        } catch (err) {
            console.error('Lỗi khi xoá ảnh trên Cloudinary:', err);
        }
    }

    await prisma.productImage.delete({ where: { id: imageId } });
    res.status(204).send();
};

// GET /api/Product/share/:slug
const shareProduct = async (req, res) => {
    try {
        const rawSlug = req.params.slug || '';
        // Decode URI and remove color search params if present
        const cleanSlug = decodeURIComponent(rawSlug).split('?')[0];

        const product = await prisma.product.findFirst({
            where: {
                OR: [
                    { slug: cleanSlug },
                    { slug: { startsWith: cleanSlug } }
                ]
            },
            include: productInclude,
        });

        const frontendDomain = 'https://www.athea.vn';

        if (!product) {
            return res.redirect(`${frontendDomain}/san-pham`);
        }

        const mainImg = product.images.find(i => i.isMain) || product.images[0];
        let imageUrl = mainImg?.imageUrl || `${frontendDomain}/Banner.jpg`;
        
        // Optimize Cloudinary image for OG sharing preview
        if (imageUrl.includes('res.cloudinary.com') && !imageUrl.includes('/w_')) {
            imageUrl = imageUrl.replace('/upload/', '/upload/w_1200,c_limit,q_auto,f_auto/');
        }

        const pageTitle = `${product.name} | ATHEA - Thời Trang Nữ Cao Cấp`;
        const priceStr = product.isOnSale && product.salePrice 
            ? `${product.salePrice.toLocaleString('vi-VN')}₫` 
            : `${product.basePrice.toLocaleString('vi-VN')}₫`;

        const description = product.description 
            ? `${priceStr} - ${product.description.replace(/<[^>]*>?/gm, '').slice(0, 150)}` 
            : `${product.name} - Giá ${priceStr}. Mua ngay tại ATHEA Thời Trang Nữ Cao Cấp.`;

        const targetUrl = `${frontendDomain}/san-pham/${product.slug}`;

        const html = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle}</title>
    <meta name="description" content="${description}">
    
    <!-- OpenGraph for Zalo / Facebook / Messenger / iMessage -->
    <meta property="og:site_name" content="ATHEA - Thời Trang Nữ Cao Cấp">
    <meta property="og:type" content="product">
    <meta property="og:title" content="${pageTitle}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:secure_url" content="${imageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:url" content="${targetUrl}">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${pageTitle}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">

    <!-- Auto redirect human visitors to frontend SPA -->
    <meta http-equiv="refresh" content="0;url=${targetUrl}">
</head>
<body>
    <p>Đang chuyển hướng đến <a href="${targetUrl}">${product.name}</a>...</p>
    <script>window.location.href = "${targetUrl}";</script>
</body>
</html>`;

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
        res.status(200).send(html);
    } catch (err) {
        console.error('Share product error:', err);
        res.redirect('https://www.athea.vn/san-pham');
    }
};

module.exports = {
    getAll, getVariantList, getById, getBySlug, create, update, remove,
    addVariant, updateVariant, deleteVariant,
    addImage, updateImage, deleteImage, shareProduct,
};
