# 🚀 GitHub Pages Deployment Guide

This guide will help you deploy your Gyruss-style tube shooter game to GitHub Pages.

## Prerequisites

- A GitHub account
- Git installed on your computer
- Your game files ready

## Step-by-Step Deployment

### 1. Create a New GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **"+"** icon in the top right corner
3. Select **"New repository"**
4. Fill in the details:
   - **Repository name**: `gyruss-tube-shooter` (or your preferred name)
   - **Description**: `A retro arcade tube shooter game inspired by Gyruss`
   - **Visibility**: Choose Public or Private
   - **Initialize**: Check "Add a README file"
5. Click **"Create repository"**

### 2. Upload Your Game Files

#### Option A: Using Git (Recommended)

```bash
# Clone the repository to your local machine
git clone https://github.com/your-username/gyruss-tube-shooter.git
cd gyruss-tube-shooter

# Copy your game files into this directory
# (index.html, style.css, game.js, js/ folder, assets/ folder, etc.)

# Add all files to git
git add .

# Commit the changes
git commit -m "Add Gyruss-style tube shooter game"

# Push to GitHub
git push origin main
```

#### Option B: Using GitHub Web Interface

1. In your repository, click **"Add file"** → **"Upload files"**
2. Drag and drop all your game files:
   - `index.html`
   - `style.css`
   - `game.js`
   - `js/` folder (with all JavaScript files)
   - `assets/` folder (with image files)
   - `README.md`
   - `.gitignore`
3. Add a commit message: `"Add Gyruss-style tube shooter game"`
4. Click **"Commit changes"**

### 3. Enable GitHub Pages

1. In your repository, go to **Settings** tab
2. Scroll down to **Pages** section (in the left sidebar)
3. Under **Source**, select **"Deploy from a branch"**
4. Choose **main** branch
5. Select **"/(root)"** folder
6. Click **"Save"**

### 4. Wait for Deployment

- GitHub Pages will automatically build and deploy your site
- This usually takes 1-5 minutes
- You'll see a green checkmark when it's ready

### 5. Access Your Game

Your game will be available at:
```
https://your-username.github.io/gyruss-tube-shooter/
```

## File Structure for GitHub Pages

Make sure your repository has this structure:
```
gyruss-tube-shooter/
├── index.html
├── style.css
├── game.js
├── README.md
├── .gitignore
├── js/
│   ├── config.js
│   ├── Player.js
│   ├── BulletManager.js
│   ├── EffectsManager.js
│   ├── EnemyManager.js
│   ├── CollisionManager.js
│   ├── GameScene.js
│   └── MenuScene.js
└── assets/
    ├── player_ship.png
    ├── red_enemy_ship.png
    ├── green_enemy_ship.png
    ├── yellow_enemy_ship.png
    └── purple_enemy_ship.png
```

## Troubleshooting

### Game Not Loading
- Check that all files are in the correct locations
- Ensure `index.html` is in the root directory
- Verify all JavaScript files are in the `js/` folder

### Assets Not Loading
- The game uses procedural assets, so this shouldn't be an issue
- If you want to use image assets, make sure they're in the `assets/` folder

### CORS Errors
- GitHub Pages serves files over HTTPS, which should resolve CORS issues
- The game is designed to work without external assets

### Performance Issues
- The game is optimized for web browsers
- Should work well on most modern devices

## Custom Domain (Optional)

If you want to use a custom domain:

1. In repository Settings → Pages
2. Enter your domain in the **Custom domain** field
3. Click **Save**
4. Configure your DNS settings with your domain provider

## Updating Your Game

To update your deployed game:

```bash
# Make your changes locally
# Then push to GitHub
git add .
git commit -m "Update game with new features"
git push origin main
```

GitHub Pages will automatically rebuild and deploy your updated game.

## Support

If you encounter issues:
1. Check the GitHub Pages documentation
2. Verify your file structure matches the requirements
3. Check the browser console for any JavaScript errors
4. Open an issue in your repository

---

**Your game should now be live and playable by anyone with the URL!** 🎮✨ 