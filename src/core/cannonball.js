import { Entity } from './entity.js';

export class Cannonball extends Entity {
  /**
   * A projectile fired by the submarine.
   * 
   * @param {number} x - Starting X position
   * @param {number} y - Starting Y position
   * @param {string} imagePath - Path to the cannonball sprite
   * @param {number} direction - Rotation in degrees
   * @param {number} speed - Movement speed
   */
  constructor(
    x = 0,
    y = 0,
    imagePath = 'assets/images/cannonball-3x3x2.png',
    direction = 0,
    speed = 4.0
  ) {
    super({
      x,
      y,
      imagePath,
      numLayers: 2,
      width: 3,
      height: 3,
      outlineEnabled: false,
      shadowEnabled: false,
      rotation: direction
    });

    this.speed = speed;
    this.lifetime = 100; // ~0.5s at 60 FPS
    this.damage = 10;
  }

  /**
   * Update cannonball position and lifetime.
   * @returns {boolean} Whether the cannonball should still exist
   */
  update() {
    const angleRad = (this.rotation * Math.PI) / 180;

    // Update position
    this.x += Math.cos(angleRad) * this.speed;
    this.y += Math.sin(angleRad) * this.speed;

    // Update sprite position
    if (this.sprite) {
      this.sprite.position.set(this.x, this.y);
      this.sprite.rotation = angleRad;
    }

    // Update collision rect if used
    if (this.rect) {
      this.rect.x = this.x - this.width / 2;
      this.rect.y = this.y - this.height / 2;
    }

    this.lifetime--;

    return this.lifetime > 0;
  }
}
