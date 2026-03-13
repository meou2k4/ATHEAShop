const prisma = require('../config/db');
const slugify = require('../utils/slugify');

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
    // Tuỳ chọn: xóa ảnh khỏi Cloudinary nếu có publicId
    await prisma.productImage.delete({ where: { id: imageId } });
    res.status(204).send();
};

module.exports = {
    getAll, getVariantList, getById, getBySlug, create, update, remove,
    addVariant, updateVariant, deleteVariant,
    addImage, updateImage, deleteImage,
};
