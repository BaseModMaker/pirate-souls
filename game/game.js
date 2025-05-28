import { Application, Graphics, Text as PixiText } from 'pixi.js';
import { Text } from './utils/text.js';
import { Entity } from './core/entity.js';
import { GameObject } from './core/gameobject.js';
import { PlayerController } from './controllers/player_controller.js';
import { Sun } from './core/sun.js';
import { ShadowManager } from './core/shadow.js';
import { Camera } from './core/camera.js';

/**
 * Represents the current state of all inputs.
 */
class InputState {
    constructor() {
        // Movement keys (translated for web compatibility)
        this.keys = {};
        
        // Mouse buttons
        this.leftMouse = false;
        this.rightMouse = false;
        this.middleMouse = false;
        
        // Special states
        this.anyKeyPressed = false;
        this.quitRequested = false;
    }
}

/**
 * Handles all input processing and converts browser inputs to game states.
 */
class InputHandler {
    constructor() {
        this.currentState = new InputState();
        this.previousState = new InputState();
        
        // Bind keyboard events
        this.setupKeyboardListeners();
        this.setupMouseListeners();
    }
    
    setupKeyboardListeners() {
        // Track pressed keys
        const pressedKeys = {};
        
        document.addEventListener('keydown', (event) => {
            pressedKeys[event.code] = true;
            this.currentState.anyKeyPressed = true;
            
            // Prevent default for game keys
            if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyZ', 'KeyQ', 'Space', 'Escape'].includes(event.code)) {
                event.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (event) => {
            pressedKeys[event.code] = false;
            
            if (event.code === 'Escape') {
                this.currentState.quitRequested = true;
            }
        });
        
        // Store reference for update method
        this.pressedKeys = pressedKeys;
    }
    
    setupMouseListeners() {
        document.addEventListener('mousedown', (event) => {
            switch (event.button) {
                case 0: this.currentState.leftMouse = true; break;
                case 1: this.currentState.middleMouse = true; break;
                case 2: this.currentState.rightMouse = true; break;
            }
            event.preventDefault();
        });
        
        document.addEventListener('mouseup', (event) => {
            switch (event.button) {
                case 0: this.currentState.leftMouse = false; break;
                case 1: this.currentState.middleMouse = false; break;
                case 2: this.currentState.rightMouse = false; break;
            }
        });
        
        document.addEventListener('contextmenu', (event) => {
            event.preventDefault(); // Disable right-click menu
        });
    }
    
    update() {
        // Store previous state
        this.copyState(this.currentState, this.previousState);
        
        // Update movement keys - handle both WASD and QSDZ
        this.currentState.keys = {
            'KeyW': this.pressedKeys['KeyW'] || this.pressedKeys['KeyZ'], // Forward
            'KeyS': this.pressedKeys['KeyS'], // Backward  
            'KeyA': this.pressedKeys['KeyA'] || this.pressedKeys['KeyQ'], // Turn left
            'KeyD': this.pressedKeys['KeyD'], // Turn right
            'Space': this.pressedKeys['Space'] // Boost/teleport
        };
        
        // Reset one-time events
        this.currentState.anyKeyPressed = false;
        this.currentState.quitRequested = false;
    }
    
    copyState(source, destination) {
        destination.keys = { ...source.keys };
        destination.leftMouse = source.leftMouse;
        destination.rightMouse = source.rightMouse;
        destination.middleMouse = source.middleMouse;
        destination.anyKeyPressed = source.anyKeyPressed;
        destination.quitRequested = source.quitRequested;
    }
}

/**
 * Main game class for Abyssal Gears: Depths of Iron and Steam.
 */
class Game {
    constructor(screenWidth, screenHeight, assetPath = "", fontPath = "", imagePath = "") {
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.assetPath = assetPath;
        this.fontPath = fontPath;
        this.imagePath = imagePath;
        
        // Game state
        this.running = true;
        this.gameStarted = false;
        
        // Colors
        this.WHITE = 0xFFFFFF;
        this.BLACK = 0x000000;
        
        // Performance mode (always optimized)
        this.performanceMode = 0;
        
        // Shadow and outline settings
        this.drawShadows = false;
        this.drawOutline = false;
        
        // Initialize PIXI application
        this.app = null;
        
        // Game objects
        this.player = null;
        this.playerController = null;
        this.worldObjects = [];
        this.wallObjects = [];
        
        // Systems
        this.camera = null;
        this.sun = null;
        this.shadowManager = null;
        this.inputHandler = null;
        
        // Cave dimensions
        this.caveWidth = 3200;
        this.caveHeight = 3200;
        this.wallThickness = 80;
        
        // UI elements
        this.titleText = null;
        this.startText = null;
        this.controlsText = null;
        
        // FPS tracking
        this.lastTime = performance.now();
        this.frameCount = 0;
        this.fps = 60;
    }
      async init() {
        // Create PIXI application
        this.app = new Application();
        await this.app.init({ 
            background: '#0a4265', 
            width: this.screenWidth, 
            height: this.screenHeight,
            resizeTo: window 
        });
          // Add canvas to DOM
        document.body.appendChild(this.app.canvas);
        
        // Set global reference for app (needed by SpriteStack)
        window.gameApp = this.app;
        
        // Setup camera
        this.camera = new Camera(this.screenWidth, this.screenHeight);
        
        // Initialize sun and shadow management
        this.sun = new Sun(135, 45); // Fixed sun position
        this.shadowManager = new ShadowManager(true); // Shadows always enabled
        
        // Initialize input handler
        this.inputHandler = new InputHandler();
        
        // Create player submarine entity
        const submarineImgPath = `${this.imagePath}/yellow-submarine.png`;
        this.player = new Entity({
            x: 0,
            y: 0,
            imagePath: submarineImgPath,
            numLayers: 24,  // yellow-submarine.png is 32x16x24
            width: 32,
            height: 16,
            entityType: "submarine",
            outlineEnabled: this.drawOutline,
            outlineColor: 0x000000,
            outlineThickness: 2,
            outlineOffset: 11,
            rotation: 270,  // Facing up
            shadowEnabled: this.drawShadows,
        });
        this.shadowManager.registerObject(this.player);
        
        // Create and assign player controller
        this.playerController = new PlayerController();
        this.player.setController(this.playerController);
        this.playerController.setCamera(this.camera);
        
        // Register cannonballs with shadow manager
        this.shadowManager.registerObjects(this.playerController.cannonballs);
        
        // Create dungeon objects
        await this.createDungeonObjects();
        
        // Apply initial shadow settings
        this.shadowManager.updateAll(this.sun);
        
        // Setup UI
        await this.setupUI();
        
        // Add to camera container
        this.app.stage.addChild(this.camera.getContainer());
        
        // Start game loop
        this.app.ticker.add(() => this.gameLoop());
    }
    
