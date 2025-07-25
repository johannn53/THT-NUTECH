const express = require('express');
const router = express.Router();

// IMPORT ALL ROUTES
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const bannerRoutes = require('./banner.routes');
const serviceRoutes = require('./service.routes');
const transactionRoutes = require('./transaction.routes');

// USE ALL ROUTES
router.use('/', authRoutes);
router.use('/', userRoutes);
router.use('/', bannerRoutes);
router.use('/', serviceRoutes);
router.use('/', transactionRoutes);

module.exports = router;
