import * as PIXI from 'pixi.js';

const GLOBAL_SCALE = 2.0; // Match GameObject.Scale

export class SpriteStack {
    /**
     * Create a SpriteStack for PixiJS.
     * @param {string|null} imagePath - Path to the sprite sheet or null.
     * @param {number} numLayers - Number of layers to stack.
     * @param {number} layerOffset - Vertical pixels between each layer.
     * @param {number} defaultWidth - Default width if no image.
     * @param {number} defaultHeight - Default height if no image.
     * @param {boolean} outlineEnabled - Whether to draw an outline.
     * @param {number} outlineThickness - Thickness of outline.
     */
    constructor({
        imagePath = null,
        numLayers = 8,
        layerOffset = 0.5,
        defaultWidth = 32,
        defaultHeight = 32,
        outlineEnabled = false,
        outlineColor = 0x000000,
        outlineThickness = 1,
    } = {}) {
        this.numLayers = numLayers;
        this.layerOffset = layerOffset;
        this.defaultWidth = defaultWidth;
        this.defaultHeight = defaultHeight;
        this.outlineEnabled = outlineEnabled;
        this.outlineColor = outlineColor;
        this.outlineThickness = outlineThickness;

        this.layers = [];  // PIXI.Sprite array for layers
        this.container = new PIXI.Container();

        this.shadowEnabled = true;
        this.sunHorizontalAngle = 45; // degrees
        this.sunVerticalAngle = 45;   // degrees

        this.width = defaultWidth;
        this.height = defaultHeight;

        // Promise for async texture loading
        this._ready = null;

        // Begin loading layers
        if (imagePath) {
            this._ready = this._createLayersFromImage(imagePath);
        } else {
            // No image: create default colored layers
            this._createDefaultLayers();
            this._ready = Promise.resolve();
        }
    }

    async ready() {
        // Returns a promise that resolves when layers are ready
        return this._ready;
    }

    async _createLayersFromImage(imgPath) {
        // Load the full image
        const baseTexture = await PIXI.BaseTexture.from(imgPath);

        const imgWidth = baseTexture.width;
        const imgHeight = baseTexture.height;
        const layerHeight = Math.floor(imgHeight / this.numLayers);

        this.layers = [];

        for (let i = 0; i < this.numLayers; i++) {
            // Each layer rect: (x=0, y=imgHeight - (i+1)*layerHeight, width=imgWidth, height=layerHeight)
            const yStart = imgHeight - (i + 1) * layerHeight;

            const rect = new PIXI.Rectangle(0, yStart, imgWidth, layerHeight);
            const texture = new PIXI.Texture(baseTexture, rect);

            const sprite = new PIXI.Sprite(texture);

            // Apply global scale
            sprite.scale.set(GLOBAL_SCALE);

            this.layers.push(sprite);
        }

        // Set width and height based on first layer
        if (this.layers.length > 0) {
            this.width = this.layers[0].width;
            this.height = this.layers[0].height;
        }
    }

    _createDefaultLayers() {
        // Create colored layers as PIXI.Graphics and convert to textures
        this.layers = [];

        const colors = [
            0xb4b4c8, // Light gray (top)
            0xa0a0b4,
            0x8c8ca0,
            0x787888,
            0x646470,
            0x505060,
            0x3c3c50,
            0x282840, // Dark gray (bottom)
        ];

        for (let i = 0; i < this.numLayers; i++) {
            const colorIndex = Math.min(i, colors.length - 1);
            const color = colors[colorIndex];

            const gfx = new PIXI.Graphics();
            gfx.beginFill(color);
            const rectWidth = this.defaultWidth * 0.8;
            const rectHeight = this.defaultHeight * 0.8;
            const xOffset = (this.defaultWidth - rectWidth) / 2;
            const yOffset = (this.defaultHeight - rectHeight) / 2;
            gfx.drawRect(xOffset, yOffset, rectWidth, rectHeight);
            gfx.endFill();

            // Generate texture from graphics
            const texture = gfx.generateCanvasTexture({
                scaleMode: PIXI.SCALE_MODES.LINEAR,
                resolution: 1,
            });

            const sprite = new PIXI.Sprite(texture);
            sprite.scale.set(GLOBAL_SCALE);

            this.layers.push(sprite);
        }

        this.width = this.defaultWidth * GLOBAL_SCALE;
        this.height = this.defaultHeight * GLOBAL_SCALE;
    }

