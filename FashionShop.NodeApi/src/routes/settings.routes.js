const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getSettings, updateSettings } = require('../controllers/settings.controller');

router.get('/', getSettings);
router.post('/', authenticate, requireAdmin, updateSettings);

module.exports = router;
