import { Scene } from 'phaser';
import { InputHandler } from '../game/Input';
import Sun from '../core/Sun';
import ShadowManager from '../core/ShadowManager';
import Text from '../utils/Text';

/**
 * Main game scene for Abyssal Gears: Depths of Iron and Steam
 * Translated from pygame Game class
 */
class Game extends Scene {
  constructor() {
    super({ key: 'GameScene' });
    
    // Game state
    this.running = true;
    this.gameStarted = false;
    this.enemies = [];
    this.projectiles = [];
    this.worldObjects = [];
    this.wallObjects = [];
    this.score = 0;
    
    // Cave dimensions
    this.caveWidth = 3200;
    this.caveHeight = 3200;
    this.wallThickness = 80;
    
    // Graphics settings
    this.drawShadows = false;
    this.drawOutline = false;
    this.performanceMode = 0; // 0 = high performance
  }

  preload() {
    // Setup paths
    const imagePath = 'assets/images/';
    const soundPath = 'assets/sounds/';
    const fontPath = 'assets/fonts/';
    
    // Load background and map elements
    this.load.image('background', `${imagePath}background.jpg`);
    
    // Load player assets
    this.load.image('submarine', `${imagePath}yellow-submarine.png`);
    this.load.spritesheet('submarine_anim', `${imagePath}yellow-submarine.png`, { 
      frameWidth: 32, 
      frameHeight: 16 
    });
    
    // Load environment assets
    this.load.image('kelp', `${imagePath}kelp-6x6x18.png`);
    this.load.image('tree', `${imagePath}tree.png`);
    this.load.image('rock', `${imagePath}rock-31x27x26.png`);
    this.load.image('clam', `${imagePath}clam-26x21x3.png`);
    
    // Load projectiles
    this.load.image('cannonball', `${imagePath}cannonball.png`);
    
    // Load fonts
    this.load.bitmapFont('blocky', `${fontPath}blocky.png`, `${fontPath}blocky.xml`);
    
    // Load UI elements
    this.load.image('ui_bubble', `${imagePath}ui/bubble.png`);
    
    // Load audio
    this.load.audio('background_music', `${soundPath}background.mp3`);
    this.load.audio('cannon_fire', `${soundPath}cannon_fire.wav`);
    this.load.audio('bubble_sound', `${soundPath}bubble.wav`);
  }

  create() {
    // Set background color - deep blue underwater color
    this.cameras.main.setBackgroundColor('rgba(10, 65, 80, 1)');
    
    // Create input handler
    this.inputHandler = new InputHandler(this);
    
    // Initialize sun and shadow management with fixed settings
    this.sun = new Sun(135, 45);  // Fixed sun position
    this.shadowManager = new ShadowManager(true);  // Shadows always enabled
    
    // Create background
    this.createBackground();
    
    // Create world objects
    this.createCaveEnvironment();
    
    // Create player submarine later
    // this.player = new Player(this, 0, 0);
    
    // Setup UI
    this.createUI();
    
    // Show welcome screen
    this.showWelcomeScreen();
    
    // Setup pause functionality
    this.input.keyboard.on('keydown-P', () => this.togglePause());
    this.input.keyboard.on('keydown-ESC', () => this.togglePause());
    
    // Setup performance tracking
    this.fpsText = this.add.text(10, 10, 'FPS: 0', { 
      fontSize: '16px',
      fill: '#ffffff' 
    }).setScrollFactor(0);
  }
  
  /**
   * Create underwater background
   */
  createBackground() {
    // Try to load background image
    const bgImage = this.textures.exists('background') ? 
      this.add.image(0, 0, 'background').setOrigin(0.5) : 
      this.createDefaultBackground();
    
    // Set background to scroll with camera at reduced rate (parallax)
    bgImage.setScrollFactor(0.1);
    
    // Scale to fit screen
    const scaleX = this.cameras.main.width / bgImage.width;
    const scaleY = this.cameras.main.height / bgImage.height;
    const scale = Math.max(scaleX, scaleY);
    bgImage.setScale(scale);
  }
  
  /**
   * Create a default background if image not available
   */
  createDefaultBackground() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Create a container for all background elements
    const background = this.add.container(width/2, height/2);
    
