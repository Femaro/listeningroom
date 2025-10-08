# Firebase Domain Configuration Guide

## 🔧 Fixing "Domain not allowlisted by project" Error

This error occurs when Firebase Authentication tries to redirect to a domain that isn't configured in your Firebase project settings.

## 📋 Steps to Fix

### 1. **Access Firebase Console**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `listening-room-4a0a6`
3. Navigate to **Authentication** → **Settings** → **Authorized domains**

### 2. **Add Required Domains**

Add these domains to your **Authorized domains** list:

#### **Development Domains:**
- `localhost` (for local development)
- `127.0.0.1` (alternative localhost)
- `localhost:3000` (if using specific port)

#### **Production Domains:**
- `listening-room-4a0a6.firebaseapp.com` (Firebase hosting)
- `listening-room-4a0a6.web.app` (Firebase hosting)
- Your Vercel domain (e.g., `your-app.vercel.app`)

### 3. **Configure Email Action Settings**

In Firebase Console:
1. Go to **Authentication** → **Templates**
2. Click on **Email address verification**
3. In **Action URL**, set:
   - **Development**: `http://localhost:3000/onboarding`
   - **Production**: `https://your-domain.com/onboarding`

### 4. **Update Firebase Configuration**

The app now automatically detects the environment and uses the appropriate domain:

```javascript
// Development
const redirectUrl = 'http://localhost:3000/onboarding';

// Production  
const redirectUrl = 'https://your-domain.com/onboarding';
```

## 🚀 Quick Fix Commands

### **For Development:**
```bash
# Make sure you're running on localhost:3000
npm run dev
```

### **For Production:**
1. Deploy to Vercel
2. Add your Vercel domain to Firebase Authorized domains
3. Update the action URL in Firebase Console

## 🔍 Troubleshooting

### **Error: "Domain not allowlisted"**
- ✅ Check Firebase Console → Authentication → Settings → Authorized domains
- ✅ Ensure your domain is in the list
- ✅ Wait 5-10 minutes for changes to propagate

### **Error: "Invalid continue URL"**
- ✅ Check the action URL in Firebase Console
- ✅ Ensure the URL matches your deployed domain
- ✅ Use HTTPS for production domains

### **Error: "Network error"**
- ✅ Check your internet connection
- ✅ Verify Firebase project is active
- ✅ Check browser console for additional errors

## 📱 Mobile App Configuration (Future)

If you plan to add mobile apps later, you'll need to configure:

```javascript
const actionCodeSettings = {
  url: 'https://your-domain.com/onboarding',
  handleCodeInApp: false,
  iOS: {
    bundleId: 'com.listeningroom.app'
  },
  android: {
    packageName: 'com.listeningroom.app',
    installApp: true,
    minimumVersion: '12'
  }
};
```

## 🎯 Current Configuration

The app is now configured to:
- ✅ Automatically detect development vs production
- ✅ Use appropriate redirect URLs
- ✅ Handle localhost and production domains
- ✅ Provide clear error messages

## 📞 Support

If you continue to have issues:
1. Check Firebase Console logs
2. Verify domain configuration
3. Test with a simple email verification
4. Contact Firebase support if needed

---

*This configuration ensures your Firebase Authentication works seamlessly across all environments.*
