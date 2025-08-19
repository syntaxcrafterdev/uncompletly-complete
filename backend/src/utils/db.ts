import mongoose from 'mongoose';
import { config } from '../config/env';

const MAX_RETRIES = 3;
let retryCount = 0;

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.database.url, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    retryCount = 0; // Reset retry count on successful connection
  } catch (error) {
    console.error('MongoDB connection error:', error);
    
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`Retrying connection (${retryCount}/${MAX_RETRIES})...`);
      setTimeout(connectDB, 3000); // Retry after 3 seconds
    } else {
      console.error('Max retries reached. Exiting...');
      process.exit(1);
    }
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');  
  if (!config.isProduction) {
    connectDB(); // Auto-reconnect in development
  }
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

export default connectDB;
