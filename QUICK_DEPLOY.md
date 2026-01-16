# Quick Deploy for Team Testing

## Fastest Way to Test Online Together

### Option 1: Railway + Vercel (Recommended - Free)

#### 1. Backend on Railway (5 minutes)

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Set root directory: `backend`
6. Railway auto-detects Python
7. Add environment variable: `PORT=8000`
8. Deploy → Get your backend URL (e.g., `https://your-app.railway.app`)

#### 2. Frontend on Vercel (3 minutes)

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Import Project"
4. Select your repository
5. Framework: Vite
6. Root Directory: `./` (root)
7. Add environment variable:
   - Key: `VITE_API_URL`
   - Value: Your Railway backend URL
8. Deploy → Get your frontend URL

#### 3. Update Frontend Code

Update `src/state/AuthContext.jsx` line 6:
```javascript
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "" : "http://127.0.0.1:8000");
```

Commit and push:
```bash
git add .
git commit -m "Configure for deployment"
git push
```

Vercel will auto-deploy!

#### 4. Run Migrations on Railway

In Railway dashboard:
- Go to your backend service
- Click "Deployments" → "View Logs"
- Or use Railway CLI: `railway run python manage.py migrate`
- Or add to startup command: `python manage.py migrate && python manage.py runserver 0.0.0.0:$PORT`

#### 5. Create Test Users

In Railway:
- Use Railway CLI or add to startup:
  `python manage.py migrate && python manage.py create_test_users && python manage.py runserver 0.0.0.0:$PORT`

### Option 2: Render (Alternative)

**Backend:**
1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repo
4. Root Directory: `backend`
5. Build: `pip install -r requirements.txt`
6. Start: `python manage.py migrate && python manage.py runserver 0.0.0.0:$PORT`

**Frontend:**
1. New → Static Site
2. Connect GitHub repo
3. Build: `npm run build`
4. Publish: `dist`

## Test with Team

1. **Share URLs:**
   - Frontend: `https://your-app.vercel.app`
   - Backend: `https://your-app.railway.app`

2. **Test Adding Library:**
   - Login as manager
   - Add "Science Library"
   - Team members refresh and see it

3. **Verify Real-time:**
   - User A updates occupancy
   - User B sees update after refresh

## Quick Commands

```bash
# Initialize git (if needed)
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
git remote add origin <your-github-url>
git push -u origin main
```

## Troubleshooting

**Backend 500 Error:**
- Run migrations: Add to startup command or use CLI

**CORS Error:**
- Update `backend/campus_infra/settings.py`:
  ```python
  CORS_ALLOWED_ORIGINS = [
      "https://your-frontend.vercel.app",
  ]
  ```

**Frontend API Error:**
- Check `VITE_API_URL` environment variable
- Verify backend URL is correct

## Success Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Can login on deployed site
- [ ] Can add library (test feature)
- [ ] Team members can access
- [ ] Data persists after refresh
