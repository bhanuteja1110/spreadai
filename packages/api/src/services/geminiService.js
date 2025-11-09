// packages/api/src/services/geminiService.js
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { formatTextForDisplay } from '../utils/textFormatter.js';
import dotenv from 'dotenv';
dotenv.config();

let genClient = null;
let cachedModel = null;

// Ordered list of models to attempt
const MODEL_OPTIONS = [
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
  'gemini-2.0-flash-exp',
  'gemini-1.5-pro-latest',
  'gemini-1.5-pro',
  'gemini-pro',
];

const PREFERRED_MODEL = process.env.GEMINI_MODEL || MODEL_OPTIONS[0];

/* ---------- Persona / system prompt ---------- */
function getPersonaConfig() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const personaPath = join(__dirname, '../config/persona.json');
    const personaData = JSON.parse(readFileSync(personaPath, 'utf-8'));
    return personaData;
  } catch (err) {
    // fallback defaults
    return {
      name: 'SpreadAI',
      about_project:
        "Spread is a startup aiming to simplify people's daily needs through delivery, digital services, and AI tools.",
      rules: [
        'Introduce yourself as SpreadAI.',
        'Stay respectful and professional.',
        'Give factual, clear, and simple answers.',
        "Do not mention who created you or the creator's name in your responses."
      ]
    };
  }
}

function buildSystemPrompt() {
  const persona = getPersonaConfig();
  let systemPrompt = `You are ${persona.name}.\n\n`;
  if (persona.greeting) {
    systemPrompt += `Greeting: ${persona.greeting}\n\n`;
  }
  if (persona.about_project) {
    systemPrompt += `About the project: ${persona.about_project}\n\n`;
  }
  if (persona.rules && persona.rules.length) {
    systemPrompt += `Rules to follow:\n`;
    persona.rules.forEach((r, i) => {
      systemPrompt += `${i + 1}. ${r}\n`;
    });
    systemPrompt += '\n';
  }
  systemPrompt += 'Always be helpful, respectful, and provide clear, factual answers.';
  return systemPrompt;
}

/* ---------- Gemini client init (lazy) ---------- */
async function initGeminiClient() {
  if (genClient) return genClient;

  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'REPLACE_ME') {
    // no key configured — we'll use fallback behavior elsewhere
    console.warn('GEMINI_API_KEY not set; Gemini features will be disabled.');
    return null;
  }

  try {
    // lazy import so local dev or environments without the SDK won't crash at startup
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    genClient = new GoogleGenerativeAI(key);
    return genClient;
  } catch (err) {
    console.error('Failed to initialize Gemini SDK:', err?.message || err);
    // return null to indicate client not available
    return null;
  }
}

/* ---------- Helpers ---------- */
function formatMessagesForGemini(messages) {
  // converts {role,content} to Gemini-style chat parts
  // throws if invalid input
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('messages must be a non-empty array');
  }
  return messages.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: String(m.content ?? '') }]
  }));
}

function safeFallbackResponse() {
  const persona = getPersonaConfig();
  return `⚙️ Hi, I'm ${persona.name}. Gemini is currently unavailable or not configured. Please try again later.`;
}

function normalizeError(err) {
  const msg = (err && (err.message || String(err))) || 'Unknown error';
  if (/API key|API_KEY|invalid/i.test(msg)) return { status: 401, message: 'Invalid Gemini API key' };
  if (/quota|QUOTA_EXCEEDED|quota exceeded/i.test(msg)) return { status: 429, message: 'Gemini quota exceeded' };
  if (/404|not found/i.test(msg)) return { status: 404, message: 'Specified Gemini model not found' };
  return { status: 502, message: `Gemini error: ${msg}` };
}

