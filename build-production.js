#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Building Listening Room for production...\n');

try {
  // Step 1: Clean previous builds
  console.log('🧹 Cleaning previous builds...');
  if (fs.existsSync('build')) {
    fs.rmSync('build', { recursive: true, force: true });
  }

  // Step 2: Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm ci --only=production', { stdio: 'inherit' });

  // Step 3: Try to build with React Router
  console.log('🔨 Building application...');
  try {
    execSync('npx react-router build', { stdio: 'inherit' });
    console.log('✅ Build completed successfully!');
  } catch (error) {
    console.log('⚠️  React Router build failed, trying alternative approach...');
    
    // Alternative: Build with Vite directly
    try {
      execSync('npx vite build', { stdio: 'inherit' });
      console.log('✅ Vite build completed successfully!');
    } catch (viteError) {
      console.log('❌ Both build methods failed. Please check the errors above.');
      process.exit(1);
    }
  }

  // Step 4: Create production package.json
  console.log('📝 Creating production package.json...');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const productionPackageJson = {
    name: packageJson.name,
    version: packageJson.version,
    type: 'module',
    scripts: {
      start: 'node server.js'
    },
    dependencies: {
      'react-router': packageJson.dependencies['react-router'],
      'react-router-dom': packageJson.dependencies['react-router-dom'],
      'react-router-serve': packageJson.dependencies['@react-router/serve'],
      'react': packageJson.dependencies['react'],
      'react-dom': packageJson.dependencies['react-dom'],
      'firebase': packageJson.dependencies['firebase'],
      'lucide-react': packageJson.dependencies['lucide-react'],
      'mammoth': packageJson.dependencies['mammoth']
    }
  };

  fs.writeFileSync('build/package.json', JSON.stringify(productionPackageJson, null, 2));

  // Step 5: Create production server
  console.log('🖥️  Creating production server...');
  const serverCode = `
import { createRequestHandler } from '@react-router/serve';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const buildPath = join(__dirname, 'client');
const requestHandler = createRequestHandler({
  build: () => import('./client/index.js'),
  mode: 'production'
});

const server = createServer((req, res) => {
  requestHandler(req, res);
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(\`🚀 Server running on port \${port}\`);
});
`;

  fs.writeFileSync('build/server.js', serverCode);

  // Step 6: Copy environment example
  console.log('📋 Copying environment configuration...');
  if (fs.existsSync('production.env.example')) {
    fs.copyFileSync('production.env.example', 'build/.env.example');
  }

  // Step 7: Create Docker files
  console.log('🐳 Creating Docker configuration...');
  if (fs.existsSync('Dockerfile')) {
    fs.copyFileSync('Dockerfile', 'build/Dockerfile');
  }
  if (fs.existsSync('.dockerignore')) {
    fs.copyFileSync('.dockerignore', 'build/.dockerignore');
  }

  // Step 8: Create deployment instructions
  console.log('📚 Creating deployment instructions...');
  const deploymentInstructions = `
# Production Build Ready! 🎉

Your Listening Room application has been built for production deployment.

## Files Created:
- \`build/\` - Production build directory
- \`build/server.js\` - Production server
- \`build/package.json\` - Production dependencies
- \`build/.env.example\` - Environment variables template
- \`build/Dockerfile\` - Docker configuration

## Quick Start:

### Option 1: Direct Node.js
\`\`\`bash
cd build
npm install
npm start
\`\`\`

### Option 2: Docker
\`\`\`bash
cd build
docker build -t listeningroom-app .
docker run -p 3000:3000 listeningroom-app
\`\`\`

### Option 3: Cloud Deployment
1. Upload the \`build/\` directory to your cloud provider
2. Set up environment variables
3. Start the server

## Environment Variables:
Copy \`.env.example\` to \`.env\` and configure:
- Firebase configuration
- Database URL
- Authentication secrets
- API endpoints

## Next Steps:
1. Configure your production environment variables
2. Set up your domain and SSL certificates
3. Configure your cloud hosting platform
4. Test the deployment thoroughly

For detailed deployment instructions, see CLOUD_DEPLOYMENT_GUIDE.md
`;

  fs.writeFileSync('build/DEPLOYMENT_INSTRUCTIONS.md', deploymentInstructions);

  console.log('\n🎉 Production build completed successfully!');
  console.log('📁 Build files are in the \'build/\' directory');
  console.log('📖 See \'build/DEPLOYMENT_INSTRUCTIONS.md\' for next steps');
  console.log('\n🚀 Ready for cloud deployment!');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
