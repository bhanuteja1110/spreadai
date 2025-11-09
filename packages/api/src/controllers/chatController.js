import express from 'express';
import GeminiService from '../services/geminiService.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

// Optional: comment out temporarily while testing
// router.use(verifyToken);

// GET endpoint for browser visibility
router.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'SpreadAI chat endpoint is live. Use POST with messages array.'
  });
});

router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || !messages.length)
      return res.status(400).json({ error: 'messages must be a non-empty array' });

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'user' || !lastMessage.content)
      return res.status(400).json({ error: 'Last message must be from user with content' });

    const assistant = await GeminiService.chat(messages);
    res.json({ assistant });
  } catch (err) {
    console.error('Chat controller error:', err);
    if (!res.headersSent) {
      const status = err.message?.includes('API key')
        ? 401
        : err.message?.includes('required')
        ? 400
        : 500;
      res.status(status).json({ error: err.message || 'Server error' });
    }
  }
});

export default router;