/* ---------- Core chat function ---------- */
export default {
  /**
   * Chat(messages)
   * messages: [{role:'user'|'assistant', content:'...'}, ...]
   * returns string reply (assistant text)
   */
  async chat(messages) {
    // If no Gemini key / client available, return graceful fallback
    const client = await initGeminiClient();
    if (!client) {
      return safeFallbackResponse();
    }

    // Prepare system instruction and chat history
    const systemPrompt = buildSystemPrompt();
    let chatHistory;
    try {
      chatHistory = formatMessagesForGemini(messages);
    } catch (err) {
      throw new Error('Invalid messages: ' + (err.message || String(err)));
    }

    // Try preferred model then fall back to alternatives
    const triedModels = [];
    let lastErr = null;

    const tryModel = async modelName => {
      triedModels.push(modelName);
      try {
        // create model instance
        const model = client.getGenerativeModel({ model: modelName, systemInstruction: systemPrompt });

        // If there is history (more than only the current message) use chat sessions
        if (chatHistory.length > 1) {
          const history = chatHistory.slice(0, -1);
          const last = chatHistory[chatHistory.length - 1];
          const userText = last.parts[0].text;

          // startChat API (SDK shape may differ depending on version)
          // We'll try both patterns so this code is resilient:
          if (typeof model.startChat === 'function') {
            const chat = model.startChat({ history });
            const result = await chat.sendMessage(userText);
            const text = result?.response?.text?.();
            if (!text) throw new Error('Empty response from Gemini');
            return formatTextForDisplay(text);
          } else if (typeof model.generateContent === 'function') {
            // fallback to a generateContent call with context included
            const prompt = (history.map(h => `${h.role}: ${h.parts.map(p => p.text).join(' ')}`).join('\n') + '\n' + `user: ${userText}`);
            const result = await model.generateContent(prompt);
            const text = result?.response?.text?.();
            if (!text) throw new Error('Empty response from Gemini');
            return formatTextForDisplay(text);
          } else {
            throw new Error('Model does not support chat or generateContent in this SDK version');
          }
        } else {
          // single message - generate content directly
          const last = chatHistory[chatHistory.length - 1];
          const userText = last.parts[0].text;
          if (typeof model.generateContent === 'function') {
            const result = await model.generateContent(userText);
            const text = result?.response?.text?.();
            if (!text) throw new Error('Empty response from Gemini');
            return formatTextForDisplay(text);
          } else if (typeof model.startChat === 'function') {
            const chat = model.startChat();
            const result = await chat.sendMessage(userText);
            const text = result?.response?.text?.();
            if (!text) throw new Error('Empty response from Gemini');
            return formatTextForDisplay(text);
          } else {
            throw new Error('Model does not support generateContent or startChat');
          }
        }
      } catch (err) {
        lastErr = err;
        const errMsg = (err && (err.message || String(err))) || '';
        // If model not found, signal upstream to try other models
        if (/404|not found/i.test(errMsg) || /model not found/i.test(errMsg)) {
          throw new Error(`MODEL_NOT_FOUND: ${modelName} -> ${errMsg}`);
        }
        // Bubble up other errors to be handled by the caller
        throw err;
      }
    };

    // First try PREFERRED_MODEL and on specific model-not-found errors loop alternatives
    try {
      return await tryModel(PREFERRED_MODEL);
    } catch (err) {
      // if it's a MODEL_NOT_FOUND, try alternatives; otherwise consider fallback
      const msg = (err && (err.message || String(err))) || '';
      if (/MODEL_NOT_FOUND/i.test(msg) || /404|not found/i.test(msg)) {
        // try alternatives
        for (const alt of MODEL_OPTIONS) {
          if (alt === PREFERRED_MODEL) continue;
          try {
            return await tryModel(alt);
          } catch (e) {
            // continue trying
            lastErr = e;
            continue;
          }
        }
      } else {
        lastErr = err;
      }
    }

    // If everything fails, return a helpful error message (not raw stack)
    const normalized = normalizeError(lastErr || new Error('Unknown Gemini error'));
    // Throwing an Error lets the controller convert to proper HTTP response (status/code)
    throw new Error(normalized.message);
  }
};
