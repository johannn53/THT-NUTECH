const express = require('express');
const router = express.Router();

const { topUpBalance, createTransaction, getTransactionHistory } = require('../controllers/transaction.controller');
const verifyToken = require('../middlewares/auth.middleware');

router.post('/topup', verifyToken, topUpBalance);
router.post('/transaction', verifyToken, createTransaction);
router.get('/transaction/history', verifyToken, getTransactionHistory);

module.exports = router;
