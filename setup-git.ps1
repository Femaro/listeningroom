# PowerShell script to set up Git and push to repository
# Run this script in PowerShell as Administrator

Write-Host "🚀 Listening Room - Git Setup Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
Write-Host "🔍 Checking if Git is installed..." -ForegroundColor Yellow
try {
    $gitVersion = git --version 2>$null
    if ($gitVersion) {
        Write-Host "✅ Git is installed: $gitVersion" -ForegroundColor Green
    } else {
        throw "Git not found"
    }
} catch {
    Write-Host "❌ Git is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📥 Please install Git first:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://git-scm.com/download/win" -ForegroundColor White
    Write-Host "2. Download and install Git" -ForegroundColor White
    Write-Host "3. Restart PowerShell and run this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "Press any key to open Git download page..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Start-Process "https://git-scm.com/download/win"
    exit 1
}

Write-Host ""
Write-Host "🔧 Setting up Git repository..." -ForegroundColor Yellow

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Not in the correct directory. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Initialize Git repository
Write-Host "📁 Initializing Git repository..." -ForegroundColor Yellow
try {
    git init
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Git repository may already be initialized" -ForegroundColor Yellow
}

# Add files to Git
Write-Host "📦 Adding files to Git..." -ForegroundColor Yellow
try {
    git add .
    Write-Host "✅ Files added to Git" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to add files to Git" -ForegroundColor Red
    exit 1
}

# Check Git status
Write-Host ""
Write-Host "📊 Git Status:" -ForegroundColor Cyan
git status

Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Configure Git (if not already done):" -ForegroundColor White
Write-Host "   git config --global user.name `"Your Name`"" -ForegroundColor Gray
Write-Host "   git config --global user.email `"your.email@example.com`"" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Create initial commit:" -ForegroundColor White
Write-Host "   git commit -m `"Initial commit: Listening Room mental health support platform`"" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Create remote repository on GitHub/GitLab" -ForegroundColor White
Write-Host ""
Write-Host "4. Connect local repository to remote:" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/yourusername/listeningroom.git" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 For complete instructions, see: COMPLETE_GIT_SETUP.md" -ForegroundColor Yellow

Write-Host ""
Write-Host "🎉 Git setup complete! Follow the next steps above." -ForegroundColor Green


