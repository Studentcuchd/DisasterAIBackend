const mongoose = require('mongoose');

const connectDB = async (uri) => {
  if (!uri) {
    throw new Error('MONGO_URI is required');
  }
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
    dbName: process.env.MONGO_DB_NAME || undefined,
  });
  // eslint-disable-next-line no-console
  console.log('MongoDB connected');
};

module.exports = connectDB;
