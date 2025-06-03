import { Scene } from 'phaser';
import { InputHandler } from '../game/Input';
import Camera from '../core/Camera';
import ShadowManager from '../core/ShadowManager';
import Sun from '../core/Sun';
import World from '../game/World';

class Game extends Scene {
  constructor() {
    super({ key: 'GameScene' });
    
    // Game state
    this.enemies = [];
    this.projectiles = [];
    this.items = [];
    this.worldObjects = [];
    this.wallObjects = [];
    this.score = 0;
    this.gameStarted = false;
    
    // Cave dimensions
    this.caveWidth = 3200;
    this.caveHeight = 3200;
    this.wallThickness = 80;
    
    // Graphics settings
    this.drawShadows = true;
    this.drawOutline = false;
  }

  create() {
    console.log("Initializing Game scene");
    
    // Initialize input handler for keyboard and mouse
    this.inputHandler = new InputHandler(this);
    
    // Initialize shadow and lighting system
    this.sun = new Sun(135, 45);
    this.shadowManager = new ShadowManager(this.drawShadows);
    
    // Initialize camera system
    this.gameCamera = new Camera(this, this.cameras.main);
    
    // Create the game world
    this.world = new World(this);
    this.world.createMap('background');
    
    // Create cave walls and environment objects
    this.createCaveWalls();
    this.placeEnvironmentObjects();
    
    // Create player submarine
    this.createPlayer();
    
    // Setup camera to follow player
    this.gameCamera.follow(this.player.x, this.player.y, 0);
    
    // Create game UI elements
    this.createUI();
    
    // Show welcome screen
    this.showWelcomeScreen();
  }
  
  createPlayer() {
    console.log("Creating player");
    // Simple player sprite
    this.player = this.physics.add.sprite(0, 0, 'submarine');
    this.player.setDepth(10);
    
    // Player properties
    this.player.health = 100;
    this.player.maxHealth = 100;
    this.player.speed = 0;
    this.player.maxSpeed = 5;
    this.player.acceleration = 0.2;
    this.player.friction = 0.98;
    this.player.rotationSpeed = 2;
    
    // Player controller
    this.player.controller = {
      stamina: 100,
      maxStamina: 100,
      staminaLocked: false
    };
    
    // Add collider with walls
    this.physics.add.collider(this.player, this.wallObjects);
  }
  
  createCaveWalls() {
    console.log("Creating cave walls");
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
      this.addWallSegment(x, -this.caveHeight/2);
      this.addWallSegment(x, this.caveHeight/2);
    }
    
