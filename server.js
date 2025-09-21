import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple production server for React Router app
const server = createServer(async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // API routes
    if (req.url.startsWith('/api/')) {
      // Handle API routes
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'API endpoint', url: req.url }));
      return;
    }

    // Serve static files
    let filePath = join(__dirname, 'build', 'client', req.url === '/' ? 'index.html' : req.url);
    
    // Check if file exists
    if (!existsSync(filePath)) {
      // Fallback to index.html for SPA routing
      filePath = join(__dirname, 'build', 'client', 'index.html');
    }

    // Read and serve file
    const content = readFileSync(filePath);
    const ext = filePath.split('.').pop();
    
    // Set content type
    const contentTypes = {
      'html': 'text/html',
      'css': 'text/css',
      'js': 'application/javascript',
      'json': 'application/json',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'ico': 'image/x-icon'
    };
    
    res.setHeader('Content-Type', contentTypes[ext] || 'text/plain');
    res.writeHead(200);
    res.end(content);

  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

server.listen(port, host, () => {
  console.log(`🚀 Listening Room server running on http://${host}:${port}`);
  console.log(`📁 Serving files from: ${join(__dirname, 'build', 'client')}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