    async createDungeonObjects() {
        this.worldObjects = [];
        this.wallObjects = [];
        
        // Load image paths
        const kelpImgPath = `${this.imagePath}/kelp-6x6x18.png`;
        const treeImgPath = `${this.imagePath}/tree.png`;
        const rockImgPath = `${this.imagePath}/rock-31x27x26.png`;
        const clamImgPath = `${this.imagePath}/clam-26x21x3.png`;
        
        // Create cave walls
        await this.createCaveWalls(treeImgPath);
        
        // Track placed positions for spacing
        const placedPositions = [];
        
        // Add kelp
        await this.placeObjects(kelpImgPath, 5, 100, placedPositions, {
            numLayers: 18, width: 6, height: 6, 
            outlineEnabled: this.drawOutline, outlineColor: 0x000000, 
            outlineThickness: 2, outlineOffset: 8
        });
        
        // Add rocks
        await this.placeObjects(rockImgPath, 3, 120, placedPositions, {
            numLayers: 26, width: 31, height: 27,
            outlineEnabled: this.drawOutline, outlineColor: 0x000000,
            outlineThickness: 2, outlineOffset: 12
        });
        
        // Add clams
        await this.placeObjects(clamImgPath, 5, 80, placedPositions, {
            numLayers: 3, width: 26, height: 21,
            outlineEnabled: this.drawOutline, outlineColor: 0x000000,
            outlineThickness: 2, outlineOffset: 1
        });
        
        // Register all objects with shadow manager
        this.shadowManager.registerObjects(this.worldObjects);
        this.shadowManager.registerObjects(this.wallObjects);
    }
    
