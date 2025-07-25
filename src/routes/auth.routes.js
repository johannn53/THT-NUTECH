const express = require('express');
const router = express.Router();

const { register, login } = require('../controllers/auth.controller');

router.post('/registration', register);
router.post('/login', login);

module.exports = router;
