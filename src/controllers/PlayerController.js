import Bubble from '../core/Bubble';
import Cannonball from '../core/Cannonball';

/**
 * Controller for submarine player entities in Abyssal Gears.
 * Translated from pygame PlayerController class.
 */
class PlayerController {
  /**
   * Initialize a new submarine controller
   */
  constructor() {
    this.entity = null;
    this.directionOffset = 180;
    this.boostActive = false;
    this.camera = null; // Will be set by the game
    this.previousBoostActive = false; // Track previous frame's boost state
    this.boostCooldown = 0;
    this.maxBoostCooldown = 60; // Frames
    
    // Stamina properties
    this.maxStamina = 100;
    this.stamina = this.maxStamina;
    this.staminaRegenRate = 0.5;
    this.boostStaminaCost = 1.0;
    this.teleportStaminaCost = 30.0; // Cost for teleporting
    this.staminaLocked = false; // Added: prevents stamina use until fully regenerated
    
    // Teleport properties
    this.spacePressTime = 0; // How long space has been pressed
    this.teleportDistance = 100; // Units to teleport
    this.maxTeleportHold = 45; // Max frames to hold for teleport vs boost (about 0.75 seconds at 60fps)
    this.isTeleporting = false; // Track if we're in teleport state
    
    // Combat properties
    this.firingLeft = false;
    this.firingRight = false;
    this.fireCooldownLeft = 0;
    this.fireCooldownRight = 0;
    this.fireRate = 15; // Frames between shots
    this.cannonballSpeed = 8.0; // Speed of fired cannonballs
    this.cannonballs = []; // List of active cannonballs
    this.cannonOffset = 30; // Distance cannons are from center of sub
    
    // Tilt effect properties
    this.tiltAmount = 0; // Current tilt (-1 for left, 1 for right)
    this.maxTilt = 1.0; // Maximum tilt value
    this.tiltSpeed = 0.2; // How fast the tilt changes
    this.layerOffset = 1; // Pixels to offset each layer during tilt
    
    // Bubble effect properties
    this.bubbles = []; // List of active bubbles
    this.bubbleSpawnTimer = 0;
    this.bubbleSpawnRate = 10; // Frames between bubble spawns when moving
    this.boostBubbleRate = 5; // Faster spawn rate when boosting
    this.bubbleLifetime = 60; // How long bubbles last in frames
    this.minBubbleSize = 2;
    this.maxBubbleSize = 4;
    this.bubbleSpeed = 0.5; // How fast bubbles float up
    this.bubbleSpread = 10; // How far bubbles can spread horizontally
  }
  