    async placeObjects(imgPath, numObjects, minSpacing, placedPositions, options) {
        for (let i = 0; i < numObjects; i++) {
            for (let attempt = 0; attempt < 10; attempt++) {
                const x = Math.random() * (this.caveWidth - this.wallThickness * 2 - 100) - this.caveWidth/2 + this.wallThickness + 50;
                const y = Math.random() * (this.caveHeight - this.wallThickness * 2 - 100) - this.caveHeight/2 + this.wallThickness + 50;
                
                // Check spacing
                let tooClose = false;
                for (const [px, py] of placedPositions) {
                    if (Math.abs(x - px) < minSpacing && Math.abs(y - py) < minSpacing) {
                        tooClose = true;
                        break;
                    }
                }
                
                if (!tooClose) {
                    placedPositions.push([x, y]);
                    const obj = new GameObject({
                        x,
                        y,
                        imagePath: imgPath,
                        shadowEnabled: this.drawShadows,
                        ...options
                    });
                    this.worldObjects.push(obj);
                    break;
                }
            }
        }
    }
    
    async createCaveWalls(wallImgPath) {
        const wallSpacing = 80;
        
        // Add corner pieces
        const corners = [
            [-this.caveWidth/2, -this.caveHeight/2],
            [this.caveWidth/2, -this.caveHeight/2],
            [-this.caveWidth/2, this.caveHeight/2],
            [this.caveWidth/2, this.caveHeight/2]
        ];
        
        for (const [x, y] of corners) {
            this.addWallSegment(x, y, wallImgPath);
        }
        
        // Create walls
        for (let x = -this.caveWidth/2 + wallSpacing; x < this.caveWidth/2; x += wallSpacing) {
            // Top and bottom walls
            this.addWallSegment(x, -this.caveHeight/2, wallImgPath);
            this.addWallSegment(x, this.caveHeight/2, wallImgPath);
        }
        
        for (let y = -this.caveHeight/2 + wallSpacing; y < this.caveHeight/2; y += wallSpacing) {
            // Left and right walls
            this.addWallSegment(-this.caveWidth/2, y, wallImgPath);
            this.addWallSegment(this.caveWidth/2, y, wallImgPath);
        }
    }
    
    addWallSegment(x, y, imgPath) {
        const wall = new GameObject({
            x,
            y,
            imagePath: imgPath,
            numLayers: 24,
            layerOffset: 0.5,
            width: 60,
            height: 60,
            outlineEnabled: false,
        });
        
        // Prevent duplicates
        if (!this.wallObjects.find(w => w.x === x && w.y === y)) {
            this.wallObjects.push(wall);
            this.worldObjects.push(wall);
        }
    }
    
    async setupUI() {
        const textX = this.screenWidth / 2 - 200;
        const textY = this.screenHeight / 4;
        const startX = this.screenWidth / 2 - 150;
        const startY = this.screenHeight / 3;
        
        const controlsText = "Controls: WASD to move, SPACE to boost/teleport";
        
        // Try to load custom font
        const fontFile = `${this.fontPath}/blocky.ttf`;
        
        try {
            // Create text objects
            this.titleText = new Text(fontFile, 50, "Abyssal Gears: Depths of Iron and Steam", [255, 255, 255], textX, textY);
            this.startText = new Text(fontFile, 25, "Press any key to dive into the depths", [255, 255, 255], startX, startY);
            this.controlsText = new Text(fontFile, 20, controlsText, [255, 255, 255], startX - 50, startY + 40);
        } catch (e) {
            console.log("Using fallback font");
            // Create fallback text
            this.titleText = new Text(null, 50, "Abyssal Gears: Depths of Iron and Steam", [255, 255, 255], textX, textY);
            this.startText = new Text(null, 25, "Press any key to dive into the depths", [255, 255, 255], startX, startY);
            this.controlsText = new Text(null, 20, controlsText, [255, 255, 255], startX - 50, startY + 40);
        }
    }
    
