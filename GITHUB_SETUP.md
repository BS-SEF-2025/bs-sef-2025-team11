# GitHub Setup Guide

This guide will help you share your code on GitHub and test it with your team.

## Step 1: Prepare Your Code

✅ **Already Done:**
- `.gitignore` configured
- `requirements.txt` created
- `README.md` updated
- Documentation files created

## Step 2: Initialize Git (if not done)

```bash
# Check if git is initialized
git status

# If not initialized:
git init
git add .
git commit -m "Initial commit - Campus Navigator with room requests and filters"
```

## Step 3: Create GitHub Repository

1. Go to https://github.com
2. Click "New repository"
3. Name it (e.g., `campus-navigator`)
4. **Don't** initialize with README (you already have one)
5. Click "Create repository"

## Step 4: Push to GitHub

```bash
# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/cAMPUS-NAVIGATOR.git

# Push code
git branch -M main
git push -u origin main
```

## Step 5: Share with Team

1. Go to your repository settings
2. Click "Collaborators"
3. Add your teammates by their GitHub usernames
4. They can now clone and contribute

## Step 6: Test Locally First

Before deploying online, test locally:

```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py create_test_users
python manage.py runserver

# Frontend (new terminal)
npm install
npm run dev
```

**Test adding a library:**
1. Login as manager (`manager@campus.edu` / `manager123`)
2. Go to Library Status
3. Click "Add Library"
4. Add "Test Library" with capacity 100
5. Verify it appears in the list

## Step 7: Deploy Online

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

### Quick Deploy Options:

**Backend:**
- Railway: https://railway.app (free tier available)
- Render: https://render.com (free tier available)

**Frontend:**
- Vercel: https://vercel.com (free, connects to GitHub)
- Netlify: https://netlify.com (free, connects to GitHub)

## Step 8: Test Online with Team

### Example Test Scenario:

1. **Deploy both backend and frontend**
2. **Share URLs with team:**
   - Frontend: `https://your-app.vercel.app`
   - Backend: `https://your-app.railway.app`

3. **Test Adding Library Together:**
   - Manager A: Login → Add "Science Library"
   - Manager B: Login → Should see "Science Library"
   - Student: Login → Should see "Science Library"
   - All: Can filter and search for it

4. **Test Real-time Updates:**
   - User A: Update library occupancy to 50
   - User B: Refresh page → Should see 50
   - Verify statistics update

5. **Test Room Requests:**
   - Lecturer: Create room request
   - Manager: See request → Approve → Assign room
   - Verify room becomes unavailable

## Files to Review Before Pushing

- [ ] `.gitignore` excludes sensitive files
- [ ] No passwords or API keys in code
- [ ] `requirements.txt` has all dependencies
- [ ] `package.json` has all dependencies
- [ ] README.md is helpful
- [ ] Test users can be created

## What Gets Pushed to GitHub

✅ **Included:**
- All source code
- Configuration files
- Documentation
- Migration files

❌ **Excluded (by .gitignore):**
- `node_modules/`
- `venv/`
- `db.sqlite3`
- `__pycache__/`
- `.env` files

## Team Collaboration Workflow

1. **Clone repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/campus-navigator.git
   cd campus-navigator
   ```

2. **Setup locally:**
   ```bash
   # Follow SETUP_GUIDE.md
   ```

3. **Make changes:**
   ```bash
   git checkout -b feature-name
   # Make changes
   git add .
   git commit -m "Description of changes"
   git push origin feature-name
   ```

4. **Create Pull Request:**
   - Go to GitHub
   - Create pull request
   - Team reviews and merges

## Testing Checklist

Use `TESTING_CHECKLIST.md` to verify everything works before sharing.

## Quick Commands Reference

```bash
# Start backend
cd backend
venv\Scripts\activate
python manage.py runserver

# Start frontend
npm run dev

# Create test users
cd backend
python manage.py create_test_users

# Run migrations
python manage.py migrate

# Check git status
git status

# Add files
git add .

# Commit
git commit -m "Your message"

# Push
git push origin main
```

## Need Help?

- Check `SETUP_GUIDE.md` for detailed setup
- Check `DEPLOYMENT_GUIDE.md` for deployment
- Check `TESTING_CHECKLIST.md` for testing
- Review error messages in browser console and terminal
