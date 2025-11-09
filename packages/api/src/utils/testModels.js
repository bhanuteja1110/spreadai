import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Test script to find which Gemini models are available
 * Run with: node src/utils/testModels.js
 */
async function testModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'REPLACE_ME') {
    console.error('❌ GEMINI_API_KEY is not set in .env');
    process.exit(1);
  }

  const client = new GoogleGenerativeAI(apiKey);
  
  const modelsToTest = [
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-2.0-flash-exp',
    'gemini-1.5-pro-latest',
    'gemini-1.5-pro',
    'gemini-pro',
    'gemini-1.0-pro',
  ];

  console.log('🔍 Testing available Gemini models...\n');

  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing: ${modelName}...`);
      const model = client.getGenerativeModel({ model: modelName });
      
      // Try a simple generation
      const result = await model.generateContent('Say "Hello"');
      const response = result.response;
      const text = response.text();
      
      if (text) {
        console.log(`✅ ${modelName} - WORKS!`);
        console.log(`   Response: ${text.substring(0, 50)}...\n`);
      } else {
        console.log(`⚠️  ${modelName} - No response\n`);
      }
    } catch (error) {
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        console.log(`❌ ${modelName} - Not found\n`);
      } else {
        console.log(`❌ ${modelName} - Error: ${error.message}\n`);
      }
    }
  }

  console.log('\n✨ Testing complete! Use a working model name in your .env as GEMINI_MODEL');
}

testModels().catch(console.error);

