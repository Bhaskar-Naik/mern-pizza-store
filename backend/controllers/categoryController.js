// backend/controllers/categoryController.js

const Category = require('../models/Category');
const asyncHandler = require('express-async-handler');


// Get all categories
const getCategories = asyncHandler(async (req, res) => {

  const categories = await Category.find();

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });

});


// Create category (Admin only)
const createCategory = asyncHandler(async (req, res) => {

  const { categoryName } = req.body;

  if (!categoryName) {
    res.status(400);
    throw new Error('Category name is required');
  }

  const category = await Category.create({ categoryName });

  res.status(201).json({
    success: true,
    message: 'Category created successfully!',
    data: category,
  });

});


// Delete category (Admin only)
const deleteCategory = asyncHandler(async (req, res) => {

  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  await Category.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully!',
  });

});


module.exports = {
  getCategories,
  createCategory,
  deleteCategory
};