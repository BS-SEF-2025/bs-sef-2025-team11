# Deployment Guide for Online Testing

This guide helps you deploy the application online so your team can test it together.

## Deployment Options

### Option 1: Free Hosting Services

#### Backend (Django)
- **Railway** (Recommended): https://railway.app
- **Render**: https://render.com
- **Heroku**: https://heroku.com (requires credit card)

#### Frontend (React/Vite)
- **Vercel** (Recommended): https://vercel.com
- **Netlify**: https://netlify.com
- **GitHub Pages**: https://pages.github.com

## Step-by-Step Deployment

### 1. Prepare Repository for GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Campus Navigator"

# Create repository on GitHub, then:
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

### 2. Deploy Backend (Railway Example)

1. **Sign up at Railway.app**
2. **Create New Project**
3. **Add PostgreSQL Database** (or use SQLite for testing)
4. **Deploy from GitHub**
   - Connect your GitHub repository
   - Select the `backend` folder as root
   - Set build command: `pip install -r requirements.txt`
   - Set start command: `python manage.py migrate && python manage.py runserver 0.0.0.0:$PORT`
5. **Set Environment Variables** (if needed):
   - `SECRET_KEY` (generate a new one for production)
   - `DEBUG=False` (for production)
   - `ALLOWED_HOSTS=your-domain.railway.app`
6. **Get your backend URL**: `https://your-app.railway.app`

### 3. Update Backend Settings for Production

Update `backend/campus_infra/settings.py`:

```python
# For production
DEBUG = False
ALLOWED_HOSTS = ['your-app.railway.app', 'your-domain.com']

# CORS settings - add your frontend URL
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend.vercel.app",
    "http://localhost:5173",  # Keep for local dev
]
```

### 4. Deploy Frontend (Vercel Example)

1. **Sign up at Vercel.com**
2. **Import Project from GitHub**
3. **Configure Project**:
   - Framework Preset: Vite
   - Root Directory: `./` (root of repo)
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Set Environment Variables**:
   - `VITE_API_URL=https://your-backend.railway.app` (optional)
5. **Deploy**
6. **Get your frontend URL**: `https://your-app.vercel.app`

### 5. Update Frontend to Use Deployed Backend

Update `src/state/AuthContext.jsx`:

```javascript
// Change this line:
const API_BASE = import.meta.env.DEV ? "" : "http://127.0.0.1:8000";

// To:
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "" : "https://your-backend.railway.app");
```

Or create `.env.production`:
```
VITE_API_URL=https://your-backend.railway.app
```

### 6. Test Deployment

1. **Access frontend URL**
2. **Register a new user**
3. **Login**
4. **Test adding a library** (as manager)
5. **Verify data persists** after refresh
6. **Share URLs with team**

## Quick Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Frontend configured to use deployed backend
- [ ] CORS configured on backend
- [ ] Database migrations run on deployed backend
- [ ] Test user created or registration works
- [ ] Can login successfully
- [ ] Can add library (test feature)
- [ ] Data persists after refresh

## Testing with Team

### Test Scenario: Add Library Together

1. **Manager A**:
   - Login to deployed site
   - Go to Library Status
   - Add "Science Library" (Capacity: 150)

2. **Manager B** (different device/browser):
   - Login to same deployed site
   - Go to Library Status
   - Should see "Science Library" in the list
   - Can filter and search for it

3. **Student**:
   - Login to same deployed site
   - Go to Library Status
   - Should see "Science Library"
   - Can view but cannot edit (creates pending request)

### Verify Real-time Updates

1. User A updates library occupancy to 75
2. User B refreshes page
3. User B should see occupancy at 75
4. Both users see updated statistics

## Environment Variables

### Backend (.env or Railway variables)
```
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-domain.com
DATABASE_URL=postgresql://... (if using PostgreSQL)
```

### Frontend (.env.production or Vercel variables)
```
VITE_API_URL=https://your-backend.railway.app
```

## Troubleshooting Deployment

### Backend Issues
- **500 Error**: Check logs, verify migrations ran
- **CORS Error**: Update CORS_ALLOWED_ORIGINS in settings
- **Database Error**: Run migrations: `python manage.py migrate`
- **Static Files**: May need to configure static file serving

### Frontend Issues
- **404 on Routes**: Configure redirects in Vercel/Netlify
- **API Errors**: Check API_BASE URL is correct
- **Build Fails**: Check Node version, ensure all dependencies in package.json

### Vercel Redirect Configuration

Create `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Netlify Redirect Configuration

Create `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Security Notes

- Never commit `.env` files
- Use environment variables for secrets
- Change default SECRET_KEY in production
- Set DEBUG=False in production
- Use HTTPS in production
- Configure proper CORS origins

## Post-Deployment

1. **Create test users** on deployed backend
2. **Test all major features**
3. **Share URLs with team**
4. **Monitor for errors**
5. **Collect feedback**

## Support

If deployment fails:
1. Check service logs
2. Verify environment variables
3. Test locally first
4. Check service documentation
5. Review error messages carefully
