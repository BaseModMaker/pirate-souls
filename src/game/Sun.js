/**
 * Sun class for shadow calculations
 * Translated from pygame Sun class
 */

class Sun {
  constructor(horizontalAngle = 135, verticalAngle = 45) {
    // Store angles and convert to radians
    this.horizontalAngle = horizontalAngle;
    this.verticalAngle = verticalAngle;
    
    // Update vectors from angles
    this.updateVectors();
  }
  
  updateVectors() {
    // Convert angles to radians
    const hRad = this.horizontalAngle * Math.PI / 180;
    const vRad = this.verticalAngle * Math.PI / 180;
    
    // Calculate 3D direction vector
    this.directionX = Math.cos(hRad) * Math.cos(vRad);
    this.directionY = Math.sin(hRad) * Math.cos(vRad);
    this.directionZ = Math.sin(vRad);
    
    // Normalize the vector
    const length = Math.sqrt(
      this.directionX * this.directionX + 
      this.directionY * this.directionY + 
      this.directionZ * this.directionZ
    );
    
    this.directionX /= length;
    this.directionY /= length;
    this.directionZ /= length;
  }
  
  setHorizontalAngle(angle) {
    this.horizontalAngle = angle;
    this.updateVectors();
  }
  
  setVerticalAngle(angle) {
    this.verticalAngle = angle;
    this.updateVectors();
  }
  
  getShadowOffset(objectHeight) {
    // If sun is directly overhead, no shadow
    if (this.directionZ >= 0.99) return { x: 0, y: 0 };
    
    // Calculate shadow offset based on sun direction
    const shadowFactor = objectHeight / this.directionZ;
    return {
      x: -this.directionX * shadowFactor,
      y: -this.directionY * shadowFactor
    };
  }
}

export default Sun;
