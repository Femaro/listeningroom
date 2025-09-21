// Script to initialize training modules in Firebase
// Run with: node scripts/initializeTraining.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { TRAINING_MODULES } from '../src/utils/trainingData.js';

// Firebase configuration (replace with your actual config)
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function initializeTrainingModules() {
  try {
    console.log('Initializing training modules...');
    
    for (const module of TRAINING_MODULES) {
      const moduleRef = doc(db, 'trainings', module.id);
      await setDoc(moduleRef, {
        ...module,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`✓ Initialized module: ${module.title}`);
    }
    
    console.log('✅ All training modules initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing training modules:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeTrainingModules();
