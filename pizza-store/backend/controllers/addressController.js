// backend/controllers/addressController.js

const Address = require('../models/Address');
const asyncHandler = require('express-async-handler');


// Get all addresses of logged in user
const getAddresses = asyncHandler(async (req, res) => {

  const addresses = await Address.find({ userId: req.user._id });

  res.status(200).json({
    success: true,
    count: addresses.length,
    data: addresses,
  });

});


// Add new address
const addAddress = asyncHandler(async (req, res) => {

  const { houseNumber, street, city, state, pincode, landmark, isDefault } = req.body;

  if (!houseNumber || !street || !city || !state || !pincode) {
    res.status(400);
    throw new Error('Please provide all required address fields');
  }

  // If new address is default, remove default from others
  if (isDefault) {
    await Address.updateMany(
      { userId: req.user._id },
      { isDefault: false }
    );
  }

  const address = await Address.create({
    userId: req.user._id,
    houseNumber,
    street,
    city,
    state,
    pincode,
    landmark,
    isDefault: isDefault || false,
  });

  res.status(201).json({
    success: true,
    message: 'Address added successfully!',
    data: address,
  });

});


// Delete address
const deleteAddress = asyncHandler(async (req, res) => {

  const address = await Address.findById(req.params.id);

  if (!address) {
    res.status(404);
    throw new Error('Address not found');
  }

  // Only owner can delete their address
  if (address.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this address');
  }

  await Address.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Address deleted successfully!',
  });

});


// Set default address
const setDefaultAddress = asyncHandler(async (req, res) => {

  // Remove default from all addresses
  await Address.updateMany(
    { userId: req.user._id },
    { isDefault: false }
  );

  // Set this one as default
  const address = await Address.findByIdAndUpdate(
    req.params.id,
    { isDefault: true },
    { new: true }
  );

  if (!address) {
    res.status(404);
    throw new Error('Address not found');
  }

  res.status(200).json({
    success: true,
    message: 'Default address updated!',
    data: address
  });

});


module.exports = {
  getAddresses,
  addAddress,
  deleteAddress,
  setDefaultAddress
};