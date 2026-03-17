const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getUserMessages,
  markAsRead,
} = require('../controllers/messageController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, adminOnly, sendMessage);
router.get('/', protect, getUserMessages);
router.put('/:id/read', protect, markAsRead);

module.exports = router;