import Entity from './Entity';

/**
 * A projectile fired by the submarine.
 * Translated from pygame Cannonball class.
 */
class Cannonball extends Entity {
  /**
   * Initialize a cannonball
   * 
   * @param {Phaser.Scene} scene - The scene this cannonball belongs to
   * @param {number} x - Starting X position
   * @param {number} y - Starting Y position
   * @param {string} textureKey - Key for the cannonball texture
   * @param {number} direction - Direction in degrees
   * @param {number} speed - Movement speed
   */
  constructor(scene, x = 0, y = 0, textureKey = 'cannonball', direction = 0, speed = 4.0) {
    // Call parent Entity constructor
    super(
      scene,
      x,
      y,
      textureKey,
      2,       // numLayers - Cannonballs are smaller than submarines
      0.5,     // layerOffset
      3,       // width - Small projectile
      3,       // height
      'cannonball',  // entityType
      false,   // outlineEnabled
      0x000000, // outlineColor
      1,       // outlineThickness
      1,       // outlineOffset
      direction, // rotation - Use Entity's rotation instead of separate direction
      false    // shadowEnabled - Cannonballs don't need shadows
    );
    
    // Override Entity's speed property
    this.speed = speed;
    this.lifetime = 100;  // 0.5 seconds at 60 FPS - short range projectiles
    this.damage = 10;     // Base damage
    
    // Add to scene's physics system
    if (scene.physics && this.body) {
      // Set velocity based on direction and speed
      const angleRad = Phaser.Math.DegToRad(this.rotation);
      this.body.setVelocity(
        Math.cos(angleRad) * this.speed * 60,
        Math.sin(angleRad) * this.speed * 60
      );
    }
    
    // Add to scene's update list if not using physics
    scene.events.on('update', this.update, this);
  }
  
  /**
   * Update cannonball position and lifetime
   * 
   * @param {number} time - Current time
   * @param {number} delta - Time since last update
   * @returns {boolean} - True if cannonball should continue existing
   */
  update(time, delta) {
    // Skip parent update to use custom movement
    
    if (!this.active) return false;
    
    if (!this.body) {
      // If not using physics, update position manually
      const angleRad = Phaser.Math.DegToRad(this.rotation);
      const deltaFactor = delta / 16.67; // Normalize for 60fps
      
      this.x += Math.cos(angleRad) * this.speed * deltaFactor;
      this.y += Math.sin(angleRad) * this.speed * deltaFactor;
      
      // Update sprite position
      this.setPosition(this.x, this.y);
    }
    
    // Update lifetime
    this.lifetime -= (delta / 16.67); // Adjust for frame rate
    
    // Check if lifetime expired
    if (this.lifetime <= 0) {
      this.destroy();
      return false;
    }
    
    return true;
  }
  
  /**
   * Handle collision with another entity
   * 
   * @param {Entity} target - The entity this cannonball hit
   */
  hit(target) {
    // Apply damage to the target if it has a takeDamage method
    if (target && typeof target.takeDamage === 'function') {
      target.takeDamage(this.damage);
    }
    
    // Destroy the cannonball
    this.destroy();
  }
  
  /**
   * Clean up resources when destroying the cannonball
   */
  destroy() {
    // Remove update listener
    if (this.scene) {
      this.scene.events.off('update', this.update, this);
    }
    
    // Call parent destroy method
    super.destroy();
  }
  
  /**
   * Create a cannonball at the specified position
   * 
   * @param {Phaser.Scene} scene - The scene to add the cannonball to
   * @param {number} x - Starting X position
   * @param {number} y - Starting Y position
   * @param {number} direction - Direction in degrees
   * @param {number} speed - Movement speed
   * @returns {Cannonball} - The created cannonball
   */
  static fire(scene, x, y, direction, speed = 4.0) {
    return new Cannonball(scene, x, y, 'cannonball', direction, speed);
  }
}

export default Cannonball;
