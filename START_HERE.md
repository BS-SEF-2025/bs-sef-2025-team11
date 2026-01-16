# 🚀 Start Here - GitHub & Online Testing Guide

## What's Ready for You

✅ **All files prepared for GitHub:**
- `.gitignore` - Excludes sensitive files
- `requirements.txt` - Python dependencies
- `README.md` - Project overview
- `SETUP_GUIDE.md` - Detailed setup instructions
- `DEPLOYMENT_GUIDE.md` - How to deploy online
- `GITHUB_SETUP.md` - GitHub workflow
- `TESTING_CHECKLIST.md` - Testing guide
- `QUICK_DEPLOY.md` - Fastest deployment option

## Quick Steps to Share on GitHub

### 1. Push to GitHub (5 minutes)

```bash
# If git not initialized:
git init
git add .
git commit -m "Campus Navigator - Complete system with room requests and filters"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/campus-navigator.git
git branch -M main
git push -u origin main
```

### 2. Deploy Online (15 minutes)

**Backend (Railway):**
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select repo → Set root: `backend`
4. Deploy → Get URL

**Frontend (Vercel):**
1. Go to https://vercel.com
2. Import from GitHub
3. Add env var: `VITE_API_URL` = your Railway URL
4. Deploy → Get URL

**Update code:**
- Edit `src/state/AuthContext.jsx` line 6 to use `VITE_API_URL`
- Commit and push (Vercel auto-deploys)

### 3. Test with Team

1. **Share URLs** with teammates
2. **Test together:**
   - Manager adds "Science Library"
   - Everyone sees it
   - Test filters and search
   - Test room requests

## Test Scenario: Add Library

1. Login as manager: `manager@campus.edu` / `manager123`
2. Go to "Library Status"
3. Click "Add Library"
4. Name: "Science Library", Capacity: 150
5. Click "Add Library"
6. ✅ Verify it appears
7. ✅ Team members can see it
8. ✅ Filters work
9. ✅ Can edit name

## Files You Need

### For GitHub:
- ✅ All source code
- ✅ `requirements.txt`
- ✅ `package.json`
- ✅ Documentation files
- ❌ NO `node_modules/`
- ❌ NO `venv/`
- ❌ NO `db.sqlite3`

### For Deployment:
- Backend URL (from Railway/Render)
- Frontend URL (from Vercel/Netlify)

## Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `SETUP_GUIDE.md` | Local setup instructions |
| `DEPLOYMENT_GUIDE.md` | Online deployment guide |
| `GITHUB_SETUP.md` | GitHub workflow |
| `QUICK_DEPLOY.md` | Fastest deployment option |
| `TESTING_CHECKLIST.md` | What to test |
| `PRE_DEPLOYMENT_CHECKLIST.md` | Before deploying |

## Quick Test Commands

```bash
# Test locally first:
cd backend
python manage.py runserver

# In another terminal:
npm run dev

# Create test users:
cd backend
python manage.py create_test_users
```

## Common Questions

**Q: What if deployment fails?**
A: Check `DEPLOYMENT_GUIDE.md` troubleshooting section

**Q: How do I test with teammates?**
A: Deploy online, share URLs, use `TESTING_CHECKLIST.md`

**Q: What if data doesn't persist?**
A: Make sure migrations ran on deployed backend

**Q: How do I update the deployed site?**
A: Push to GitHub, Vercel/Railway auto-deploys

## Next Steps

1. ✅ Review `PRE_DEPLOYMENT_CHECKLIST.md`
2. ✅ Push to GitHub
3. ✅ Deploy using `QUICK_DEPLOY.md`
4. ✅ Test with team using `TESTING_CHECKLIST.md`
5. ✅ Verify adding library works online

## Support

- Check documentation files
- Review error messages
- Test locally first
- Check service logs

**Ready to deploy? Start with `QUICK_DEPLOY.md`!** 🚀
