import * as PIXI from 'pixi.js';

export class Sun {
    /**
     * Class to manage sun position, appearance, and related calculations.
     * 
     * @param {number} horizontalAngle - 0-360 degrees, compass direction of the sun.
     *                                   0 = North, 90 = East, 180 = South, 270 = West
     * @param {number} verticalAngle - 0-90 degrees, height of the sun in the sky.
     *                                 0 = sun at horizon, 90 = overhead.
     */
    constructor(horizontalAngle = 45, verticalAngle = 45) {
        this.horizontalAngle = horizontalAngle;
        this.verticalAngle = verticalAngle;
        this.debugEnabled = false;
    }

    /**
     * Adjust the horizontal angle of the sun (compass direction).
     * @param {number} delta - Amount to change the angle by (positive = clockwise)
     * @returns {number} Updated horizontal angle.
     */
    adjustHorizontalAngle(delta) {
        this.horizontalAngle = (this.horizontalAngle + delta) % 360;
        return this.horizontalAngle;
    }

    /**
     * Adjust the vertical angle of the sun (height in sky).
     * @param {number} delta - Amount to change the angle by (positive = higher in sky)
     * @returns {number} Updated vertical angle.
     */
    adjustVerticalAngle(delta) {
        this.verticalAngle = Math.min(90, Math.max(0, this.verticalAngle + delta));
        return this.verticalAngle;
    }

    /**
     * Toggle debug mode (disabled).
     * @returns {boolean} Always false.
     */
    toggleDebug() {
        return false;
    }

    /**
     * Draw a visual representation of the sun on the PixiJS container.
     * @param {PIXI.Container} container - The PixiJS container to draw on.
     * @param {number} screenWidth - Width of the screen.
     * @param {number} screenHeight - Height of the screen.
     */
    draw(container, screenWidth, screenHeight) {
        // Clear previous graphics if any
        if (this._graphics) {
            container.removeChild(this._graphics);
            this._graphics.destroy();
        }

        const graphics = new PIXI.Graphics();

        // Calculate sun position on a circular path
        const margin = 150;
        const sunSize = 30;

        // Offset horizontal angle by 270 deg to match shadow direction
        const displayAngle = (this.horizontalAngle + 270) % 360;
        const radAngle = (displayAngle * Math.PI) / 180;

        const x = screenWidth / 2 + margin * Math.cos(radAngle);
        const y = screenHeight / 2 - margin * Math.sin(radAngle);

        // Compute color based on vertical angle (0-90)
        const verticalFactor = this.verticalAngle / 90;

        let red, green, blue;
        if (verticalFactor < 0.5) {
            red = 255;
            green = Math.max(0, Math.floor(255 * verticalFactor * 2));
            blue = 0;
        } else {
            red = 255;
            green = 255;
            blue = Math.max(0, Math.floor(255 * (verticalFactor - 0.5) * 2));
        }

        const sunColor = (red << 16) + (green << 8) + blue;

        // Draw sun circle
        graphics.beginFill(sunColor);
        graphics.drawCircle(x, y, sunSize);
        graphics.endFill();

        // Draw rays (8 rays every 45 degrees)
        graphics.lineStyle(3, sunColor);
        const rayLength = 15;
        for (let angle = 0; angle < 360; angle += 45) {
            const rad = (angle * Math.PI) / 180;
            const endX = x + rayLength * Math.cos(rad);
            const endY = y + rayLength * Math.sin(rad);
            graphics.moveTo(x, y);
            graphics.lineTo(endX, endY);
        }

        // Draw a line from sun to center of screen showing light direction
        // Using semi-transparent yellow line
        graphics.lineStyle(2, 0xFFFF00, 0.5);
        graphics.moveTo(x, y);
        graphics.lineTo(screenWidth / 2, screenHeight / 2);

        container.addChild(graphics);
        this._graphics = graphics;
    }

    /**
     * Debug info drawing disabled (does nothing).
     */
    drawDebugInfo() {
        // No debug info shown
    }
}
