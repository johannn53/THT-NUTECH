const db = require('../config/db');

// TOP UP BALANCE
exports.topUpBalance = async (req, res) => {
  try {
    // GET USER ID DARI JWT
    const userId = req.user.id;

    // REQ BODY
    const { top_up_amount } = req.body;

    // VALIDASI top_up_amount
    if (top_up_amount === undefined || typeof top_up_amount !== 'number' || top_up_amount <= 0) {
      return res.status(400).json({
        status: 102,
        message: 'Parameter amount hanya boleh angka dan tidak boleh lebih kecil dari 0',
        data: null,
      });
    }

    // UPDATE USER BALANCE
    const updateUserBalance = await db.query(
      `UPDATE users
        SET balance = balance + $1,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING BALANCE`,
      [top_up_amount, userId]
    );

    // ADD DATA KE TRANSACTION TABLE
    await db.query(
      `INSERT INTO transactions (user_id, transaction_type, amount, description)
        VALUES ($1, $2, $3, $4)`,
      [userId, 'TOPUP', top_up_amount, 'Top up saldo']
    );

    // RETURN RESPONSE
    return res.status(200).json({
      status: 0,
      message: 'Top Up Balance berhasil',
      data: {
        balance: updateUserBalance.rows[0].balance,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
      data: null,
    });
  }
};

// CREATE TRANSACTION
exports.createTransaction = async (req, res) => {
  const client = await db.connect(); // START TRANSACTION
  try {
    // GET USER ID FROM JWT
    const userId = req.user.id;

    const { service_code: rawServiceCode } = req.body;

    if (!rawServiceCode) {
      return res.status(400).json({
        status: 102,
        message: 'Parameter service_code dibutuhkan',
        data: null,
      });
    }

    // UPPERCASE SERVICE CODE
    const service_code = rawServiceCode.toUpperCase();

    // BEGIN (BUAT HINDARIN RACE CONDITION)
    await client.query('BEGIN');

    // AMBIL SERVICE
    const serviceResult = await client.query(`SELECT * FROM services WHERE service_code = $1`, [service_code]);
    if (!serviceResult.rows.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        status: 102,
        message: 'Service ataus Layanan tidak ditemukan',
        data: null,
      });
    }

    const service = serviceResult.rows[0];

    // LOCK USER BALANCE
    const userResult = await client.query(`SELECT balance FROM users WHERE id = $1 FOR UPDATE`, [userId]);
    const balance = userResult.rows[0].balance;

    // KALKULASI & VALIDASI BALANCE USER
    if (balance < service.service_tariff) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        status: 104,
        message: 'Saldo tidak cukup',
        data: null,
      });
    }

    // FORMAT INVOICE ex: INV1753334484300-342
    const invoiceNumber = `INV${Date.now()}-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')}`;

    const transactionResult = await client.query(
      `INSERT INTO transactions
        (user_id, transaction_type, amount, service_code, service_name, invoice_number, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING created_at`,
      [
        userId,
        'PAYMENT',
        service.service_tariff,
        service.service_code,
        service.service_name,
        invoiceNumber,
        `Pembayaran layanan ${service.service_name}`,
      ]
    );

    await client.query(
      `UPDATE users 
        SET balance = balance - $1,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $2`,
      [service.service_tariff, userId]
    );

    await client.query('COMMIT');

    return res.status(200).json({
      status: 0,
      message: 'Transaksi berhasil',
      data: {
        invoice_number: invoiceNumber,
        service_code: service.service_code,
        service_name: service.service_name,
        transaction_type: 'PAYMENT',
        total_amount: service.service_tariff,
        created_on: transactionResult.rows[0].created_at,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    return res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
      data: null,
    });
  } finally {
    client.release(); // RELEASE CONNECTION
  }
};

// GET TRANSACTION HISTORIES
exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    // SET OFFSET & LIMIT
    const offset = parseInt(req.query.offset) || 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : null;

    // QUERY UNTUK AMBIL TRASACTIONS DATA
    let query = `SELECT invoice_number, transaction_type, description, amount AS total_amount, created_at AS created_on 
                 FROM transactions 
                 WHERE user_id = $1 
                 ORDER BY created_at DESC`;

    // PARAMS QUERY
    const params = [userId];

    // VALIDASI KALAU LIMIT TIDAK ADA
    if (limit !== null) {
      query += ` LIMIT $2 OFFSET $3`;
      params.push(limit, offset);
    }

    // AMBIL TRANSACTION HISTORY
    const transactionHistoryData = await db.query(query, params);

    // RETURN RESPONSE
    return res.status(200).json({
      status: 0,
      message: 'Get History Berhasil',
      data: {
        offset,
        limit: limit ?? transactionHistoryData.rows.length,
        records: transactionHistoryData.rows,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
      data: null,
    });
  }
};
