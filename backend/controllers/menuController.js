// backend/controllers/menuController.js

const MenuItem = require("../models/MenuItem");
const Category = require("../models/Category");
const asyncHandler = require("express-async-handler");

// ─────────────────────────────────────────
// @route   GET /api/menu
// @desc    Get all menu items
// @access  Public
// ─────────────────────────────────────────
const getMenuItems = asyncHandler(async (req, res) => {
  const menuItems = await MenuItem.find().populate(
    "categoryId",
    "categoryName",
  );

  res.status(200).json({
    success: true,
    count: menuItems.length,
    data: menuItems,
  });
});

// ─────────────────────────────────────────
// @route   GET /api/menu/:id
// @desc    Get single menu item
// @access  Public
// ─────────────────────────────────────────
const getMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id).populate(
    "categoryId",
    "categoryName",
  );

  if (!menuItem) {
    res.status(404);
    throw new Error("Menu item not found");
  }

  res.status(200).json({
    success: true,
    data: menuItem,
  });
});

// ─────────────────────────────────────────
// @route   POST /api/menu
// @desc    Create new menu item (Admin only)
// @access  Private/Admin
// ─────────────────────────────────────────
const createMenuItem = asyncHandler(async (req, res) => {
  const { name, description, price, categoryId, image, isAvailable } = req.body;

  if (!name || !description || !price || !categoryId) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  const category = await Category.findById(categoryId);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  const menuItem = await MenuItem.create({
    name,
    description,
    price,
    categoryId,
    image: image || "default-pizza.jpg",
    isAvailable: isAvailable !== undefined ? isAvailable : true,
  });

  res.status(201).json({
    success: true,
    message: "Menu item created successfully!",
    data: menuItem,
  });
});

// ─────────────────────────────────────────
// @route   PUT /api/menu/:id
// @desc    Update menu item (Admin only)
// @access  Private/Admin
// ─────────────────────────────────────────
const updateMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id);

  if (!menuItem) {
    res.status(404);
    throw new Error("Menu item not found");
  }

  const updatedItem = await MenuItem.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    success: true,
    message: "Menu item updated successfully!",
    data: updatedItem,
  });
});

// ─────────────────────────────────────────
// @route   DELETE /api/menu/:id
// @desc    Delete menu item (Admin only)
// @access  Private/Admin
// ─────────────────────────────────────────
const deleteMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id);

  if (!menuItem) {
    res.status(404);
    throw new Error("Menu item not found");
  }

  await MenuItem.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Menu item deleted successfully!",
  });
});

module.exports = {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