  /**
   * Update the entity based on input state
   * 
   * @param {object} inputState - InputState object containing current input states
   * @param {number} delta - Time since last update in milliseconds
   */
  update(inputState, delta = 16.67) {
    if (!this.entity) return;
    
    // Normalize delta for frame rate independence
    const deltaFactor = delta / 16.67; // Base timing on 60fps
    
    // Update bubbles
    this.updateBubbles(deltaFactor);
    
    // Track space bar press duration and handle teleport/boost
    if (inputState.boostTeleport) {
      this.spacePressTime += deltaFactor;
      
      // Handle boost activation - activate immediately if holding space
      if (!this.staminaLocked && this.stamina > 0 && this.boostCooldown <= 0) {
        this.boostActive = true;
        this.stamina -= this.boostStaminaCost * deltaFactor;
        if (this.stamina <= 0) {
          this.boostActive = false;
          this.boostCooldown = this.maxBoostCooldown;
          this.staminaLocked = true;
        }
      } else {
        this.boostActive = false;
      }
    } else {
      // Handle teleport on space release if it was a short press and we have stamina
      if (this.spacePressTime > 0 && 
          this.spacePressTime <= this.maxTeleportHold && 
          !this.staminaLocked && 
          !this.boostCooldown) {
        // Determine teleport direction based on movement keys, default to forward
        let angle = 270; // Default to forward
        if (inputState.backward) { // Backward
          angle = 90;
        } else if (inputState.turnLeft) { // Left
          angle = 180;
        } else if (inputState.turnRight) { // Right
          angle = 0;
        }
        
        // Execute teleport
        this.teleportPolar(angle, this.teleportDistance);
        
        // Create bubble burst at end position
        this.createTeleportBubbles();
        
        // Consume stamina and lock if we don't have enough
        if (this.stamina >= this.teleportStaminaCost) {
          this.stamina -= this.teleportStaminaCost;
        } else {
          // If not enough stamina, deplete it and lock
          this.stamina = 0;
          this.staminaLocked = true;
        }
      }
      
      // Reset teleport/boost state
      this.spacePressTime = 0;
      this.boostActive = false;
    }
    
    // Movement controls (ZQSD)
    // Z - Forward
    if (inputState.forward) {
      this.entity.speed += this.entity.acceleration * deltaFactor;
    }
    // S - Backward
    else if (inputState.backward) {
      this.entity.speed -= this.entity.acceleration * deltaFactor;
    }
    
    // Handle rotation and tilt (Q/D for left/right)
    if (inputState.turnLeft) {
      // Update rotation
      this.entity.rotation = (this.entity.rotation - this.entity.rotationSpeed * deltaFactor) % 360;
      if (this.entity.rotation < 0) this.entity.rotation += 360;
      
      // Add tilt effect when turning left
      this.tiltAmount = Math.min(this.maxTilt, this.tiltAmount + this.tiltSpeed * deltaFactor);
    } else if (inputState.turnRight) {
      // Update rotation
      this.entity.rotation = (this.entity.rotation + this.entity.rotationSpeed * deltaFactor) % 360;
      
      // Add tilt effect when turning right
      this.tiltAmount = Math.max(-this.maxTilt, this.tiltAmount - this.tiltSpeed * deltaFactor);
    } else {
      // Return tilt to center when not turning
      if (this.tiltAmount > 0) {
        this.tiltAmount = Math.max(0, this.tiltAmount - this.tiltSpeed * deltaFactor);
      } else if (this.tiltAmount < 0) {
        this.tiltAmount = Math.min(0, this.tiltAmount + this.tiltSpeed * deltaFactor);
      }
    }
    
    // Regenerate stamina when not boosting
    if (!this.boostActive && this.stamina < this.maxStamina) {
      this.stamina = Math.min(this.maxStamina, this.stamina + this.staminaRegenRate * deltaFactor);
      // Unlock stamina when fully regenerated
      if (this.stamina >= this.maxStamina) {
        this.staminaLocked = false;
      }
    }
    
    // Decrease boost cooldown
    if (this.boostCooldown > 0) {
      this.boostCooldown -= deltaFactor;
    }
    
    // Apply boost effect if active
    if (this.boostActive) {
      const maxBoostSpeed = this.entity.maxSpeed * 2.0;
      this.entity.speed = Math.min(this.entity.speed * 1.8, maxBoostSpeed);
    }
    
    // Cap speed
    let normalMaxSpeed = this.entity.maxSpeed;
    if (this.boostActive) {
      normalMaxSpeed *= 1.5;
    }
    
    this.entity.speed = Math.max(
      Math.min(this.entity.speed, normalMaxSpeed),
      -normalMaxSpeed * 0.6
    );
    
    // Handle weapon firing
    // Left mouse button - Fire left weapon
    if (inputState.leftMouse && this.fireCooldownLeft <= 0) {
      this.firingLeft = true;
      this.fireCooldownLeft = this.fireRate;
      this.fireCannon(90); // Fire from left side
    } else {
      this.firingLeft = false;
    }
    
    // Right mouse button - Fire right weapon
    if (inputState.rightMouse && this.fireCooldownRight <= 0) {
      this.firingRight = true;
      this.fireCooldownRight = this.fireRate;
      this.fireCannon(-90); // Fire from right side
    } else {
      this.firingRight = false;
    }
    
    // Update cooldowns
    if (this.fireCooldownLeft > 0) {
      this.fireCooldownLeft -= deltaFactor;
    }
    
    if (this.fireCooldownRight > 0) {
      this.fireCooldownRight -= deltaFactor;
    }
    
    // Update cannonballs
    this.updateCannonballs(deltaFactor);
    
    // Update previous boost state for next frame
    this.previousBoostActive = this.boostActive;
  }
  
