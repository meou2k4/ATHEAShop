const prisma = require('../config/db');
const slugify = require('../utils/slugify');

const getAll = async (req, res) => {
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    const categories = await prisma.category.findMany({ orderBy: { displayOrder: 'asc' } });
    res.json(categories);
};

const getById = async (req, res) => {
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    const cat = await prisma.category.findUnique({ where: { id: +req.params.id } });
    if (!cat) return res.status(404).json({ message: 'Không tìm thấy danh mục.' });
    res.json(cat);
};

const create = async (req, res) => {
    const { name, slug, displayOrder } = req.body;
    if (!name) return res.status(400).json({ message: 'Tên danh mục là bắt buộc.' });

    const finalSlug = slug || slugify(name);
    const existed = await prisma.category.findFirst({
        where: { OR: [{ name }, { slug: finalSlug }] },
    });
    if (existed) return res.status(400).json({ message: 'Tên hoặc slug đã tồn tại.' });

    const cat = await prisma.category.create({ 
        data: { name, slug: finalSlug, displayOrder: displayOrder || 1 } 
    });
    return res.status(201).json(cat);
};

const update = async (req, res) => {
    const { name, slug, displayOrder } = req.body;
    const id = +req.params.id;
    const existed = await prisma.category.findUnique({ where: { id } });
    if (!existed) return res.status(404).json({ message: 'Không tìm thấy danh mục.' });

    const updated = await prisma.category.update({
        where: { id },
        data: { name, slug: slug || slugify(name), displayOrder: displayOrder || 1 },
    });
    res.json(updated);
};

const remove = async (req, res) => {
    const id = +req.params.id;
    const existed = await prisma.category.findUnique({ where: { id } });
    if (!existed) return res.status(404).json({ message: 'Không tìm thấy danh mục.' });
    await prisma.category.delete({ where: { id } });
    res.status(204).send();
};

module.exports = { getAll, getById, create, update, remove };
