import dotenv from 'dotenv';
import admin from 'firebase-admin';

dotenv.config();

console.log('\n🔍 Checking Firebase Admin Configuration...\n');

// Check Option 1: FIREBASE_SERVICE_ACCOUNT
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

// Check Option 2: Individual environment variables
const hasIndividualVars = process.env.FIREBASE_PROJECT_ID && 
                           process.env.FIREBASE_PRIVATE_KEY && 
                           process.env.FIREBASE_CLIENT_EMAIL;

if (serviceAccount) {
  console.log('✅ FIREBASE_SERVICE_ACCOUNT is set');
  
  try {
    const serviceAccountJson = JSON.parse(serviceAccount);
    console.log('✅ JSON is valid');
    console.log(`   Project ID: ${serviceAccountJson.project_id || 'N/A'}`);
    console.log(`   Client Email: ${serviceAccountJson.client_email || 'N/A'}`);
    
    // Try to initialize
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountJson)
      });
      console.log('✅ Firebase Admin initialized successfully!\n');
    } else {
      console.log('✅ Firebase Admin already initialized\n');
    }
  } catch (parseError) {
    console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:');
    console.error(`   Error: ${parseError.message}\n`);
    console.log('💡 Make sure the JSON is on a single line and properly escaped');
  }
} else if (hasIndividualVars) {
  console.log('✅ Individual Firebase environment variables are set');
  console.log(`   Project ID: ${process.env.FIREBASE_PROJECT_ID}`);
  console.log(`   Client Email: ${process.env.FIREBASE_CLIENT_EMAIL}`);
  
  try {
    const serviceAccountFromEnv = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || '',
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID || '',
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL || ''
    };
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountFromEnv)
      });
      console.log('✅ Firebase Admin initialized successfully!\n');
    } else {
      console.log('✅ Firebase Admin already initialized\n');
    }
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:');
    console.error(`   Error: ${error.message}\n`);
  }
} else {
  console.log('⚠️  Firebase Service Account not configured');
  console.log('\n💡 To configure, add to packages/api/.env:');
  console.log('   Option 1: FIREBASE_SERVICE_ACCOUNT=\'{"type":"service_account",...}\'');
  console.log('   Option 2: Individual variables (FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, etc.)\n');
}

// Check other required variables
console.log('📋 Other Environment Variables:');
console.log(`   PORT: ${process.env.PORT || '8080 (default)'}`);
console.log(`   GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Not set'}`);
console.log('');

