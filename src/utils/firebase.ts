import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Helper to remove quotes from env vars (Vercel adds quotes sometimes)
function cleanEnvVar(value: string | undefined): string | undefined {
  if (!value) return value;
  return value.replace(/^["'](.*)["']$/, '$1');
}

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: cleanEnvVar(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: cleanEnvVar(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnvVar(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnvVar(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnvVar(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnvVar(import.meta.env.VITE_FIREBASE_APP_ID),
  measurementId: cleanEnvVar(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID),
};

// Log config status for debugging
if (typeof window !== 'undefined') {
  console.log('Firebase Config Status:', {
    hasApiKey: !!firebaseConfig.apiKey,
    hasAuthDomain: !!firebaseConfig.authDomain,
    hasProjectId: !!firebaseConfig.projectId,
    projectId: firebaseConfig.projectId,
    apiKeyStart: firebaseConfig.apiKey?.substring(0, 10),
  });
}

// Initialize Firebase only on client-side
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let analyticsInstance: Analytics | undefined;
let isInitialized = false;

// Function to initialize Firebase
function initializeFirebase() {
  if (isInitialized) return;
  
  // Validate config before initializing
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error('Firebase config is missing required values. Check environment variables.');
    console.error('Config:', {
      hasApiKey: !!firebaseConfig.apiKey,
      hasProjectId: !!firebaseConfig.projectId,
      apiKey: firebaseConfig.apiKey?.substring(0, 10) + '...',
    });
    return;
  }
  
  try {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    isInitialized = true;
    console.log('Firebase app initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
    // Fallback initialization
    try {
      app = initializeApp(firebaseConfig);
      isInitialized = true;
      console.log('Firebase app initialized on retry');
    } catch (retryError) {
      console.error('Firebase fallback initialization failed:', retryError);
      return;
    }
  }

  // Initialize Auth & Firestore
  if (app) {
    try {
      auth = getAuth(app);
      db = getFirestore(app);
      console.log('Firebase Auth and Firestore initialized successfully');
    } catch (error) {
      console.error('Firebase services initialization error:', error);
    }

    // Initialize Analytics when supported
    try {
      void isSupported()
        .then((supported) => {
          if (supported && app) {
            analyticsInstance = getAnalytics(app);
          }
        })
        .catch((error) => {
          console.warn('Analytics initialization failed:', error);
        });
    } catch (error) {
      console.warn('Analytics setup failed:', error);
    }
  }
}

// Initialize immediately on client-side
if (typeof window !== 'undefined') {
  initializeFirebase();
}

// Helper to ensure Firebase is initialized (client-side only)
export function getFirebaseApp(): FirebaseApp {
  if (typeof window === 'undefined') {
    throw new Error('Firebase can only be used on the client side');
  }
  
  // Try to initialize if not already done
  if (!app && !isInitialized) {
    initializeFirebase();
  }
  
  if (!app) {
    throw new Error('Firebase app not initialized');
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (typeof window === 'undefined') {
    throw new Error('Firebase Auth can only be used on the client side');
  }
  
  // Try to initialize if not already done
  if (!auth && !isInitialized) {
    initializeFirebase();
  }
  
  if (!auth) {
    throw new Error('Firebase Auth not initialized');
  }
  return auth;
}

export function getFirebaseFirestore(): Firestore {
  if (typeof window === 'undefined') {
    throw new Error('Firebase Firestore can only be used on the client side');
  }
  
  // Try to initialize if not already done
  if (!db && !isInitialized) {
    initializeFirebase();
  }
  
  if (!db) {
    throw new Error('Firebase Firestore not initialized');
  }
  return db;
}

// Helper to check if Firebase is ready
export function isFirebaseReady(): boolean {
  return typeof window !== 'undefined' && isInitialized && !!auth && !!db;
}

// Export instances (may be undefined on server)
export { app, auth, db, analyticsInstance as analytics };


