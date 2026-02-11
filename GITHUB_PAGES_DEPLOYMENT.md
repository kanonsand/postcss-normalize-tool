# GitHub Pages Deployment Guide

This guide explains how to deploy the CSS Normalizer Tool to GitHub Pages.

## Option 1: Automatic Deployment via GitHub Actions (Recommended)

### Prerequisites

1. **Fork or use existing repository**
   - The tool should be in a GitHub repository
   - Repository must be public or private with GitHub Pages enabled

2. **Enable GitHub Pages**

   Go to your repository on GitHub:
   - Click **Settings** → **Pages**
   - Under **Build and deployment**, select **GitHub Actions** as the source
   - Click **Save**

### Deployment Steps

1. **Push the workflow file**

   The `.github/workflows/deploy-gh-pages.yml` file is already created. Push it to your repository:

   ```bash
   git add packages/postcss-normalize-tool/.github/workflows/deploy-gh-pages.yml
   git commit -m "Add GitHub Pages deployment workflow"
   git push origin master
   ```

2. **Check deployment status**

   Go to your repository on GitHub:
   - Click **Actions** tab
   - You should see the "Deploy to GitHub Pages" workflow running
   - Wait for it to complete (usually takes 1-2 minutes)

3. **Access your site**

   Your site will be available at:
   ```
   https://<your-username>.github.io/cssnano/
   ```
   Or for user/organization sites:
   ```
   https://<your-username>.github.io/
   ```

### Workflow Triggers

The workflow automatically deploys when:
- You push to `master` or `main` branch
- You modify files in `packages/postcss-normalize-tool/` directory
- You manually trigger it from Actions tab

## Option 2: Manual Deployment via gh CLI

### Install gh CLI

```bash
# On Ubuntu/Debian
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# Or with brew
brew install gh
```

### Authenticate

```bash
gh auth login
```

### Deploy manually

```bash
cd packages/postcss-normalize-tool

# Create a temporary directory
mkdir -p _site
cp demo-static.html _site/index.html
cp dist.js _site/
cp README.md _site/ 2>/dev/null || true

# Deploy to GitHub Pages
gh-pages -d _site -m "Deploy to GitHub Pages"

# Cleanup
rm -rf _site
```

## Option 3: Using git subtree (Alternative)

### First time setup

```bash
cd /path/to/cssnano

# Add subtree
git subtree push --prefix packages/postcss-normalize-tool origin gh-pages

# Set gh-pages branch to serve from subdirectory
cd packages/postcss-normalize-tool
git checkout --orphan gh-pages
git rm -rf .
cp demo-static.html index.html
cp dist.js .
git add .
git commit -m "Initial GitHub Pages setup"
git push origin gh-pages

# Go back to main branch
git checkout master
```

### Update deployment

```bash
cd packages/postcss-normalize-tool
git checkout gh-pages
cp demo-static.html index.html
cp dist.js .
git add .
git commit -m "Update GitHub Pages"
git push origin gh-pages
git checkout master
```

## Configuration Options

### Custom Domain

To use a custom domain:

1. **Create a CNAME file**

   ```bash
   echo "your-domain.com" > packages/postcss-normalize-tool/CNAME
   ```

2. **Update DNS settings**

   Add CNAME record pointing to `<your-username>.github.io`

3. **Update GitHub Pages settings**

   - Go to **Settings** → **Pages**
   - Enter your custom domain
   - Enable **Enforce HTTPS**

### Project vs User/Organization Site

| Type | URL Pattern | Repository |
|------|-------------|------------|
| **Project** | `username.github.io/repo-name/` | Any repository |
| **User/Org** | `username.github.io/` | Must be `username.github.io` repo |

For project site, the workflow automatically deploys correctly.

## Troubleshooting

### 404 Not Found

1. **Check deployment status**
   - Go to Actions tab
   - Verify workflow completed successfully

2. **Check Pages settings**
   - Settings → Pages
   - Ensure source is set to **GitHub Actions**

3. **Wait a few minutes**
   - DNS propagation can take up to 10 minutes

### Build Failed

Check the workflow logs:
- Actions → Select workflow run → View logs
- Look for specific error messages

### Files Not Loading

Ensure paths in `demo-static.html` are correct:
```html
<script src="dist.js"></script>
```

### Custom Domain Not Working

1. Verify DNS settings
2. Check CNAME file is in root
3. Wait for DNS propagation (up to 48 hours)
4. Enable HTTPS in Pages settings

## Updating the Site

### Automatic (Recommended)

Simply push changes to master:
```bash
git add packages/postcss-normalize-tool/
git commit -m "Update CSS Normalizer Tool"
git push origin master
```

The workflow will automatically deploy.

### Manual

Trigger the workflow from Actions tab:
- Actions → "Deploy to GitHub Pages" → Run workflow

## Monitoring

### Deployment History

Go to Actions → "Deploy to GitHub Pages" to see all deployments.

### Deployment URL

Each deployment shows the URL at the top of the workflow run.

## Best Practices

1. **Keep dist.js updated**
   - Always update both source and dist.js together
   - Test locally before pushing

2. **Use semantic versioning**
   - Tag releases: `git tag -a v1.0.0 -m "Version 1.0.0"`
   - Push tags: `git push origin v1.0.0`

3. **Write good commit messages**
   - Helps track deployment history

4. **Test before deploying**
   - Use local server: `python3 -m http.server 8000`
   - Verify all features work

## Security

### Private Repositories

- GitHub Pages works with private repos
- Access is controlled by repository visibility settings
- API tokens for private repos require appropriate permissions

### HTTPS

- GitHub Pages automatically provides HTTPS
- No additional configuration needed
- Redirect HTTP to HTTPS automatically

## Analytics

### GitHub Pages Analytics

GitHub provides built-in analytics:
- Go to repository → Insights → Traffic
- View page views and visitors

### Add Google Analytics

Update `demo-static.html`:

```html
<head>
  <!-- Add GA tracking code -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  </script>
</head>
```

## Support

For issues:
1. Check Actions logs
2. Review GitHub Pages status: https://www.githubstatus.com/
3. Check repository settings
4. Verify workflow permissions are enabled

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Pages Status](https://www.githubstatus.com/)