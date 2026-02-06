# Deployment Guide

This guide explains how to deploy the blog application to production.

## Architecture

- **Frontend**: React + Vite (deployed to Netlify)
- **Backend**: Express + SQLite (deployed to Vercel Serverless)
- **Database**: SQLite (file-based, included in deployment)

## Prerequisites

1. [Vercel CLI](https://vercel.com/download) installed and logged in
2. [Netlify CLI](https://docs.netlify.com/cli/get-started/) installed and logged in
3. Environment variables configured

## Environment Variables

### Backend (`server/.env`)

```env
PORT=3001
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
CORS_ORIGIN=https://your-blog.netlify.app
```

### Frontend (`client/.env`)

```env
VITE_API_URL=https://your-api.vercel.app
```

## Deployment Steps

### 1. Backend (Vercel)

```bash
cd server

# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add JWT_SECRET
vercel env add CORS_ORIGIN
vercel env add NODE_ENV production
```

### 2. Frontend (Netlify)

```bash
cd client

# Install Netlify CLI if not already installed
npm i -g netlify-cli

# Login to Netlify
netlify login

# Initialize (first time only)
netlify init

# Deploy
netlify deploy --prod

# Set environment variables
netlify env:set VITE_API_URL https://your-api.vercel.app
```

### 3. One-Command Deployment (Root)

```bash
# From project root
npm run deploy:server  # Deploy backend
npm run deploy:client  # Deploy frontend
```

## Post-Deployment Checklist

- [ ] Health check endpoint returns OK
- [ ] RSS feed is accessible at `/api/feed/rss`
- [ ] Sitemap is accessible at `/api/feed/sitemap.xml`
- [ ] robots.txt is accessible at `/api/feed/robots.txt`
- [ ] Contact form submits successfully
- [ ] Authentication works (login/logout)
- [ ] SEO meta tags are correct (check with Facebook Debugger)
- [ ] Structured data validates (use Google's Rich Results Test)

## Domain Configuration

### Custom Domain on Vercel

1. Go to Vercel Dashboard > Your Project > Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `CORS_ORIGIN` to match your custom domain

### Custom Domain on Netlify

1. Go to Netlify Dashboard > Your Site > Domain Settings
2. Add custom domain
3. Update DNS records
4. Enable HTTPS (Let's Encrypt)

## Monitoring & Logging

### Vercel
- View logs: `vercel logs your-project-name`
- Dashboard: https://vercel.com/dashboard

### Netlify
- View logs: `netlify logs`
- Dashboard: https://app.netlify.com

## Troubleshooting

### CORS Errors
Ensure `CORS_ORIGIN` matches your frontend URL exactly (including `https://`)

### Database Issues
SQLite is ephemeral on Vercel. For production with persistent data, consider:
- Vercel Postgres (recommended)
- PlanetScale
- Supabase

Update `DATABASE_URL` accordingly.

### Build Failures
```bash
# Clear caches and reinstall
npm run clean
rm -rf node_modules server/node_modules client/node_modules
npm run install:all
```

## Rollback

### Vercel
```bash
vercel rollback [deployment-url]
```

### Netlify
Use the Netlify Dashboard to restore a previous deploy.

## Security Considerations

1. **JWT Secret**: Must be at least 32 characters in production
2. **CORS**: Restrict to your frontend domain only
3. **Rate Limiting**: Already configured (5 req/15min for contact, 10 req/15min for auth)
4. **Headers**: Security headers configured via Helmet

## Performance Optimizations

- Static assets cached for 1 year
- API responses cached according to type:
  - RSS/Sitemap: 1 hour
  - Posts list: 5 minutes
  - Other: No cache

## SSL/HTTPS

Both Vercel and Netlify provide automatic SSL certificates via Let's Encrypt.

No manual configuration needed.
