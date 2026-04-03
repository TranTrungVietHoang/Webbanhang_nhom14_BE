const express = require('express');
const router = express.Router();
const loyaltyController = require('../controllers/loyaltyController');

router.route('/')
    .get(loyaltyController.getLoyaltyProfile);

module.exports = router;
