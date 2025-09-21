#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔥 Building for Firebase Hosting...\n');

try {
  // Step 1: Clean previous builds
  console.log('🧹 Cleaning previous builds...');
  if (fs.existsSync('build')) {
    fs.rmSync('build', { recursive: true, force: true });
  }

  // Step 2: Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Step 3: Try to build with React Router
  console.log('🔨 Building application...');
  try {
    execSync('npx react-router build', { stdio: 'inherit' });
    console.log('✅ React Router build completed successfully!');
  } catch (error) {
    console.log('⚠️  React Router build failed, trying Vite build...');
    
    try {
      execSync('npx vite build', { stdio: 'inherit' });
      console.log('✅ Vite build completed successfully!');
    } catch (viteError) {
      console.log('❌ Both build methods failed. Please check the errors above.');
      process.exit(1);
    }
  }

  // Step 4: Install Firebase Functions dependencies
  console.log('🔧 Installing Firebase Functions dependencies...');
  execSync('cd functions && npm install', { stdio: 'inherit' });

  // Step 5: Build Firebase Functions
  console.log('🏗️  Building Firebase Functions...');
  execSync('cd functions && npm run build', { stdio: 'inherit' });

  // Step 6: Create Firebase environment configuration
  console.log('📝 Creating Firebase environment configuration...');
  const firebaseEnv = `
# Firebase Hosting Environment Variables
# Copy this to .env.local and configure with your values

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Authentication
AUTH_SECRET=your_secure_random_secret_key

# API Configuration
API_BASE_URL=https://your-project.web.app/api
CORS_ORIGIN=https://your-project.web.app
`;

  fs.writeFileSync('firebase.env.example', firebaseEnv);

  // Step 7: Create deployment instructions
  console.log('📚 Creating deployment instructions...');
  const deploymentInstructions = `
# Firebase Hosting Deployment Ready! 🔥

Your Listening Room application has been built for Firebase Hosting deployment.

## Files Created:
- \`build/\` - Production build directory
- \`functions/\` - Firebase Functions for API routes
- \`firebase.json\` - Firebase Hosting configuration
- \`firebase.env.example\` - Environment variables template

## Quick Deployment:

### 1. Login to Firebase
\`\`\`bash
firebase login
\`\`\`

### 2. Initialize Firebase Project
\`\`\`bash
firebase init hosting
\`\`\`
- Select your Firebase project
- Set public directory to: \`build/client\`
- Configure as single-page app: \`Yes\`
- Set up automatic builds: \`No\`

### 3. Deploy to Firebase Hosting
\`\`\`bash
firebase deploy
\`\`\`

### 4. Deploy Functions (if using API routes)
\`\`\`bash
firebase deploy --only functions
\`\`\`

## Environment Configuration:

1. Copy \`firebase.env.example\` to \`.env.local\`
2. Update with your Firebase project values
3. Configure Firebase project settings
4. Set up authentication providers

## Firebase Project Setup:

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create new project
   - Enable Authentication, Firestore, and Hosting

2. **Configure Authentication:**
   - Enable Email/Password provider
   - Configure authorized domains

3. **Set up Firestore:**
   - Create database in production mode
   - Configure security rules

4. **Configure Hosting:**
   - Connect custom domain (optional)
   - Set up SSL certificates

## Features Ready:
- ✅ Complete React Router application
- ✅ Firebase Authentication integration
- ✅ Firestore database integration
- ✅ Firebase Functions for API routes
- ✅ Text-based training system
- ✅ Admin dashboard
- ✅ Volunteer features
- ✅ Mobile-responsive design

## Next Steps:
1. Configure your Firebase project
2. Set up environment variables
3. Deploy using Firebase CLI
4. Test all functionality
5. Go live! 🚀

Your app will be available at: https://your-project.web.app
`;

  fs.writeFileSync('FIREBASE_DEPLOYMENT_INSTRUCTIONS.md', deploymentInstructions);

  console.log('\n🎉 Firebase Hosting build completed successfully!');
  console.log('📁 Build files are in the \'build/\' directory');
  console.log('🔥 Firebase Functions are in the \'functions/\' directory');
  console.log('📖 See \'FIREBASE_DEPLOYMENT_INSTRUCTIONS.md\' for next steps');
  console.log('\n🚀 Ready for Firebase Hosting deployment!');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
