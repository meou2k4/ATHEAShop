const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc.' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
        return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
        return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });

    const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'fallback-secret-for-dev-only',
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret) {
        console.error('CRITICAL: JWT_REFRESH_SECRET is not defined in environment variables.');
        return res.status(500).json({ message: 'Lỗi cấu hình server (Thiếu JWT Secret).' });
    }

    const refreshToken = jwt.sign(
        { id: user.id },
        refreshSecret,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    // Lưu refresh token vào database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Mặc định 7 ngày

    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: expiresAt
        }
    });

    return res.json({ 
        token: accessToken, 
        refreshToken, 
        email: user.email, 
        fullName: user.fullName 
    });
};

const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;

    if (!refreshSecret) {
        console.error('CRITICAL: JWT_REFRESH_SECRET is not defined.');
        return res.status(500).json({ message: 'Lỗi cấu hình server.' });
    }

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token là bắt buộc.' });
    }

    try {
        const payload = jwt.verify(refreshToken, refreshSecret);
        
        const storedToken = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true }
        });

        if (!storedToken || storedToken.expiresAt < new Date()) {
            if (storedToken) {
                await prisma.refreshToken.delete({ where: { id: storedToken.id } });
            }
            return res.status(401).json({ message: 'Refresh token không hợp lệ hoặc đã hết hạn.' });
        }

        const user = storedToken.user;
        const newAccessToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
        );

        return res.json({ token: newAccessToken });
    } catch (error) {
        return res.status(401).json({ message: 'Refresh token không hợp lệ.' });
    }
};

module.exports = { login, refreshToken };
