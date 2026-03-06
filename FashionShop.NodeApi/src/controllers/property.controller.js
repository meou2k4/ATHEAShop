const prisma = require('../config/db');

const getColors = async (req, res) => {
    const colors = await prisma.color.findMany({ orderBy: { name: 'asc' } });
    res.json(colors);
};

const createColor = async (req, res) => {
    const { name, hex } = req.body;
    if (!name || !hex) return res.status(400).json({ message: 'Tên và mã màu là bắt buộc.' });
    const existed = await prisma.color.findUnique({ where: { name } });
    if (existed) return res.status(400).json({ message: 'Màu sắc đã tồn tại.' });
    const color = await prisma.color.create({ data: { name, hex } });
    res.json(color);
};

const getSizes = async (req, res) => {
    const sizes = await prisma.size.findMany({ orderBy: { name: 'asc' } });
    res.json(sizes);
};

const createSize = async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Tên kích thước là bắt buộc.' });
    const existed = await prisma.size.findUnique({ where: { name } });
    if (existed) return res.status(400).json({ message: 'Kích thước đã tồn tại.' });
    const size = await prisma.size.create({ data: { name } });
    res.json(size);
};

module.exports = { getColors, createColor, getSizes, createSize };
