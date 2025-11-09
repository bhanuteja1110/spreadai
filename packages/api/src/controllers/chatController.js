import express from 'express';
import GeminiService from '../services/geminiService.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

// Apply authentication middleware to all chat routes
router.use(verifyToken);

/**
 * POST /api/chat
 * Receives messages array and returns Gemini's response
 * 
 * Request body:
 * {
 *   "messages": [
 *     { "role": "user", "content": "Hello SpreadAI, how are you?" }
 *   ]
 * }
 * 
 * Response:
 * {
 *   "assistant": "Hello! I'm SpreadAI powered by Gemini."
 * }
 */
router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;
    
    // Validate request
    if (!messages) {
      return res.status(400).json({ error: 'messages required' });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages must be a non-empty array' });
    }

    // Validate message structure
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage.role || !lastMessage.content) {
      return res.status(400).json({ error: 'Each message must have role and content' });
    }

    if (lastMessage.role !== 'user') {
      return res.status(400).json({ error: 'Last message must be from user' });
    }

    // Get response from Gemini
    const assistant = await GeminiService.chat(messages);
    
    return res.json({ assistant });
  } catch (err) {
    console.error('Chat controller error:', err);
    
    // Ensure we always return valid JSON
    if (!res.headersSent) {
      // Return appropriate status code based on error type
      const statusCode = err.message?.includes('API key') || err.message?.includes('quota')
        ? 401
        : err.message?.includes('required') || err.message?.includes('must be')
        ? 400
        : 500;

      return res.status(statusCode).json({ error: err.message || String(err) });
    } else {
      // Headers already sent, log the error
      console.error('Cannot send error response - headers already sent:', err);
    }
  }
});

export default router;

