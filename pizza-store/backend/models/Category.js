// backend/models/Category.js

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,          // no duplicate categories
      trim: true,
    },
  },
  {
    timestamps: true,        // auto adds createdAt
  }
);

module.exports = mongoose.model('Category', categorySchema);