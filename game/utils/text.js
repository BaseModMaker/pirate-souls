import * as PIXI from 'pixi.js';

export class Text {
    /**
     * Utility class for rendering text in PixiJS.
     * 
     * @param {string|null} textFont - Font family name or null for default font
     * @param {number} size - Font size in pixels
     * @param {string} message - Text to display
     * @param {number[]} color - RGB array, e.g. [255, 255, 255]
     * @param {number} xpos - X position
     * @param {number} ypos - Y position
     */
    constructor(textFont, size, message, color, xpos, ypos) {
        // If textFont is null, use default font family "Arial"
        const fontFamily = textFont || "Arial";

        // Convert RGB array to hex color string PixiJS accepts
        const colorHex = (color[0] << 16) + (color[1] << 8) + color[2];

        this.text = new PIXI.Text(message, {
            fontFamily: fontFamily,
            fontSize: size,
            fill: colorHex,
        });

        this.text.x = xpos;
        this.text.y = ypos;
    }

    /**
     * Add the text to a PixiJS container for rendering.
     * @param {PIXI.Container} container - Container to add the text to
     */
    draw(container) {
        if (!container.children.includes(this.text)) {
            container.addChild(this.text);
        }
    }
}
