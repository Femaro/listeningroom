// Script to test training application submission
// Run with: node scripts/testTrainingApplication.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Firebase configuration (replace with your actual config)
const firebaseConfig = {
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

async function testTrainingApplication() {
  try {
    console.log('Testing training application submission...');
    
    const testApplication = {
      name: "Test User",
      email: "test@example.com",
      phone: "+1234567890",
      country: "United States",
      city: "New York",
      timezone: "UTC-05:00 (Eastern)",
      background: "Software engineer with 5 years of experience",
      experience: "Volunteered at local community center",
      motivation: "Want to help people struggling with mental health issues",
      trainingGoals: ["Learn active listening skills", "Understand crisis intervention"],
      specializations: ["General Listening", "Anxiety Support"],
      preferredLanguages: ["English", "Spanish"],
      agreeToTerms: true,
      agreeToTraining: true,
      agreeToBackground: true,
      status: "pending",
      applicationType: "training",
      submittedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'training_applications'), testApplication);
    console.log('✅ Test training application created with ID:', docRef.id);
    
    // Test API endpoint
    console.log('Testing API endpoint...');
    const response = await fetch('http://localhost:3000/api/training-applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testApplication),
    });
    
    const result = await response.json();
    if (response.ok) {
      console.log('✅ API endpoint working:', result.message);
    } else {
      console.log('❌ API endpoint error:', result.error);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing training application:', error);
    process.exit(1);
  }
}

// Run the test
testTrainingApplication();
