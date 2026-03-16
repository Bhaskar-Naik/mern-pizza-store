const Message = require('../models/Message');
const asyncHandler = require('express-async-handler');


// Send message (admin only)
const sendMessage = asyncHandler(async (req, res) => {

  const { userId, orderId, message } = req.body;

  if (!userId || !orderId || !message) {
    res.status(400);
    throw new Error('Please provide userId, orderId and message');
  }

  const newMessage = await Message.create({
    userId,
    orderId,
    message,
  });

  res.status(201).json({
    success: true,
    message: 'Message sent successfully!',
    data: newMessage,
  });

});


// Get messages for logged in user
const getUserMessages = asyncHandler(async (req, res) => {

  const messages = await Message.find({ userId: req.user._id })
    .populate('orderId', 'orderStatus totalAmount')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages,
  });

});


// Mark message as read
const markAsRead = asyncHandler(async (req, res) => {

  const message = await Message.findById(req.params.id);

  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  message.isRead = true;
  await message.save();

  res.status(200).json({
    success: true,
    message: 'Message marked as read!',
  });

});


module.exports = {
  sendMessage,
  getUserMessages,
  markAsRead
};