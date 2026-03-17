// backend/controllers/cartController.js

const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');
const asyncHandler = require('express-async-handler');


// Get cart
const getCart = asyncHandler(async (req, res) => {

  let cart = await Cart.findOne({ userId: req.user._id })
    .populate('items.itemId', 'name price image isAvailable');

  if (!cart) {
    return res.status(200).json({
      success: true,
      data: { items: [], totalAmount: 0 },
    });
  }

  res.status(200).json({ success: true, data: cart });

});


// Add item to cart
const addToCart = asyncHandler(async (req, res) => {

  const { itemId, quantity } = req.body;

  const menuItem = await MenuItem.findById(itemId);
  if (!menuItem) {
    res.status(404);
    throw new Error('Menu item not found');
  }

  if (!menuItem.isAvailable) {
    res.status(400);
    throw new Error('Menu item is not available');
  }

  let cart = await Cart.findOne({ userId: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      userId: req.user._id,
      items: [{
        itemId,
        name: menuItem.name,
        price: menuItem.price,
        quantity: quantity || 1,
      }],
      totalAmount: menuItem.price * (quantity || 1),
    });
  } else {

    // convert both ids to string for comparison
    const itemIndex = cart.items.findIndex(
      (item) => item.itemId.toString() === itemId.toString()
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity || 1;
    } else {
      cart.items.push({
        itemId,
        name: menuItem.name,
        price: menuItem.price,
        quantity: quantity || 1,
      });
    }

    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await cart.save();
  }

  res.status(200).json({
    success: true,
    message: 'Item added to cart!',
    data: cart,
  });

});


// Update item quantity
const updateCartItem = asyncHandler(async (req, res) => {

  const { quantity } = req.body;
  const { itemId } = req.params;

  if (quantity === undefined || quantity === null) {
    res.status(400);
    throw new Error('Quantity is required');
  }

  const cart = await Cart.findOne({ userId: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.itemId.toString() === itemId.toString()
  );

  if (itemIndex === -1) {
    res.status(404);
    throw new Error('Item not found in cart');
  }

  if (quantity <= 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].quantity = Number(quantity);
  }

  cart.totalAmount = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  await cart.save();

  res.status(200).json({
    success: true,
    message: 'Cart updated!',
    data: cart,
  });

});


// Remove item from cart
const removeFromCart = asyncHandler(async (req, res) => {

  const cart = await Cart.findOne({ userId: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.items = cart.items.filter(
    (item) => item.itemId.toString() !== req.params.itemId.toString()
  );

  cart.totalAmount = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  await cart.save();

  res.status(200).json({
    success: true,
    message: 'Item removed from cart!',
    data: cart,
  });

});


// Clear cart
const clearCart = asyncHandler(async (req, res) => {

  await Cart.findOneAndDelete({ userId: req.user._id });

  res.status(200).json({
    success: true,
    message: 'Cart cleared!',
  });

});


module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};