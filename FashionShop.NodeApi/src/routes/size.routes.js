const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getSizes, createSize } = require('../controllers/property.controller');

router.get('/', getSizes);
router.post('/', authenticate, requireAdmin, createSize);

module.exports = router;
