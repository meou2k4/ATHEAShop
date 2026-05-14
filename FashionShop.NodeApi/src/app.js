const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
const allowedOrigins = [
    'https://athea.vn',
    'https://www.athea.vn',
    'https://athea.cloud',
    'https://www.athea.cloud',
    'http://localhost:3000',
    'http://localhost:5173',
];
app.use(cors({
    origin: (origin, callback) => {
        // Cho phép requests không có origin (Postman, server-to-server)
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: Origin "${origin}" không được phép.`));
    },
    credentials: true,
    optionsSuccessStatus: 204,
}));
// Xử lý preflight OPTIONS cho tất cả routes
app.options('*', cors());
app.use(express.json());

// Routes
app.use('/api/Auth', require('./routes/auth.routes'));
app.use('/api/Category', require('./routes/category.routes'));
app.use('/api/Product', require('./routes/product.routes'));
app.use('/api/Color', require('./routes/color.routes'));
app.use('/api/Size', require('./routes/size.routes'));
app.use('/api/Settings', require('./routes/settings.routes'));
app.use('/api/Contact', require('./routes/contact.routes'));
app.use('/api/Upload', require('./routes/upload.routes'));

// Health check
app.get('/', (req, res) => res.json({ message: 'ATHEA FashionShop API is running.' }));

// Xuất app để Vercel dùng làm Serverless Function
module.exports = app;

const PORT = process.env.PORT || 7299;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`➜  Local:   http://localhost:${PORT}/`);
    });
}
