import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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

// Initialize Firebase (singleton across HMR/reloads)
let app;
try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Fallback initialization
  app = initializeApp(firebaseConfig);
}

export { app };

// Initialize Analytics only on the client and when supported
let analyticsInstance: Analytics | undefined;
if (typeof window !== 'undefined') {
  try {
    void isSupported()
      .then((supported) => {
        if (supported) {
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

export const analytics = analyticsInstance;

// Firebase Auth & Firestore (web)
let auth, db;
try {
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error('Firebase services initialization error:', error);
  // Re-initialize app if needed
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (retryError) {
    console.error('Firebase retry initialization failed:', retryError);
    throw retryError;
  }
}

export { auth, db };


