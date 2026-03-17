const express = require('express');
const router = express.Router();
const {
  getActiveCoupons, getAllCoupons, createCoupon,
  updateCoupon, deleteCoupon, validateCoupon,
} = require('../controllers/couponController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getActiveCoupons);
router.get('/all', protect, adminOnly, getAllCoupons);
router.post('/', protect, adminOnly, createCoupon);
router.put('/:id', protect, adminOnly, updateCoupon);
router.delete('/:id', protect, adminOnly, deleteCoupon);
router.post('/validate', protect, validateCoupon);

module.exports = router;