    handleEvents() {
        // Update input handler
        this.inputHandler.update();
        
        // Check for quit
        if (this.inputHandler.currentState.quitRequested) {
            this.running = false;
        }
        
        // Start game on any key press
        if (!this.gameStarted && this.inputHandler.currentState.anyKeyPressed) {
            this.gameStarted = true;
        }
    }
    
    update() {
        if (this.gameStarted) {
            // Update player entity
            this.player.update(this.inputHandler.currentState);
            
            // Update cannonballs
            for (const cannonball of this.playerController.cannonballs) {
                cannonball.update();
            }
            
            // Keep player in cave boundaries
            this.keepPlayerInCave();
            
            // Update camera to follow player
            this.camera.follow(this.player.x, this.player.y, this.player.rotation);
        }
    }
    
    keepPlayerInCave() {
        const buffer = 30;
        const minX = -this.caveWidth / 2 + this.wallThickness + buffer;
        const maxX = this.caveWidth / 2 - this.wallThickness - buffer;
        const minY = -this.caveHeight / 2 + this.wallThickness + buffer;
        const maxY = this.caveHeight / 2 - this.wallThickness - buffer;
        
        this.player.x = Math.max(minX, Math.min(this.player.x, maxX));
        this.player.y = Math.max(minY, Math.min(this.player.y, maxY));
    }
    
    draw() {
        // Clear camera container
        const container = this.camera.getContainer();
        container.removeChildren();
        
        // Create background gradient
        this.drawBackground(container);
        
        if (!this.gameStarted) {
            // Draw menu screen
            this.titleText.draw(container);
            this.startText.draw(container);
            this.controlsText.draw(container);
        } else {
            // Draw game world
            this.drawGameWorld(container);
        }
    }
      drawBackground(container) {
        const background = new Graphics();
        
        // Create gradient background
        for (let y = 0; y < this.camera.height; y++) {
            const depthFactor = y / this.camera.height;
            const blue = 40 + Math.floor(40 * (1 - depthFactor));
            const green = 65 + Math.floor(15 * (1 - depthFactor));
            
            background.lineStyle(1, (10 << 16) + (green << 8) + blue);
            background.moveTo(0, y);
            background.lineTo(this.camera.width, y);
        }
        
        container.addChild(background);
    }
    
