# Deployment Guide - Equipment Manager Extension

This guide explains how to deploy your Equipment Manager extension for Owlbear Rodeo.

## Quick Start (Local Testing)

1. **Run Local Server**:
   ```bash
   python3 serve.py
   # Or alternatively:
   python3 -m http.server 8080
   # Or if you have Node.js:
   npm run dev
   ```

2. **Add to Owlbear Rodeo**:
   - Open Owlbear Rodeo in your browser
   - Go to Extensions
   - Click "Add Extension"
   - Enter: `http://localhost:8080/manifest.json`
   - Click "Add"

3. **Test the Extension**:
   - Create or join a room
   - Enable the "Equipment Manager" extension
   - The extension should appear in your sidebar

## Production Deployment

### Option 1: GitHub Pages (Free)

1. **Create GitHub Repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/owlbear-equipment-manager.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository settings
   - Scroll to "Pages" section
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)"
   - Save

3. **Update Manifest URL**:
   - Your extension will be available at: `https://yourusername.github.io/owlbear-equipment-manager/manifest.json`

### Option 2: Vercel (Free)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Your extension will be available at the provided Vercel URL**

### Option 3: Netlify (Free)

1. **Install Netlify CLI**:
   ```bash
   npm i -g netlify-cli
   ```

2. **Deploy**:
   ```bash
   netlify deploy --prod --dir .
   ```

### Option 4: Cloudflare Pages (Free)

1. **Connect your GitHub repository to Cloudflare Pages**
2. **Set build settings**:
   - Build command: (leave empty)
   - Build output directory: (leave empty or set to "/")
3. **Deploy**

## Adding to Owlbear Rodeo Extension Store

Once deployed, you can submit your extension to the official store:

1. **Fork the Extensions Repository**:
   ```bash
   git clone https://github.com/owlbear-rodeo/extensions.git
   ```

2. **Add Your Extension**:
   - Edit `extensions.json`
   - Add your extension details:
   ```json
   {
     "title": "Equipment Manager",
     "description": "A comprehensive equipment and inventory management system for RPG characters",
     "author": "Your Name",
     "image": "/path/to/screenshot.png",
     "tags": ["character-sheet", "inventory", "equipment", "rpg"],
     "manifest": "https://your-domain.com/manifest.json",
     "contact": "your-email@example.com"
   }
   ```

3. **Submit Pull Request**:
   - Create a branch with your extension
   - Submit a pull request to the main repository
   - Include screenshots and description

## Verification Process

To get your extension verified:

1. **Ensure Quality Standards**:
   - Works across devices and browsers
   - Follows accessibility guidelines
   - Uses Owlbear Rodeo APIs properly
   - Has proper error handling

2. **Request Verification**:
   - After your extension is in the store
   - Comment on your PR with: `/verify Equipment Manager`
   - The team will review and verify if it meets standards

## File Checklist

Make sure you include these files in your deployment:

- ✅ `index.html` - Main extension interface
- ✅ `manifest.json` - Extension manifest
- ✅ `standalone-equipment-system.js` - Core functionality
- ✅ `icon.svg` - Extension icon
- ✅ `README.md` - Documentation
- ✅ `package.json` - Package information

## Testing Checklist

Before deploying, test:

- ✅ Extension loads without errors
- ✅ Character creation and selection works
- ✅ Equipment can be added, edited, and equipped
- ✅ Data persists between sessions
- ✅ Encumbrance calculation works correctly
- ✅ Gold/currency system functions properly
- ✅ Search and filtering work
- ✅ Responsive design on mobile
- ✅ Dark theme styling is correct

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure your hosting platform serves files with proper headers
2. **SDK Not Loading**: Verify the Owlbear Rodeo SDK URL is correct
3. **Manifest Not Found**: Check the manifest.json file is accessible at the provided URL
4. **Data Not Saving**: Ensure the extension has proper permissions in the manifest

### Debug Mode:

Open browser developer tools to see console messages and errors. The extension logs detailed information about initialization and data operations.

## Support

For deployment issues:
- Check the Owlbear Rodeo Discord #extensions channel
- Review the official documentation at docs.owlbear.rodeo
- Open an issue on the GitHub repository