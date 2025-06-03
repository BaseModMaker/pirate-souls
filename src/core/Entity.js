import GameObject from './GameObject';

/**
 * An entity is a game object that can move and has physics properties.
 * Translated from pygame Entity class.
 */
class Entity extends GameObject {
  /**
   * Initialize an entity
   * 
   * @param {Phaser.Scene} scene - The scene this entity belongs to
   * @param {number} x - X position of the entity
   * @param {number} y - Y position of the entity
   * @param {string} textureKey - Key for the sprite texture
   * @param {number} numLayers - Number of layers for sprite stacking
   * @param {number} layerOffset - Vertical offset between layers
   * @param {number} width - Width of the entity if no image provided
   * @param {number} height - Height of the entity if no image provided
   * @param {string} entityType - Type of entity for specialized sprite generation
   * @param {boolean} outlineEnabled - Whether to draw outline around the entity
   * @param {number} outlineColor - RGB color for outline (0xRRGGBB format)
   * @param {number} outlineThickness - Thickness of outline in pixels
   * @param {number} outlineOffset - Offset for outline
   * @param {number} rotation - Initial rotation angle in degrees
   * @param {boolean} shadowEnabled - Whether to draw shadows for this entity
   */
  constructor(scene, x = 0, y = 0, textureKey = null, numLayers = 8, 
              layerOffset = 0.5, width = 32, height = 16, 
              entityType = "generic", outlineEnabled = false, outlineColor = 0x000000, 
              outlineThickness = 1, outlineOffset = 1, rotation = 0, shadowEnabled = true) {
    
    // Call parent constructor
    super(scene, x, y, textureKey, numLayers, layerOffset, width, height, 
          outlineEnabled, outlineColor, outlineThickness, outlineOffset, shadowEnabled);
    
    // Movement properties
    this.speed = 0;
    this.maxSpeed = 5;      // Increased for larger map
    this.acceleration = 0.2; // Increased for larger map
    this.deceleration = 0.1;
    this.friction = 0.98;    // Slightly increased from 0.95 for smoother movement
    
    // Set initial rotation
    this.rotation = rotation;
    this.baseAngle = rotation; // Base angle without tilt effect
    this.rotationSpeed = 2;    // Reduced for slower turning
    this.direction = 0;
    
    // Physics body setup if using Phaser physics
    if (scene.physics && this.body) {
      this.body.setDamping(true);
      this.body.setDrag(this.friction);
    }
    
    // Handle specialized entity types
    if (entityType === "submarine" && !textureKey) {
      // Create custom submarine sprite layers if needed
      // This would be implemented in a similar way to the car layers in pygame
    }
  }
  
  /**
   * Set a controller for this entity
   * 
   * @param {object} controller - Controller to handle entity behavior
   */
  setController(controller) {
    super.setController(controller);
    
    // Additional entity-specific controller setup
    if (controller) {
      controller.entity = this;
    }
  }
  
  /**
   * Apply physics calculations to the entity
   * 
   * @param {number} delta - Time since last update (ms)
   */
  applyPhysics(delta) {
    // Normalize delta for consistent movement regardless of frame rate
    const deltaFactor = delta / 16.67; // Normalized against 60fps
    
    // Apply friction to gradually slow down
    this.speed *= this.friction;
    
    // Calculate movement based on current rotation and controller offset
    let effectiveRotation = this.rotation;
    if (this.controller && this.controller.directionOffset !== undefined) {
      effectiveRotation = (this.rotation + this.controller.directionOffset) % 360;
    }
    
    // Convert to radians and calculate movement
    const angleRad = Phaser.Math.DegToRad(effectiveRotation);
    const moveX = -Math.sin(angleRad) * this.speed * deltaFactor;
    const moveY = Math.cos(angleRad) * this.speed * deltaFactor;
    
    // Update position
    this.x += moveX;
    this.y += moveY;
    
    // Update physics body if using Phaser physics
    if (this.body) {
      this.body.x = this.x - this.width / 2;
      this.body.y = this.y - this.height / 2;
    }
  }
  
  /**
   * Update the entity state
   * 
   * @param {number} time - Current time
   * @param {number} delta - Time elapsed since the last update
   * @param {object} inputState - Optional input state to pass to controller
   */
  update(time, delta, inputState) {
    // Call parent update method
    super.update(time, delta);
    
    // Let the controller update first if it exists
    if (this.controller && typeof this.controller.update === 'function') {
      this.controller.update(inputState, delta);
    }
    
    // Then apply physics
    this.applyPhysics(delta);
  }
  
  /**
   * Draw the entity
   * 
   * @param {boolean} drawShadow - Whether to draw shadow
   * @param {number} performanceMode - Quality level (0=Low, 1=Medium, 2=High)
   */
  draw(drawShadow = true, performanceMode = 0) {
    // Override the parent draw method to include rotation and tilting
    const tiltAmount = this.controller && this.controller.tiltAmount !== undefined ? 
                        this.controller.tiltAmount : 0;
    
    this.spriteStack.draw(
      this.x,
      this.y,
      this.rotation,
      drawShadow && this.shadowEnabled,
      performanceMode,
      tiltAmount
    );
  }
  
  /**
   * Keep the entity within specified bounds
   * This method is a no-op to allow for infinite world movement
   * Kept for compatibility with existing code
   * 
   * @param {number} width - The maximum x coordinate (ignored)
   * @param {number} height - The maximum y coordinate (ignored)
   */
  keepInBounds(width, height) {
    // No longer constrain entity position to allow infinite world
  }
  
  /**
   * Set the entity's speed directly
   * 
   * @param {number} speed - New speed value
   */
  setSpeed(speed) {
    this.speed = Phaser.Math.Clamp(speed, -this.maxSpeed, this.maxSpeed);
  }
  
  /**
   * Apply acceleration to the entity's speed
   * 
   * @param {number} amount - Amount to accelerate (positive or negative)
   */
  accelerate(amount) {
    this.speed += amount;
    this.speed = Phaser.Math.Clamp(this.speed, -this.maxSpeed, this.maxSpeed);
  }
  
  /**
   * Change the entity's rotation
   * 
   * @param {number} amount - Amount to change rotation in degrees
   */
  rotate(amount) {
    this.rotation = (this.rotation + amount) % 360;
    if (this.rotation < 0) this.rotation += 360;
    
    // Update the Phaser object's rotation in radians
    super.setRotation(this.rotation);
  }
}

export default Entity;
