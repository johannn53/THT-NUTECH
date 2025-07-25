const express = require('express');
const router = express.Router();

const { getServices } = require('../controllers/service.controller');

router.get('/services', getServices);

module.exports = router;
