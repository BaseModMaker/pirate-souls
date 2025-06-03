import Phaser from 'phaser';
import SpriteStack from './SpriteStack';

/**
 * Base class for all game objects.
 * Translated from pygame GameObject class.
 */
class GameObject extends Phaser.GameObjects.Container {
  static Scale = 2.0; // Default scale for all game objects

  /**
   * Initialize a game object
   * 
   * @param {Phaser.Scene} scene - The scene this object belongs to
   * @param {number} x - X position of the object
   * @param {number} y - Y position of the object
   * @param {string} textureKey - Key for the sprite texture
   * @param {number} numLayers - Number of layers for sprite stacking
   * @param {number} layerOffset - Vertical offset between layers
   * @param {number} width - Width of the object if no image provided
   * @param {number} height - Height of the object if no image provided
   * @param {boolean} outlineEnabled - Whether to draw outline around the object
   * @param {number} outlineColor - RGB color for outline (0xRRGGBB format)
   * @param {number} outlineThickness - Thickness of outline in pixels
   * @param {number} outlineOffset - Offset for outline
   * @param {boolean} shadowEnabled - Whether to draw shadows for this object
   */
  constructor(scene, x = 0, y = 0, textureKey = null, numLayers = 8, 
              layerOffset = 0.5, width = 32, height = 32,
              outlineEnabled = false, outlineColor = 0x000000, 
              outlineThickness = 1, outlineOffset = 1, shadowEnabled = true) {
    // Call parent constructor (Phaser.GameObjects.Container)
    super(scene, x, y);
    
    // Add to the scene's display list
    scene.add.existing(this);
    
    // Add to the scene's physics system if it exists
    if (scene.physics && scene.physics.add) {
      scene.physics.add.existing(this);
      
      // Set up the physics body
      this.body.setSize(width * GameObject.Scale, height * GameObject.Scale);
      this.body.setOffset(-width * GameObject.Scale / 2, -height * GameObject.Scale / 2);
    }
    
    // Create sprite stack for rendering
    this.spriteStack = new SpriteStack(
      scene,
      textureKey, 
      numLayers, 
      layerOffset * GameObject.Scale,
      width,
      height,
      outlineEnabled,
      outlineColor,
      outlineThickness,
      outlineOffset
    );
    
    // Set shadow state
    this.shadowEnabled = shadowEnabled;
    
    // Set basic properties
    this.width = width * GameObject.Scale;
    this.height = height * GameObject.Scale;
    
    // Rotation in degrees (to match pygame)
    this.rotation = 0;
    this.tiltAmount = 0;
    
    // Store rotation in radians for Phaser internal use
    this.rotationRadians = 0;
    
    // Add sprite stack container to this container
    this.add(this.spriteStack.container);
    
    // Set controller property
    this.controller = null;
  }
  
  /**
   * Update the game object state
   * This method should be overridden by subclasses
   * 
   * @param {number} time - Current time
   * @param {number} delta - Time since last update
   */
  update(time, delta) {
    // Update physics body position if it exists
    if (this.body) {
      this.body.position.x = this.x - this.width / 2;
      this.body.position.y = this.y - this.height / 2;
    }
    
    // Update controller if it exists
    if (this.controller && typeof this.controller.update === 'function') {
      this.controller.update(time, delta);
      
      // Update tilt amount if controller provides it
      if (this.controller.tiltAmount !== undefined) {
        this.tiltAmount = this.controller.tiltAmount;
      }
    }
  }
  
  /**
   * Draw the game object
   * 
   * @param {boolean} drawShadow - Whether to draw shadow
   * @param {number} performanceMode - Quality level (0=Low, 1=Medium, 2=High)
   */
  draw(drawShadow = true, performanceMode = 0) {
    this.spriteStack.draw(
      this.x, 
      this.y,
      this.rotation,
      drawShadow && this.shadowEnabled,
      performanceMode,
      this.tiltAmount
    );
  }
  
  /**
   * Draw at a specific screen position (used with camera)
   * 
   * @param {number} screenX - X position on screen
   * @param {number} screenY - Y position on screen
   * @param {boolean} drawShadow - Whether to draw shadow
   * @param {number} performanceMode - Quality level (0=Low, 1=Medium, 2=High)
   * @param {number} rotation - Override rotation angle (or null to use object's rotation)
   */
  drawAtPosition(screenX, screenY, drawShadow = true, performanceMode = 0, rotation = null) {
    // Calculate actual rotation to use
    const actualRotation = rotation !== null ? rotation : this.rotation;
    
    // Draw using sprite stack
    this.spriteStack.draw(
      screenX,
      screenY,
      actualRotation,
      drawShadow && this.shadowEnabled,
      performanceMode,
      this.tiltAmount
    );
  }
  
  /**
   * Set the object's rotation in degrees
   * 
   * @param {number} degrees - Rotation angle in degrees
   */
  setRotation(degrees) {
    this.rotation = degrees;
    // Convert to radians for Phaser internal use
    this.rotationRadians = Phaser.Math.DegToRad(degrees);
    super.setRotation(this.rotationRadians);
  }
  
  /**
   * Set the game object's controller
   * 
   * @param {object} controller - Controller to handle object behavior
   */
  setController(controller) {
    this.controller = controller;
    if (controller) {
      controller.gameObject = this;
    }
  }
  
  /**
   * Configure the outline properties
   * 
   * @param {boolean} enabled - Whether outline is enabled
   * @param {number} color - Outline color (0xRRGGBB format)
   * @param {number} thickness - Outline thickness in pixels
   * @returns {GameObject} - Returns self for method chaining
   */
  configureOutline(enabled = true, color = 0xFF0000, thickness = 2) {
    if (this.spriteStack && this.spriteStack.outlineManager) {
      this.spriteStack.outlineManager.setEnabled(enabled);
      this.spriteStack.outlineManager.setColor(color);
      this.spriteStack.outlineManager.setThickness(thickness);
    }
    return this;
  }
  
  /**
   * Configure shadow by setting sun position parameters
   * 
   * @param {number} horizontalAngle - Horizontal angle of sun (0-360 degrees)
   * @param {number} verticalAngle - Vertical angle of sun (0-90 degrees)
   * @param {boolean} shadowEnabled - Whether shadows are enabled
   * @returns {GameObject} - Returns self for method chaining
   */
  configureShadow(horizontalAngle = 45, verticalAngle = 45, shadowEnabled = true) {
    this.shadowEnabled = shadowEnabled;
    if (this.spriteStack) {
      this.spriteStack.configureSun(horizontalAngle, verticalAngle, shadowEnabled);
    }
    return this;
  }
  
  /**
   * Destroy the game object and clean up resources
   */
  destroy() {
    if (this.spriteStack) {
      this.spriteStack.destroy();
    }
    super.destroy();
  }
}

export default GameObject;
