# 🎮 Game Deployment Guide

This project uses a dual-branch deployment strategy with GitHub Pages and GitHub Actions.

## 🌿 Branch Strategy

### **Main Branch (Production)**
- **Purpose**: Live, stable version for players
- **URL**: `https://sl4ppy.github.io/gyruss-tube-shooter/`
- **Deployment**: Automatic via GitHub Actions
- **When to use**: Only when features are tested and ready for players

### **Development Branch (Testing)**
- **Purpose**: Testing new features and fixes
- **URL**: `https://sl4ppy.github.io/gyruss-tube-shooter/development/`
- **Deployment**: Automatic via GitHub Actions
- **When to use**: Daily development and testing

## 🚀 Workflow

### **For Daily Development:**
```bash
# Switch to development branch
git checkout development

# Make your changes
# ... edit files ...

# Commit and push to development
git add .
git commit -m "Add new feature: [description]"
git push origin development
```

### **To Release to Production:**
```bash
# Merge development into main
git checkout main
git merge development
git push origin main

# Or create a pull request on GitHub for review
```

## 📋 Setup Instructions

### **1. GitHub Pages Configuration**
- Go to your repository Settings → Pages
- Set Source to "GitHub Actions" (not "Deploy from a branch")
- This allows the workflow to manage deployments

### **2. Branch Protection (Recommended)**
- Go to Settings → Branches
- Add rule for `main` branch:
  - Require pull request reviews
  - Require status checks to pass
  - Restrict pushes to matching branches

## 🔧 Manual Deployment Commands

### **Deploy Development Version:**
```bash
git checkout development
git add .
git commit -m "Development update"
git push origin development
```

### **Deploy Production Version:**
```bash
git checkout main
git merge development
git push origin main
```

## 🎯 Benefits

- **Safe Testing**: Test features without affecting live players
- **Continuous Development**: Keep working while production stays stable
- **Easy Rollback**: If issues arise, production remains untouched
- **Player Experience**: Live game stays stable and reliable

## 📊 Monitoring

- **Production**: Check `https://sl4ppy.github.io/gyruss-tube-shooter/`
- **Development**: Check `https://sl4ppy.github.io/gyruss-tube-shooter/development/`
- **GitHub Actions**: Monitor deployment status in the Actions tab

## 🚨 Troubleshooting

### **If Development Doesn't Deploy:**
1. Check GitHub Actions tab for errors
2. Verify the workflow file is in `.github/workflows/deploy.yml`
3. Ensure GitHub Pages is set to "GitHub Actions" source

### **If Production Doesn't Update:**
1. Check that you're on the `main` branch
2. Verify the merge was successful
3. Check GitHub Actions for deployment status 