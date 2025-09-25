import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDlVrMCBIc1mRmzdqioQHDWjMLtBw_PtS0',
  authDomain: 'listening-room-4a0a6.firebaseapp.com',
  projectId: 'listening-room-4a0a6',
  storageBucket: 'listening-room-4a0a6.firebasestorage.app',
  messagingSenderId: '135218011074',
  appId: '1:135218011074:web:bf86618b096f40d1bed45b',
  measurementId: 'G-E2YYCFB00K',
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


