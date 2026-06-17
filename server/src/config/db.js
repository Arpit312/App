import mongoose from 'mongoose';

/**
 * Establishes a connection to MongoDB using Mongoose.
 * Features auto-reconnection events and detailed logger warnings.
 */
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce_db';

  try {
    // Configure event listeners before connecting
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connection successfully established.');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB connection disconnected. Attempting to reconnect...');
    });

    await mongoose.connect(mongoURI, {
      autoIndex: true, // Build indexes automatically in development/boilerplate
    });

  } catch (error) {
    console.error(`Failed to connect to MongoDB on initial startup: ${error.message}`);
    // Exit process with failure code if connection fails initially in production
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export default connectDB;
