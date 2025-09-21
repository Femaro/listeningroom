# ▲ Vercel Deployment Guide

Complete guide to deploy your Listening Room application to Vercel.

## Prerequisites

- Node.js 18+ installed
- Firebase project created
- Vercel account (free tier available)
- Git repository with your code

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
3. Add your domains to **Authorized domains**:
   - `localhost` (for development)
   - `your-project.vercel.app` (Vercel domain)
   - `your-project-git-main.vercel.app` (Vercel preview domain)
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
# Run the Vercel build script
npm run build:vercel

# Or manually
node build-vercel.js
```

### 2.2 Manual Build (if script fails)

```bash
# Install dependencies
npm install

# Build application
npm run build
```

## Step 3: Deploy to Vercel

### Option A: Vercel CLI (Recommended)

#### 3.1 Install Vercel CLI

```bash
npm install -g vercel
```

#### 3.2 Login to Vercel

```bash
vercel login
```

#### 3.3 Deploy

```bash
# Deploy to production
vercel --prod

# Or deploy to preview
vercel
```

### Option B: Vercel Dashboard

#### 3.1 Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import your GitHub repository
4. Select the repository

#### 3.2 Configure Build Settings

- **Framework Preset:** React Router
- **Build Command:** `npm run build`
- **Output Directory:** `build/client`
- **Install Command:** `npm install`
- **Root Directory:** `apps/web` (if deploying from monorepo)

#### 3.3 Deploy

Click **"Deploy"** and wait for the build to complete.

## Step 4: Configure Environment Variables

### 4.1 Get Firebase Configuration

1. Go to **Project Settings** → **General**
2. Scroll down to **Your apps**
3. Click **Add app** → **Web app**
4. Register app with nickname: `listeningroom-web`
5. Copy the Firebase configuration

### 4.2 Add Environment Variables in Vercel

1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Environment Variables**
3. Add the following variables:

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
API_BASE_URL=https://your-project.vercel.app/api
CORS_ORIGIN=https://your-project.vercel.app

# Environment
NODE_ENV=production
```

### 4.3 Redeploy After Adding Variables

```bash
# Redeploy to apply environment variables
vercel --prod
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

Visit your Vercel URL:
- **Production:** `https://your-project.vercel.app`
- **Preview:** `https://your-project-git-main.vercel.app`

### 6.2 Test Key Features

- [ ] **User Registration/Login** - Test Firebase Auth
- [ ] **Admin Dashboard** - Verify admin access
- [ ] **Training System** - Test file uploads and modules
- [ ] **Session Management** - Test session creation
- [ ] **API Endpoints** - Test Vercel Functions

## Step 7: Custom Domain (Optional)

### 7.1 Add Custom Domain

1. Go to **Vercel Dashboard** → **Project Settings** → **Domains**
2. Add your custom domain
3. Follow the DNS configuration instructions
4. Wait for SSL certificate to be issued

### 7.2 Update Environment Variables

Update your environment variables with the custom domain:

```env
API_BASE_URL=https://yourdomain.com/api
CORS_ORIGIN=https://yourdomain.com
```

## Step 8: Production Optimization

### 8.1 Vercel Analytics

Vercel automatically provides:
- **Web Analytics** - Page views and performance
- **Speed Insights** - Core Web Vitals
- **Function Analytics** - API performance

### 8.2 Performance Monitoring

1. **Vercel Speed Insights:**
   - Automatically enabled
   - Monitor Core Web Vitals
   - Track performance metrics

2. **Error Tracking:**
   - Consider adding Sentry for error tracking
   - Monitor function errors in Vercel dashboard

### 8.3 Caching

Your `vercel.json` already includes:
- Static asset caching
- Security headers
- SPA routing configuration

## Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Check Node.js version (18+ required)
   - Verify all dependencies installed
   - Check for TypeScript errors
   - Review build logs in Vercel dashboard

2. **Authentication Issues:**
   - Verify Firebase configuration
   - Check authorized domains in Firebase
   - Ensure environment variables are set

3. **API Errors:**
   - Check Vercel Functions logs
   - Verify function deployment
   - Check CORS configuration

4. **File Upload Issues:**
   - Check Firebase Storage rules
   - Verify file size limits
   - Check file type restrictions

### Debug Commands:

```bash
# Check Vercel project status
vercel ls

# View deployment logs
vercel logs

# Check function logs
vercel logs --follow

# Test locally with Vercel
vercel dev
```

## Maintenance

### Regular Tasks:

1. **Update Dependencies:**
   ```bash
   npm update
   vercel --prod
   ```

2. **Monitor Performance:**
   - Check Vercel Analytics
   - Monitor function execution times
   - Review error logs

3. **Backup Data:**
   - Export Firestore data regularly
   - Backup environment variables

## Vercel Features

### Automatic Deployments:

- **Git Integration** - Deploy on every push
- **Preview Deployments** - Test before production
- **Branch Deployments** - Deploy feature branches
- **Rollback** - Easy rollback to previous versions

### Performance:

- **Edge Network** - Global CDN
- **Automatic HTTPS** - SSL certificates
- **Image Optimization** - Automatic image optimization
- **Function Scaling** - Automatic serverless scaling

## Success! 🎉

Your Listening Room application is now live on Vercel!

**Your app URL:** `https://your-project.vercel.app`

**Features Available:**
- ✅ Complete user management system
- ✅ Real-time session management
- ✅ Text-based training system with Word document support
- ✅ Professional admin dashboard
- ✅ Mobile-responsive design
- ✅ Firebase integration
- ✅ Serverless API functions
- ✅ Global CDN and edge optimization

**Next Steps:**
1. Test all functionality thoroughly
2. Set up monitoring and analytics
3. Configure custom domain (optional)
4. Share with your users! 🚀

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Router Documentation](https://reactrouter.com)
- [Vercel Support](https://vercel.com/support)
