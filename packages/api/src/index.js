import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatController from './controllers/chatController.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

app.use('/api/chat', chatController);

// Global error handler - ensures all errors return valid JSON
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  // Make sure we haven't already sent a response
  if (!res.headersSent) {
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit - let the server continue running
});

// Uncaught exception handler
process.on('uncaughtException', (e) => {
  console.error('Uncaught Exception:', e);
  // Don't exit immediately - log and continue
  // Only exit if it's a critical error
  if (e.code === 'EADDRINUSE') {
    console.error('Port already in use. Exiting...');
    process.exit(1);
  }
});

const port = process.env.PORT || 8080;

// Start the server
app.listen(port, () => {
  console.log(`\n🚀 SpreadAI API listening on http://localhost:${port}`);
  console.log(`📡 Chat endpoint: http://localhost:${port}/api/chat\n`);
  
  // Check for required environment variables
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'REPLACE_ME') {
    console.warn('⚠️  WARNING: GEMINI_API_KEY not set. Chat will not work until you set it in packages/api/.env');
  }
  
  if (!process.env.FIREBASE_SERVICE_ACCOUNT && !process.env.FIREBASE_PROJECT_ID) {
    console.warn('⚠️  WARNING: Firebase Admin not configured. Authentication is disabled (dev mode).');
    console.warn('   To enable authentication, add FIREBASE_SERVICE_ACCOUNT to packages/api/.env');
  }
});

