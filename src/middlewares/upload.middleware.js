const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, res, cb) {
    cb(null, 'uploads/'); // SIMPAN DI FOLDER UPLAODS
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  },
});
// FILTER FORMAT FILE HANYA JPG/PNG
const fileFilter = function (req, file, cb) {
  const allowedTypes = ['image/jpeg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format Image tidak sesuai'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;
