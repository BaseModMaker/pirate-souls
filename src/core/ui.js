import * as PIXI from 'pixi.js';

/**
 * Custom Button Component
 */
class CustomButton extends PIXI.Container {
    constructor(options = {}) {
        super();
        
        this.options = {
            width: 250,
            height: 60,
            text: 'Button',
            fontSize: 18,
            normalColor: 0x3296ff,
            hoverColor: 0x5ab8ff,
            pressedColor: 0x1e7bd1,
            textColor: 0xffffff,
            borderRadius: 8,
            ...options
        };
          this.isPressed = false;
        this.isHovered = false;
        
        this.createButton();
        this.setupInteraction();
    }
    
    createButton() {
        // Background
        this.background = new PIXI.Graphics();
        this.addChild(this.background);
        
        // Text
        this.text = new PIXI.Text(this.options.text, {
            fontFamily: 'Arial, sans-serif',
            fontSize: this.options.fontSize,
            fill: this.options.textColor,
            fontWeight: 'bold'
        });
        this.text.anchor.set(0.5);
        this.text.x = this.options.width / 2;
        this.text.y = this.options.height / 2;
        this.addChild(this.text);
        
        this.updateAppearance();
    }
    
    setupInteraction() {
        this.eventMode = 'static';
        this.cursor = 'pointer';
        
        this.on('pointerdown', () => {
            this.isPressed = true;
            this.updateAppearance();
        });
          this.on('pointerup', () => {
            if (this.isPressed) {
                this.emit('press');
            }
            this.isPressed = false;
            this.updateAppearance();
        });
        
        this.on('pointerupoutside', () => {
            this.isPressed = false;
            this.updateAppearance();
        });
        
        this.on('pointerover', () => {
            this.isHovered = true;
            this.updateAppearance();
        });
        
        this.on('pointerout', () => {
            this.isHovered = false;
            this.updateAppearance();
        });
    }
    
    updateAppearance() {
        this.background.clear();
        
        let color = this.options.normalColor;
        if (this.isPressed) {
            color = this.options.pressedColor;
        } else if (this.isHovered) {
            color = this.options.hoverColor;
        }
        
        // Draw background
        this.background.beginFill(color);
        this.background.drawRoundedRect(0, 0, this.options.width, this.options.height, this.options.borderRadius);
        this.background.endFill();
        
        // Draw border
        this.background.lineStyle(2, 0xffffff, 0.3);
        this.background.drawRoundedRect(1, 1, this.options.width - 2, this.options.height - 2, this.options.borderRadius - 1);
    }
}

/**
 * Custom Progress Bar Component
 */
class CustomProgressBar extends PIXI.Container {
    constructor(options = {}) {
        super();
        
        this.options = {
            width: 200,
            height: 15,
            backgroundColor: 0x323232,
            fillColor: 0x3296ff,
            borderColor: 0xc8c8c8,
            borderRadius: 3,
            ...options
        };
        
        this._progress = 100;
        this.createProgressBar();
    }
    
    createProgressBar() {
        // Background
        this.background = new PIXI.Graphics();
        this.addChild(this.background);
        
        // Fill
        this.fill = new PIXI.Graphics();
        this.addChild(this.fill);
        
        this.updateAppearance();
    }
    
    updateAppearance() {
        // Clear graphics
        this.background.clear();
        this.fill.clear();
        
        // Draw background
        this.background.beginFill(this.options.backgroundColor);
        this.background.drawRoundedRect(0, 0, this.options.width, this.options.height, this.options.borderRadius);
        this.background.endFill();
        
        // Draw border
        this.background.lineStyle(1, this.options.borderColor, 0.5);
        this.background.drawRoundedRect(0, 0, this.options.width, this.options.height, this.options.borderRadius);
        
        // Draw fill
        const fillWidth = (this._progress / 100) * this.options.width;
        if (fillWidth > 0) {
            this.fill.beginFill(this.options.fillColor);
            this.fill.drawRoundedRect(0, 0, fillWidth, this.options.height, this.options.borderRadius);
            this.fill.endFill();
        }
    }
    
    get progress() {
        return this._progress;
    }
    
    set progress(value) {
        this._progress = Math.max(0, Math.min(100, value));
        this.updateAppearance();
    }
    
    setFillColor(color) {
        this.options.fillColor = color;
        this.updateAppearance();
    }
}

/**
 * UI Manager for PixiJS UI components
 */
export class UIManager {
    constructor(app) {
        this.app = app;
        this.container = new PIXI.Container();
        this.menuContainer = new PIXI.Container();
        this.gameUIContainer = new PIXI.Container();
        
        // UI state
        this.gameStarted = false;
        
        // UI elements
        this.titleText = null;
        this.startButton = null;
        this.controlsText = null;
        this.staminaBar = null;
        this.fpsText = null;
        
        this.init();
    }
    
    init() {
        // Setup main UI containers
        this.container.addChild(this.menuContainer);
        this.container.addChild(this.gameUIContainer);
        
        // Initially show menu
        this.showMenu();
    }
    
