const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getColors, createColor } = require('../controllers/property.controller');

router.get('/', getColors);
router.post('/', authenticate, requireAdmin, createColor);

module.exports = router;
