// backend/models/MenuItem.js

const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,  // links to Category collection
      ref: 'Category',                        // tells Mongoose which collection
      required: [true, 'Category is required'],
    },
    image: {
      type: String,                           // stores image URL
      default: 'default-pizza.jpg',
    },
    isAvailable: {
      type: Boolean,
      default: true,                          // item is available by default
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);