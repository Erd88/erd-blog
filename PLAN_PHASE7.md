# Phase 7: Production & SEO - Implementation Plan

## Overview
Bu phase blog projesini production-ready hale getirmeyi hedefler: SEO optimizasyonları, security hardening, error handling ve deployment configuration.

---

## Mevcut Durum Analizi

| Özellik | Durum |
|---------|-------|
| RSS Feed | ✅ Var |
| Sitemap.xml | ✅ Var |
| robots.txt | ✅ Var |
| Contact Form Backend | ✅ Var |
| Contact Form Frontend | ✅ Var |
| SEOHead Component | ✅ Var |
| Helmet Security | ❌ Yok |
| Rate Limiting | ❌ Yok |
| Global Error Boundary | ❌ Yok |
| Structured Data | ❌ Yok |
| Environment Validation | ❌ Yok |
| Deployment Config | ❌ Yok |

---

## 1. Backend Security & Performance

### 1.1 Helmet Security Headers
**Dosya:** `server/src/middleware/security.ts`

```typescript
// Security headers configuration
- Content Security Policy
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection
- Strict-Transport-Security
- Referrer-Policy
```

### 1.2 Rate Limiting
**Dosya:** `server/src/middleware/rateLimiter.ts`

| Route | Limit | Window |
|-------|-------|--------|
| /api/contact | 5 requests | 15 min |
| /api/auth/* | 10 requests | 15 min |
| /api/* (general) | 100 requests | 15 min |

### 1.3 Environment Validation
**Dosya:** `server/src/config.ts`

Zod ile environment validation:
- PORT (number, default: 3001)
- JWT_SECRET (string, min 32 chars in production)
- CORS_ORIGIN (string, URL format)
- NODE_ENV (enum: development, production, test)

---

## 2. Backend Error Handling Improvements

### 2.1 Enhanced Error Handler
**Dosya:** `server/src/middleware/errorHandler.ts`

Eklenecekler:
- Error logging with timestamp
- Production vs Development error messages
- Request ID tracking
- Stack trace filtering (dev only)

---

## 3. Frontend Error Handling

### 3.1 Global Error Boundary
**Dosya:** `client/src/components/error/ErrorBoundary.tsx`

Features:
- Catch React render errors
- Fallback UI with retry button
- Error reporting (console + optional service)
- Graceful degradation

### 3.2 API Error Improvements
**Dosya:** `client/src/api/client.ts`

- Request/Response interceptors
- Automatic token refresh (if needed)
- Network error handling
- Timeout configuration

---

## 4. SEO Enhancements

### 4.1 Structured Data (JSON-LD)
**Dosya:** `client/src/components/seo/StructuredData.tsx`

Types to implement:
- WebSite (homepage)
- BlogPosting (post detail)
- BreadcrumbList (navigation)
- Organization (site info)

### 4.2 Per-Page SEO Improvements

| Page | Title | Description | OG Image |
|------|-------|-------------|----------|
| Home | "Blog Name" | Site description | Default OG |
| Post | "{title} | Blog Name" | Excerpt | Cover image |
| Category | "{name} Posts | Blog Name" | Category description | Default OG |
| Search | "Search: {query} | Blog Name" | Results count | Default OG |
| Contact | "Contact | Blog Name" | Contact page desc | Default OG |
| 404 | "Page Not Found | Blog Name" | Default | Default OG |

### 4.3 Canonical URLs
- Her sayfa için unique canonical URL
- Query params temizleme
- Trailing slash handling

---

## 5. Deployment Configuration

### 5.1 Vercel Serverless (Backend)
**Dosya:** `server/vercel.json`

```json
{
  "version": 2,
  "builds": [...],
  "routes": [...],
  "env": {
    "NODE_ENV": "production"
  }
}
```

**Dosya:** `server/api/index.ts` (Vercel entry point)

### 5.2 Netlify SPA (Frontend)
**Dosya:** `client/netlify.toml`

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 5.3 Root Package Scripts
**Dosya:** `package.json` (root)

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "cd server && npm run dev",
    "dev:client": "cd client && npm run dev",
    "build": "npm run build:server && npm run build:client",
    "build:server": "cd server && npm run build",
    "build:client": "cd client && npm run build",
    "start": "cd server && npm start"
  }
}
```

---

## 6. Production Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Security headers tested
- [ ] Rate limiting tested
- [ ] Error boundaries tested
- [ ] SEO meta tags verified
- [ ] RSS feed validated
- [ ] Sitemap submitted to Google
- [ ] robots.txt validated

### Performance
- [ ] Bundle size checked
- [ ] Lazy loading implemented
- [ ] Images optimized
- [ ] Caching headers configured

### Security
- [ ] JWT secret strong (32+ chars)
- [ ] CORS origin restricted
- [ ] Rate limits active
- [ ] Helmet headers active
- [ ] No sensitive data in client

---

## File Structure Changes

```
blog/
├── PLAN_PHASE7.md          # This plan
├── package.json            # Root scripts
├── server/
│   ├── api/
│   │   └── index.ts        # Vercel entry
│   ├── vercel.json         # Vercel config
│   ├── src/
│   │   ├── middleware/
│   │   │   ├── security.ts      # NEW: Helmet
│   │   │   ├── rateLimiter.ts   # NEW: Rate limiting
│   │   │   └── errorHandler.ts  # UPDATE: Enhanced
│   │   └── config.ts       # UPDATE: Env validation
│   └── package.json        # UPDATE: Add helmet
├── client/
│   ├── netlify.toml        # NEW: Netlify config
│   ├── public/
│   │   └── og-default.png  # NEW: Default OG image
│   └── src/
│       ├── components/
│       │   ├── error/
│       │   │   └── ErrorBoundary.tsx  # NEW
│       │   └── seo/
│       │       ├── SEOHead.tsx        # UPDATE
│       │       └── StructuredData.tsx # NEW
│       └── pages/
│           └── ...         # UPDATE: Add SEO
└── .env.example            # UPDATE: Document env vars
```

---

## Implementation Order

1. **Backend Security** - Güvenlik kritik, önce bu
2. **Backend Error Handling** - Sağlam temel
3. **Environment Validation** - Config güvenliği
4. **Frontend Error Boundary** - UX iyileştirmesi
5. **SEO Enhancements** - Arama motorları için
6. **Deployment Config** - Canlıya alma hazırlığı
7. **Root Scripts** - Developer experience
8. **Final Verification** - Production ready check