    // Create gradient background using multiple rectangles
    for (let y = 0; y < height; y += 3) {
      // Calculate gradient color - darker at bottom, lighter at top
      const depthFactor = y / height;
      const blue = 40 + Math.floor(40 * (1 - depthFactor));  // 40-80 range
      const green = 65 + Math.floor(15 * (1 - depthFactor)); // 65-80 range
      
      const line = this.add.rectangle(0, y - height/2, width, 3, Phaser.Display.Color.GetColor(10, green, blue));
      background.add(line);
    }
    
    // Add light rays
    for (let i = 0; i < 10; i++) {
      const startX = Phaser.Math.Between(-width/2, width/2);
      const rayWidth = Phaser.Math.Between(20, 80);
      
      const ray = this.add.rectangle(startX, 0, rayWidth, height, 0xffffdc, 0.2);
      background.add(ray);
    }
    
    // Add bubbles
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(-width/2, width/2);
      const y = Phaser.Math.Between(-height/2, height/2);
      const size = Phaser.Math.Between(1, 5);
      const alpha = Phaser.Math.FloatBetween(0.1, 0.3);
      
      const bubble = this.add.circle(x, y, size, 0xffffff, alpha);
      background.add(bubble);
    }
    
    return background;
  }
  
  /**
   * Create the cave environment
   */
  createCaveEnvironment() {
    // Create cave walls
    this.createCaveWalls();
    
    // Add kelp, rocks and clams
    this.placeEnvironmentObjects();
  }
  
  /**
   * Create cave walls to form boundaries
   */
  createCaveWalls() {
    const wallSpacing = 80;
    
    // Add corner pieces first
    const corners = [
      {x: -this.caveWidth/2, y: -this.caveHeight/2},
      {x: this.caveWidth/2, y: -this.caveHeight/2},
      {x: -this.caveWidth/2, y: this.caveHeight/2},
      {x: this.caveWidth/2, y: this.caveHeight/2}
    ];
    
    corners.forEach(pos => this.addWallSegment(pos.x, pos.y));
    
    // Create horizontal walls
    for (let x = -this.caveWidth/2 + wallSpacing; x < this.caveWidth/2; x += wallSpacing) {
      // Top wall
      this.addWallSegment(x, -this.caveHeight/2);
      // Bottom wall
      this.addWallSegment(x, this.caveHeight/2);
    }
    
    // Create vertical walls
    for (let y = -this.caveHeight/2 + wallSpacing; y < this.caveHeight/2; y += wallSpacing) {
      // Left wall
      this.addWallSegment(-this.caveWidth/2, y);
      // Right wall
      this.addWallSegment(this.caveWidth/2, y);
    }
  }
  
  /**
   * Add a single wall segment
   * 
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  addWallSegment(x, y) {
    const wall = this.physics.add.sprite(x, y, 'tree');
    
    // Set as static physics body
    wall.body.setImmovable(true);
    wall.setDisplaySize(60, 60);
    
    // Add to wall objects array
    this.wallObjects.push(wall);
    
    // Register with shadow manager if shadows enabled
    if (this.drawShadows) {
      this.shadowManager.registerObject(wall);
    }
  }
  
  /**
   * Place environmental objects like kelp, rocks and clams
   */
  placeEnvironmentObjects() {
    const placedPositions = [];
    
    // Place kelp
    this.placeObjects('kelp', 5, 100, placedPositions, {
      numLayers: 18,
      width: 6, 
      height: 6,
      outlineEnabled: this.drawOutline,
      outlineColor: 0x000000,
      outlineThickness: 2,
      outlineOffset: 8
    });
    
    // Place rocks
    this.placeObjects('rock', 3, 120, placedPositions, {
      numLayers: 26,
      width: 31, 
      height: 27,
      outlineEnabled: this.drawOutline,
      outlineColor: 0x000000,
      outlineThickness: 2,
      outlineOffset: 12
    });
    
    // Place clams
    this.placeObjects('clam', 5, 80, placedPositions, {
      numLayers: 3,
      width: 26, 
      height: 21,
      outlineEnabled: this.drawOutline,
      outlineColor: 0x000000,
      outlineThickness: 2,
      outlineOffset: 1
    });
  }
  
  /**
   * Helper method to place objects in the cave with proper spacing
   * 
   * @param {string} key - Texture key
   * @param {number} count - Number of objects to place
   * @param {number} minSpacing - Minimum spacing between objects
   * @param {Array} placedPositions - Array of already placed positions
   * @param {object} properties - Additional properties for the objects
   */
  placeObjects(key, count, minSpacing, placedPositions, properties) {
    for (let i = 0; i < count; i++) {
      for (let attempt = 0; attempt < 10; attempt++) {
        // Get random position inside cave
        const x = Phaser.Math.Between(
          -this.caveWidth/2 + this.wallThickness + 50, 
          this.caveWidth/2 - this.wallThickness - 50
        );
        const y = Phaser.Math.Between(
          -this.caveHeight/2 + this.wallThickness + 50,
          this.caveHeight/2 - this.wallThickness - 50
        );
        
        // Check if far enough from other objects
        let tooClose = false;
        placedPositions.forEach(pos => {
          if (Phaser.Math.Distance.Between(x, y, pos.x, pos.y) < minSpacing) {
            tooClose = true;
          }
        });
        
        if (!tooClose) {
          placedPositions.push({x, y});
          
          // Create object
          const obj = this.physics.add.sprite(x, y, key);
          obj.setImmovable(true);
          
          // Store properties for later use with SpriteStack
          obj.spriteStackProps = properties;
          
          // Add to world objects array
          this.worldObjects.push(obj);
          
          // Register with shadow manager if shadows enabled
          if (this.drawShadows) {
            this.shadowManager.registerObject(obj);
          }
          
          break;
        }
      }
    }
  }
  
  /**
   * Create user interface elements
   */
  createUI() {
    // Create stamina bar (will be populated when player is created)
    this.staminaBar = this.add.graphics();
    this.staminaBar.setScrollFactor(0);
  }
  
  /**
   * Show the welcome screen
   */
  showWelcomeScreen() {
    // Create title text
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    
    this.titleText = new Text(
      this,
      'blocky',
      50, 
      'Abyssal Gears: Depths of Iron and Steam',
      0xFFFFFF,
      centerX,
      centerY - 100,
      true
    );
    this.titleText.setOrigin(0.5);
    
    this.startText = new Text(
      this,
      'blocky',
      25,
      'Press any key to dive into the depths',
      0xFFFFFF,
      centerX,
      centerY,
      true
    );
    this.startText.setOrigin(0.5);
    
    // Detect mobile for correct control instructions
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    const controlText = isMobile ? 
      'Controls: Touch to move, tap button to boost' : 
      'Controls: QSDZ to move, SPACE to boost/teleport';
      
    this.controlsText = new Text(
      this,
      'blocky',
      20,
      controlText,
      0xFFFFFF,
      centerX,
      centerY + 50,
      true
    );
    this.controlsText.setOrigin(0.5);
  }
  
  /**
   * Toggle pause state
   */
  togglePause() {
    this.paused = !this.paused;
    
    if (this.paused) {
      // Pause physics
      this.physics.pause();
      
      // Show pause text
      this.pauseText = this.add.text(
        this.cameras.main.worldView.x + this.cameras.main.width / 2,
        this.cameras.main.worldView.y + this.cameras.main.height / 2,
        'PAUSED',
        {
          font: '32px Arial',
          fill: '#ffffff',
          stroke: '#000000',
          strokeThickness: 6
        }
      ).setOrigin(0.5).setScrollFactor(0).setDepth(1000);
    } else {
      // Resume physics
      this.physics.resume();
      
      // Hide pause text
      if (this.pauseText) this.pauseText.destroy();
    }
  }

  update() {
    // Update input handler
    this.inputHandler.update();
    
    // Check for quit request
    if (this.inputHandler.currentState.quitRequested) {
      this.scene.start('GameOverScene');
      return;
    }
    
    // Update FPS counter
    this.fpsText.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);
    
    // Handle game start
    if (!this.gameStarted && this.inputHandler.currentState.anyKeyPressed) {
      this.startGame();
      return;
    }
    
    // Skip updates if paused
    if (this.paused) return;
    
    // Handle other game updates when implemented
    
    // Update shadow manager
    this.shadowManager.updateAll(this.sun);
  }
  
  /**
   * Start the game
   */
  startGame() {
    this.gameStarted = true;
    
    // Hide welcome screen
    if (this.titleText) this.titleText.destroy();
    if (this.startText) this.startText.destroy();
    if (this.controlsText) this.controlsText.destroy();
    
    // Start background music if available
    if (this.sound.get('background_music')) {
      this.backgroundMusic = this.sound.add('background_music', { loop: true, volume: 0.5 });
      this.backgroundMusic.play();
    }
    
    // Create player (will be implemented)
    // this.createPlayer();
  }
}

export default Game;
