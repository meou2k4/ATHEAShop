const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getColors, createColor, deleteColor } = require('../controllers/property.controller');

router.get('/', getColors);
router.post('/', authenticate, requireAdmin, createColor);
router.delete('/:id', authenticate, requireAdmin, deleteColor);

module.exports = router;
