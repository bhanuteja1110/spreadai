import admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    // Option 1: Use FIREBASE_SERVICE_ACCOUNT environment variable (JSON string)
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    // Option 2: Use individual environment variables
    const hasIndividualVars = process.env.FIREBASE_PROJECT_ID && 
                               process.env.FIREBASE_PRIVATE_KEY && 
                               process.env.FIREBASE_CLIENT_EMAIL;
    
    if (serviceAccount) {
      // Parse JSON string from environment variable
      try {
        const serviceAccountJson = JSON.parse(serviceAccount);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccountJson)
        });
        console.log('Firebase Admin initialized from FIREBASE_SERVICE_ACCOUNT');
      } catch (parseError) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', parseError.message);
        console.warn('Authentication will be disabled.');
      }
    } else if (hasIndividualVars) {
      // Use individual environment variables
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
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountFromEnv)
      });
      console.log('Firebase Admin initialized from environment variables');
    } else {
      console.warn('FIREBASE_SERVICE_ACCOUNT or Firebase env vars not set. Authentication will be disabled.');
      console.warn('Set FIREBASE_SERVICE_ACCOUNT (JSON string) or individual Firebase env vars to enable authentication.');
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    console.warn('Authentication middleware will be disabled.');
  }
}

/**
 * Middleware to verify Firebase ID token
 */
export const verifyToken = async (req, res, next) => {
  try {
    // Skip auth if Firebase Admin is not initialized (for development)
    if (!admin.apps.length) {
      // Only log once per request to avoid spam
      if (!req._authLogged) {
        console.log('Firebase Admin not initialized - allowing request (auth disabled)');
        req._authLogged = true;
      }
      req.user = { uid: 'dev-user', email: 'dev@localhost' }; // Mock user for development
      return next();
    }

    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    if (!idToken) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token format' });
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        ...decodedToken
      }; // Attach user info to request
      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      
      // Ensure we haven't already sent a response
      if (!res.headersSent) {
        // Provide more specific error messages
        if (error.code === 'auth/id-token-expired') {
          return res.status(401).json({ error: 'Unauthorized: Token expired' });
        }
        if (error.code === 'auth/argument-error') {
          return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }
        
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // Ensure we haven't already sent a response
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export default { verifyToken };
