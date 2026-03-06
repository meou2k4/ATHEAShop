const router = require('express').Router();
const { sendContact } = require('../controllers/contact.controller');

router.post('/', sendContact);

module.exports = router;
