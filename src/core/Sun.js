/**
 * Class to manage sun position, appearance, and related calculations.
 * Translated from pygame Sun class.
 */
class Sun {
  /**
   * Initialize the sun with default angles.
   * 
   * @param {number} horizontalAngle - Horizontal angle of the sun (0-360 degrees)
   *   0 = North, 90 = East, 180 = South, 270 = West
   * @param {number} verticalAngle - Vertical angle of the sun (0-90 degrees)
   *   0 = sun at horizon (long shadows), 90 = directly overhead (no shadows)
   */
  constructor(horizontalAngle = 45, verticalAngle = 45) {
    this.horizontalAngle = horizontalAngle; // 0-360 degrees (compass direction)
    this.verticalAngle = verticalAngle;     // 0-90 degrees (height in sky)
    this.debugEnabled = false;              // Debug always disabled
    
    // Calculate direction vector based on angles
    this.updateDirectionVector();
  }

  /**
   * Update the sun's direction vector based on its angles
   */
  updateDirectionVector() {
    // Convert angles to radians
    const horizontalRad = this.horizontalAngle * Math.PI / 180;
    const verticalRad = this.verticalAngle * Math.PI / 180;
    
    // Calculate 3D direction vector
    this.directionX = Math.cos(horizontalRad) * Math.cos(verticalRad);
    this.directionY = Math.sin(horizontalRad) * Math.cos(verticalRad);
    this.directionZ = Math.sin(verticalRad);
    
    // Normalize the direction vector
    const length = Math.sqrt(
      this.directionX * this.directionX + 
      this.directionY * this.directionY + 
      this.directionZ * this.directionZ
    );
    
    this.directionX /= length;
    this.directionY /= length;
    this.directionZ /= length;
  }

  /**
   * Adjust the horizontal angle of the sun.
   * 
   * @param {number} delta - Amount to change the angle by (positive = clockwise)
   * @return {number} The new horizontal angle
   */
  adjustHorizontalAngle(delta) {
    this.horizontalAngle = (this.horizontalAngle + delta) % 360;
    this.updateDirectionVector();
    return this.horizontalAngle;
  }

  /**
   * Adjust the vertical angle of the sun.
   * 
   * @param {number} delta - Amount to change the angle by (positive = higher in sky)
   * @return {number} The new vertical angle
   */
  adjustVerticalAngle(delta) {
    this.verticalAngle = Math.max(0, Math.min(90, this.verticalAngle + delta));
    this.updateDirectionVector();
    return this.verticalAngle;
  }

  /**
   * Calculate shadow offset based on object height and sun position
   * 
   * @param {number} objectHeight - Height of the object casting the shadow
   * @return {object} Object containing x and y shadow offset
   */
  getShadowOffset(objectHeight) {
    // If sun is directly overhead, no shadow
    if (this.directionZ >= 0.99) {
      return { x: 0, y: 0 };
    }
    
    // Calculate shadow length based on sun angle
    // The lower the sun (smaller vertical angle), the longer the shadow
    const shadowFactor = objectHeight / Math.max(0.1, this.directionZ);
    
    return {
      x: -this.directionX * shadowFactor,
      y: -this.directionY * shadowFactor
    };
  }

  /**
   * Toggle debug mode (disabled in this implementation)
   */
  toggleDebug() {
    return false;
  }

  /**
   * Draw a visual representation of the sun in the scene (for debugging)
   * 
   * @param {Phaser.Scene} scene - The Phaser scene to draw in
   * @param {number} screenWidth - Width of the screen
   * @param {number} screenHeight - Height of the screen
   * @return {Phaser.GameObjects.Container} Container with sun visualization elements
   */
  createVisual(scene, screenWidth, screenHeight) {
    const container = scene.add.container(0, 0);
    container.setScrollFactor(0); // Fixed to camera
    
    // Calculate sun position based on horizontal angle
    const margin = 150; // Distance from screen center
    const sunSize = 30; // Size of sun circle
    
    // Determine position based on horizontal angle (circular path)
    // Add 270 degrees to correct the sun position to match shadow direction
    const displayAngle = (this.horizontalAngle + 270) % 360;
    const radAngle = displayAngle * Math.PI / 180;
    const x = screenWidth / 2 + margin * Math.cos(radAngle);
    const y = screenHeight / 2 - margin * Math.sin(radAngle);
    
    // Adjust sun color based on vertical angle
    const verticalFactor = this.verticalAngle / 90.0; // 0.0 to 1.0
    
    let red = 255;
    let green = 255;
    let blue = 0;
    
    if (verticalFactor < 0.5) {
      // Sunset/sunrise colors (orange/red) for low sun angles
      green = Math.max(0, Math.floor(255 * (verticalFactor * 2))); // Reduces green for redder appearance
    } else {
      // Yellow to white for higher sun angles
      blue = Math.max(0, Math.floor(255 * (verticalFactor - 0.5) * 2)); // Increases blue for whiter appearance
    }
    
    const sunColor = Phaser.Display.Color.GetColor(red, green, blue);
    
    // Draw the sun
    const sun = scene.add.circle(x, y, sunSize, sunColor);
    container.add(sun);
    
    // Draw rays from the sun
    const rayLength = 15;
    for (let angle = 0; angle < 360; angle += 45) { // Draw 8 rays
      const rayAngle = angle * Math.PI / 180;
      const endX = x + rayLength * Math.cos(rayAngle);
      const endY = y + rayLength * Math.sin(rayAngle);
      
      const ray = scene.add.line(0, 0, x, y, endX, endY, sunColor).setLineWidth(3);
      container.add(ray);
    }
    
    // Draw a line from the sun to center of screen to show light direction
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;
    const directionLine = scene.add.line(
      0, 0, x, y, centerX, centerY, 
      0xFFFF00, 0.5 // Semi-transparent yellow
    ).setLineWidth(2);
    container.add(directionLine);
    
    return container;
  }
  
  /**
   * Return current sun direction as an object
   * 
   * @return {object} The direction vector components
   */
  getDirection() {
    return {
      x: this.directionX,
      y: this.directionY,
      z: this.directionZ
    };
  }
}

export default Sun;
