import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase only on client-side
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let analyticsInstance: Analytics | undefined;

// Client-side only initialization
if (typeof window !== 'undefined') {
  try {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  } catch (error) {
    console.error('Firebase initialization error:', error);
    // Fallback initialization
    try {
      app = initializeApp(firebaseConfig);
    } catch (retryError) {
      console.error('Firebase fallback initialization failed:', retryError);
    }
  }

  // Initialize Auth & Firestore only on client
  if (app) {
    try {
      auth = getAuth(app);
      db = getFirestore(app);
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

// Helper to ensure Firebase is initialized (client-side only)
export function getFirebaseApp(): FirebaseApp {
  if (typeof window === 'undefined') {
    throw new Error('Firebase can only be used on the client side');
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
  if (!auth) {
    throw new Error('Firebase Auth not initialized');
  }
  return auth;
}

export function getFirebaseFirestore(): Firestore {
  if (typeof window === 'undefined') {
    throw new Error('Firebase Firestore can only be used on the client side');
  }
  if (!db) {
    throw new Error('Firebase Firestore not initialized');
  }
  return db;
}

// Export instances (may be undefined on server)
export { app, auth, db, analyticsInstance as analytics };


