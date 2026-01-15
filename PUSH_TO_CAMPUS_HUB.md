# Push to campus_hub Repository - Authentication Guide

## ⚠️ Permission Issue

You're getting a permission denied error because:
- Repository: `mohamdbadhe/campus_hub`
- Authenticating as: `mohamdbadhe123` (different account)

## 🔐 Solutions

### Option 1: Use Personal Access Token (Recommended)

1. **Create a Personal Access Token:**
   - Go to GitHub.com
   - Click your profile → **Settings**
   - Go to **Developer settings** → **Personal access tokens** → **Tokens (classic)**
   - Click **"Generate new token (classic)"**
   - Name it: "Campus Hub Push"
   - Select scope: **`repo`** (full control)
   - Click **"Generate token"**
   - **COPY THE TOKEN** (you won't see it again!)

2. **Push using the token:**
   ```powershell
   cd "c:\Users\Mohamd badhe\Desktop\project_ysodot123"
   git push https://YOUR_TOKEN@github.com/mohamdbadhe/campus_hub.git main
   ```
   (Replace `YOUR_TOKEN` with the token you copied)

   Or use it as password when prompted:
   ```powershell
   git push -u origin main
   ```
   (Use your GitHub username, and the token as password)

### Option 2: Update Git Credentials

```powershell
# Clear cached credentials
git credential-manager erase
# Or on Windows:
cmdkey /list
# Find github.com entries and delete them:
cmdkey /delete:git:https://github.com
```

Then try pushing again - it will prompt for credentials.

### Option 3: Use SSH Instead of HTTPS

1. **Set up SSH key** (if you haven't):
   ```powershell
   # Generate SSH key
   ssh-keygen -t ed25519 -C "your_email@example.com"
   # Copy public key
   cat ~/.ssh/id_ed25519.pub
   ```

2. **Add SSH key to GitHub:**
   - GitHub → Settings → SSH and GPG keys → New SSH key
   - Paste your public key

3. **Change remote to SSH:**
   ```powershell
   git remote set-url origin git@github.com:mohamdbadhe/campus_hub.git
   git push -u origin main
   ```

### Option 4: Check Repository Ownership

Make sure you have access to the repository:
- Is `mohamdbadhe` your GitHub account?
- Or is it a different account/organization?
- Do you have write permissions?

## 🚀 Quick Fix: Try This First

```powershell
cd "c:\Users\Mohamd badhe\Desktop\project_ysodot123"

# Make sure remote is correct
git remote set-url origin https://github.com/mohamdbadhe/campus_hub.git

# Try pushing (will prompt for credentials)
git push -u origin main
```

When prompted:
- **Username**: `mohamdbadhe` (or your GitHub username)
- **Password**: Use a Personal Access Token (not your GitHub password)

## 📝 Alternative: Push to Your Own Repository

If you don't have access to `mohamdbadhe/campus_hub`, you can:

1. **Create a new repository** under your account (`mohamdbadhe123`)
2. **Update the remote:**
   ```powershell
   git remote set-url origin https://github.com/mohamdbadhe123/campus_hub.git
   git push -u origin main
   ```

## ✅ After Success

Once pushed successfully, your code will be at:
```
https://github.com/mohamdbadhe/campus_hub
```

Your friends can then clone it:
```bash
git clone https://github.com/mohamdbadhe/campus_hub.git
```
