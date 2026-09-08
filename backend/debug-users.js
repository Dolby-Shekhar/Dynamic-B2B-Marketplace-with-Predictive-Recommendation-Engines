const mongoose = require('mongoose');
const { UserModel } = require('./src/models/User');

(async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/marketplace';
    console.log('Trying to connect to:', mongoUri);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000, maxPoolSize: 20 });
    const users = await UserModel.find({}).select('email role firstName lastName passwordHash').lean();
    console.log('USER_COUNT', users.length);
    console.log(JSON.stringify(users, null, 2));
    await mongoose.disconnect();
  } catch (error) {
    console.error('ERROR', error);
    process.exit(1);
  }
})();
