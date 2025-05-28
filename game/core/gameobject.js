import * as PIXI from 'pixi.js';
import { SpriteStack } from './spritestack.js';

export class GameObject extends PIXI.Sprite {
    static Scale = 2.0;  // Default scale for all game objects

    /**
     * Initialize a game object.
     * @param {object} options - Configuration options for the object.
     */
    constructor({
        x = 0,
        y = 0,
        texture = null,
        imagePath = null,
        numLayers = 8,
        layerOffset = 0.5,
        width = 32,
        height = 32,
        outlineEnabled = false,
        outlineColor = 0x000000,
        outlineThickness = 1,
        outlineOffset = 1,
        shadowEnabled = true
    } = {}) {
        // Load texture from imagePath if provided, otherwise use texture or fallback
        let loadedTexture = texture;
        if (imagePath && !texture) {
            loadedTexture = PIXI.Texture.from(imagePath);
        }
        if (!loadedTexture) {
            loadedTexture = PIXI.Texture.WHITE; // Fallback to white texture
        }
        
        super(loadedTexture);

        this.x = x;
        this.y = y;        // Create sprite stack for rendering
        this.spriteStack = new SpriteStack({
            texture: loadedTexture,
            numLayers,
            layerOffset: layerOffset * GameObject.Scale,
            defaultWidth: width,
            defaultHeight: height,
            outlineEnabled,
            outlineColor,
            outlineThickness,
            outlineOffset
        });

        // Set shadow state
        this.shadowEnabled = shadowEnabled;

        // Set basic sprite properties for collision detection
        this.width = this.spriteStack.width * GameObject.Scale;
        this.height = this.spriteStack.height * GameObject.Scale;

        // Initialize rectangle for collision detection
        this.rect = new PIXI.Rectangle(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);

        // Set up sprite from sprite stack
        this.texture = this.spriteStack.layers.length > 0 ? this.spriteStack.layers[0].texture : null;
    }

    update(delta, ...args) {
        // Update rectangle position
        if (this.rect) {
            this.rect.x = this.x - this.width / 2;
            this.rect.y = this.y - this.height / 2;
        }
    }

    draw(renderer, drawShadow = true, performanceMode = 0) {
        // Draw using sprite stack
        this.spriteStack.draw(renderer, this.x, this.y, 0, drawShadow && this.shadowEnabled, performanceMode);
    }

    drawAtPosition(renderer, screenX, screenY, drawShadow = true, performanceMode = 0, rotation = null) {
        // Calculate the actual rotation to use
        const actualRotation = rotation !== null ? rotation : this.rotation;

        // Draw using sprite stack at the specified position
        this.spriteStack.draw(renderer, screenX, screenY, actualRotation, drawShadow && this.shadowEnabled, performanceMode);
    }

    configureOutline(enabled = true, color = 0xff0000, thickness = 2) {
        // Configure outline properties
        this.spriteStack.outlineManager.configure(enabled, color, thickness);
        return this;
    }

    configureShadow(horizontalAngle = 45, verticalAngle = 45, shadowEnabled = true) {
        // Configure shadow based on sun position
        this.spriteStack.configureSun(horizontalAngle, verticalAngle, shadowEnabled);
        return this;
    }
}