    /**
     * Create the main menu UI
     */
    showMenu() {
        this.menuContainer.removeChildren();
        this.gameStarted = false;
        
        const centerX = this.app.screen.width / 2;
        const centerY = this.app.screen.height / 2;
        
        // Create title text
        this.titleText = new PIXI.Text('Abyssal Gears: Depths of Iron and Steam', {
            fontFamily: 'Arial, sans-serif',
            fontSize: 42,
            fill: 0xffffff,
            align: 'center',
            dropShadow: {
                color: 0x000000,
                blur: 4,
                angle: Math.PI / 6,
                distance: 6,
            }
        });
        this.titleText.anchor.set(0.5);
        this.titleText.x = centerX;
        this.titleText.y = centerY - 150;
        this.menuContainer.addChild(this.titleText);
        
        // Create start button using custom button
        this.startButton = new CustomButton({
            text: 'Start Game',
            width: 250,
            height: 60
        });
          this.startButton.x = centerX - this.startButton.options.width / 2;
        this.startButton.y = centerY - 50 - this.startButton.options.height / 2;
        
        this.startButton.on('press', () => {
            this.hideMenu();
            this.showGameUI();
            this.gameStarted = true;
            // Dispatch custom event for game start
            this.app.stage.emit('gameStart');
        });
        
        this.menuContainer.addChild(this.startButton);
        
        // Create controls text
        this.controlsText = new PIXI.Text('Controls: WASD to move, SPACE to boost/teleport', {
            fontFamily: 'Arial, sans-serif',
            fontSize: 18,
            fill: 0xcccccc,
            align: 'center'
        });
        this.controlsText.anchor.set(0.5);
        this.controlsText.x = centerX;
        this.controlsText.y = centerY + 50;
        this.menuContainer.addChild(this.controlsText);
        
        // Add subtitle
        const subtitle = new PIXI.Text('Navigate the mysterious depths in your steampunk submarine', {
            fontFamily: 'Arial, sans-serif',
            fontSize: 16,
            fill: 0x888888,
            align: 'center',
            fontStyle: 'italic'
        });
        subtitle.anchor.set(0.5);
        subtitle.x = centerX;
        subtitle.y = centerY - 100;
        this.menuContainer.addChild(subtitle);
    }
    
    /**
     * Hide the main menu
     */
    hideMenu() {
        this.menuContainer.visible = false;
    }
    
    /**
     * Show the in-game UI
     */
    showGameUI() {
        this.gameUIContainer.removeChildren();
        this.gameUIContainer.visible = true;
        
        // Create stamina bar
        this.createStaminaBar();
        
        // Create FPS counter
        this.createFPSCounter();
    }
    
    /**
     * Create stamina bar UI component
     */
    createStaminaBar() {
        const staminaContainer = new PIXI.Container();
        
        // Stamina label
        const staminaLabel = new PIXI.Text('STAMINA', {
            fontFamily: 'Arial, sans-serif',
            fontSize: 12,
            fill: 0xffffff,
            fontWeight: 'bold'
        });
        staminaLabel.x = this.app.screen.width - 220;
        staminaLabel.y = this.app.screen.height - 60;
        staminaContainer.addChild(staminaLabel);
        
        // Create progress bar for stamina using custom progress bar
        this.staminaBar = new CustomProgressBar({
            width: 200,
            height: 15,
            fillColor: 0x3296ff
        });
        
        this.staminaBar.x = this.app.screen.width - 220;
        this.staminaBar.y = this.app.screen.height - 40;
        
        staminaContainer.addChild(this.staminaBar);
        this.gameUIContainer.addChild(staminaContainer);
    }
    
    /**
     * Create FPS counter
     */
    createFPSCounter() {
        this.fpsText = new PIXI.Text('FPS: 60', {
            fontFamily: 'Arial, sans-serif',
            fontSize: 14,
            fill: 0xffffff
        });
        this.fpsText.x = 10;
        this.fpsText.y = 10;
        this.gameUIContainer.addChild(this.fpsText);
    }
    
    /**
     * Update the stamina bar
     */
    updateStaminaBar(current, max, locked = false) {
        if (this.staminaBar) {
            const progress = (current / max) * 100;
            this.staminaBar.progress = progress;
            
            // Change color based on locked state
            const color = locked ? 0xff3232 : 0x3296ff;
            this.staminaBar.setFillColor(color);
        }
    }
    
    /**
     * Update FPS display
     */
    updateFPS(fps) {
        if (this.fpsText) {
            this.fpsText.text = `FPS: ${fps}`;
        }
    }
    
    /**
     * Handle window resize
     */
    resize(width, height) {
        // Update UI positions based on new screen size
        if (this.titleText) {
            this.titleText.x = width / 2;
            this.titleText.y = height / 2 - 150;
        }
        
        if (this.startButton) {
            this.startButton.x = width / 2 - this.startButton.options.width / 2;
            this.startButton.y = height / 2 - 50 - this.startButton.options.height / 2;
        }
        
        if (this.controlsText) {
            this.controlsText.x = width / 2;
            this.controlsText.y = height / 2 + 50;
        }
        
        if (this.staminaBar) {
            this.staminaBar.x = width - 220;
            this.staminaBar.y = height - 40;
        }
    }
    
    /**
     * Get the main UI container
     */
    getContainer() {
        return this.container;
    }
    
    /**
     * Check if game has started
     */
    isGameStarted() {
        return this.gameStarted;
    }
}
