import Phaser from 'phaser';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Boot, Game, GameOver } from './scenes';
import './index.css';

// Get browser window dimensions (equivalent to screen resolution detection in pygame)
const getWindowDimensions = () => {
  const { innerWidth: width, innerHeight: height } = window;
  return { width, height };
};

const { width, height } = getWindowDimensions();
console.log(`Screen resolution: ${width}x${height}`);
console.log(`Asset path: public/assets`);

// Configure the game
const config = {
  type: Phaser.AUTO,
  parent: 'phaser-container',
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.RESIZE,
    parent: 'phaser-container',
    width: width,
    height: height,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [Boot, Game, GameOver],
  // Set performance related settings
  pixelArt: true,
  roundPixels: true,
  antialias: false,
  banner: false, // Disable Phaser banner in console to match pygame clean console
  disableContextMenu: true // Prevents right-click menu for better game experience
};

// Create the game instance
const game = new Phaser.Game(config);

// Save reference to the game for debugging
window.game = game;

// Start React app alongside Phaser
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
