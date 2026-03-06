const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
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