  /**
   * Check if boost just started this frame
   * 
   * @returns {boolean} - True if boost just started, False otherwise
   */
  boostJustStarted() {
    return this.boostActive && !this.previousBoostActive;
  }
  
  /**
   * Set the camera reference for coordinate transformations
   * 
   * @param {Camera} camera - The game's camera instance
   */
  setCamera(camera) {
    this.camera = camera;
  }
  
  /**
   * Get the spawn position for projectiles and bubbles relative to the submarine's center
   * 
   * @param {number} offsetDistance - Distance from center to spawn point
   * @param {number} angleOffset - Angle offset from sub's rotation
   * @returns {object} - {x, y} coordinates in world space
   */
  getSpawnPosition(offsetDistance = 0, angleOffset = 0) {
    if (!this.entity) {
      return { x: 0, y: 0 };
    }
    
    // Calculate spawn point using polar coordinates
    const angleRad = Phaser.Math.DegToRad(this.entity.rotation + angleOffset);
    const spawnX = this.entity.x + offsetDistance * Math.cos(angleRad);
    const spawnY = this.entity.y + offsetDistance * Math.sin(angleRad);
    
    return { x: spawnX, y: spawnY };
  }
  
  /**
   * Get the submarine's center position (where the red dot appears)
   * 
   * @returns {object} - {x, y} coordinates of the center in world space
   */
  getCenterPosition() {
    if (!this.camera) {
      return { x: this.entity.x, y: this.entity.y };
    }
    
    // Get the screen center (where red dot is drawn)
    const screenX = this.camera.width / 2;
    const screenY = this.camera.height / 2;
    
    // Convert to world coordinates
    return this.camera.screenToWorld(screenX, screenY);
  }
  
  /**
   * Spawn a new bubble behind the submarine
   */
  spawnBubble() {
    if (!this.entity) return;
    
    // Get the exact position of the red dot
    const { x: spawnX, y: spawnY } = this.getCenterPosition();
    
    // Bubbles always move straight up
    const moveAngle = 90;
    
    // Create new bubble
    const bubble = new Bubble(
      spawnX,
      spawnY,
      Phaser.Math.Between(this.minBubbleSize, this.maxBubbleSize),
      this.bubbleLifetime,
      this.bubbleSpeed * Phaser.Math.FloatBetween(0.8, 1.2),
      moveAngle + Phaser.Math.FloatBetween(-20, 20)
    );
    
    this.bubbles.push(bubble);
  }
  
  /**
   * Update and remove dead bubbles
   * 
   * @param {number} deltaFactor - Time factor for frame-rate independence
   */
  updateBubbles(deltaFactor) {
    // Update each bubble and keep only the active ones
    const newBubbles = [];
    for (let i = 0; i < this.bubbles.length; i++) {
      if (this.bubbles[i].update(16.67 * deltaFactor)) {
        newBubbles.push(this.bubbles[i]);
      }
    }
    this.bubbles = newBubbles;
    
    // Spawn new bubbles if moving
    if (Math.abs(this.entity.speed) > 0.1) {
      this.bubbleSpawnTimer -= deltaFactor;
      if (this.bubbleSpawnTimer <= 0) {
        this.spawnBubble();
        // Set next spawn time based on boost state
        this.bubbleSpawnTimer = this.boostActive ? this.boostBubbleRate : this.bubbleSpawnRate;
      }
    }
  }
  
