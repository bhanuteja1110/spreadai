import express from 'express';
import OpenAIService from '../services/openaiService.js';

const router = express.Router();

// POST /embed
router.post('/', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'text required' });

    // TODO: Implement embedding generation
    return res.json({ embedding: [] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
});

export default router;

