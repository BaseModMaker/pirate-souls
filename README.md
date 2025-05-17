# Pirate Souls

A Godot-based game project.

## Web Export

This project is configured to automatically generate a web export when you push to the `release` branch. The exported web build will be deployed to GitHub Pages and will be available at `https://YOUR-USERNAME.github.io/pirate-souls`.

### How it works

1. Push your changes to the `release` branch
2. GitHub Actions will automatically:
   - Build the web export
   - Deploy it to the `gh-pages` branch
   - Make it available on GitHub Pages

### Manual Export

You can also manually export the game for web by opening the project in Godot and using the export feature.