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

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({ token, email: user.email, fullName: user.fullName });
};

module.exports = { login };
