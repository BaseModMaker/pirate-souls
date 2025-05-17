# Pirate Souls

A Godot-based game project.

## Web Export

This project is configured to automatically generate a web export when you push a new version tag (e.g., `v1.0.0`). The exported web build will be deployed to GitHub Pages and will be available at `https://YOUR-USERNAME.github.io/pirate-souls`.

### How it works

1. Create and push a new tag that starts with 'v' (e.g., `v1.0.0`, `v1.2.3`)
2. GitHub Actions will automatically:
   - Build the web export
   - Deploy it to the `gh-pages` branch
   - Make it available on GitHub Pages

### Manual Export

You can also manually export the game for web by opening the project in Godot and using the export feature.