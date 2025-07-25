const db = require('../config/db');

exports.getBanner = async (req, res) => {
  try {
    // GET BANNER FROM DB
    const getBanner = await db.query(`SELECT banner_name, banner_image, description FROM banners`);

    // RETURN RESPONSE
    return res.status(200).json({
      status: 0,
      message: 'Sukses',
      data: getBanner.rows,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
      data: null,
    });
  }
};
