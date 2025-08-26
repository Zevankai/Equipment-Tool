# Troubleshooting Guide - Equipment Manager

## "Not Serving Traffic" Issues

If Vercel shows "not serving traffic" or deployment issues, try these solutions:

### 1. Check Deployment Status
- Go to your Vercel dashboard
- Check if the deployment completed successfully
- Look for any error messages in the build logs

### 2. Verify Files Are Accessible
Test these URLs directly in your browser:
- `https://your-project.vercel.app/` (should show index.html)
- `https://your-project.vercel.app/manifest.json` (should show the manifest)
- `https://your-project.vercel.app/api/` (should show API info)
- `https://your-project.vercel.app/api/health` (should show health status)

### 3. Common Fixes

#### Fix 1: Redeploy from Vercel Dashboard
1. Go to your Vercel project dashboard
2. Click "Deployments" tab
3. Click "Redeploy" on the latest deployment
4. Wait for completion

#### Fix 2: Check Domain Configuration
1. In Vercel dashboard, go to Settings → Domains
2. Ensure your domain is properly configured
3. Try using the `.vercel.app` URL directly

#### Fix 3: Environment Variables
1. Go to Settings → Environment Variables
2. Add `DATABASE_URL` if using database features
3. Redeploy after adding variables

#### Fix 4: Clear Cache
1. Go to Settings → General
2. Scroll to "Clear Cache"
3. Click "Clear Build Cache"
4. Redeploy

### 4. Local Testing
You can test the extension locally without deployment:

```bash
# Start local server
python3 -m http.server 8080

# Or use Node.js
npx http-server -p 8080 -c-1

# Add to Owlbear Rodeo
http://localhost:8080/manifest.json
```

### 5. Extension Without Backend
The extension works in local-only mode if backend is unavailable:
- Data saves to Owlbear Rodeo room metadata
- No cross-device sync, but full functionality
- Shows "💾 Local Storage Only" in status indicator

### 6. API Testing
Test API endpoints manually:

```bash
# Health check
curl https://your-project.vercel.app/api/health

# API info
curl https://your-project.vercel.app/api/

# Test characters endpoint (should return empty object for new room)
curl "https://your-project.vercel.app/api/characters?roomId=test"
```

### 7. Vercel Function Logs
1. Go to Vercel dashboard
2. Click on your project
3. Go to "Functions" tab
4. Check logs for any errors

### 8. Manual Deployment via CLI

If web deployment fails, try CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
vercel --prod
```

### 9. Alternative: GitHub Pages Deployment
If Vercel continues to have issues, you can deploy to GitHub Pages (local storage only):

1. Go to GitHub repository settings
2. Enable GitHub Pages from main branch
3. Use URL: `https://yourusername.github.io/Equipment-Tool/manifest.json`

### 10. Check Browser Console
When testing the extension:
1. Open browser developer tools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Look for CORS or loading errors

## Common Error Messages

### "Function Invocation Failed"
- Check API file syntax
- Verify dependencies in package.json
- Check environment variables

### "Build Failed"
- Check vercel.json syntax
- Verify all referenced files exist
- Check package.json scripts

### "Domain Not Found"
- Wait a few minutes after deployment
- Try the .vercel.app URL
- Check DNS settings if using custom domain

### "API Timeout"
- Database connection issues
- Check DATABASE_URL format
- Verify Neon database is running

## Contact Support

If issues persist:
1. Check Vercel status page
2. Contact Vercel support
3. Open GitHub issue with error details
4. Join Owlbear Rodeo Discord #extensions

## Fallback Options

1. **Local Storage Only**: Extension works without backend
2. **GitHub Pages**: Static hosting for basic functionality  
3. **Other Platforms**: Netlify, Cloudflare Pages work too
4. **Self-Hosting**: Deploy on your own server

Remember: The extension is designed to work offline and will automatically fallback to local storage if the backend is unavailable!