# Equipment Manager - Deployment Guide

This document provides comprehensive instructions for deploying the Equipment Manager Owlbear Rodeo Extension with backend support using Vercel and Neon.

## Overview

The Equipment Manager now supports both local storage (Owlbear Rodeo metadata) and backend persistence (Neon PostgreSQL via Vercel API). This hybrid approach provides:

- **Immediate responsiveness** with local storage
- **Cross-device synchronization** with backend storage
- **Automatic fallback** when backend is unavailable
- **Conflict resolution** for simultaneous edits

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Neon Account**: Sign up at [neon.tech](https://neon.tech)
3. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, etc.)

## Step 1: Set Up Neon Database

### 1.1 Create Neon Project
1. Log into your Neon console
2. Click "Create Project"
3. Choose a name (e.g., "equipment-manager")
4. Select a region close to your users
5. Note down the connection string

### 1.2 Initialize Database
1. Connect to your Neon database using the provided connection string
2. Run the initialization script:
   ```sql
   -- Copy and paste the contents of scripts/init-db.sql
   ```
   Or use the Neon SQL Editor to run `/scripts/init-db.sql`

### 1.3 Get Connection Details
From your Neon dashboard, copy the connection string. It should look like:
```
postgresql://username:password@host:port/database?sslmode=require
```

## Step 2: Deploy to Vercel

### 2.1 Connect Repository
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Vercel will auto-detect the project settings

### 2.2 Configure Environment Variables
In Vercel's project settings, add these environment variables:

| Name | Value | Notes |
|------|-------|-------|
| `DATABASE_URL` | Your Neon connection string | Required for backend functionality |
| `NODE_ENV` | `production` | Recommended |

### 2.3 Deploy
1. Click "Deploy" 
2. Vercel will build and deploy your project
3. Note the deployment URL (e.g., `https://your-project.vercel.app`)

## Step 3: Configure Owlbear Extension

### 3.1 Update Manifest URL
Your extension manifest will be available at:
```
https://your-project.vercel.app/manifest.json
```

### 3.2 Install in Owlbear Rodeo
1. Open Owlbear Rodeo
2. Go to Extensions
3. Click "Add Extension"
4. Enter your manifest URL
5. Click "Add"

## Features and Architecture

### Hybrid Storage System
- **Primary**: Backend database (Neon PostgreSQL)
- **Fallback**: Local storage (Owlbear Rodeo metadata)
- **Sync**: Automatic synchronization between local and remote

### API Endpoints
- `GET /api/characters?roomId={id}` - Load characters for a room
- `POST /api/characters` - Create/update character
- `DELETE /api/characters?roomId={id}&characterId={id}` - Delete character
- `POST /api/sync` - Synchronize local and remote data
- `GET /api/health` - Health check

### Data Flow
1. Extension loads → Check backend availability
2. Load from local storage (immediate)
3. Sync with backend (if available)
4. Resolve conflicts (user prompt)
5. Save changes → Local first, then backend

## Local Development

### Setup
```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your database URL

# Start development server
npm run dev
```

### Testing Backend Locally
For local API testing, you can use Vercel CLI:
```bash
# Install Vercel CLI
npm install -g vercel

# Start local development
vercel dev
```

## Troubleshooting

### Backend Not Available
- Extension automatically falls back to local storage
- Data is preserved and will sync when backend becomes available
- Check Vercel function logs for errors

### Database Connection Issues
- Verify `DATABASE_URL` environment variable
- Check Neon database status
- Ensure connection string includes `?sslmode=require`

### CORS Issues
- All API endpoints include proper CORS headers
- Verify your domain is not blocked

### Sync Conflicts
- Extension prompts user to choose between local/server data
- Default behavior prefers server data
- Manual resolution available through conflict dialog

## Monitoring and Maintenance

### Vercel Analytics
- Function execution logs available in Vercel dashboard
- Monitor API response times and error rates

### Neon Database
- Monitor connection count and query performance
- Database metrics available in Neon console

### Extension Logs
- Client-side logs available in browser developer tools
- Check for API errors and sync issues

## Security Considerations

### Database Security
- Connection string uses SSL (`sslmode=require`)
- Neon provides automatic connection pooling
- No sensitive data stored beyond character equipment

### API Security
- CORS properly configured for Owlbear Rodeo
- No authentication required (data scoped by room ID)
- Rate limiting handled by Vercel

### Data Privacy
- Data scoped to individual Owlbear Rodeo rooms
- No cross-room data access
- Local storage fallback preserves privacy

## Scaling Considerations

### Neon Database
- Free tier: 512 MB storage, 1 GB data transfer
- Paid tiers: Unlimited storage, higher limits
- Automatic scaling with usage

### Vercel Functions
- Free tier: 100 GB-hours, 100,000 invocations
- Automatic scaling based on demand
- Edge deployment for global performance

## Migration from Local-Only

Existing installations will automatically migrate:
1. Local data preserved during upgrade
2. Backend sync initiated on first load
3. No data loss during transition
4. Gradual rollout possible

## Support and Updates

### Version Management
- Semantic versioning in `package.json`
- Vercel auto-deploys from main branch
- Manual deployments via Vercel CLI

### Backup Strategy
- Neon provides automatic backups
- Local storage provides additional redundancy
- Export functionality available in extension

---

## Quick Reference

### URLs
- **Production**: `https://your-project.vercel.app`
- **Manifest**: `https://your-project.vercel.app/manifest.json`
- **API Health**: `https://your-project.vercel.app/api/health`

### Environment Variables
```bash
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require
NODE_ENV=production
```

### Key Files
- `/api/*` - Vercel serverless functions
- `/scripts/init-db.sql` - Database initialization
- `/api-client.js` - Frontend API integration
- `/vercel.json` - Vercel configuration