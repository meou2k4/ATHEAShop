const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { upload, uploadImage } = require('../controllers/upload.controller');

router.post('/image', authenticate, requireAdmin, upload.single('file'), uploadImage);

module.exports = router;
