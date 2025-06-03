/**
 * Bubble particle system for underwater effects.
 * Translated from pygame Bubble class.
 */

class Bubble {
  /**
   * Initialize a bubble
   * 
   * @param {number} x - Starting X position
   * @param {number} y - Starting Y position
   * @param {number} size - Radius of the bubble
   * @param {number} lifetime - How many frames the bubble lives
   * @param {number} speed - Movement speed
   * @param {number} angle - Direction of movement in degrees
   */
  constructor(x, y, size, lifetime, speed, angle) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.lifetime = lifetime;
    this.maxLifetime = lifetime;
    this.speed = speed;
    this.angle = angle;
    this.alpha = 255; // Bubble transparency
  }

  /**
   * Update bubble position and lifetime
   * 
   * @param {number} delta - Time elapsed since last update (ms)
   * @returns {boolean} - Whether the bubble is still alive
   */
  update(delta = 16.67) {
    // Apply deltaTime factor for frame rate independence
    const deltaFactor = delta / 16.67; // Normalize for 60fps
    
    // Convert angle to radians for movement calculation
    const angleRad = Phaser.Math.DegToRad(this.angle);
    
    // Move bubble
    this.x += Math.cos(angleRad) * this.speed * deltaFactor;
    this.y += Math.sin(angleRad) * this.speed * deltaFactor;
    
    // Decrease lifetime
    this.lifetime -= deltaFactor;
    
    // Update alpha based on remaining lifetime
    this.alpha = Math.floor((this.lifetime / this.maxLifetime) * 200 + 55); // Keep minimum visibility
    
    // Normalize alpha for Phaser (0-1 instead of 0-255)
    this.alphaValue = this.alpha / 255;
    
    return this.lifetime > 0;
  }
  
  /**
   * Create a Phaser graphics object for this bubble
   * 
   * @param {Phaser.Scene} scene - The scene to create the graphics in
   * @returns {Phaser.GameObjects.Graphics} - The graphics object for the bubble
   */
  createGraphics(scene) {
    const graphics = scene.add.graphics();
    this.render(graphics);
    return graphics;
  }
  
  /**
   * Render the bubble to a graphics object
   * 
   * @param {Phaser.GameObjects.Graphics} graphics - The graphics object to draw to
   */
  render(graphics) {
    graphics.clear();
    graphics.fillStyle(0xffffff, this.alphaValue);
    graphics.fillCircle(this.x, this.y, this.size);
  }
  
  /**
   * Factory method to create a bubble with random properties
   * 
   * @param {Phaser.Scene} scene - The scene to create the bubble in
   * @param {number} x - Starting X position
   * @param {number} y - Starting Y position
   * @param {object} options - Optional settings to override defaults
   * @returns {Bubble} - The created bubble
   */
  static createRandom(scene, x, y, options = {}) {
    // Default options
    const defaults = {
      minSize: 1,
      maxSize: 5,
      minLifetime: 60,
      maxLifetime: 180,
      minSpeed: 0.5,
      maxSpeed: 2,
      angleRange: 30 // Degrees range around vertical
    };
    
    // Merge with provided options
    const settings = { ...defaults, ...options };
    
    // Generate random properties
    const size = Phaser.Math.Between(settings.minSize, settings.maxSize);
    const lifetime = Phaser.Math.Between(settings.minLifetime, settings.maxLifetime);
    const speed = Phaser.Math.FloatBetween(settings.minSpeed, settings.maxSpeed);
    
    // Calculate angle - default is upward with variation
    const baseAngle = -90; // Upward
    const angleVariation = Phaser.Math.FloatBetween(-settings.angleRange/2, settings.angleRange/2);
    const angle = baseAngle + angleVariation;
    
    // Create and return the bubble
    return new Bubble(x, y, size, lifetime, speed, angle);
  }
}

export default Bubble;
