/**
 * Camera manager for Pirate Souls
 * Translated from pygame Camera class
 */

class Camera {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    
    // Camera properties
    this.x = 0;
    this.y = 0;
    this.width = camera.width;
    this.height = camera.height;
    this.zoom = 1;
    this.rotation = 0;
    
    // Camera target properties
    this.targetX = 0;
    this.targetY = 0;
    this.targetRotation = 0;
    
    // Camera smoothing
    this.smoothFactor = 0.1;
    this.rotationSmoothFactor = 0.05;
    this.hasManualAdjustment = false;
    
    // Handle browser resize events
    window.addEventListener('resize', () => {
      this.updateDimensions();
    });
  }
  
  updateDimensions() {
    this.width = this.camera.width;
    this.height = this.camera.height;
  }
  
  follow(x, y, rotation = 0) {
    this.targetX = x;
    this.targetY = y;
    this.targetRotation = rotation;
    
    // Smooth camera movement
    if (!this.hasManualAdjustment) {
      // Smoothly approach the target
      this.x += (this.targetX - this.x) * this.smoothFactor;
      this.y += (this.targetY - this.y) * this.smoothFactor;
      
      // Handle rotation wrapping for smooth transitions
      const shortestAngle = this.getShortestAngle(this.rotation, this.targetRotation);
      this.rotation += shortestAngle * this.rotationSmoothFactor;
      
      // Apply to the Phaser camera
      this.camera.scrollX = this.x - this.width / 2;
      this.camera.scrollY = this.y - this.height / 2;
    }
  }
  
  getShortestAngle(from, to) {
    // Convert to radians for calculation
    const fromRad = from * Math.PI / 180;
    const toRad = to * Math.PI / 180;
    
    // Calculate shortest angle difference
    let diff = ((toRad - fromRad + Math.PI) % (Math.PI * 2)) - Math.PI;
    if (diff < -Math.PI) diff += Math.PI * 2;
    
    // Convert back to degrees
    return diff * 180 / Math.PI;
  }
  
  manualAdjust(dx, dy) {
    this.x += dx;
    this.y += dy;
    this.hasManualAdjustment = true;
    
    // Apply to the Phaser camera
    this.camera.scrollX = this.x - this.width / 2;
    this.camera.scrollY = this.y - this.height / 2;
  }
  
  resetToDefaultPosition() {
    this.hasManualAdjustment = false;
  }
  
  worldToScreen(worldX, worldY) {
    const screenX = worldX - this.camera.scrollX;
    const screenY = worldY - this.camera.scrollY;
    return { x: screenX, y: screenY };
  }
  
  screenToWorld(screenX, screenY) {
    const worldX = screenX + this.camera.scrollX;
    const worldY = screenY + this.camera.scrollY;
    return { x: worldX, y: worldY };
  }
  
  shake(intensity = 5, duration = 100) {
    this.scene.cameras.main.shake(duration, intensity/1000);
  }
}

export default Camera;
