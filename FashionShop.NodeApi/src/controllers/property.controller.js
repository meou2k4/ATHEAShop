const prisma = require('../config/db');

const getColors = async (req, res) => {
    const colors = await prisma.color.findMany({ orderBy: { name: 'asc' } });
    res.json(colors);
};

const createColor = async (req, res) => {
    try {
        let { name, hex, hexCode } = req.body;
        const finalHex = hex || hexCode;

        if (!name || !name.trim()) return res.status(400).json({ message: 'Tên màu là bắt buộc.' });
        if (!finalHex || !finalHex.trim()) return res.status(400).json({ message: 'Mã màu là bắt buộc.' });

        const trimmedName = name.trim();
        const trimmedHex = finalHex.trim();

        const existed = await prisma.color.findFirst({
            where: { name: { equals: trimmedName, mode: 'insensitive' } }
        });

        if (existed) return res.status(400).json({ message: 'Màu sắc đã tồn tại.' });

        const color = await prisma.color.create({
            data: { name: trimmedName, hex: trimmedHex }
        });
        res.json(color);
    } catch (error) {
        console.error('Create Color Error:', error);
        res.status(500).json({ message: 'Lỗi hệ thống khi thêm màu.' });
    }
};

const getSizes = async (req, res) => {
    const sizes = await prisma.size.findMany({ orderBy: { name: 'asc' } });
    res.json(sizes);
};

const createSize = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ message: 'Tên kích thước là bắt buộc.' });

        const trimmedName = name.trim();
        const existed = await prisma.size.findFirst({
            where: { name: { equals: trimmedName, mode: 'insensitive' } }
        });

        if (existed) return res.status(400).json({ message: 'Kích thước đã tồn tại.' });

        const size = await prisma.size.create({ data: { name: trimmedName } });
        res.json(size);
    } catch (error) {
        console.error('Create Size Error:', error);
        res.status(500).json({ message: 'Lỗi hệ thống khi thêm kích thước.' });
    }
};

module.exports = { getColors, createColor, getSizes, createSize };
