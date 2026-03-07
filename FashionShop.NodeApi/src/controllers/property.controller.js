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

const deleteSize = async (req, res) => {
    try {
        const id = +req.params.id;
        const used = await prisma.productVariant.findFirst({ where: { sizeId: id } });
        if (used) return res.status(400).json({ message: 'Không thể xoá vì kích thước này đang được sử dụng.' });
        
        await prisma.size.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        console.error('Delete Size Error:', error);
        res.status(500).json({ message: 'Lỗi hệ thống khi xoá kích thước.' });
    }
};

const deleteColor = async (req, res) => {
    try {
        const id = +req.params.id;
        const used = await prisma.productVariant.findFirst({ where: { colorId: id } });
        if (used) return res.status(400).json({ message: 'Không thể xoá vì màu này đang được sử dụng.' });
        
        await prisma.color.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        console.error('Delete Color Error:', error);
        res.status(500).json({ message: 'Lỗi hệ thống khi xoá màu.' });
    }
};

module.exports = { getColors, createColor, deleteColor, getSizes, createSize, deleteSize };
