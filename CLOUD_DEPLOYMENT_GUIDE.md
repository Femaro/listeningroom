# Cloud Deployment Guide

This guide will help you deploy your Listening Room application to various cloud hosting platforms.

## Prerequisites

- Node.js 18+ installed locally
- Git repository with your code
- Firebase project configured
- Domain name (optional but recommended)

## Environment Setup

### 1. Production Environment Variables

Copy the example environment file and configure your production values:

```bash
cp production.env.example .env.production
```

Update the following variables in `.env.production`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_actual_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_actual_app_id

# Database (if using external database)
DATABASE_URL=your_production_database_url

# Authentication
AUTH_SECRET=your_secure_random_secret_key

# API Configuration
API_BASE_URL=https://your-domain.com/api

# Security
CORS_ORIGIN=https://your-domain.com
```

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the easiest way to deploy React Router applications.

#### Steps:

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

4. **Configure Environment Variables:**
   - Go to your Vercel dashboard
   - Select your project
   - Go to Settings > Environment Variables
   - Add all variables from your `.env.production` file

#### Vercel Configuration

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "framework": "react-router",
  "functions": {
    "src/app/api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Option 2: Railway

Railway provides easy deployment with automatic builds.

#### Steps:

1. **Connect GitHub Repository:**
   - Go to [Railway.app](https://railway.app)
   - Sign in with GitHub
   - Create new project from GitHub repo

2. **Configure Build Settings:**
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Root Directory: `apps/web`

3. **Set Environment Variables:**
   - Add all production environment variables
   - Railway will automatically restart the app

### Option 3: Render

Render offers free tier hosting with automatic deployments.

#### Steps:

1. **Create New Web Service:**
   - Connect your GitHub repository
   - Choose "Web Service"

2. **Configure Build:**
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Environment: `Node`

3. **Set Environment Variables:**
   - Add all production environment variables

### Option 4: DigitalOcean App Platform

DigitalOcean provides scalable hosting with managed databases.

#### Steps:

1. **Create New App:**
   - Connect GitHub repository
   - Choose "Web Service"

2. **Configure Build:**
   - Build Command: `npm run build`
   - Run Command: `npm start`
   - Source Directory: `apps/web`

3. **Add Environment Variables:**
   - Add all production environment variables

### Option 5: AWS (Advanced)

For enterprise deployments, use AWS with proper infrastructure.

#### Using AWS Amplify:

1. **Connect Repository:**
   - Go to AWS Amplify Console
   - Connect your GitHub repository

2. **Configure Build:**
   - Build Command: `npm run build`
   - Base Directory: `apps/web`
   - Output Directory: `build`

3. **Set Environment Variables:**
   - Add all production environment variables

#### Using AWS EC2 with Docker:

1. **Create EC2 Instance:**
   - Choose Ubuntu 20.04 LTS
   - Install Docker and Docker Compose

2. **Deploy with Docker:**
   ```bash
   # Clone your repository
   git clone <your-repo-url>
   cd listeningroom/apps/web
   
   # Build and run
   docker build -t listeningroom-app .
   docker run -p 3000:3000 --env-file .env.production listeningroom-app
   ```

## Docker Deployment

### Build Docker Image

```bash
# Build the image
docker build -t listeningroom-app .

# Run the container
docker run -p 3000:3000 --env-file .env.production listeningroom-app
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

## Production Checklist

### Before Deployment:

- [ ] Update all environment variables
- [ ] Configure Firebase for production
- [ ] Set up proper CORS origins
- [ ] Configure SSL/HTTPS
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies
- [ ] Test all functionality in staging

### After Deployment:

- [ ] Verify all pages load correctly
- [ ] Test user authentication
- [ ] Test file uploads
- [ ] Test training system
- [ ] Monitor performance
- [ ] Set up error tracking
- [ ] Configure analytics

## Performance Optimization

### Build Optimization:

1. **Enable Gzip Compression:**
   ```javascript
   // In your server configuration
   app.use(compression());
   ```

2. **Set Cache Headers:**
   ```javascript
   app.use(express.static('build', {
     maxAge: '1y',
     immutable: true
   }));
   ```

3. **Enable CDN:**
   - Use CloudFlare or AWS CloudFront
   - Cache static assets globally

### Database Optimization:

1. **Index Frequently Queried Fields:**
   ```javascript
   // Firebase Firestore indexes
   db.collection('sessions').where('status', '==', 'active')
   ```

2. **Implement Pagination:**
   ```javascript
   // Limit query results
   .limit(20)
   ```

## Monitoring and Logging

### Error Tracking:

1. **Sentry Integration:**
   ```bash
   npm install @sentry/react @sentry/node
   ```

2. **Configure Sentry:**
   ```javascript
   import * as Sentry from '@sentry/react';
   
   Sentry.init({
     dsn: 'your-sentry-dsn',
     environment: 'production'
   });
   ```

### Analytics:

1. **Google Analytics:**
   ```javascript
   // Add to your root component
   import { Analytics } from '@vercel/analytics/react';
   
   <Analytics />
   ```

2. **Custom Metrics:**
   ```javascript
   // Track user interactions
   const trackEvent = (eventName, properties) => {
     // Send to your analytics service
   };
   ```

## Security Considerations

### Environment Security:

1. **Never commit `.env` files**
2. **Use strong, unique secrets**
3. **Rotate secrets regularly**
4. **Use environment-specific configurations**

### Application Security:

1. **Enable HTTPS everywhere**
2. **Implement rate limiting**
3. **Validate all inputs**
4. **Use secure headers**
5. **Regular security audits**

## Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Runtime Errors:**
   - Check environment variables
   - Verify Firebase configuration
   - Check network connectivity

3. **Performance Issues:**
   - Monitor bundle size
   - Check database query performance
   - Optimize images and assets

### Getting Help:

1. **Check Logs:**
   - Application logs
   - Server logs
   - Error tracking service

2. **Debug Mode:**
   - Enable debug logging
   - Use browser dev tools
   - Check network requests

## Maintenance

### Regular Tasks:

1. **Update Dependencies:**
   ```bash
   npm update
   npm audit fix
   ```

2. **Monitor Performance:**
   - Check response times
   - Monitor error rates
   - Review user feedback

3. **Backup Data:**
   - Regular Firebase exports
   - Database backups
   - Configuration backups

### Scaling:

1. **Horizontal Scaling:**
   - Use load balancers
   - Deploy multiple instances
   - Use CDN for static assets

2. **Database Scaling:**
   - Use read replicas
   - Implement caching
   - Optimize queries

This guide should help you successfully deploy your Listening Room application to any cloud hosting platform. Choose the option that best fits your needs and budget.
