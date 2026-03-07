const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getSizes, createSize, deleteSize } = require('../controllers/property.controller');

router.get('/', getSizes);
router.post('/', authenticate, requireAdmin, createSize);
router.delete('/:id', authenticate, requireAdmin, deleteSize);

module.exports = router;
