const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');

// Xử lý logic cho endpoint GET và POST
router.route('/')
    .get(couponController.getAllCoupons)
    .post(couponController.createCoupon);

// Xử lý logic cho endpoint lấy chi tiết, cập nhật và xoá theo ID
router.route('/:id')
    .get(couponController.getCouponById)
    .put(couponController.updateCoupon) // Hoặc dùng patch
    .delete(couponController.deleteCoupon);

module.exports = router;
