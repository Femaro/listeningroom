# Listening Room - Setup Guide

## Quick Start

The availability toggle now uses Firebase for data storage and authentication. No database setup required!

## Firebase Setup (Current)

The app is now configured to use Firebase for all data storage and authentication. Here's how to get started:

1. **Firebase is already configured** - no additional setup needed!
2. **Start the development server**:
```bash
npm run dev
```

3. **Sign up for an account** using the Firebase authentication
4. **Complete onboarding** and select 'volunteer' as your user type
5. **Navigate to the volunteer dashboard** - the availability toggle should work!

## How It Works

- **Authentication**: Firebase Auth handles user sign-in/sign-up
- **Data Storage**: Firestore stores availability status and user profiles
- **Real-time Updates**: Changes to availability are synced in real-time
- **No Database Setup**: Firebase handles everything automatically

## Firebase Collections

The app automatically creates these collections in Firestore:
- `users` - User profiles and settings
- `volunteer_availability` - Volunteer availability status
- `sessions` - Chat sessions and scheduling

## Troubleshooting

### "Setup Required" Error
This means you're not properly authenticated. Check:
1. You're signed in to the application
2. Your user profile has `userType: 'volunteer'` in Firebase
3. Firebase is properly configured

### "Unauthorized" Error
This means you're not logged in as a volunteer. Make sure:
1. You're signed in to the application
2. Your user profile has `userType: 'volunteer'` in Firebase

### Firebase Connection Issues
- Check your internet connection
- Verify Firebase configuration in `src/utils/firebase.ts`
- Check browser console for Firebase errors

## Next Steps

1. Sign up for an account using Firebase authentication
2. Complete the onboarding process and select 'volunteer' as your user type
3. Navigate to the volunteer dashboard
4. The availability toggle should now work with Firebase!
