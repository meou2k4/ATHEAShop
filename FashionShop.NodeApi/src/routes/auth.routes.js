const router = require('express').Router();
const { login, refreshToken } = require('../controllers/auth.controller');

router.post('/login', login);
router.post('/refresh-token', refreshToken);

module.exports = router;
