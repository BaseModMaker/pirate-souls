import { Scene } from 'phaser';

class Boot extends Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Create loading display
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Loading text
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading Abyssal Gears...', {
      fontSize: '32px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Loading bar background
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
    
    // Loading bar
    const progressBar = this.add.graphics();
    
    // Loading progress events
    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    // Handle file load errors
    this.load.on('loaderror', (file) => {
      console.warn(`Error loading file: ${file.key} (${file.type})`);
    });
    
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // Load basic assets to get started
    this.loadBasicAssets();
  }

  loadBasicAssets() {
    // Create placeholder assets for common game elements
    this.createPlaceholderAssets();
  }
  
  createPlaceholderAssets() {
    // Create a placeholder submarine texture if missing
    this.createTextureRect('submarine', 32, 16, 0xFFFF00); // Yellow submarine
    
    // Create a placeholder background
    this.createTextureRect('background', 100, 100, 0x0A4150, true); // Ocean blue background
    
    // Create placeholders for environment objects
    this.createTextureRect('tree', 32, 32, 0x00AA00); // Green tree/plant
    this.createTextureRect('rock', 32, 32, 0x808080); // Gray rock
    this.createTextureRect('kelp', 32, 64, 0x00CC00); // Tall green kelp
    this.createTextureRect('clam', 24, 16, 0xDDDDDD); // Light gray clam
    
    // Create a placeholder for the cannonball
    this.createTextureRect('cannonball', 8, 8, 0x000000); // Black cannonball
    
    // Create a placeholder for the bubble
    this.createTextureCircle('bubble', 8, 0xFFFFFF, 0.5); // Semi-transparent white circle
  }
  
  createTextureRect(key, width, height, color, repeatable = false) {
    // Fix: Remove setTilePosition which is not a function on RenderTexture
    
    // Create a texture with the specified dimensions and color
    const rt = this.make.renderTexture({ width, height }, true);
    const graphics = this.add.graphics();
    graphics.fillStyle(color);
    graphics.fillRect(0, 0, width, height);
    rt.draw(graphics);
    
    // If repeatable, create a tileSprite instead (but still save the basic texture)
    if (repeatable) {
      // First save the base texture
      if (!this.textures.exists(key)) {
        rt.saveTexture(key);
      }
      
      // Then create a tileSprite demonstration using this texture
      const tileSprite = this.add.tileSprite(0, 0, width * 10, height * 10, key);
      tileSprite.visible = false; // Just create it to make sure it works, but don't show it
    } else {
      // Save the texture with the provided key
      if (!this.textures.exists(key)) {
        rt.saveTexture(key);
      }
    }
    
    // Clean up
    graphics.destroy();
    rt.destroy();
  }
  
  createTextureCircle(key, radius, color, alpha = 1) {
    // Create a circular texture
    const rt = this.make.renderTexture({ width: radius * 2, height: radius * 2 }, true);
    const graphics = this.add.graphics();
    graphics.fillStyle(color, alpha);
    graphics.fillCircle(radius, radius, radius);
    rt.draw(graphics);
    
    if (!this.textures.exists(key)) {
      rt.saveTexture(key);
    }
    
    graphics.destroy();
    rt.destroy();
  }

  create() {
    console.log("Assets loaded, starting game");
    this.scene.start('GameScene');
  }
}

export default Boot;
