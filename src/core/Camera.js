/**
 * Camera module for handling view transformations in the game.
 * This allows for an infinite world where the player stays centered.
 * Translated from pygame Camera class.
 */

class Camera {
  /**
   * Initialize a camera
   * 
   * @param {Phaser.Scene} scene - The scene this camera belongs to
   * @param {Phaser.Cameras.Scene2D.Camera} camera - The Phaser camera to control
   */
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    
    // Store dimensions for calculations
    this.width = camera.width;
    this.height = camera.height;
    
    // Camera position in world coordinates
    this.x = 0;
    this.y = 0;
    
    // Camera rotation (in degrees, 0 = no rotation)
    this.rotation = 0;
    
    // Camera smoothing (lower = smoother)
    this.smoothing = 0.1;
    
    // Track manual adjustments
    this.hasManualAdjustment = false;
    
    // Current target (for following)
    this.targetX = 0;
    this.targetY = 0;
    this.targetRotation = 0;
    
    // Handle window resize
    window.addEventListener('resize', () => {
      this.width = camera.width;
      this.height = camera.height;
    });
  }

  /**
   * Make the camera follow a target position, keeping it centered
   * 
   * @param {number} targetX - X position to follow in world coordinates
   * @param {number} targetY - Y position to follow in world coordinates
   * @param {number} targetRotation - Target rotation in degrees for camera alignment
   */
  follow(targetX, targetY, targetRotation = null) {
    // Store target values
    this.targetX = targetX;
    this.targetY = targetY;
    if (targetRotation !== null) {
      this.targetRotation = targetRotation;
    }
    
    // If there's a manual adjustment active, don't update the camera position
    if (this.hasManualAdjustment) {
      return;
    }
    
    // Smoothly move camera to target position
    this.x += (this.targetX - this.x) * this.smoothing;
    this.y += (this.targetY - this.y) * this.smoothing;
    
    // Set the Phaser camera position
    this.camera.scrollX = this.x - this.width / 2;
    this.camera.scrollY = this.y - this.height / 2;
    
    if (targetRotation !== null) {
      // Set camera rotation to counter-rotate the world
      // This makes the submarine appear stationary while the world rotates
      const targetAngle = (-targetRotation) % 360;
      
      // Smooth rotation
      this.rotation += this._getShortestAngleDifference(this.rotation, targetAngle) * this.smoothing;
      this.rotation = this.rotation % 360;
      
      // Convert to radians for Phaser
      const radians = Phaser.Math.DegToRad(this.rotation);
      this.camera.setRotation(radians);
    }
  }
  
  /**
   * Calculate the shortest angle difference between current and target angles
   * 
   * @param {number} current - Current angle in degrees
   * @param {number} target - Target angle in degrees
   * @return {number} - Shortest angle difference
   */
  _getShortestAngleDifference(current, target) {
    let diff = (target - current) % 360;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return diff;
  }

  /**
   * Convert world coordinates to screen coordinates
   * 
   * @param {number} worldX - X position in world coordinates
   * @param {number} worldY - Y position in world coordinates
   * @return {object} - {x, y} screen coordinates for drawing
   */
  worldToScreen(worldX, worldY) {
    // Calculate offset from camera position
    let offsetX = worldX - this.x;
    let offsetY = worldY - this.y;
    
    // Apply rotation if needed
    if (this.rotation !== 0) {
      // Convert to radians
      const radAngle = Phaser.Math.DegToRad(this.rotation);
      const cosVal = Math.cos(radAngle);
      const sinVal = Math.sin(radAngle);
      
      // Apply rotation matrix
      const rotatedX = offsetX * cosVal - offsetY * sinVal;
      const rotatedY = offsetX * sinVal + offsetY * cosVal;
      
      offsetX = rotatedX;
      offsetY = rotatedY;
    }
    
    // Convert to screen coordinates (centered)
    const screenX = this.width / 2 + offsetX;
    const screenY = this.height / 2 + offsetY;
    
    return { x: screenX, y: screenY };
  }

  /**
   * Convert screen coordinates to world coordinates
   * 
   * @param {number} screenX - X position on screen
   * @param {number} screenY - Y position on screen
   * @return {object} - {x, y} world coordinates
   */
  screenToWorld(screenX, screenY) {
    // Calculate offset from screen center
    let offsetX = screenX - this.width / 2;
    let offsetY = screenY - this.height / 2;
    
    // Apply reverse rotation if needed
    if (this.rotation !== 0) {
      // Convert to radians
      const radAngle = Phaser.Math.DegToRad(-this.rotation); // Negative for reverse rotation
      const cosVal = Math.cos(radAngle);
      const sinVal = Math.sin(radAngle);
      
      // Apply rotation matrix
      const rotatedX = offsetX * cosVal - offsetY * sinVal;
      const rotatedY = offsetX * sinVal + offsetY * cosVal;
      
      offsetX = rotatedX;
      offsetY = rotatedY;
    }
    
    // Convert to world coordinates
    const worldX = this.x + offsetX;
    const worldY = this.y + offsetY;
    
    return { x: worldX, y: worldY };
  }

  /**
   * Set the camera rotation angle
   * 
   * @param {number} angle - Rotation angle in degrees
   * @return {number} - The new rotation angle
   */
  setRotation(angle) {
    this.rotation = angle % 360;
    
    // Convert to radians for Phaser
    const radians = Phaser.Math.DegToRad(this.rotation);
    this.camera.setRotation(radians);
    
    return this.rotation;
  }

  /**
   * Manually move the camera by the specified amount
   * 
   * @param {number} dx - Amount to move in x direction
   * @param {number} dy - Amount to move in y direction
   */
  move(dx, dy) {
    this.x += dx;
    this.y += dy;
    
    // Update Phaser camera position
    this.camera.scrollX = this.x - this.width / 2;
    this.camera.scrollY = this.y - this.height / 2;
    
    // Mark that we have a manual adjustment
    this.hasManualAdjustment = true;
  }
  
  /**
   * Reset manual adjustment flag to allow normal following again
   */
  resetToDefaultPosition() {
    this.hasManualAdjustment = false;
  }
  
  /**
   * Apply a camera shake effect
   * 
   * @param {number} intensity - How intense the shake should be
   * @param {number} duration - How long the shake should last (ms)
   */
  shake(intensity = 5, duration = 100) {
    this.camera.shake(duration / 1000, intensity / 1000); // Convert to seconds and normalized intensity
  }
  
  /**
   * Set the camera smoothing factor
   * 
   * @param {number} smoothing - Smoothing factor (lower = smoother)
   */
  setSmoothing(smoothing) {
    this.smoothing = Phaser.Math.Clamp(smoothing, 0.01, 1);
  }
  
  /**
   * Reset the camera to the target position immediately
   * 
   * @param {number} x - Target X position
   * @param {number} y - Target Y position
   * @param {number} rotation - Target rotation angle
   */
  reset(x = null, y = null, rotation = null) {
    if (x !== null) this.x = x;
    if (y !== null) this.y = y;
    if (rotation !== null) this.rotation = rotation % 360;
    
    // Update Phaser camera
    this.camera.scrollX = this.x - this.width / 2;
    this.camera.scrollY = this.y - this.height / 2;
    
    if (rotation !== null) {
      this.camera.setRotation(Phaser.Math.DegToRad(this.rotation));
    }
    
    // Clear manual adjustment flag
    this.hasManualAdjustment = false;
  }
}

export default Camera;
