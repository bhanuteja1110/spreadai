import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
// Uses environment variables if available, otherwise uses default config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDMTRjl3YTdy_6wCM2NF09KFcakvecf_J0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "spread-23ece.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "spread-23ece",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "spread-23ece.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "839553092478",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:839553092478:web:e3f2de252e78b5ae0a412f",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-W7SGK6TB4L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Analytics (only in browser environment)
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
}

export { analytics };
export default app;

