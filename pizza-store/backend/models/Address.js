// backend/models/Address.js

const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',                           // links to User collection
      required: [true, 'User is required'],
    },
    houseNumber: {
      type: String,
      required: [true, 'House number is required'],
      trim: true,
    },
    street: {
      type: String,
      required: [true, 'Street is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
    },
    landmark: {
      type: String,
      trim: true,                            // optional field
    },
    isDefault: {
      type: Boolean,
      default: false,                        // not default address initially
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Address', addressSchema);