# Deploy to GitHub - Step by Step Guide

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in the details:
   - **Repository name**: `spreadai` (or your preferred name)
   - **Description**: "AI Chat Assistant built with React, Node.js, and Google Gemini API"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **"Create repository"**

## Step 2: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/spreadai.git

# Or if you prefer SSH:
# git remote add origin git@github.com:YOUR_USERNAME/spreadai.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 3: Verify Deployment

1. Go to your GitHub repository page
2. You should see all your files
3. Check that `.env` files are **NOT** visible (they should be in `.gitignore`)

## Important Security Checklist

Before pushing, make sure:

- ✅ `.env` files are in `.gitignore`
- ✅ `*-firebase-adminsdk-*.json` files are in `.gitignore`
- ✅ No API keys are in the code
- ✅ No passwords are in the code
- ✅ All sensitive files are excluded

## Quick Commands

```bash
# Check what will be committed
git status

# See what files are ignored
git status --ignored

# If you accidentally committed .env files, remove them:
git rm --cached packages/api/.env
git rm --cached packages/web/.env
git commit -m "Remove .env files from git"

# Then push
git push
```

## After Deployment

1. **Set up GitHub Secrets** (for CI/CD if needed):
   - Go to repository → Settings → Secrets and variables → Actions
   - Add secrets for:
     - `GEMINI_API_KEY`
     - `FIREBASE_SERVICE_ACCOUNT`
     - Other sensitive variables

2. **Update README** with your repository URL

3. **Add deployment badges** (optional)

## Troubleshooting

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/spreadai.git
```

### Error: "failed to push some refs"
```bash
# Pull first, then push
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Check if .env files are tracked
```bash
git ls-files | grep .env
# If any .env files show up, remove them:
git rm --cached <file>
git commit -m "Remove .env from tracking"
```

## Next Steps

After deploying to GitHub, you can:
- Set up GitHub Actions for CI/CD
- Deploy to Vercel/Netlify for frontend
- Deploy to Railway/Render for backend
- Add collaborators
- Create issues and project boards