    drawGameWorld(container) {
        // Get visible objects
        const visibleObjects = this.getVisibleObjects();
          // Draw bubbles
        for (const bubble of this.playerController.bubbles) {
            const [screenX, screenY] = this.camera.worldToScreen(bubble.x, bubble.y);
            
            if (screenX >= -50 && screenX <= this.camera.width + 50 &&
                screenY >= -50 && screenY <= this.camera.height + 50) {
                
                const bubbleGraphics = new Graphics();
                bubbleGraphics.beginFill(0x99ccff, bubble.alpha / 255);
                bubbleGraphics.drawCircle(screenX, screenY, bubble.size);
                bubbleGraphics.endFill();
                container.addChild(bubbleGraphics);
            }
        }
        
        // Draw cannonballs
        for (const cannonball of this.playerController.cannonballs) {
            const [screenX, screenY] = this.camera.worldToScreen(cannonball.x, cannonball.y);
            cannonball.drawAtPosition(
                container,
                screenX,
                screenY,
                this.shadowManager.enabled,
                this.performanceMode,
                this.camera.rotation
            );
        }
        
        // Draw world objects
        for (const obj of visibleObjects) {
            const [screenX, screenY] = this.camera.worldToScreen(obj.x, obj.y);
            const relativeAngle = this.camera.rotation;
            
            obj.drawAtPosition(
                container,
                screenX,
                screenY,
                this.shadowManager.enabled,
                this.performanceMode,
                relativeAngle
            );
        }
        
        // Draw player at center
        const centerX = this.camera.width / 2;
        const centerY = this.camera.height / 2;
        
        this.player.drawAtPosition(
            container,
            centerX,
            centerY,
            this.shadowManager.enabled,
            this.performanceMode,
            270 // Always facing up on screen
        );
        
        // Draw stamina bar
        this.drawStaminaBar(container);
        
        // Draw FPS counter
        this.drawFPS(container);
    }
      drawStaminaBar(container) {
        if (this.playerController.stamina !== undefined && this.playerController.maxStamina !== undefined) {
            const staminaWidth = 200;
            const staminaHeight = 15;
            const staminaX = this.camera.width - staminaWidth - 20;
            const staminaY = this.camera.height - staminaHeight - 20;
            
            // Background
            const bg = new Graphics();
            bg.beginFill(0x323232);
            bg.drawRect(staminaX, staminaY, staminaWidth, staminaHeight);
            bg.endFill();
            container.addChild(bg);
            
            // Current stamina
            const currentWidth = (this.playerController.stamina / this.playerController.maxStamina) * staminaWidth;
            const staminaColor = this.playerController.staminaLocked ? 0xff3232 : 0x3296ff;
            
            const stamina = new Graphics();
            stamina.beginFill(staminaColor);
            stamina.drawRect(staminaX, staminaY, currentWidth, staminaHeight);
            stamina.endFill();
            container.addChild(stamina);
            
            // Border
            const border = new Graphics();
            border.lineStyle(1, 0xc8c8c8);
            border.drawRect(staminaX, staminaY, staminaWidth, staminaHeight);
            container.addChild(border);
            
            // Label
            const label = new PixiText('STAMINA', {
                fontFamily: 'Arial',
                fontSize: 12,
                fill: 0xffffff
            });
            label.x = staminaX;
            label.y = staminaY - 25;
            container.addChild(label);
        }
    }
      drawFPS(container) {
        // Calculate FPS
        const now = performance.now();
        this.frameCount++;
        
        if (now - this.lastTime >= 1000) {
            this.fps = Math.round(this.frameCount * 1000 / (now - this.lastTime));
            this.frameCount = 0;
            this.lastTime = now;
        }
        
        const fpsText = new PixiText(`FPS: ${this.fps}`, {
            fontFamily: 'Arial',
            fontSize: 14,
            fill: 0xffffff
        });
        fpsText.x = 10;
        fpsText.y = 10;
        container.addChild(fpsText);
    }
    
    getVisibleObjects() {
        const visibleObjects = [];
        const margin = 200;
        const camLeft = this.camera.x - this.camera.width / 2 - margin;
        const camRight = this.camera.x + this.camera.width / 2 + margin;
        const camTop = this.camera.y - this.camera.height / 2 - margin;
        const camBottom = this.camera.y + this.camera.height / 2 + margin;
        
        const maxRenderDistanceSq = (this.camera.width + margin) * (this.camera.width + margin);
        
        for (const obj of this.worldObjects) {
            const dx = obj.x - this.camera.x;
            const dy = obj.y - this.camera.y;
            const distanceSq = dx * dx + dy * dy;
            
            if (distanceSq <= maxRenderDistanceSq &&
                camLeft <= obj.x && obj.x <= camRight &&
                camTop <= obj.y && obj.y <= camBottom) {
                visibleObjects.push(obj);
            }
        }
        
        return visibleObjects;
    }
    
    gameLoop() {
        this.handleEvents();
        this.update();
        this.draw();
        
        if (!this.running) {
            this.app.destroy();
        }
    }
}

// Initialize and run the game
(async () => {
    try {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        const game = new Game(
            screenWidth,
            screenHeight,
            "assets",
            "assets/fonts",
            "assets/images"
        );
        
        await game.init();
        console.log("Abyssal Gears: Depths of Iron and Steam - Game Started!");
    } catch (error) {
        console.error("Error starting game:", error);
        
        // Show error to user
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #ff6b6b;
            font-size: 16px;
            text-align: center;
            max-width: 500px;
            z-index: 1000;
            background: rgba(0,0,0,0.8);
            padding: 20px;
            border-radius: 10px;
        `;
        errorDiv.innerHTML = `
            <h3>Failed to load game</h3>
            <p>Error: ${error.message}</p>
            <p>Make sure you're running this from a local server and all assets are available.</p>
        `;
        document.body.appendChild(errorDiv);
    }
})();