    // Create vertical walls
    for (let y = -this.caveHeight/2 + wallSpacing; y < this.caveHeight/2; y += wallSpacing) {
      this.addWallSegment(-this.caveWidth/2, y);
      this.addWallSegment(this.caveWidth/2, y);
    }
  }
  
  addWallSegment(x, y) {
    const wall = this.physics.add.sprite(x, y, 'tree');
    wall.setImmovable(true);
    wall.body.setSize(60, 60);
    this.wallObjects.push(wall);
    
    // Register with shadow manager if needed
    if (this.shadowManager && this.drawShadows) {
      this.shadowManager.registerObject(wall);
    }
  }
  
  placeEnvironmentObjects() {
    const placedPositions = [];
    
    // Place rocks
    this.placeObjects('rock', 3, 120, placedPositions);
    
    // Place clams
    this.placeObjects('clam', 5, 80, placedPositions);
  }
  
  placeObjects(key, count, minSpacing, placedPositions) {
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
        for (const pos of placedPositions) {
          if (Phaser.Math.Distance.Between(x, y, pos.x, pos.y) < minSpacing) {
            tooClose = true;
            break;
          }
        }
        
        if (!tooClose) {
          placedPositions.push({x, y});
          
          // Create object
          const obj = this.physics.add.sprite(x, y, key);
          obj.setImmovable(true);
          this.worldObjects.push(obj);
          
          // Register with shadow manager
          if (this.shadowManager && this.drawShadows) {
            this.shadowManager.registerObject(obj);
          }
          break;
        }
      }
    }
  }
  
  createUI() {
    // Create simple UI
    this.scoreText = this.add.text(20, 20, 'SCORE: 0', {
      fontFamily: 'Arial',
      fontSize: '24px', 
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setScrollFactor(0).setDepth(100);
    
    // Health bar
    this.healthBarBg = this.add.rectangle(20, 60, 200, 20, 0x222222)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(100);
      
    this.healthBar = this.add.rectangle(20, 60, 200, 16, 0x00ff00)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(100);
      
    this.healthText = this.add.text(20, 44, 'HEALTH', {
      fontFamily: 'Arial',
      fontSize: '14px',
      fill: '#ffffff'
    }).setScrollFactor(0).setDepth(100);
    
    // Stamina bar
    this.staminaBarBg = this.add.rectangle(this.cameras.main.width - 220, 60, 200, 20, 0x222222)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(100);
      
    this.staminaBar = this.add.rectangle(this.cameras.main.width - 220, 60, 200, 16, 0x3296ff)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(100);
      
    this.staminaText = this.add.text(this.cameras.main.width - 220, 44, 'STAMINA', {
      fontFamily: 'Arial',
      fontSize: '14px',
      fill: '#ffffff'
    }).setScrollFactor(0).setDepth(100);
  }
  
  showGameMessage(message, duration = 2000) {
    const text = this.add.text(
      this.cameras.main.width / 2, 
      this.cameras.main.height / 2, 
      message, 
      {
        fontFamily: 'Arial',
        fontSize: '32px',
        fill: '#ffffff',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 4
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(1000);
    
    this.tweens.add({
      targets: text,
      alpha: { from: 0, to: 1 },
      y: { from: this.cameras.main.height / 2 - 30, to: this.cameras.main.height / 2 },
      duration: 300,
      onComplete: () => {
        this.time.delayedCall(duration - 600, () => {
          this.tweens.add({
            targets: text,
            alpha: { from: 1, to: 0 },
            y: { from: this.cameras.main.height / 2, to: this.cameras.main.height / 2 + 30 },
            duration: 300,
            onComplete: () => text.destroy()
          });
        });
      }
    });
  }
  
  showWelcomeScreen() {
    // Display welcome screen
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    
    this.titleText = this.add.text(centerX, centerY - 100, 'Abyssal Gears:\nDepths of Iron and Steam', {
      fontFamily: 'Arial',
      fontSize: '40px',
      color: '#ffffff',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    
    this.startText = this.add.text(centerX, centerY + 50, 'Press any key to dive into the depths', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    
    // Detect mobile for correct control instructions
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    const controlText = isMobile ? 
      'Controls: Touch to move, tap button to boost' : 
      'Controls: QSDZ to move, SPACE to boost/teleport';
      
    this.controlsText = this.add.text(centerX, centerY + 100, controlText, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
  }
  
  startGame() {
    if (this.gameStarted) return;
    this.gameStarted = true;
    
    // Hide welcome screen
    if (this.titleText) this.titleText.destroy();
    if (this.startText) this.startText.destroy();
    if (this.controlsText) this.controlsText.destroy();
    
    // Show game start message
    this.showGameMessage("Dive! Dive! Dive!", 2000);
  }

  update(time, delta) {
    // Update input handler
    if (this.inputHandler) this.inputHandler.update();
    
    // Check for game start
    if (!this.gameStarted && this.inputHandler && this.inputHandler.currentState.anyKeyPressed) {
      this.startGame();
    }
    
    if (!this.gameStarted) return;
    
    // Handle player movement
    this.handlePlayerInput();
    
    // Update camera to follow player
    if (this.gameCamera && this.player) {
      this.gameCamera.follow(this.player.x, this.player.y);
    }
    
    // Keep player in cave boundaries
    this.keepPlayerInCave();
    
    // Update UI elements
    this.updateUI();
  }
  
  handlePlayerInput() {
    if (!this.player || !this.inputHandler) return;
    
    const input = this.inputHandler.currentState;
    
    // Apply acceleration based on input
    if (input.forward) {
      this.player.speed += this.player.acceleration;
    } else if (input.backward) {
      this.player.speed -= this.player.acceleration;
    }
    
    // Apply rotation
    if (input.turnLeft) {
      this.player.rotation -= this.player.rotationSpeed;
    } else if (input.turnRight) {
      this.player.rotation += this.player.rotationSpeed;
    }
    
    // Apply friction to slow down
    this.player.speed *= this.player.friction;
    
    // Cap speed
    this.player.speed = Phaser.Math.Clamp(
      this.player.speed, 
      -this.player.maxSpeed * 0.6, 
      this.player.maxSpeed
    );
    
    // Convert angle to radians and calculate movement
    const angleRad = Phaser.Math.DegToRad(this.player.rotation);
    const moveX = -Math.sin(angleRad) * this.player.speed;
    const moveY = Math.cos(angleRad) * this.player.speed;
    
    // Update position
    this.player.x += moveX;
    this.player.y += moveY;
    
    // Set angle for sprite orientation
    this.player.angle = this.player.rotation;
  }
  
  keepPlayerInCave() {
    if (!this.player) return;
    
    // Calculate boundaries with buffer
    const buffer = 30;
    const minX = -this.caveWidth/2 + this.wallThickness + buffer;
    const maxX = this.caveWidth/2 - this.wallThickness - buffer;
    const minY = -this.caveHeight/2 + this.wallThickness + buffer;
    const maxY = this.caveHeight/2 - this.wallThickness - buffer;
    
    // Constrain player position
    this.player.x = Phaser.Math.Clamp(this.player.x, minX, maxX);
    this.player.y = Phaser.Math.Clamp(this.player.y, minY, maxY);
  }
  
  updateUI() {
    if (!this.player) return;
    
    // Update health bar
    if (this.healthBar) {
      const healthPercent = this.player.health / this.player.maxHealth;
      this.healthBar.width = 200 * healthPercent;
      
      // Change color based on health
      if (healthPercent < 0.3) {
        this.healthBar.fillColor = 0xff0000; // Red
      } else if (healthPercent < 0.6) {
        this.healthBar.fillColor = 0xffff00; // Yellow
      } else {
        this.healthBar.fillColor = 0x00ff00; // Green
      }
    }
    
    // Update stamina bar if player has controller
    if (this.staminaBar && this.player.controller) {
      const staminaPercent = this.player.controller.stamina / this.player.controller.maxStamina;
      this.staminaBar.width = 200 * staminaPercent;
      
      // Change color based on lock status
      this.staminaBar.fillColor = this.player.controller.staminaLocked ? 0xff3232 : 0x3296ff;
    }
  }
}

export default Game;
