import { Application, Graphics, Text as PixiText, Assets } from 'pixi.js';
import { Text } from './utils/text.js';
import { Entity } from './core/entity.js';
import { GameObject } from './core/gameobject.js';
import { PlayerController } from './controllers/player_controller.js';
import { Sun } from './core/sun.js';
import { ShadowManager } from './core/shadow.js';
import { Camera } from './core/camera.js';
import { LoadingScreen } from './core/loading.js';
import { UIManager } from './core/ui.js';

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
        
        // Don't reset anyKeyPressed here - let it be handled after events are processed
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
 * Asset Manager for optimized loading using PIXI.js Assets
 */
class AssetManager {
    constructor() {
        this.bundles = {};
        this.loaded = {};
    }    /**
     * Initialize and register all game assets using manifest
     */
    async initAssets(assetPath, imagePath, onProgress = null) {
        try {
            // Try to load manifest first
            onProgress?.(0.1, 'Loading asset manifest...');
            const manifestUrl = `${assetPath}/manifest.json`;
            await Assets.init({ manifest: manifestUrl });
            
            // Load bundles from manifest with progress tracking
            onProgress?.(0.3, 'Loading game sprites...');
            const gameSprites = await Assets.loadBundle('game-sprites');
            
            onProgress?.(0.7, 'Loading game fonts...');
            const gameFonts = await Assets.loadBundle('game-fonts').catch(() => ({}));
            
            this.loaded = { 
                ...this.loaded, 
                ...gameSprites, 
                ...gameFonts 
            };
            
            onProgress?.(1.0, 'Assets loaded successfully!');
            console.log('Assets loaded from manifest:', Object.keys(this.loaded));
        } catch (error) {
            console.warn('Failed to load manifest, falling back to manual loading:', error);
            
            // Fallback to manual asset loading
            onProgress?.(0.2, 'Setting up manual asset loading...');
            Assets.addBundle('game-sprites', {
                'submarine': `${imagePath}/yellow-submarine.png`,
                'kelp': `${imagePath}/kelp-6x6x18.png`,
                'tree': `${imagePath}/tree.png`,
                'rock': `${imagePath}/rock-31x27x26.png`,
                'clam': `${imagePath}/clam-26x21x3.png`,
                'cannonball': `${imagePath}/cannonball-3x3x2.png`,
                'cavefloor': `${imagePath}/cavefloor.jpg`,
                'seafloor': `${imagePath}/seafloor.png`
            });

            // Load the game sprites bundle
            onProgress?.(0.6, 'Loading sprites manually...');
            const gameSprites = await Assets.loadBundle('game-sprites');
            this.loaded = { ...this.loaded, ...gameSprites };
            
            onProgress?.(1.0, 'Assets loaded successfully!');
            console.log('Assets loaded manually:', Object.keys(this.loaded));
        }
        
        return this.loaded;
    }

    /**
     * Get a loaded texture by name
     */
    getTexture(name) {
        if (this.loaded[name]) {
            return this.loaded[name];
        }
        console.warn(`Texture '${name}' not found. Available textures:`, Object.keys(this.loaded));
        return null;
    }

    /**
     * Preload additional assets
     */
    async loadAdditionalAssets(assets) {
        const loaded = await Assets.load(assets);
        this.loaded = { ...this.loaded, ...loaded };
        return loaded;
    }

    /**
     * Check if all required textures are loaded
     */
    validateTextures(requiredTextures) {
        const missing = requiredTextures.filter(name => !this.loaded[name]);
        if (missing.length > 0) {
            console.warn('Missing textures:', missing);
            return false;
        }
        return true;
    }
}

/**
 * Main game class for Abyssal Gears: Depths of Iron and Steam.
 */
class Game {    constructor(screenWidth, screenHeight, assetPath = "", fontPath = "", imagePath = "") {
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.assetPath = assetPath;
        this.fontPath = fontPath;
        this.imagePath = imagePath;
        
        // Asset manager
        this.assetManager = new AssetManager();
        
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
        
        // UI Manager
        this.uiManager = null;
        
        // FPS tracking
        this.lastTime = performance.now();
        this.frameCount = 0;
        this.fps = 60;
        
