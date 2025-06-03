import Entity from '../core/Entity';
import PlayerController from '../controllers/PlayerController';

/**
 * Player class representing the submarine controlled by the player
 */
class Player extends Entity {
  /**
   * Create a new player submarine
   * 
   * @param {Phaser.Scene} scene - The scene this player belongs to
   * @param {number} x - Starting X position
   * @param {number} y - Starting Y position
   * @param {string} textureKey - Key for the player texture
   * @param {number} numLayers - Number of layers for sprite stacking
   * @param {number} layerOffset - Vertical offset between layers
   * @param {number} width - Width of the player sprite
   * @param {number} height - Height of the player sprite
   */
  constructor(scene, x = 0, y = 0, textureKey = 'submarine', 
              numLayers = 24, layerOffset = 0.5, width = 32, height = 16) {
    // Call parent Entity constructor
    super(
      scene,
      x, y,
      textureKey,
      numLayers,
      layerOffset,
      width, height,
      'submarine',  // entityType
      true,  // outlineEnabled
      0x000000, // outlineColor
      2, // outlineThickness
      11, // outlineOffset
      270, // initial rotation (facing up)
      true // shadowEnabled
    );
    
    // Set player-specific properties
    this.health = 100;
    this.maxHealth = 100;
    this.score = 0;
    
    // Create and assign controller
    this.controller = new PlayerController();
    this.setController(this.controller);
    
    // Set up physics body
    if (this.body) {
      this.body.setCollideWorldBounds(false);
      this.body.setSize(width * 0.8, height * 0.8); // Slightly smaller hitbox than visual
    }
    
    // Create player animations if needed
    this.createAnimations();
  }
  
  /**
   * Set up player animations
   */
  createAnimations() {
    // Set up animations if the texture has frames
    if (this.scene.textures.exists('submarine_anim')) {
      this.scene.anims.create({
        key: 'submarine_idle',
        frames: this.scene.anims.generateFrameNumbers('submarine_anim', { start: 0, end: 3 }),
        frameRate: 5,
        repeat: -1
      });
      
      this.scene.anims.create({
        key: 'submarine_boost',
        frames: this.scene.anims.generateFrameNumbers('submarine_anim', { start: 4, end: 7 }),
        frameRate: 10,
        repeat: -1
      });
    }
  }
  
  /**
   * Handle damage to the player
   * 
   * @param {number} amount - Amount of damage to take
   * @return {number} - Current health after damage
   */
  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    
    // Play damage effect
    if (this.scene) {
      this.scene.cameras.main.shake(100, 0.01);
      
      // Flash red
      this.setTint(0xff0000);
      this.scene.time.delayedCall(100, () => {
        this.clearTint();
      });
    }
    
    // Check for death
    if (this.health <= 0) {
      this.die();
    }
    
    return this.health;
  }
  
  /**
   * Handle player death
   */
  die() {
    // Store score in registry for game over scene
    if (this.scene && this.scene.registry) {
      this.scene.registry.set('score', this.scene.score || 0);
    }
    
    // Play death animation/effects
    if (this.scene) {
      this.scene.cameras.main.shake(500, 0.02);
      this.scene.cameras.main.fade(1000, 0, 0, 0);
      
      // Switch to game over scene after death
      this.scene.time.delayedCall(1000, () => {
        this.scene.scene.start('GameOverScene');
      });
    }
  }
  
  /**
   * Update the player
   * 
   * @param {number} time - Current time
   * @param {number} delta - Time since last update
   * @param {object} inputState - Current input state
   */
  update(time, delta, inputState) {
    // Call parent Entity update
    super.update(time, delta, inputState);
    
    // Update animations based on state
    if (this.controller && this.anims) {
      if (this.controller.boostActive) {
        this.play('submarine_boost', true);
      } else {
        this.play('submarine_idle', true);
      }
    }
  }
}

export default Player;
