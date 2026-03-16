require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const admins = await User.find({ role: 'admin' }).select('name email role');
  console.log('Admin users:', JSON.stringify(admins, null, 2));
  process.exit(0);
})();
