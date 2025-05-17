# GitHub Actions Workflows

## Godot Web Export

This workflow automatically exports your Godot game for web and deploys it to GitHub Pages when you push a new version tag (e.g., `v1.0.0`).

### Setup Instructions

1. Go to your repository settings
2. Navigate to "Pages" in the sidebar
3. Under "Build and deployment", set:
   - Source: "Deploy from a branch"
   - Branch: "gh-pages" / "/ (root)"
4. Click "Save"

After these steps, your web export will be available at:
`https://YOUR-USERNAME.github.io/pirate-souls`

### Creating a Release with Tags

To trigger the workflow and create a new web export:

1. Make sure your changes are committed and pushed to your repository
2. Create a new tag with a version number:
   ```
   git tag v1.0.0  # Replace with your actual version number
   ```
3. Push the tag to GitHub:
   ```
   git push origin v1.0.0  # Replace with your tag name
   ```
4. The workflow will automatically detect the new tag and start the export process

### Additional Notes

- The first deployment might take a few minutes
- You can check the status of your deployments in the "Actions" tab
- Make sure your game is properly configured for web export in Godot
- You can create tags from GitHub's web interface as well, under the "Releases" section
