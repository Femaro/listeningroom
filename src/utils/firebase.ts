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
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Analytics only on the client and when supported
let analyticsInstance: Analytics | undefined;
if (typeof window !== 'undefined') {
  void isSupported()
    .then((supported) => {
      if (supported) {
        analyticsInstance = getAnalytics(app);
      }
    })
    .catch(() => {
      // No-op if analytics isn't supported
    });
}

export const analytics = analyticsInstance;

// Firebase Auth & Firestore (web)
export const auth = getAuth(app);
export const db = getFirestore(app);


