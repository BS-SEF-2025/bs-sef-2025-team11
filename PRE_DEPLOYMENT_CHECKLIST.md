# Pre-Deployment Checklist

Use this checklist before pushing to GitHub and deploying online.

## Code Preparation

- [ ] All code is working locally
- [ ] No console errors in browser
- [ ] No errors in backend terminal
- [ ] All features tested locally
- [ ] Database migrations are up to date

## File Preparation

- [ ] `.gitignore` properly configured
- [ ] `requirements.txt` exists and is complete
- [ ] `package.json` has all dependencies
- [ ] `README.md` is updated
- [ ] No sensitive data in code (passwords, API keys)
- [ ] No `db.sqlite3` files committed
- [ ] No `node_modules` committed
- [ ] No `venv` folders committed

## Documentation

- [ ] README.md explains the project
- [ ] SETUP_GUIDE.md has setup instructions
- [ ] DEPLOYMENT_GUIDE.md has deployment steps
- [ ] TESTING_CHECKLIST.md is ready
- [ ] GITHUB_SETUP.md explains GitHub workflow

## Testing

- [ ] Can register new user
- [ ] Can login
- [ ] Manager can add library
- [ ] Manager can add lab
- [ ] Manager can add classroom
- [ ] Filters work on all pages
- [ ] Lecturer can create room request
- [ ] Manager can approve room request
- [ ] Approved room becomes unavailable
- [ ] Student updates create pending requests
- [ ] Manager can approve/reject updates

## Git Preparation

- [ ] Git repository initialized
- [ ] All files added: `git add .`
- [ ] Initial commit made: `git commit -m "Initial commit"`
- [ ] GitHub repository created
- [ ] Remote added: `git remote add origin <url>`
- [ ] Ready to push: `git push -u origin main`

## Before Deploying Online

- [ ] Backend settings updated for production (if needed)
- [ ] CORS settings include frontend URL
- [ ] Environment variables documented
- [ ] Test users can be created on deployed server
- [ ] Frontend API_BASE can be configured

## After Deployment

- [ ] Backend is accessible
- [ ] Frontend is accessible
- [ ] Frontend connects to backend
- [ ] Can login on deployed site
- [ ] Can add library (test feature)
- [ ] Data persists after refresh
- [ ] Team members can access
- [ ] Real-time updates work

## Team Testing

- [ ] Shared URLs with team
- [ ] Team can access site
- [ ] Team can login
- [ ] Tested adding library together
- [ ] Verified real-time updates
- [ ] No critical errors reported
