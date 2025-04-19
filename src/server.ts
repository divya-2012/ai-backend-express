import createApp from './api/v1/app';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const port: number = Number(process.env.PORT) || 8001;

const startServer = async () => {
  try {
    const app = await createApp();
    app.listen(port, () => {
      console.log(`🚀 Server running at: http://localhost:${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle process-level events
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
startServer();