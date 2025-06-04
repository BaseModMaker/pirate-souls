import Phaser from 'phaser';
import { InputHandler } from '../game/Input';

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
    this.inputHandler = null;
    this.hasStarted = false;
  }

  preload() {
    console.log('Boot scene preloading assets...');
    
    // Don't set baseURL - let Phaser use the default which is relative to the HTML file
    // this.load.setBaseURL(window.location.origin);
    
    // Create a placeholder graphics for missing assets
    this.createPlaceholders();
    
    // Try different paths for assets (React public folder structure)
    try {
      // First try loading from the public folder (standard path for React apps)
      this.load.image('ship', '/assets/images/ship.png');
      this.load.image('enemy', '/assets/images/enemy.png');
      this.load.image('cannon', '/assets/images/cannon.png');
      this.load.image('cannonball', '/assets/images/cannonball.png');
      this.load.image('explosion', '/assets/images/explosion.png');
      this.load.image('background', '/assets/images/sea_background.png');
      this.load.image('island', '/assets/images/island.png');
      
      // Load UI assets
      this.load.image('start_button', '/assets/images/start_button.png');
      this.load.image('game_over', '/assets/images/game_over.png');
    } catch (error) {
      console.error("Error setting up image loads:", error);
    }
    
    // Display loading progress
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
    
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      font: '20px monospace',
      fill: '#ffffff'
    }).setOrigin(0.5, 0.5);
    
    // Update progress bar as assets load
    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });
    
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      
      this.createStartPrompt();
    });
    
    // Handle file load errors by creating placeholder graphics
    this.load.on('loaderror', (file) => {
      console.error(`Error loading file: ${file.src}`);
      this.createPlaceholderTexture(file.key);
    });
  }

  /**
   * Create placeholder textures for missing assets
   */
  createPlaceholders() {
    const placeholderColors = {
      'ship': 0x3498db,      // Blue
      'enemy': 0xe74c3c,     // Red
      'cannon': 0x7f8c8d,    // Gray
      'cannonball': 0x2c3e50, // Dark blue
      'explosion': 0xe67e22,  // Orange
      'background': 0x2980b9, // Light blue
      'island': 0x27ae60,    // Green
      'start_button': 0xf39c12, // Yellow
      'game_over': 0x8e44ad   // Purple
    };
    
    // Create sized placeholders for different asset types
    const assetSizes = {
      'ship': [64, 64],
      'enemy': [48, 48],
      'cannon': [32, 32],
      'cannonball': [16, 16],
      'explosion': [64, 64],
      'background': [800, 600],
      'island': [128, 128],
      'start_button': [200, 50],
      'game_over': [400, 100]
    };
    
    // Pre-generate placeholder textures
    Object.entries(placeholderColors).forEach(([key, color]) => {
      const size = assetSizes[key] || [64, 64];
      this.createPlaceholderTexture(key, color, size[0], size[1]);
    });
  }
  
  /**
   * Create a placeholder texture for a missing asset
   */
  createPlaceholderTexture(key, color = 0xff00ff, width = 64, height = 64) {
    if (this.textures.exists(key)) return;
    
    const graphics = this.add.graphics();
    
    // Draw colored rectangle with cross
    graphics.fillStyle(color, 1);
    graphics.fillRect(0, 0, width, height);
    
    // Add a cross to indicate missing texture
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.moveTo(0, 0);
    graphics.lineTo(width, height);
    graphics.moveTo(width, 0);
    graphics.lineTo(0, height);
    
    // Add the key text
    const textStyle = {
      font: `${Math.min(12, width / key.length)}px Arial`,
      fill: '#ffffff',
      align: 'center'
    };
    const text = this.add.text(width / 2, height / 2, key, textStyle);
    text.setOrigin(0.5, 0.5);
    
    // Generate texture and destroy graphics objects
    graphics.generateTexture(key, width, height);
    graphics.destroy();
    text.destroy();
    
    console.log(`Created placeholder texture for "${key}"`);
  }

  create() {
    this.inputHandler = new InputHandler(this);
    
    // If we already have a start prompt from preload, no need to create it again
    if (!this.startText) {
      this.createStartPrompt();
    }
  }
  
  createStartPrompt() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    this.startText = this.add.text(width / 2, height / 2 - 100, 'Pirate Souls', {
      font: '32px monospace',
      fill: '#ffffff'
    }).setOrigin(0.5, 0.5);
    
    this.instructionText = this.add.text(width / 2, height / 2, 'Press Any Key to Start', {
      font: '24px monospace',
      fill: '#ffffff'
    }).setOrigin(0.5, 0.5);
    
    // Make the instruction text blink
    this.tweens.add({
      targets: this.instructionText,
      alpha: { from: 1, to: 0.3 },
      duration: 800,
      yoyo: true,
      repeat: -1
    });
    
    // Add an interactive zone for mobile users
    const touchZone = this.add.zone(0, 0, width, height);
    touchZone.setOrigin(0);
    touchZone.setInteractive();
    touchZone.on('pointerdown', () => {
      this.startGame();
    });
  }
  
  update() {
    if (this.inputHandler) {
      this.inputHandler.update();
      
      // Check for any key press to start the game
      if (!this.hasStarted && this.inputHandler.checkAndResetAnyKeyPressed()) {
        this.startGame();
      }
    }
  }
  
  startGame() {
    if (!this.hasStarted) {
      this.hasStarted = true;
      console.log('Starting game');
      this.scene.start('GameScene');
    }
  }
}

export default BootScene;
