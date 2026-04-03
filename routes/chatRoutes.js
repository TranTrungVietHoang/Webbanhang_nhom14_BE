const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.route('/')
    .get(chatController.getMessages)
    .post(chatController.sendMessage);

module.exports = router;