        // Reusable graphics objects
        this.directionArrow = null;
        this.arrowHead = null;
        this.background = null;
        this.bubbleGraphics = [];  // Array to hold bubble graphics objects
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
        
        // Create and show loading screen
        const loadingScreen = new LoadingScreen(this.app);
        loadingScreen.show();
        
        // Initialize and load assets with progress tracking
        console.log('Loading game assets...');
        await this.assetManager.initAssets(
            this.assetPath, 
            this.imagePath,
            (progress, message) => {
                loadingScreen.updateProgress(progress, message);
            }
        );
        
        // Add a small delay to show final loading message
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Validate that all required textures are loaded
        const requiredTextures = ['submarine', 'kelp', 'tree', 'rock', 'clam'];
        if (!this.assetManager.validateTextures(requiredTextures)) {
            loadingScreen.hide();
            throw new Error('Failed to load required game textures');
        }
        
        // Hide loading screen
        loadingScreen.hide();
        console.log('Assets loaded successfully!');
        
        // Setup camera
        this.camera = new Camera(this.screenWidth, this.screenHeight);
        
        // Initialize sun and shadow management
        this.sun = new Sun(135, 45); // Fixed sun position
        this.shadowManager = new ShadowManager(true); // Shadows always enabled
        
        // Initialize input handler
        this.inputHandler = new InputHandler();
        