  /**
   * Create a burst of bubbles in all directions for teleport effect
   */
  createTeleportBubbles() {
    if (!this.entity) return;
    
    const numBubbles = 16; // Number of bubbles in the burst
    for (let i = 0; i < numBubbles; i++) {
      // Calculate angle for even distribution around the circle
      const angle = (i * 360 / numBubbles) + Phaser.Math.FloatBetween(-10, 10);
      const angleRad = Phaser.Math.DegToRad(angle);
      
      // Random distance from center
      const distance = Phaser.Math.FloatBetween(20, 40);
      
      // Get center position and calculate bubble position relative to it
      const { x: centerX, y: centerY } = this.getCenterPosition();
      const spawnX = centerX + distance * Math.cos(angleRad);
      const spawnY = centerY + distance * Math.sin(angleRad);
      
      // Create bubble with outward movement
      const bubble = new Bubble(
        spawnX,
        spawnY,
        Phaser.Math.Between(2, 6), // Slightly larger bubbles for effect
        30, // Shorter lifetime for the effect
        Phaser.Math.FloatBetween(1.0, 2.0), // Faster speed for burst effect
        angle // Move in the direction they're spawned
      );
      
      this.bubbles.push(bubble);
    }
  }
  
  /**
   * Teleport the submarine using polar coordinates relative to its current position and rotation
   * 
   * @param {number} angle - Angle in degrees relative to submarine's front (0 = front, 180 = back)
   * @param {number} distance - Distance to teleport in units
   */
  teleportPolar(angle, distance) {
    if (!this.entity) return;
    
    // Convert angle to world space by adding submarine's rotation
    const worldAngle = this.entity.rotation + angle;
    // Convert to radians for math calculations
    const angleRad = Phaser.Math.DegToRad(worldAngle);
    
    // Calculate new position using polar coordinates
    const newX = this.entity.x + distance * Math.cos(angleRad);
    const newY = this.entity.y + distance * Math.sin(angleRad);
    
    // Update submarine position
    this.entity.x = newX;
    this.entity.y = newY;
    
    // Create teleportation bubble effect
    this.createTeleportBubbles();
  }
  
  /**
   * Fire a cannonball from one of the submarine's cannons
   * 
   * @param {number} sideAngle - Angle offset from submarine's direction for cannon position (-90=left, 90=right)
   */
  fireCannon(sideAngle) {
    if (!this.entity || !this.entity.scene) return;
    
    // Get the exact position of the red dot
    const { x: spawnX, y: spawnY } = this.getCenterPosition();
    
    // Create the cannonball
    const ball = new Cannonball(
      this.entity.scene,
      spawnX,
      spawnY,
      'cannonball',
      this.entity.rotation + sideAngle + 90, // Add side angle and 90 for proper orientation
      this.cannonballSpeed
    );
    
    this.cannonballs.push(ball);
    
    // Create bubble effect at cannon position
    for (let i = 0; i < 3; i++) {
      const bubble = new Bubble(
        spawnX,
        spawnY,
        Phaser.Math.Between(3, 5),
        20,
        Phaser.Math.FloatBetween(1.0, 2.0),
        Phaser.Math.FloatBetween(0, 360) // Random directions for explosion effect
      );
      
      this.bubbles.push(bubble);
    }
  }
  
  /**
   * Update and remove dead cannonballs
   * 
   * @param {number} deltaFactor - Time factor for frame-rate independence
   */
  updateCannonballs(deltaFactor) {
    // Update each cannonball and keep only the active ones
    const newCannonballs = [];
    for (let i = 0; i < this.cannonballs.length; i++) {
      if (this.cannonballs[i].active) {
        this.cannonballs[i].update(null, 16.67 * deltaFactor);
        newCannonballs.push(this.cannonballs[i]);
      }
    }
    this.cannonballs = newCannonballs;
  }
}

export default PlayerController;
