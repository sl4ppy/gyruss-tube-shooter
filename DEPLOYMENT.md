# 🎮 Game Deployment Guide

This project uses a simplified deployment strategy with GitHub Pages.

## 🌿 Branch Strategy

### **Main Branch (Production)**
- **Purpose**: Live, stable version for players
- **URL**: `https://sl4ppy.github.io/gyruss-tube-shooter/`
- **Deployment**: Automatic via GitHub Pages (built-in)
- **When to use**: Only when features are tested and ready for players

### **Development Branch (Testing)**
- **Purpose**: Testing new features and fixes
- **URL**: `https://sl4ppy.github.io/gyruss-tube-shooter/` (same as production)
- **Indicator**: Shows "DEVELOPMENT VERSION" text in the game
- **Deployment**: Manual merge to main branch
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
- Set Source to "Deploy from a branch"
- Select "main" branch and "/ (root)" folder
- Save the changes

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
- **Simple Deployment**: No complex GitHub Actions setup

## 📊 Monitoring

- **Production**: Check `https://sl4ppy.github.io/gyruss-tube-shooter/`
- **Development**: Same URL, but shows "DEVELOPMENT VERSION" indicator
- **GitHub Pages**: Monitor deployment status in the Pages settings

## 🚨 Troubleshooting

### **If Development Doesn't Deploy:**
1. Make sure you're on the development branch
2. Push changes to development branch
3. Merge to main when ready for production

### **If Production Doesn't Update:**
1. Check that you're on the `main` branch
2. Verify the merge was successful
3. Check GitHub Pages settings

## 🔍 How to Tell Which Version You're Playing

- **Production Version**: No special indicator
- **Development Version**: Shows "DEVELOPMENT VERSION" text in the top-left corner

## 📝 Current Status

- **Development Branch**: Active development with procedural assets
- **Production Branch**: Stable version for players
- **Deployment**: Simple GitHub Pages from main branch 