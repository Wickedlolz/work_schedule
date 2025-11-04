# 🚀 Deployment Guide

## GitHub Pages Deployment (Recommended)

This project is configured to automatically deploy to GitHub Pages using GitHub Actions.

### Setup Steps:

1. **Add GitHub Secrets** (required for Firebase config):

   - Go to your repository → Settings → Secrets and variables → Actions
   - Click "New repository secret" and add each of these:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`

2. **Enable GitHub Pages**:

   - Go to Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` / `root`
   - Save

3. **Deploy**:
   - Push to `main` branch
   - GitHub Actions will automatically build and deploy
   - View workflow status in the "Actions" tab

### Important Security Notes:

- ✅ Firebase API keys in client-side apps are **safe to expose** (they're meant for browsers)
- ✅ Security is enforced by **Firestore Security Rules**, not by hiding keys
- ✅ Always use **environment variables** (never hardcode in source)
- ✅ The workflow uses **GitHub Secrets** to inject keys during build
- ⚠️ Make sure your Firebase Security Rules are properly configured

---

## Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
4. Deploy

### Using Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

---

## Netlify Deployment

### Option 1: Netlify CLI

```bash
# Build the project
npm run build

# Deploy dist folder
netlify deploy --prod --dir=dist
```

### Option 2: Netlify Dashboard

1. Push code to GitHub
2. Import project in Netlify
3. Add environment variables in Netlify dashboard
4. Set build command: `npm run build`
5. Set publish directory: `dist`
6. Deploy

**Important:** Add all Firebase environment variables in Netlify dashboard.

---

## Manual Deployment

If you want to deploy to any static hosting:

1. **Build the project**:

```bash
npm run build
```

2. **Upload the `dist` folder** to your hosting provider

3. **Configure environment variables** on your hosting platform

4. **Ensure proper routing** - All routes should serve `index.html` for SPA to work

---

## Environment Variables

All deployment platforms require these environment variables:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## Build Configuration

The project uses Vite with the following configuration:

```typescript
// vite.config.ts
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: command === "build" ? "/work_schedule/" : "/",
}));
```

**Note:** The `base` path is set to `/work_schedule/` for GitHub Pages. Adjust this if deploying to a different platform.

---

## Troubleshooting Deployment

### Build Fails

1. **Check Node version** - Ensure you're using Node 20+
2. **Clear cache**: `rm -rf node_modules package-lock.json && npm install`
3. **Check environment variables** - Make sure all Firebase variables are set

### Firebase Not Working After Deployment

1. **Verify environment variables** are set correctly
2. **Check Firebase console** - Ensure domain is whitelisted
3. **Check Firestore Rules** - Make sure they allow read/write operations
4. **Check browser console** for specific Firebase errors

### 404 Errors on Page Refresh

This happens because the hosting doesn't route all requests to `index.html`. Solutions:

**Netlify:** Add `_redirects` file in `public/`:

```
/*    /index.html   200
```

**Vercel:** Add `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

**GitHub Pages:** This is handled automatically by the SPA routing.

---

## Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Firebase domain whitelisted
- [ ] Firestore rules deployed
- [ ] Test authentication flow
- [ ] Test schedule creation/editing
- [ ] Test PDF/Excel export
- [ ] Check mobile responsiveness
- [ ] Verify SEO meta tags
- [ ] Test on different browsers
- [ ] Check console for errors
