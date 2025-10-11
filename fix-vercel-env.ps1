# Script to fix Vercel environment variables
# Run this to properly set Firebase config in Vercel

Write-Host "Fixing Vercel Environment Variables..." -ForegroundColor Cyan

# Firebase configuration values
$apiKey = "AIzaSyDlVrMCBIc1mRmzdqioQHDWjMLtBw_PtS0"
$authDomain = "listening-room-4a0a6.firebaseapp.com"
$projectId = "listening-room-4a0a6"
$storageBucket = "listening-room-4a0a6.firebasestorage.app"
$messagingSenderId = "135218011074"
$appId = "1:135218011074:web:bf86618b096f40d1bed45b"
$measurementId = "G-E2YYCFB00K"

$environments = @("production", "preview", "development")

# Set each variable for each environment
foreach ($env in $environments) {
    Write-Host "`nSetting variables for $env environment..." -ForegroundColor Yellow
    
    Write-Output $apiKey | vercel env add VITE_FIREBASE_API_KEY $env
    Write-Output $authDomain | vercel env add VITE_FIREBASE_AUTH_DOMAIN $env
    Write-Output $projectId | vercel env add VITE_FIREBASE_PROJECT_ID $env
    Write-Output $storageBucket | vercel env add VITE_FIREBASE_STORAGE_BUCKET $env
    Write-Output $messagingSenderId | vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID $env
    Write-Output $appId | vercel env add VITE_FIREBASE_APP_ID $env
    Write-Output $measurementId | vercel env add VITE_FIREBASE_MEASUREMENT_ID $env
}

Write-Host "`nAll environment variables have been set!" -ForegroundColor Green
Write-Host "Next: Run 'npm run vercel:deploy' to deploy with new variables" -ForegroundColor Cyan

