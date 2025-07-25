// IMPORT MODULE
const db = require('../config/db');

// GET USER PROFILE
exports.getProfile = async (req, res) => {
  try {
    // GET USER EMAIL DARI JWT TOKEN
    const email = req.user.email;

    // GET USER QUERY
    const getUser = await db.query(
      `
        SELECT email, first_name, last_name, profile_image FROM users WHERE email = $1`,
      [email]
    );

    // STORE USER DATA KE VARIABLE BARU
    const userData = getUser.rows[0];

    // VALIDASI KALO USER NOT FOUND
    if (!userData) {
      return res.status(404).json({
        status: 105,
        message: 'User tidak ditemukan',
        data: null,
      });
    }

    // RETURN RESPONSE
    return res.status(200).json({
      status: 0,
      message: 'Sukses',
      data: userData,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
      data: null,
    });
  }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    // GET USER ID FROM JWT
    const userId = req.user.id;

    // REQ BODY
    const { first_name, last_name } = req.body;

    // VALIDASI REQ BODY
    if (!first_name || !last_name) {
      return res.status(400).json({
        status: 101,
        message: 'first_name dan last_name wajib diisi',
        data: null,
      });
    }

    // UPDATE USER
    const updateUser = await db.query(
      `
        UPDATE users
       SET first_name = $1,
           last_name = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING email, first_name, last_name, profile_image`,
      [first_name, last_name, userId]
    );

    // VALIDASI GAGAL UPDATE
    if (!updateUser.rows.length) {
      return res.status(404).json({
        status: 105,
        message: 'User tidak ditemukan',
        data: null,
      });
    }

    // RETURN RESPONSE
    return res.status(200).json({
      status: 0,
      message: 'Update Profile berhasil',
      data: updateUser.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
      data: null,
    });
  }
};

// UPLOAD IMAGE PROFILE
exports.uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        status: 102,
        message: 'Format Image tidak sesuai',
        data: null,
      });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const result = await db.query(
      `UPDATE users
       SET profile_image = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING email, first_name, last_name, profile_image`,
      [imageUrl, userId]
    );

    return res.status(200).json({
      status: 0,
      message: 'Update Profile Image berhasil',
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
      data: null,
    });
  }
};

// GET BALANCE
exports.getBalance = async (req, res) => {
  try {
    // GET USER ID
    const userId = req.user.id;

    // GET BALANCE INFO DARI USER ID
    const getUserBalance = await db.query(`SELECT balance::INT FROM users WHERE id = $1`, [userId]);

    // VALIDATION USER NOT FOUND
    if (!getUserBalance.rows.length) {
      return res.status(404).json({
        status: 105,
        message: 'User tidak ditemukan',
        data: null,
      });
    }
    // RETURN RESPONSE
    return res.status(200).json({
      status: 0,
      message: 'Get Balance Berhasil',
      data: getUserBalance.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
      data: null,
    });
  }
};
