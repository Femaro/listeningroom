#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📚 Setting up Git repository for Listening Room...\n');

try {
  // Check if Git is installed
  try {
    execSync('git --version', { stdio: 'pipe' });
    console.log('✅ Git is installed');
  } catch (error) {
    console.log('❌ Git is not installed. Please install Git first:');
    console.log('   - Windows: Download from https://git-scm.com/download/win');
    console.log('   - macOS: Run "brew install git" or download from git-scm.com');
    console.log('   - Linux: Run "sudo apt install git" or equivalent');
    process.exit(1);
  }

  // Initialize Git repository
  console.log('🔧 Initializing Git repository...');
  try {
    execSync('git init', { stdio: 'inherit' });
    console.log('✅ Git repository initialized');
  } catch (error) {
    console.log('⚠️  Git repository may already be initialized');
  }

  // Check if .gitignore exists
  if (fs.existsSync('.gitignore')) {
    console.log('✅ .gitignore file exists');
  } else {
    console.log('❌ .gitignore file not found');
  }

  // Check if README.md exists
  if (fs.existsSync('README.md')) {
    console.log('✅ README.md file exists');
  } else {
    console.log('❌ README.md file not found');
  }

  // Check if LICENSE exists
  if (fs.existsSync('LICENSE')) {
    console.log('✅ LICENSE file exists');
  } else {
    console.log('❌ LICENSE file not found');
  }

  // Add files to Git
  console.log('📁 Adding files to Git...');
  try {
    execSync('git add .', { stdio: 'inherit' });
    console.log('✅ Files added to Git');
  } catch (error) {
    console.log('❌ Failed to add files to Git:', error.message);
  }

  // Check Git status
  console.log('📊 Git status:');
  try {
    execSync('git status', { stdio: 'inherit' });
  } catch (error) {
    console.log('❌ Failed to check Git status');
  }

  console.log('\n🎉 Git repository setup complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Configure Git (if not already done):');
  console.log('   git config --global user.name "Your Name"');
  console.log('   git config --global user.email "your.email@example.com"');
  console.log('\n2. Create initial commit:');
  console.log('   git commit -m "Initial commit: Listening Room mental health support platform"');
  console.log('\n3. Create remote repository on GitHub/GitLab');
  console.log('\n4. Connect local repository to remote:');
  console.log('   git remote add origin https://github.com/yourusername/listeningroom.git');
  console.log('   git push -u origin main');
  console.log('\n5. Follow the complete guide in GIT_SETUP_GUIDE.md');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}

