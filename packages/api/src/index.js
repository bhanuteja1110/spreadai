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

// ✅ Root route (home page)
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>SpreadAI Backend</title>
        <style>
          body {
            background-color: #0b0f19;
            color: #fff;
            font-family: "Segoe UI", Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          h1 {
            color: #4ef0a6;
            font-size: 2.2rem;
            margin-bottom: 0.5rem;
          }
          p {
            color: #aaa;
            font-size: 1rem;
            margin: 0.3rem 0;
          }
          .card {
            background: rgba(255,255,255,0.05);
            padding: 2rem 3rem;
            border-radius: 16px;
            box-shadow: 0 0 20px rgba(0,0,0,0.2);
            text-align: center;
          }
          code {
            background: rgba(255,255,255,0.1);
            padding: 3px 6px;
            border-radius: 4px;
            color: #4ef0a6;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>🚀 SpreadAI Backend is Live</h1>
          <p>Your API is running successfully on Render.</p>
          <p>Endpoints:</p>
          <p><code>/health</code> – Health status</p>
          <p><code>/api/chat</code> – Chat endpoint</p>
          <p style="margin-top:1rem;color:#777;">Environment: ${process.env.NODE_ENV || 'development'}</p>
        </div>
      </body>
    </html>
  `);
});

// ✅ Health check route
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'SpreadAI API',
    env: process.env.NODE_ENV || 'development',
    time: new Date().toISOString()
  });
});

// Chat route
app.use('/api/chat', chatController);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (!res.headersSent) {
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (e) => {
  console.error('Uncaught Exception:', e);
  if (e.code === 'EADDRINUSE') {
    console.error('Port already in use. Exiting...');
    process.exit(1);
  }
});

const port = process.env.PORT || 8080;

// Start server
app.listen(port, () => {
  console.log(`\n🚀 SpreadAI API listening on http://localhost:${port}`);
  console.log(`📡 Chat endpoint: http://localhost:${port}/api/chat`);
  console.log(`💚 Health check: http://localhost:${port}/health\n`);

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'REPLACE_ME') {
    console.warn('⚠️  WARNING: GEMINI_API_KEY not set. Chat will not work until configured.');
  }
  if (!process.env.FIREBASE_SERVICE_ACCOUNT && !process.env.FIREBASE_PROJECT_ID) {
    console.warn('⚠️  WARNING: Firebase Admin not configured. Authentication is disabled (dev mode).');
  }
});
