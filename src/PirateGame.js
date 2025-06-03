import Phaser from 'phaser';

class PirateBootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PirateBootScene' });
  }

  preload() {
    // Display loading text
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const loadingText = this.add.text(
      width / 2,
      height / 2,
      'Loading Pirate Souls...',
      { 
        fontSize: '32px',
        fill: '#ffffff',
        fontFamily: 'Arial'
      }
    ).setOrigin(0.5);
    
    // Create a loading bar
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 + 50, 320, 30);
    
    // Update the loading bar as assets load
    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 + 60, 300 * value, 10);
    });
    
    // Clean up when loading is complete
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });
    
    // Load basic assets
    this.load.image('pirate_ship', 'assets/player/player.png');
    this.load.image('water', 'assets/map/background.png');
  }

  create() {
    this.scene.start('PirateMainScene');
  }
}

class PirateMainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PirateMainScene' });
  }

  create() {
    // Set background color to ocean blue
    this.cameras.main.setBackgroundColor('#0a4150');
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Display title
    this.add.text(
      width / 2,
      100,
      'PIRATE SOULS',
      { 
        fontSize: '64px', 
        fill: '#ffffff',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 6
      }
    ).setOrigin(0.5);
    
    // Add player ship at center of screen
    this.ship = this.physics.add.sprite(width / 2, height / 2, 'pirate_ship');
    if (!this.ship.texture.key) {
      // If texture didn't load, create a red rectangle as placeholder
      this.ship = this.add.rectangle(width / 2, height / 2, 50, 30, 0xff0000);
    }
    
    // Add text to confirm custom game is running
    this.add.text(
      width / 2,
      height / 2 + 100,
      'Your custom Pirate Souls game is running!',
      { 
        fontSize: '24px', 
        fill: '#ffffff',
        fontFamily: 'Arial'
      }
    ).setOrigin(0.5);
    
    this.add.text(
      width / 2,
      height / 2 + 150,
      'Use arrow keys to move the ship',
      { 
        fontSize: '18px', 
        fill: '#ffffff',
        fontFamily: 'Arial'
      }
    ).setOrigin(0.5);
    
    // Set up arrow key controls
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    // Basic movement to demonstrate game is working
    if (this.ship && this.cursors) {
      const speed = 5;
      
      if (this.cursors.left.isDown) {
        this.ship.x -= speed;
        this.ship.angle = -10;
      } else if (this.cursors.right.isDown) {
        this.ship.x += speed;
        this.ship.angle = 10;
      } else {
        this.ship.angle = 0;
      }
      
      if (this.cursors.up.isDown) {
        this.ship.y -= speed;
      } else if (this.cursors.down.isDown) {
        this.ship.y += speed;
      }
    }
  }
}

export default class PirateGame {
  constructor() {
    // Destroy any existing game instance
    if (window.game) {
      window.game.destroy(true);
    }
    
    // Create game configuration
    const config = {
      type: Phaser.AUTO,
      parent: 'phaser-container',
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#0a4150',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 }
        }
      },
      scene: [PirateBootScene, PirateMainScene]
    };
    
    // Create the game instance
    window.game = new Phaser.Game(config);
    
    // Handle window resizing
    window.addEventListener('resize', () => {
      if (window.game) {
        window.game.scale.resize(window.innerWidth, window.innerHeight);
      }
    });
    
    return window.game;
  }
}
