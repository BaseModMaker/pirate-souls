/**
 * Manages outlines for sprite stack objects
 * Translated from pygame OutlineManager class
 */
class OutlineManager {
  /**
   * Initialize the outline manager
   * 
   * @param {Phaser.Scene} scene - The Phaser scene this outline belongs to
   * @param {boolean} enabled - Whether outlines are enabled
   * @param {number} color - Color for the outline
   * @param {number} thickness - Thickness of the outline in pixels
   * @param {number} outlineOffset - Offset for the outline
   */
  constructor(scene, enabled = false, color = 0x000000, thickness = 1, outlineOffset = 1) {
    this.scene = scene;
    this.enabled = enabled;
    this.color = color;
    this.thickness = thickness;
    this.outlineOffset = outlineOffset;
    
    // Graphics object for drawing outlines
    this.graphics = null;
    
    // Create graphics object if needed
    if (this.enabled) {
      this.graphics = this.scene.add.graphics();
    }
  }
  
  /**
   * Draw an outline around a sprite stack
   * 
   * @param {number} x - X position of the sprite stack center
   * @param {number} y - Y position of the sprite stack center
   * @param {number} rotation - Rotation angle in degrees
   * @param {Array} layerSprites - Array of layer sprites
   * @param {number} width - Width of the sprite stack
   * @param {number} height - Height of the sprite stack
   * @param {number} numLayers - Number of layers
   * @param {number} layerOffset - Offset between layers
   * @param {number} tiltAmount - Amount to tilt the layers
   */
  drawOutline(x, y, rotation, layerSprites, width, height, numLayers, layerOffset, tiltAmount = 0) {
    if (!this.enabled || !this.graphics) return;
    
    // Clear previous outline
    this.graphics.clear();
    
    // Set line style for the outline
    this.graphics.lineStyle(this.thickness, this.color, 1.0);
    
    // Calculate outline dimensions
    const outlineWidth = width + (this.outlineOffset * 2);
    const outlineHeight = height + (this.outlineOffset * 2);
    const totalStackHeight = numLayers * layerOffset;
    
    // Add outline around the full sprite stack
    this.graphics.setPosition(x, y);
    this.graphics.setRotation(rotation * Math.PI / 180);
    
    // Draw outline for full stack
    this.graphics.strokeRect(
      -outlineWidth / 2, 
      -outlineHeight / 2 - totalStackHeight, 
      outlineWidth, 
      outlineHeight + totalStackHeight
    );
    
    // Draw outline for individual layers (for more detailed outline)
    if (layerSprites.length > 1 && this.outlineOffset > 1) {
      // Find top and bottom layers and their positions
      const topLayer = layerSprites[layerSprites.length - 1];
      const bottomLayer = layerSprites[0];
      
      // Calculate positions for top outline based on stack parameters
      const topOffsetY = -(numLayers - 1) * layerOffset;
      
      // Draw outline for top face
      this.graphics.strokeRect(
        -width / 2 - this.outlineOffset,
        topOffsetY - height / 2 - this.outlineOffset,
        width + (this.outlineOffset * 2),
        height + (this.outlineOffset * 2)
      );
      
      // Draw connecting lines between top and bottom
      const sidePoints = [
        { x: -width / 2 - this.outlineOffset, y: -height / 2 - this.outlineOffset },
        { x: width / 2 + this.outlineOffset, y: -height / 2 - this.outlineOffset },
        { x: width / 2 + this.outlineOffset, y: height / 2 + this.outlineOffset },
        { x: -width / 2 - this.outlineOffset, y: height / 2 + this.outlineOffset }
      ];
      
      for (const point of sidePoints) {
        this.graphics.lineBetween(
          point.x, 
          topOffsetY + point.y,
          point.x,
          point.y
        );
      }
    }
  }
  
  /**
   * Set whether outlines are enabled
   * 
   * @param {boolean} enabled - Whether outlines should be enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    
    // Create or destroy graphics object as needed
    if (this.enabled && !this.graphics) {
      this.graphics = this.scene.add.graphics();
    } else if (!this.enabled && this.graphics) {
      this.graphics.destroy();
      this.graphics = null;
    }
  }
  
  /**
   * Set outline color
   * 
   * @param {number} color - New outline color
   */
  setColor(color) {
    this.color = color;
  }
  
  /**
   * Set outline thickness
   * 
   * @param {number} thickness - New outline thickness
   */
  setThickness(thickness) {
    this.thickness = thickness;
  }
  
  /**
   * Destroy the outline manager and clean up resources
   */
  destroy() {
    if (this.graphics) {
      this.graphics.destroy();
      this.graphics = null;
    }
  }
}

export default OutlineManager;
