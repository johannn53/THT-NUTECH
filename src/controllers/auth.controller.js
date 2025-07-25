// IMPORT MODULE
const db = require('../config/db');

// IMPORT LIBRARY
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// GLOBAL VARIABLE
// VALIDASI FORMAT EMAIL
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// REGISTER USER BARU
exports.register = async (req, res) => {
  try {
    try {
      // REQ BODY
      const { email, first_name, last_name, password } = req.body;

      // VALIDASI REQ BODY
      if (!email || !first_name || !last_name || !password) {
        return res.status(400).json({
          status: 101,
          message: 'Semua field wajib diisi',
          data: null,
        });
      }

      // VALIDASI FORMAT EMAIL
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          status: 102,
          message: 'Parameter email tidak sesuai format',
          data: null,
        });
      }

      // VALIDASI PANJANG PASSWORD
      if (password.length < 8) {
        return res.status(400).json({
          status: 103,
          message: 'Password minimal 8 karakter',
          data: null,
        });
      }

      // CHECK IF EMAIL REGISTERED
      const checkEmailExist = await db.query(
        `
        SELECT * FROM users WHERE email = $1`,
        [email]
      );
      if (checkEmailExist.rows.length > 0) {
        return res.status(400).json({
          status: 104,
          message: 'Email sudah terdaftar',
          data: null,
        });
      }

      // ENCRYPT PASSWORD
      const hashedPassword = await bcrypt.hash(password, 10);

      // INSERT USER DATA
      await db.query(
        `
        INSERT INTO users(email, first_name, last_name, password) 
        VALUES ($1, $2, $3, $4)`,
        [email, first_name, last_name, hashedPassword]
      );

      // RETURN RESPONSE
      return res.status(200).json({
        status: 0,
        message: 'Registrasi berhasil silahkan login',
        data: null,
      });
    } catch (error) {
      return res.status(500).json({ status: 500, message: 'Internal Server Error', data: null });
    }
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
      data: null,
    });
  }
};

exports.login = async (req, res) => {
  try {
    // REQ BODY
    const { email, password } = req.body;

    // VALIDASI REQ BODY
    if (!email || !password) {
      return res.status(400).json({
        status: 101,
        message: 'Email dan password wajib diisi',
        data: null,
      });
    }

    // VALIDASI FORMAT EMAIL
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 102,
        message: 'Parameter email tidak sesuai format',
        data: null,
      });
    }

    // VALIDASI PANJANG PASSWORD
    if (password.length < 8) {
      return res.status(400).json({
        status: 103,
        message: 'Password minimal 8 karakter',
        data: null,
      });
    }

    // GET USER BY EMAIL
    const getUser = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
    // const getUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    // VALIDASI USER NOT FOUND
    if (!getUser.rows.length) {
      return res.status(401).json({
        status: 103,
        message: 'Username atau password salah',
        data: null,
      });
    }

    // STORE USER DATA INTO NEW VARIABLE
    const userData = getUser.rows[0];

    // CEK PASSWORD VALID
    const isPasswordMatch = await bcrypt.compare(password, userData.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        status: 103,
        message: 'Username atau password salah',
        data: null,
      });
    }

    // GENERATE TOKEN
    const token = jwt.sign(
      // ISI DATA TOKEN
      {
        id: userData.id,
        email: userData.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: '12h' } // EXPIRED 12 JAM
    );

    // RETURN RESPONSE
    return res.status(200).json({
      status: 0,
      message: 'Login Sukses',
      data: { token },
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
      data: null,
    });
  }
};