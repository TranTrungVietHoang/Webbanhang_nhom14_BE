const express = require('express');
const router = express.Router();
const rewardsController = require('../controllers/rewardsController');

router.get('/rewards', rewardsController.getUserRewards);
router.get('/history', rewardsController.getPointsHistory);
router.get('/missions', rewardsController.getUserMissions);
router.get('/available-rewards', rewardsController.getAvailableRewards);

module.exports = router;
