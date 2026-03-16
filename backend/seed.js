// backend/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const MenuItem = require('./models/MenuItem');
const User = require('./models/User');

// Default categories — only seeded if DB is empty
const defaultCategories = [
  { categoryName: 'Veg Pizza' },
  { categoryName: 'Non-Veg Pizza' },
  { categoryName: 'Beverages' },
  { categoryName: 'Sides' }
];

// Default menu items — only seeded if DB is empty
const defaultMenuItems = [
  {
    name: 'Margherita Pizza',
    description: 'Classic delight with 100% real mozzarella cheese',
    price: 299,
    category: 'Veg Pizza',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?w=500&q=80',
    isAvailable: true
  },
  {
    name: 'Farmhouse Pizza',
    description: 'Delightful combination of onion, capsicum, tomato & mushroom',
    price: 399,
    category: 'Veg Pizza',
    image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500&q=80',
    isAvailable: true
  },
  {
    name: 'Pepperoni Pizza',
    description: 'Classic pepperoni with mozzarella and tomato sauce',
    price: 499,
    category: 'Non-Veg Pizza',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80',
    isAvailable: true
  },
  {
    name: 'Coke (500ml)',
    description: 'Refreshing Coca-Cola',
    price: 60,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80',
    isAvailable: true
  },
  {
    name: 'Garlic Breadsticks',
    description: 'Freshly baked breadsticks with garlic butter',
    price: 120,
    category: 'Sides',
    image: 'https://images.unsplash.com/photo-1549611016-3a70d82b5040?w=500&q=80',
    isAvailable: true
  }
];

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding...');

    // ── 1. Admin user ──────────────────────────────────────────
    const adminEmail = 'baachin22@gmail.com';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      // Remove any stale admin before creating fresh one
      await User.deleteMany({ role: 'admin' });
      const admin = new User({
        name: 'Admin',
        email: adminEmail,
        password: 'Baachi@123',  // plain text — pre-save hook hashes it once
        phone: '0000000000',
        role: 'admin',
      });
      await admin.save();
      console.log(`👑 Admin user created: ${adminEmail}`);
    } else {
      console.log(`👑 Admin already exists: ${adminEmail}`);
    }

    // ── 2. Categories — only seed if none exist ─────────────────
    const categoryCount = await Category.countDocuments();
    let allCategories;
    if (categoryCount === 0) {
      allCategories = await Category.insertMany(defaultCategories);
      console.log(`📂 Created ${allCategories.length} default categories.`);
    } else {
      allCategories = await Category.find();
      console.log(`📂 Categories already exist (${allCategories.length}) — skipping seed.`);
    }

    // ── 3. Menu items — only seed if none exist ──────────────────
    const menuCount = await MenuItem.countDocuments();
    if (menuCount === 0) {
      const menuItemsWithIds = defaultMenuItems.map(item => {
        const category = allCategories.find(c => c.categoryName === item.category);
        return { ...item, categoryId: category ? category._id : null };
      });
      const createdItems = await MenuItem.insertMany(menuItemsWithIds.filter(i => i.categoryId));
      console.log(`🍕 Created ${createdItems.length} default menu items.`);
    } else {
      console.log(`🍕 Menu items already exist (${menuCount}) — skipping seed.`);
    }

    console.log('✨ Seeding completed! Existing data was NOT modified.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seedDB();
