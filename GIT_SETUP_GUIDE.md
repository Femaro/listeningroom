# 📚 Git Repository Setup Guide

Complete guide to set up Git and add your Listening Room application to a repository.

## Prerequisites

### 1. Install Git

#### Windows:
1. Download Git from [git-scm.com](https://git-scm.com/download/win)
2. Run the installer with default settings
3. Restart your terminal/command prompt

#### macOS:
```bash
# Using Homebrew
brew install git

# Or download from git-scm.com
```

#### Linux:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install git

# CentOS/RHEL
sudo yum install git
```

### 2. Configure Git (First Time Setup)

```bash
# Set your name
git config --global user.name "Your Name"

# Set your email
git config --global user.email "your.email@example.com"

# Set default branch name
git config --global init.defaultBranch main

# Verify configuration
git config --list
```

## Step 1: Initialize Git Repository

### 1.1 Navigate to Your Project

```bash
cd C:\Users\prisc\Downloads\listeningroom\createxyz-project\_\apps\web
```

### 1.2 Initialize Git

```bash
git init
```

### 1.3 Create .gitignore File

```bash
# Create .gitignore file
echo "# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
build/
dist/
.next/
out/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Firebase
.firebase/
firebase-debug.log
firebase-debug.*.log

# Vercel
.vercel

# Temporary files
*.tmp
*.temp" > .gitignore
```

## Step 2: Create Repository Structure

### 2.1 Create README.md

```bash
# Create README.md
echo "# 🎧 Listening Room

A comprehensive mental health support platform connecting volunteers with those in need.

## Features

- **User Management**: Admin, Volunteer, and Seeker roles
- **Session Management**: Real-time voice and text chat sessions
- **Training System**: Text-based training modules with Word document support
- **Admin Dashboard**: Complete management interface
- **Firebase Integration**: Authentication, database, and storage
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Frontend**: React Router v7, Tailwind CSS, Lucide React
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Deployment**: Vercel
- **File Processing**: Mammoth (Word documents)

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project
- Git

### Installation

1. Clone the repository
2. Install dependencies: \`npm install\`
3. Set up environment variables
4. Run development server: \`npm run dev\`

### Environment Variables

Copy \`vercel.env.example\` to \`.env.local\` and configure:

\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
AUTH_SECRET=your_secure_secret
\`\`\`

## Deployment

### Vercel (Recommended)

1. Connect repository to Vercel
2. Configure environment variables
3. Deploy automatically

### Firebase Hosting

1. Run \`npm run build:firebase\`
2. Deploy with \`firebase deploy\`

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License - see LICENSE file for details" > README.md
```

### 2.2 Create LICENSE File

```bash
# Create MIT License
echo "MIT License

Copyright (c) 2024 Listening Room

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the \"Software\"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE." > LICENSE
```

## Step 3: Add Files to Git

### 3.1 Add All Files

```bash
# Add all files to staging
git add .

# Check status
git status
```

### 3.2 Create Initial Commit

```bash
# Create initial commit
git commit -m "Initial commit: Listening Room mental health support platform

- Complete React Router application
- Firebase authentication and database integration
- Text-based training system with Word document support
- Admin dashboard with user management
- Volunteer features and session management
- Vercel deployment configuration
- Mobile-responsive design"
```

## Step 4: Create Remote Repository

### 4.1 GitHub (Recommended)

1. Go to [GitHub.com](https://github.com)
2. Click "New repository"
3. Repository name: `listeningroom`
4. Description: "Mental health support platform connecting volunteers with those in need"
5. Set to Public or Private
6. Don't initialize with README (we already have one)
7. Click "Create repository"

### 4.2 GitLab Alternative

1. Go to [GitLab.com](https://gitlab.com)
2. Click "New project"
3. Create blank project
4. Follow similar steps as GitHub

## Step 5: Connect Local Repository to Remote

### 5.1 Add Remote Origin

```bash
# Add remote origin (replace with your repository URL)
git remote add origin https://github.com/yourusername/listeningroom.git

# Verify remote
git remote -v
```

### 5.2 Push to Remote Repository

```bash
# Push to main branch
git push -u origin main

# Or if using master branch
git push -u origin master
```

## Step 6: Set Up Branch Protection (Optional)

### 6.1 GitHub Branch Protection

1. Go to repository Settings
2. Click "Branches"
3. Add rule for main branch
4. Enable "Require pull request reviews"
5. Enable "Require status checks"

## Step 7: Set Up Continuous Deployment

### 7.1 Vercel Integration

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import from GitHub
4. Select your repository
5. Configure build settings
6. Deploy automatically

### 7.2 Environment Variables

Add environment variables in Vercel:
- Go to Project Settings → Environment Variables
- Add all variables from `vercel.env.example`

## Step 8: Development Workflow

### 8.1 Daily Workflow

```bash
# Pull latest changes
git pull origin main

# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push branch
git push origin feature/new-feature

# Create Pull Request on GitHub
```

### 8.2 Commit Message Convention

Use conventional commits:
- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation changes
- `style:` formatting changes
- `refactor:` code refactoring
- `test:` adding tests
- `chore:` maintenance tasks

## Step 9: Repository Structure

Your repository should look like this:

```
listeningroom/
├── src/
│   ├── app/
│   ├── components/
│   ├── utils/
│   └── ...
├── functions/ (if using Firebase)
├── public/
├── build/
├── .gitignore
├── .env.example
├── vercel.json
├── firebase.json
├── package.json
├── README.md
├── LICENSE
└── deployment guides/
```

## Troubleshooting

### Common Issues:

1. **Git not found:**
   - Install Git from git-scm.com
   - Restart terminal after installation

2. **Authentication failed:**
   - Use Personal Access Token instead of password
   - Configure Git credentials

3. **Push rejected:**
   - Pull latest changes first
   - Resolve merge conflicts

4. **Large files:**
   - Add to .gitignore
   - Use Git LFS for large files

### Useful Commands:

```bash
# Check Git status
git status

# View commit history
git log --oneline

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# View remote repositories
git remote -v

# Change remote URL
git remote set-url origin new-url

# Clone repository
git clone repository-url

# Create and switch to branch
git checkout -b branch-name

# Switch to branch
git checkout branch-name

# Merge branch
git merge branch-name

# Delete branch
git branch -d branch-name
```

## Success! 🎉

Your Listening Room application is now in a Git repository!

**Next Steps:**
1. Install Git if not already installed
2. Follow the setup steps above
3. Create remote repository on GitHub/GitLab
4. Push your code
5. Set up continuous deployment
6. Start developing with proper version control! 🚀
