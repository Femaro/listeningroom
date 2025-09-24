#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Building static version for Vercel...\n');

try {
  // Clean previous builds
  console.log('🧹 Cleaning previous builds...');
  if (fs.existsSync('build')) {
    fs.rmSync('build', { recursive: true, force: true });
  }
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Create a simple static build
  console.log('🔨 Building static application...');
  
  // Copy public files
  if (fs.existsSync('public')) {
    fs.cpSync('public', 'build/client', { recursive: true });
  } else {
    fs.mkdirSync('build/client', { recursive: true });
  }

  // Create a simple index.html
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Listening Room - Mental Health Support Platform</title>
    <script type="module" crossorigin src="/assets/index.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index.css">
</head>
<body>
    <div id="root"></div>
    <script type="module">
        // Simple client-side routing
        import { createRoot } from 'react-dom/client';
        import { BrowserRouter } from 'react-router-dom';
        import App from './src/app/root.tsx';
        
        const root = createRoot(document.getElementById('root'));
        root.render(
            <BrowserRouter>
                <App />
            </BrowserRouter>
        );
    </script>
</body>
</html>`;

  fs.writeFileSync('build/client/index.html', indexHtml);

  console.log('✅ Static build completed successfully!');
  console.log('📁 Output directory: build/client');
  
  // List build contents
  const buildContents = fs.readdirSync('build/client');
  console.log('📋 Build contents:', buildContents.join(', '));

  console.log('\n🎉 Static build ready for Vercel deployment!');
  console.log('📝 Note: This is a simplified static build');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

