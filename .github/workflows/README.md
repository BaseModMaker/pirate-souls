# GitHub Actions Workflows

## Godot Web Export

This workflow automatically exports your Godot game for web and deploys it to GitHub Pages when you push to the `release` branch.

### Setup Instructions

1. Go to your repository settings
2. Navigate to "Pages" in the sidebar
3. Under "Build and deployment", set:
   - Source: "Deploy from a branch"
   - Branch: "gh-pages" / "/ (root)"
4. Click "Save"

After these steps, your web export will be available at:
`https://YOUR-USERNAME.github.io/pirate-souls`

### Additional Notes

- The first deployment might take a few minutes
- You can check the status of your deployments in the "Actions" tab
- Make sure your game is properly configured for web export in Godot
