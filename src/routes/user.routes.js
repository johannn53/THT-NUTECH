const express = require('express');
const router = express.Router();

const verifyToken = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

const { getProfile, updateProfile, uploadProfileImage, getBalance } = require('../controllers/user.controller');

router.get('/profile', verifyToken, getProfile);
router.get('/balance', verifyToken, getBalance);
router.put('/profile/update', verifyToken, updateProfile);

// UPLOAD FILE, HANDLE FORMAT FILE BIAR TIDAK THROW ERROR DALAM HTML
router.put(
  '/profile/image',
  verifyToken,
  (req, res, next) => {
    upload.single('file')(req, res, function (err) {
      if (err) {
        return res.status(400).json({
          status: 102,
          message: 'Format Image tidak sesuai',
          data: null,
        });
      }
      next();
    });
  },
  uploadProfileImage
);

module.exports = router;
