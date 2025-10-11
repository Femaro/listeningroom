# How to Fix Vercel Environment Variables

## Problem
The Firebase environment variables in Vercel have newline characters (`\r\n`) which makes them invalid.

## Solution Options

### Option 1: Use the PowerShell Script (Automated)

Run this command:
```powershell
.\fix-vercel-env.ps1
```

This will automatically:
1. Remove all corrupted variables
2. Re-add them cleanly to all environments
3. No newlines or quotes

### Option 2: Manual Fix via Vercel Dashboard (Recommended if script fails)

1. **Go to Vercel Dashboard:**
   https://vercel.com/femaros-projects/listeningroom/settings/environment-variables

2. **Delete ALL existing `VITE_FIREBASE_*` variables:**
   - Click the three dots (⋮) next to each variable
   - Click "Delete"
   - Confirm deletion

3. **Add them back ONE BY ONE:**

   **For EACH variable below:**
   - Click "Add New"
   - Enter the Name and Value EXACTLY as shown (NO quotes!)
   - Select **all 3 environments**: Production, Preview, Development
   - Click "Save"

   ```
   Name:  VITE_FIREBASE_API_KEY
   Value: AIzaSyDlVrMCBIc1mRmzdqioQHDWjMLtBw_PtS0

   Name:  VITE_FIREBASE_AUTH_DOMAIN
   Value: listening-room-4a0a6.firebaseapp.com

   Name:  VITE_FIREBASE_PROJECT_ID
   Value: listening-room-4a0a6

   Name:  VITE_FIREBASE_STORAGE_BUCKET
   Value: listening-room-4a0a6.firebasestorage.app

   Name:  VITE_FIREBASE_MESSAGING_SENDER_ID
   Value: 135218011074

   Name:  VITE_FIREBASE_APP_ID
   Value: 1:135218011074:web:bf86618b096f40d1bed45b

   Name:  VITE_FIREBASE_MEASUREMENT_ID
   Value: G-E2YYCFB00K
   ```

4. **Redeploy:**
   ```bash
   npm run vercel:deploy
   ```

## Why This Happened

When we used `echo "value" | vercel env add`, it included the newline character that `echo` adds. This corrupted the values.

## How to Verify It's Fixed

After re-adding, test the deployment:

1. Visit your Vercel URL
2. Open browser console (F12)
3. Look for: `Firebase app initialized successfully`
4. Try registration - should work!

## If Still Having Issues

The code now includes `cleanEnvVar()` which strips newlines, but if variables are severely corrupted, manual re-addition via dashboard is safest.

