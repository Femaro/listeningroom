#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('▲ Building for Vercel deployment...\n');

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

  // Step 4: Create Vercel environment configuration
  console.log('📝 Creating Vercel environment configuration...');
  const vercelEnv = `
# Vercel Environment Variables
# Add these to your Vercel project settings

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
API_BASE_URL=https://your-project.vercel.app/api
CORS_ORIGIN=https://your-project.vercel.app

# Vercel Configuration
NODE_ENV=production
`;

  fs.writeFileSync('vercel.env.example', vercelEnv);

  // Step 5: Create deployment instructions
  console.log('📚 Creating deployment instructions...');
  const deploymentInstructions = `
# Vercel Deployment Ready! ▲

Your Listening Room application has been built for Vercel deployment.

## Files Created:
- \`build/\` - Production build directory
- \`vercel.json\` - Vercel configuration
- \`vercel.env.example\` - Environment variables template

## Quick Deployment:

### Option 1: Vercel CLI (Recommended)
\`\`\`bash
# Login to Vercel
vercel login

# Deploy to Vercel
vercel --prod
\`\`\`

### Option 2: Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings:
   - Build Command: \`npm run build\`
   - Output Directory: \`build/client\`
   - Framework: React Router
5. Add environment variables
6. Deploy!

## Environment Configuration:

1. Copy \`vercel.env.example\` values
2. Go to Vercel Dashboard → Project Settings → Environment Variables
3. Add all variables with your actual values

## Firebase Project Setup:

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create new project
   - Enable Authentication, Firestore, and Storage

2. **Configure Authentication:**
   - Enable Email/Password provider
   - Add Vercel domain to authorized domains:
     - \`your-project.vercel.app\`
     - \`your-project-git-main.vercel.app\`

3. **Set up Firestore:**
   - Create database in production mode
   - Configure security rules

4. **Configure Storage:**
   - Enable Firebase Storage
   - Set up security rules

## Features Ready:
- ✅ Complete React Router application
- ✅ Firebase Authentication integration
- ✅ Firestore database integration
- ✅ Text-based training system
- ✅ Admin dashboard
- ✅ Volunteer features
- ✅ Mobile-responsive design
- ✅ API routes as Vercel Functions

## Next Steps:
1. Set up Firebase project
2. Configure environment variables in Vercel
3. Deploy using Vercel CLI or Dashboard
4. Test all functionality
5. Go live! 🚀

Your app will be available at: https://your-project.vercel.app
`;

  fs.writeFileSync('VERCEL_DEPLOYMENT_INSTRUCTIONS.md', deploymentInstructions);

  console.log('\n🎉 Vercel build completed successfully!');
  console.log('📁 Build files are in the \'build/\' directory');
  console.log('📖 See \'VERCEL_DEPLOYMENT_INSTRUCTIONS.md\' for next steps');
  console.log('\n🚀 Ready for Vercel deployment!');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
