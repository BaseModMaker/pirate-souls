import * as PIXI from 'pixi.js';

export class OutlineManager {
    /**
     * Initialize the outline manager.
     * @param {object} options - Configuration options.
     */
    constructor({ enabled = false, color = 0x000000, thickness = 1, outlineOffset = 1 } = {}) {
        this.enabled = enabled;
        this.color = color;
        this.thickness = thickness;
        this.outlineOffset = outlineOffset;
    }

    /**
     * Draw the outline around a sprite stack.
     * @param {PIXI.Container} container - The PIXI container or main stage.
     * @param {number} x - X world position.
     * @param {number} y - Y world position.
     * @param {number} rotation - Rotation in degrees.
     * @param {PIXI.Sprite[]} layers - Array of sprite layers.
     * @param {number} width - Width of the sprite.
     * @param {number} height - Height of the sprite.
     * @param {number} numLayers - Number of layers in the stack.
     * @param {number} layerOffset - Vertical distance between layers.
     * @param {number} tiltAmount - Horizontal tilt from -1 to 1.
     */
    drawOutline(container, x, y, rotation, layers, width, height, numLayers, layerOffset, tiltAmount = 0) {
        if (!this.enabled || !layers || layers.length < 1) return;

        // Render each layer to a render texture
        const totalHeight = height + (numLayers - 1) * layerOffset;
        const padding = Math.max(width, totalHeight) + 20;
        const tempWidth = width + padding * 2;
        const tempHeight = totalHeight + padding * 2;

        const renderTexture = PIXI.RenderTexture.create({ width: tempWidth, height: tempHeight });
        const tempContainer = new PIXI.Container();

        const centerX = tempWidth / 2;
        const centerY = tempHeight / 2;

        for (let i = 0; i < layers.length; i++) {
            const sprite = layers[i];
            if (!sprite) continue;

            const layerFactor = i / Math.max(1, layers.length - 1);
            const tiltOffset = tiltAmount * layerFactor * 4;

            const copy = new PIXI.Sprite(sprite.texture);
            copy.anchor.set(0.5);
            copy.x = centerX + tiltOffset;
            copy.y = centerY - i * layerOffset;
            copy.rotation = PIXI.DEG_TO_RAD * -rotation;

            tempContainer.addChild(copy);
        }

        const renderer = PIXI.autoDetectRenderer();
        renderer.render(tempContainer, { renderTexture });

        // Use filters or pixel data to extract contour (requires custom shader or hitmap technique)
        // Here, we fake it by drawing a thick polygonal outline around the layers

        const outline = new PIXI.Graphics();
        outline.lineStyle(this.thickness, this.color, 1);

        // Fallback: bounding box polygon since real contour requires complex extraction
        const left = x - width / 2 - this.thickness;
        const right = x + width / 2 + this.thickness;
        const top = y - totalHeight / 2 - this.thickness;
        const bottom = y + totalHeight / 2 + this.thickness;

        outline.drawRect(left, top + this.outlineOffset, right - left, bottom - top);

        container.addChild(outline);
    }

    /**
     * Configure the outline properties.
     * @param {boolean} [enabled] - Enable or disable the outline.
     * @param {number} [color] - Color in hex (e.g., 0xff0000).
     * @param {number} [thickness] - Outline thickness in pixels.
     * @returns {OutlineManager} this
     */
    configure(enabled = undefined, color = undefined, thickness = undefined) {
        if (enabled !== undefined) this.enabled = enabled;
        if (color !== undefined) this.color = color;
        if (thickness !== undefined) this.thickness = thickness;
        return this;
    }
}
