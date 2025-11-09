import { GoogleGenerativeAI } from '@google/generative-ai';
import { formatTextForDisplay } from '../utils/textFormatter.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

let genAI = null;
let model = null;

// Try these models in order of preference
const MODEL_OPTIONS = [
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
  'gemini-2.0-flash-exp',
  'gemini-1.5-pro-latest',
  'gemini-1.5-pro',
  'gemini-pro',
];

const MODEL_NAME = process.env.GEMINI_MODEL || MODEL_OPTIONS[0];

/**
 * Load persona configuration
 */
function getPersonaConfig() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const personaPath = join(__dirname, '../config/persona.json');
    const personaData = JSON.parse(readFileSync(personaPath, 'utf-8'));
    return personaData;
  } catch (error) {
    console.warn('Could not load persona config, using defaults:', error.message);
    return {
      name: 'SpreadAI',
      about_project: 'Spread is a startup aiming to simplify people\'s daily needs through delivery, digital services, and AI tools.',
      rules: [
        'Introduce yourself as SpreadAI.',
        'Stay respectful and professional.',
        'Give factual, clear, and simple answers.',
        'Do not mention who created you or the creator\'s name in your responses.'
      ]
    };
  }
}

/**
 * Build system prompt from persona configuration
 */
function buildSystemPrompt() {
  const persona = getPersonaConfig();
  
  let systemPrompt = `You are ${persona.name}.\n\n`;
  
  if (persona.about_project) {
    systemPrompt += `About the project: ${persona.about_project}\n\n`;
  }
  
  if (persona.rules && persona.rules.length > 0) {
    systemPrompt += `Rules to follow:\n`;
    persona.rules.forEach((rule, index) => {
      systemPrompt += `${index + 1}. ${rule}\n`;
    });
    systemPrompt += '\n';
  }
  
  systemPrompt += 'Always be helpful, respectful, and provide clear, factual answers.';
  
  return systemPrompt;
}

/**
 * Initialize Gemini client (lazy loading)
 */
function getGeminiClient() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'REPLACE_ME') {
      throw new Error('GEMINI_API_KEY is not set. Please set it in packages/api/.env');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Get the model instance
 */
function getModel() {
  if (!model) {
    const client = getGeminiClient();
    try {
      model = client.getGenerativeModel({ model: MODEL_NAME });
      console.log(`Using Gemini model: ${MODEL_NAME}`);
    } catch (error) {
      console.error(`Failed to initialize model ${MODEL_NAME}:`, error.message);
      throw error;
    }
  }
  return model;
}

/**
 * Convert messages array to chat history format for Gemini
 * Gemini supports chat format with role-based messages
 */
function formatMessagesForGemini(messages) {
  if (!messages || messages.length === 0) {
    throw new Error('No messages provided');
  }

  // Get the last user message (most recent)
  const lastMessage = messages[messages.length - 1];
  
  if (lastMessage.role !== 'user') {
    throw new Error('Last message must be from user');
  }

  // Convert messages to Gemini's expected format
  // Gemini uses 'user' and 'model' roles
  const chatHistory = messages.map(msg => {
    const role = msg.role === 'user' ? 'user' : 'model';
    return {
      role: role,
      parts: [{ text: msg.content }]
    };
  });

  return chatHistory;
}

/**
 * Chat with Gemini API using chat format
 * @param {Array} messages - Array of message objects with role and content
 * @returns {Promise<string>} - Gemini's response
 */
export default {
  async chat(messages) {
    let lastError = null;
    
    // Try the configured model first
    try {
      return await this.tryChatWithModel(MODEL_NAME, messages);
    } catch (error) {
      console.warn(`Model ${MODEL_NAME} failed:`, error.message);
      lastError = error;
      
      // If it's a 404/model not found error, try other models
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        console.log('Trying alternative models...');
        
        for (const modelName of MODEL_OPTIONS) {
          if (modelName === MODEL_NAME) continue; // Already tried this one
          
          try {
            console.log(`Trying model: ${modelName}`);
            return await this.tryChatWithModel(modelName, messages);
          } catch (err) {
            console.warn(`Model ${modelName} failed:`, err.message);
            lastError = err;
            continue;
          }
        }
      }
    }

    // If we get here, all models failed
    throw this.handleError(lastError);
  },

  /**
   * Try to chat with a specific model
   */
  async tryChatWithModel(modelName, messages) {
    const client = getGeminiClient();
    const systemPrompt = buildSystemPrompt();
    const chatHistory = formatMessagesForGemini(messages);

    // Create model with system instruction
    const geminiModel = client.getGenerativeModel({ 
      model: modelName,
      systemInstruction: systemPrompt
    });

    // If we have conversation history, use chat format
    if (chatHistory.length > 1) {
      const history = chatHistory.slice(0, -1); // All messages except the last one
      const lastMessage = chatHistory[chatHistory.length - 1];
      const userMessage = lastMessage.parts[0].text;

      // Start a chat session with history
      const chat = geminiModel.startChat({
        history: history,
      });

      // Send the message and get response
      const result = await chat.sendMessage(userMessage);
      const response = result.response;
      let text = response.text();

      if (!text) {
        throw new Error('Empty response from Gemini');
      }

      // Format the text to remove markdown and improve readability
      text = formatTextForDisplay(text);

      // If this model worked, cache it for future use
      if (modelName !== MODEL_NAME) {
        console.log(`Successfully using model: ${modelName}. Consider setting GEMINI_MODEL=${modelName} in .env`);
        model = geminiModel;
      }

      return text;
    } else {
      // Single message - use simple generateContent
      const lastMessage = chatHistory[0];
      const userMessage = lastMessage.parts[0].text;

      const result = await geminiModel.generateContent(userMessage);
      const response = result.response;
      let text = response.text();

      if (!text) {
        throw new Error('Empty response from Gemini');
      }

      // Format the text to remove markdown and improve readability
      text = formatTextForDisplay(text);

      // Cache the working model
      if (modelName !== MODEL_NAME) {
        console.log(`Successfully using model: ${modelName}. Consider setting GEMINI_MODEL=${modelName} in .env`);
        model = geminiModel;
      }

      return text;
    }
  },

  /**
   * Handle errors with helpful messages
   */
  handleError(error) {
    console.error('Gemini API Error:', error);

    // Handle model not found error
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      return new Error(
        `No available Gemini models found. Please check your API key. ` +
        `Tried models: ${MODEL_OPTIONS.join(', ')}. ` +
        `You can set GEMINI_MODEL in .env to specify a model.`
      );
    }

    // Handle specific Gemini API errors
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key')) {
      return new Error('Invalid Gemini API key. Please check your GEMINI_API_KEY in .env');
    }

    if (error.message?.includes('quota') || error.message?.includes('QUOTA_EXCEEDED')) {
      return new Error('Gemini API quota exceeded. Please check your usage limits.');
    }

    if (error.message?.includes('SAFETY') || error.message?.includes('safety')) {
      return new Error('Content was blocked by Gemini safety filters.');
    }

    // Generic error
    return new Error(`Gemini API error: ${error.message || 'Unknown error'}`);
  }
};
