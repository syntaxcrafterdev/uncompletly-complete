import 'module-alias/register';
import 'reflect-metadata';
import { connectToDatabase } from './config/database';
import App from './app';
import { config } from './config/env';

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Connect to database and start server
const startServer = async () => {
  try {
    await connectToDatabase();
    console.log('Database connected successfully');

    const app = new App();
    app.start();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
