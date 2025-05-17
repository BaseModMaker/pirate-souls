# Git Tag Instructions

## Step-by-Step Guide to Push a Tag and Trigger Workflow

### 1. First Time Setup

```powershell
# Make sure you're in the repository root directory
cd "c:\Users\basil\Documents\GitHub\pirate-souls"

# Commit the workflow files to ensure they're on GitHub
git add .github/workflows/*.yml
git add TAG-INSTRUCTIONS.md
git commit -m "Add GitHub Actions workflow for web export"

# Push the changes to your main branch
git push origin main  # or master, or whatever your default branch is named
```

### 2. Create and Push a New Tag

```powershell
# Ensure you're in the repository root
cd "c:\Users\basil\Documents\GitHub\pirate-souls"

# Create an annotated tag (IMPORTANT: Must start with 'v')
git tag -a v1.0.0 -m "Version 1.0.0"

# Push ONLY the tag to GitHub (this is critical)
git push origin v1.0.0
```

### 3. Verify the Tag

```powershell
# List all tags to verify it was created locally
git tag -l

# Check if the tag was pushed to the remote repository
git ls-remote --tags origin
```

### 4. Verify on GitHub

1. Go to your GitHub repository
2. Click on "tags" near the top of the code tab
3. You should see your newly created tag
4. Go to the "Actions" tab - you should see a workflow run triggered by the tag

## Using the Manual Trigger

If pushing a tag doesn't work, you can use the manual trigger:

1. Go to your GitHub repository
2. Click on "Actions" tab
3. Select "Manual Godot Web Export" from the workflows list
4. Click "Run workflow"
5. Enter the version number and click "Run workflow"

## Complete Troubleshooting Guide

### If No Workflows Appear in the Actions Tab:

1. **Enable GitHub Actions:**
   - Go to your repository settings
   - Click on "Actions" in the sidebar menu
   - Under "Actions permissions," select "Allow all actions and reusable workflows"

2. **Verify Workflow Files on GitHub:**
   - Check if `.github/workflows/*.yml` files are visible on GitHub
   - If not, check if `.github` is in your `.gitignore` file
   - Make sure the files are committed and pushed

3. **Force Refresh the Workflow:**
   ```powershell
   # Delete the tag locally
   git tag -d v1.0.0
   
   # Delete the tag on the remote
   git push --delete origin v1.0.0
   
   # Create a new tag with a different version
   git tag -a v1.0.1 -m "Version 1.0.1"
   
   # Push the new tag
   git push origin v1.0.1
   ```

4. **Create a Release Directly on GitHub:**
   - Go to your repository
   - Click on "Releases" on the right side
   - Click "Create a new release"
   - Enter a tag version (e.g., "v1.0.2")
   - Set a release title
   - Click "Publish release"

5. **Check for Workflow Errors:**
   If the workflow starts but fails:
   - Look at the error logs
   - Fix any issues in the workflow file
   - Push the changes
   - Try again with a new tag
