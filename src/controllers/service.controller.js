const db = require('../config/db');

// GET ALL SERVICES
exports.getServices = async (req, res) => {
  try {
    // GET ALL SERVICE DATA
    const getAllServices = await db.query(
      `SELECT service_code, service_name, service_icon, service_tariff::int AS service_tariff FROM services`
    );

    // RETURN RESPONSE
    return res.status(200).json({
      status: 0,
      message: 'Sukses',
      data: getAllServices.rows,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
      data: null,
    });
  }
};
