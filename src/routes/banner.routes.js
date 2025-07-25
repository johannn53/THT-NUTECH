const express = require('express');
const router = express.Router();

const { getBanner } = require('../controllers/banner.controller');

router.get('/banner', getBanner);

module.exports = router;