        // Create player submarine entity
        this.player = new Entity({
            x: 0,
            y: 0,
            texture: this.assetManager.getTexture('submarine'),
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
        
        // Setup UI Manager
        this.uiManager = new UIManager(this.app);
        
        // Listen for game start event from UI
        this.app.stage.on('gameStart', () => {
            this.gameStarted = true;
        });
          // Add UI container to camera UI container (so it doesn't rotate with camera)
        this.camera.getUIContainer().addChild(this.uiManager.getContainer());
        
        // Setup window resize handler for UI
        window.addEventListener('resize', () => {
            this.uiManager.resize(window.innerWidth, window.innerHeight);
        });
        
        // Create reusable graphics objects
        this.directionArrow = new Graphics();
        this.arrowHead = new Graphics();
        this.background = new Graphics();
        
        // Add to camera container
        this.app.stage.addChild(this.camera.getContainer());
        
        // Start game loop
        this.app.ticker.add(() => this.gameLoop());
    }
      async createDungeonObjects() {
        this.worldObjects = [];
        this.wallObjects = [];
        
        // Create cave walls
        await this.createCaveWalls();
        
        // Track placed positions for spacing
        const placedPositions = [];
        
        // Add kelp
        await this.placeObjects('kelp', 5, 100, placedPositions, {
            numLayers: 18, width: 6, height: 6, 
            outlineEnabled: this.drawOutline, outlineColor: 0x000000, 
            outlineThickness: 2, outlineOffset: 8
        });
        
        // Add rocks
        await this.placeObjects('rock', 3, 120, placedPositions, {
            numLayers: 26, width: 31, height: 27,
            outlineEnabled: this.drawOutline, outlineColor: 0x000000,
            outlineThickness: 2, outlineOffset: 12
        });
        
        // Add clams
        await this.placeObjects('clam', 5, 80, placedPositions, {
            numLayers: 3, width: 26, height: 21,
            outlineEnabled: this.drawOutline, outlineColor: 0x000000,
            outlineThickness: 2, outlineOffset: 1
        });
        
        // Register all objects with shadow manager
        this.shadowManager.registerObjects(this.worldObjects);
        this.shadowManager.registerObjects(this.wallObjects);
    }
      async placeObjects(textureKey, numObjects, minSpacing, placedPositions, options) {
        const texture = this.assetManager.getTexture(textureKey);
        if (!texture) {
            console.warn(`Texture '${textureKey}' not found, skipping object placement`);
            return;
        }

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
                        texture: texture,
                        shadowEnabled: this.drawShadows,
                        ...options
                    });
                    this.worldObjects.push(obj);
                    break;
                }
            }
        }
    }
      async createCaveWalls() {
        const wallTexture = this.assetManager.getTexture('tree');
        if (!wallTexture) {
            console.warn('Wall texture not found, creating walls without texture');
        }

        const wallSpacing = 80;
        
        // Add corner pieces
        const corners = [
            [-this.caveWidth/2, -this.caveHeight/2],
            [this.caveWidth/2, -this.caveHeight/2],
            [-this.caveWidth/2, this.caveHeight/2],
            [this.caveWidth/2, this.caveHeight/2]
        ];
        
        for (const [x, y] of corners) {
            this.addWallSegment(x, y, wallTexture);
        }
        
        // Create walls
        for (let x = -this.caveWidth/2 + wallSpacing; x < this.caveWidth/2; x += wallSpacing) {
            // Top and bottom walls
            this.addWallSegment(x, -this.caveHeight/2, wallTexture);
            this.addWallSegment(x, this.caveHeight/2, wallTexture);
        }
        
        for (let y = -this.caveHeight/2 + wallSpacing; y < this.caveHeight/2; y += wallSpacing) {
            // Left and right walls
            this.addWallSegment(-this.caveWidth/2, y, wallTexture);
            this.addWallSegment(this.caveWidth/2, y, wallTexture);
        }
    }
      addWallSegment(x, y, texture) {
        const wall = new GameObject({
            x,
            y,
            texture: texture,
            numLayers: 24,
            layerOffset: 0.5,
            width: 60,
            height: 60,
            outlineEnabled: false,
        });
        
        // Prevent duplicates
        if (!this.wallObjects.find(w => w.x === x && w.y === y)) {
            this.wallObjects.push(wall);
            this.worldObjects.push(wall);        }
    }
    
    handleEvents() {
        // Update input handler
        this.inputHandler.update();
        
        // Check for quit
        if (this.inputHandler.currentState.quitRequested) {
            this.running = false;
        }
        
        // Reset one-time events after processing
        this.inputHandler.currentState.anyKeyPressed = false;
        this.inputHandler.currentState.quitRequested = false;
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
            
            // Update camera to follow player position AND rotation
            // This will rotate the world around the submarine
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
    }    draw() {
        // Clear both containers
        const worldContainer = this.camera.getWorldContainer();
        const uiContainer = this.camera.getUIContainer();
        worldContainer.removeChildren();
        
        // Keep UI container children (UI Manager handles its own drawing)
        // Only remove UI elements that aren't from UIManager
        const uiChildren = [...uiContainer.children];
        for (const child of uiChildren) {
            if (child !== this.uiManager.getContainer()) {
                uiContainer.removeChild(child);
            }
        }
        
        // Create background gradient (add to world container)
        this.drawBackground(worldContainer);
        
        if (this.uiManager.isGameStarted()) {
            // Draw game world
            this.drawGameWorld(worldContainer, uiContainer);
        }
    }
      drawBackground(container) {
        this.background.clear();
        
        // Create gradient background
        for (let y = 0; y < this.camera.height; y++) {
            const depthFactor = y / this.camera.height;
            const blue = 40 + Math.floor(40 * (1 - depthFactor));
            const green = 65 + Math.floor(15 * (1 - depthFactor));
            
            this.background.lineStyle(1, (10 << 16) + (green << 8) + blue);
            this.background.moveTo(0, y);
            this.background.lineTo(this.camera.width, y);
        }
        
        container.addChild(this.background);
    }
      drawGameWorld(worldContainer, uiContainer) {
        // Get visible objects
        const visibleObjects = this.getVisibleObjects();
        
        // Ensure we have enough bubble graphics objects
        while (this.bubbleGraphics.length < this.playerController.bubbles.length) {
            this.bubbleGraphics.push(new Graphics());
        }
          
        // Draw bubbles
        for (let i = 0; i < this.playerController.bubbles.length; i++) {
            const bubble = this.playerController.bubbles[i];
            const [screenX, screenY] = this.camera.worldToScreen(bubble.x, bubble.y);
            
            if (screenX >= -50 && screenX <= this.camera.width + 50 &&
                screenY >= -50 && screenY <= this.camera.height + 50) {
                
                const bubbleGraphic = this.bubbleGraphics[i];
                bubbleGraphic.clear();
                bubbleGraphic.beginFill(0x99ccff, bubble.alpha / 255);
                bubbleGraphic.drawCircle(screenX, screenY, bubble.size);
                bubbleGraphic.endFill();
                worldContainer.addChild(bubbleGraphic);
            }
        }
        
        // Draw cannonballs
        for (const cannonball of this.playerController.cannonballs) {
            const [screenX, screenY] = this.camera.worldToScreen(cannonball.x, cannonball.y);
            cannonball.drawAtPosition(
                worldContainer,
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
                worldContainer,
                screenX,
                screenY,
                this.shadowManager.enabled,
                this.performanceMode,
                relativeAngle
            );
        }
        
        // Draw player at center with FIXED rotation (270 = facing up)
        const centerX = this.camera.width / 2;
        const centerY = this.camera.height / 2;
        
        this.player.drawAtPosition(
            worldContainer,
            centerX,
            centerY,
            this.shadowManager.enabled,
            this.performanceMode,
            270 // Always facing up on screen, never rotating visually
        );
        
        // Draw direction indicator arrow (red)
        this.directionArrow.clear();
        
        // Get the exact movement angle from the entity's rotation
        // No need for directionOffset anymore since we've aligned the movement
        const angleRad = this.player.rotation * (Math.PI / 180);
        
        // Calculate the movement vector (normalized)
        const moveX = -Math.sin(angleRad);
        const moveY = Math.cos(angleRad);
        
        // Arrow parameters
        const arrowLength = 60;
        const arrowHeadSize = 12;
        const lineWidth = 3;
        
        // Calculate shaft endpoint
        const shaftEndX = centerX + moveX * (arrowLength - arrowHeadSize);
        const shaftEndY = centerY + moveY * (arrowLength - arrowHeadSize);
        
        // Draw the line directly with lineStyle
        this.directionArrow.lineStyle({
            width: lineWidth,
            color: 0xFF0000,
            cap: 'round',
            join: 'round'
        });
        
        // Draw the shaft
        this.directionArrow.moveTo(centerX, centerY);
        this.directionArrow.lineTo(shaftEndX, shaftEndY);
        
        // Add to world container
        worldContainer.addChild(this.directionArrow);
        
        // Draw arrow head
        this.arrowHead.clear();
        this.arrowHead.beginFill(0xFF0000);
        
        // Calculate the angle from the movement vector
        const arrowAngle = Math.atan2(moveY, moveX);
        
        // Draw the arrowhead directly at the end of the shaft
        this.arrowHead.position.set(shaftEndX, shaftEndY);
        
        // Draw a triangle pointing in the direction of movement
        const headBackX = -Math.cos(arrowAngle) * arrowHeadSize;
        const headBackY = -Math.sin(arrowAngle) * arrowHeadSize;
        const headRightX = -Math.sin(arrowAngle) * arrowHeadSize/2;
        const headRightY = Math.cos(arrowAngle) * arrowHeadSize/2;
        
        this.arrowHead.moveTo(0, 0);
        this.arrowHead.lineTo(headBackX + headRightX, headBackY + headRightY);
        this.arrowHead.lineTo(headBackX - headRightX, headBackY - headRightY);
        this.arrowHead.closePath();
        this.arrowHead.endFill();
        
        // Add arrowhead to world container
        worldContainer.addChild(this.arrowHead);
        
        // Draw UI elements using UI Manager
        if (this.playerController.stamina !== undefined && this.playerController.maxStamina !== undefined) {
            this.uiManager.updateStaminaBar(
                this.playerController.stamina, 
                this.playerController.maxStamina, 
                this.playerController.staminaLocked
            );
        }
        
        // Update FPS
        this.updateFPS();        this.uiManager.updateFPS(this.fps);
    }
    
    updateFPS() {
        // Calculate FPS
        const now = performance.now();
        this.frameCount++;
        
        if (now - this.lastTime >= 1000) {
            this.fps = Math.round(this.frameCount * 1000 / (now - this.lastTime));
            this.frameCount = 0;
            this.lastTime = now;
        }
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