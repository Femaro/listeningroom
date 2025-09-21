# 🔥 Firebase Hosting Deployment Guide

Complete guide to deploy your Listening Room application to Firebase Hosting.

## Prerequisites

- Node.js 18+ installed
- Firebase project created
- Firebase CLI installed (`npm install -g firebase-tools`)

## Step 1: Firebase Project Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Enter project name: `listeningroom` (or your preferred name)
4. Enable Google Analytics (recommended)
5. Choose Analytics account or create new one

### 1.2 Enable Required Services

#### Authentication:
1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** provider
3. Add your domain to **Authorized domains**:
   - `localhost` (for development)
   - `your-project.web.app` (Firebase Hosting domain)
   - Your custom domain (if you have one)

#### Firestore Database:
1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode**
4. Select a location close to your users

#### Storage (for file uploads):
1. Go to **Storage**
2. Click **Get started**
3. Choose **Start in production mode**
4. Select same location as Firestore

## Step 2: Build Application

### 2.1 Run Build Script

```bash
# Run the Firebase build script
node build-firebase.js
```

This will:
- Build your React Router application
- Set up Firebase Functions
- Create necessary configuration files

### 2.2 Manual Build (if script fails)

```bash
# Install dependencies
npm install

# Build application
npm run build

# Install Functions dependencies
cd functions
npm install
npm run build
cd ..
```

## Step 3: Configure Environment Variables

### 3.1 Get Firebase Configuration

1. Go to **Project Settings** → **General**
2. Scroll down to **Your apps**
3. Click **Add app** → **Web app**
4. Register app with nickname: `listeningroom-web`
5. Copy the Firebase configuration

### 3.2 Update Environment Variables

Create `.env.local` file:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_actual_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_actual_app_id

# Authentication
AUTH_SECRET=your_secure_random_secret_key

# API Configuration
API_BASE_URL=https://your-project.web.app/api
CORS_ORIGIN=https://your-project.web.app
```

## Step 4: Deploy to Firebase

### 4.1 Login to Firebase

```bash
firebase login
```

### 4.2 Initialize Firebase in Your Project

```bash
firebase init
```

Select the following:
- ✅ **Hosting: Configure files for Firebase Hosting**
- ✅ **Functions: Configure a Cloud Functions directory**

### 4.3 Configure Hosting

When prompted:
- **What do you want to use as your public directory?** → `build/client`
- **Configure as a single-page app?** → `Yes`
- **Set up automatic builds and deploys with GitHub?** → `No` (or `Yes` if you want)

### 4.4 Configure Functions

When prompted:
- **What language would you like to use?** → `TypeScript`
- **Do you want to use ESLint?** → `Yes`
- **Do you want to install dependencies?** → `Yes`

### 4.5 Deploy Everything

```bash
# Deploy hosting and functions
firebase deploy

# Or deploy separately
firebase deploy --only hosting
firebase deploy --only functions
```

## Step 5: Configure Firestore Security Rules

### 5.1 Set Up Security Rules

Go to **Firestore Database** → **Rules** and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /user_profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Training applications - authenticated users can read, admins can write
    match /training_applications/{applicationId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/user_profiles/$(request.auth.uid)).data.userType == 'admin';
    }
    
    // Training modules - everyone can read, admins can write
    match /training_modules/{moduleId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/user_profiles/$(request.auth.uid)).data.userType == 'admin';
    }
    
    // Training progress - users can read/write their own progress
    match /training_progress/{progressId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Sessions - authenticated users can read/write
    match /sessions/{sessionId} {
      allow read, write: if request.auth != null;
    }
    
    // Contact messages - everyone can write, admins can read
    match /contact_messages/{messageId} {
      allow write: if true;
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/user_profiles/$(request.auth.uid)).data.userType == 'admin';
    }
  }
}
```

### 5.2 Set Up Storage Rules

Go to **Storage** → **Rules** and replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can upload files to their own folder
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Training files - admins can upload
    match /training/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/user_profiles/$(request.auth.uid)).data.userType == 'admin';
    }
  }
}
```

## Step 6: Test Your Deployment

### 6.1 Check Your App

Visit your Firebase Hosting URL:
- `https://your-project.web.app`
- `https://your-project.firebaseapp.com`

### 6.2 Test Key Features

- [ ] **User Registration/Login** - Test Firebase Auth
- [ ] **Admin Dashboard** - Verify admin access
- [ ] **Training System** - Test file uploads and modules
- [ ] **Session Management** - Test session creation
- [ ] **API Endpoints** - Test Firebase Functions

## Step 7: Custom Domain (Optional)

### 7.1 Add Custom Domain

1. Go to **Hosting** → **Add custom domain**
2. Enter your domain name
3. Follow the verification steps
4. Update DNS records as instructed

### 7.2 Update Environment Variables

Update your `.env.local` with the custom domain:

```env
API_BASE_URL=https://yourdomain.com/api
CORS_ORIGIN=https://yourdomain.com
```

## Step 8: Production Optimization

### 8.1 Enable Caching

Your `firebase.json` already includes caching headers for optimal performance.

### 8.2 Set Up Monitoring

1. **Firebase Performance Monitoring:**
   - Automatically enabled with Firebase SDK
   - Monitor app performance and crashes

2. **Firebase Analytics:**
   - Track user engagement
   - Monitor feature usage

### 8.3 Set Up Error Tracking

Consider adding Sentry for error tracking:

```bash
npm install @sentry/react @sentry/node
```

## Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Check Node.js version (18+ required)
   - Clear node_modules and reinstall
   - Check for TypeScript errors

2. **Authentication Issues:**
   - Verify Firebase configuration
   - Check authorized domains
   - Ensure security rules are correct

3. **API Errors:**
   - Check Firebase Functions logs
   - Verify function deployment
   - Check CORS configuration

4. **File Upload Issues:**
   - Check Storage security rules
   - Verify file size limits
   - Check file type restrictions

### Debug Commands:

```bash
# Check Firebase project
firebase projects:list

# View hosting logs
firebase hosting:channel:list

# View function logs
firebase functions:log

# Test functions locally
firebase emulators:start
```

## Maintenance

### Regular Tasks:

1. **Update Dependencies:**
   ```bash
   npm update
   cd functions && npm update
   ```

2. **Monitor Performance:**
   - Check Firebase Console metrics
   - Monitor function execution times
   - Review error logs

3. **Backup Data:**
   - Export Firestore data regularly
   - Backup Firebase Functions code

## Success! 🎉

Your Listening Room application is now live on Firebase Hosting!

**Your app URL:** `https://your-project.web.app`

**Features Available:**
- ✅ Complete user management system
- ✅ Real-time session management
- ✅ Text-based training system with Word document support
- ✅ Professional admin dashboard
- ✅ Mobile-responsive design
- ✅ Firebase integration
- ✅ Scalable cloud infrastructure

**Next Steps:**
1. Test all functionality thoroughly
2. Set up monitoring and analytics
3. Configure custom domain (optional)
4. Share with your users! 🚀