    configureSun(horizontalAngle = 45, verticalAngle = 45, shadowEnabled = true) {
        this.sunHorizontalAngle = horizontalAngle;
        this.sunVerticalAngle = verticalAngle;
        this.shadowEnabled = shadowEnabled;
        return this;
    }

    _drawShadow(container, x, y, rotation) {
        if (!this.shadowEnabled) return;

        const verticalFactor = this.sunVerticalAngle / 90.0;
        const horizontalRad = (this.sunHorizontalAngle * Math.PI) / 180;

        const baseShadowLength = this.height * (1.0 - verticalFactor) * 2.5;

        const shadowOffsetX = -Math.sin(horizontalRad) * baseShadowLength;
        const shadowOffsetY = -Math.cos(horizontalRad) * baseShadowLength;

        // We'll create a container to hold shadow sprites
        const shadowContainer = new PIXI.Container();

        // Use a subset of layers for shadow, sampling evenly
        const layerCount = this.layers.length;
        let layerIndices;
        if (layerCount <= 8) {
            layerIndices = [...Array(layerCount).keys()];
        } else {
            const step = Math.max(1, Math.floor(layerCount / 5));
            layerIndices = [];
            for (let i = 0; i < layerCount; i += step) layerIndices.push(i);
        }

        for (const i of layerIndices) {
            const layer = this.layers[i];
            if (!layer) continue;

            // Clone sprite for shadow
            const shadowSprite = new PIXI.Sprite(layer.texture);

            shadowSprite.anchor.set(0.5);

            // Apply black tint and alpha for shadow
            shadowSprite.tint = 0x000000;
            const shadowAlpha = 220 * (1.0 - verticalFactor * 0.3) / 255;
            shadowSprite.alpha = shadowAlpha;

            // Calculate offset
            const layerFactor = i / Math.max(1, layerCount - 1);

            let layerOffsetX = 0;
            let layerOffsetY = 0;

            if (i !== 0) {
                layerOffsetX = shadowOffsetX * layerFactor * 0.6;
                layerOffsetY = shadowOffsetY * layerFactor * 0.6;
            }

            shadowSprite.x = x + layerOffsetX;
            shadowSprite.y = y + layerOffsetY - i * this.layerOffset;
            shadowSprite.rotation = -rotation * (Math.PI / 180);

            shadowContainer.addChild(shadowSprite);
        }

        container.addChild(shadowContainer);
    }

    draw(container, x, y, rotation = 0, drawShadow = true, tiltAmount = 0) {
        // Clear previous container children
        this.container.removeChildren();

        // Draw shadow behind
        if (drawShadow && this.shadowEnabled) {
            this._drawShadow(this.container, x, y, rotation);
        }

        // Draw layers bottom to top
        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            if (!layer) continue;

            // Clone sprite to avoid modifying original
            const sprite = new PIXI.Sprite(layer.texture);
            sprite.anchor.set(0.5);

            // Position with stacking and tilt
            const layerFactor = i / Math.max(1, this.layers.length - 1);
            const horizontalOffset = tiltAmount * layerFactor * 4;

            sprite.x = x + horizontalOffset;
            sprite.y = y - i * this.layerOffset;

            sprite.rotation = -rotation * (Math.PI / 180);

            this.container.addChild(sprite);
        }

        // Apply outline filter if enabled (simple example)
        if (this.outlineEnabled) {
            // You can install pixi-filters and use OutlineFilter:
            // import { OutlineFilter } from 'pixi-filters';
            this.container.filters = [new OutlineFilter(this.outlineThickness, this.outlineColor)];
            // For demo, let's just set a dummy filter array:
            // NOTE: To fully implement outlines you need to add pixi-filters and uncomment below:

            
            if (!this._outlineFilter) {
                this._outlineFilter = new OutlineFilter(this.outlineThickness, this.outlineColor);
            }
            this.container.filters = [this._outlineFilter];
            

            // For now, just leave container.filters empty or null
            // this.container.filters = null;
        } else {
            this.container.filters = null;
        }

        // Add container to target
        if (!container.children.includes(this.container)) {
            container.addChild(this.container);
        }
    }
}
