/**
 * Utility class for rendering text in Phaser
 * Translated from pygame Text class
 */

class Text {
  /**
   * Initialize text object
   * 
   * @param {Phaser.Scene} scene - The Phaser scene to add the text to
   * @param {string|null} fontKey - Key for the bitmap font or null for system font
   * @param {number} size - Font size
   * @param {string} message - Text to display
   * @param {object} color - Color for the text, can be a string like '#FFFFFF' or a number like 0xFFFFFF
   * @param {number} xpos - X position of text
   * @param {number} ypos - Y position of text
   * @param {boolean} fixed - Whether the text should be fixed to camera (default: false)
   */
  constructor(scene, fontKey, size, message, color, xpos, ypos, fixed = false) {
    this.scene = scene;
    
    // Convert color to string format if it's a number
    const colorStr = typeof color === 'number' ? 
      `#${color.toString(16).padStart(6, '0')}` : color;
    
    // Options for text rendering
    const textOptions = {
      fontFamily: fontKey || 'Arial',
      fontSize: `${size}px`,
      color: colorStr,
      align: 'left'
    };
    
    // Add optional stroke for better visibility
    if (!fontKey) {
      textOptions.stroke = '#000000';
      textOptions.strokeThickness = 2;
    }
    
    // Create the text object
    if (fontKey && scene.textures.exists(fontKey)) {
      // Use bitmap font if specified and exists
      this.textObject = scene.add.bitmapText(xpos, ypos, fontKey, message);
      this.textObject.setFontSize(size);
      this.textObject.setTint(color);
    } else {
      // Use standard text with given options
      this.textObject = scene.add.text(xpos, ypos, message, textOptions);
    }
    
    // Set fixed to camera if requested
    if (fixed) {
      this.textObject.setScrollFactor(0);
    }
  }
  
  /**
   * Draw the text - this does nothing in Phaser as the text is automatically
   * added to the scene, but included for API compatibility
   */
  draw() {
    // No need to draw explicitly in Phaser
    // Text is automatically rendered as part of the scene
  }
  
  /**
   * Update the text content
   * 
   * @param {string} message - New text to display
   */
  setText(message) {
    this.textObject.setText(message);
  }
  
  /**
   * Set text position
   * 
   * @param {number} x - New X position
   * @param {number} y - New Y position
   */
  setPosition(x, y) {
    this.textObject.setPosition(x, y);
  }
  
  /**
   * Set text origin/anchor point (0,0 is top-left, 0.5,0.5 is center)
   * 
   * @param {number} x - Origin X (0-1)
   * @param {number} y - Origin Y (0-1)
   */
  setOrigin(x, y) {
    this.textObject.setOrigin(x, y);
  }
  
  /**
   * Set text color
   * 
   * @param {string|number} color - New color
   */
  setColor(color) {
    // Convert color to string format if it's a number
    const colorStr = typeof color === 'number' ? 
      `#${color.toString(16).padStart(6, '0')}` : color;
      
    if (this.textObject.setTint) {
      // For bitmap text
      this.textObject.setTint(color);
    } else {
      // For standard text
      this.textObject.setColor(colorStr);
    }
  }
  
  /**
   * Set text visibility
   * 
   * @param {boolean} visible - Whether text should be visible
   */
  setVisible(visible) {
    this.textObject.setVisible(visible);
  }
  
  /**
   * Set text alpha/transparency
   * 
   * @param {number} alpha - Alpha value (0-1)
   */
  setAlpha(alpha) {
    this.textObject.setAlpha(alpha);
  }
  
  /**
   * Destroy the text object
   */
  destroy() {
    if (this.textObject) {
      this.textObject.destroy();
    }
  }
}

export default Text;
