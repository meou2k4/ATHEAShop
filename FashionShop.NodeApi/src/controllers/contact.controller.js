const nodemailer = require('nodemailer');

const sendContact = async (req, res) => {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message)
        return res.status(400).json({ message: 'Tên, email và nội dung là bắt buộc.' });

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: +process.env.EMAIL_PORT,
            secure: false,
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: process.env.EMAIL_USER,
            subject: `[Liên hệ ATHEA] Từ ${name}`,
            html: `
        <h2>Thông tin liên hệ mới</h2>
        <p><strong>Họ tên:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Số điện thoại:</strong> ${phone || 'Không cung cấp'}</p>
        <p><strong>Nội dung:</strong></p>
        <p>${message}</p>
      `,
        });

        res.json({ message: 'Gửi thông tin liên hệ thành công!' });
    } catch (err) {
        res.status(500).json({ message: 'Có lỗi xảy ra khi gửi email.', error: err.message });
    }
};

module.exports = { sendContact };
