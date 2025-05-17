# GitHub Actions Web Export Guide

This document provides instructions for the Godot web export automation.

## How It Works

The project has been set up with a GitHub Actions workflow that automatically:
1. Builds your Godot game for web (HTML5)
2. Deploys it to GitHub Pages

## Triggering the Web Export

The web export happens automatically when you:
- Push changes to the `main` branch

That's it! No special commands or tags needed.

## Checking the Status

1. After pushing to the main branch, go to your GitHub repository
2. Click on the "Actions" tab
3. You should see a workflow run named "Godot Web Export" 
4. Click on it to see the details and check for any errors

## Viewing Your Web Build

After the workflow completes successfully:
1. Go to your GitHub repository settings
2. Navigate to "Pages" in the sidebar
3. You'll see a message saying "Your site is published at..."
4. Click that URL to view your game

The web build will be available at:
`https://YOUR-USERNAME.github.io/pirate-souls`

## Troubleshooting

If the workflow doesn't run:
1. Make sure GitHub Actions are enabled in your repository settings
2. Check that you're pushing to the `main` branch
3. Verify the workflow file exists at `.github/workflows/godot-web-export.yml`

If the workflow runs but fails:
1. Check the error logs in the Actions tab
2. Make sure your Godot project has a valid HTML5 export preset
3. Ensure GitHub Pages is set up to deploy from the `gh-pages` branch
