const prisma = require('../config/db');

const getSettings = async (req, res) => {
    const settings = await prisma.setting.findMany({ orderBy: { key: 'asc' } });
    res.json(settings);
};

// Upsert danh sách settings (nhận mảng [{ key, value, description }])
const updateSettings = async (req, res) => {
    const items = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ message: 'Body phải là mảng.' });

    for (const item of items) {
        await prisma.setting.upsert({
            where: { key: item.key },
            update: { value: item.value, ...(item.description ? { description: item.description } : {}) },
            create: { key: item.key, value: item.value, description: item.description },
        });
    }
    res.json({ message: 'Cập nhật cấu hình thành công!' });
};

module.exports = { getSettings, updateSettings };
