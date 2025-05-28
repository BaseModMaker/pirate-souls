import * as PIXI from 'pixi.js';

export class Bubble {
  constructor(x, y, speed, angle, size, lifetime) {
    /** Starting values */
    this.x = x;
    this.y = y;
    this.size = size;
    this.lifetime = lifetime;
    this.maxLifetime = lifetime;
    this.speed = speed;
    this.angle = angle;

    /** Create the PIXI graphics object */
    this.sprite = new PIXI.Graphics();
    this.sprite.beginFill(0x99ccff, 1.0);
    this.sprite.drawCircle(0, 0, this.size);
    this.sprite.endFill();
    this.sprite.x = this.x;
    this.sprite.y = this.y;
    this.sprite.alpha = 1.0;
  }

  update() {
    // Convert angle to radians
    const radians = this.angle * (Math.PI / 180);

    // Move bubble
    this.x += Math.cos(radians) * this.speed;
    this.y += Math.sin(radians) * this.speed;

    // Update position
    this.sprite.x = this.x;
    this.sprite.y = this.y;

    // Decrease lifetime
    this.lifetime--;    // Update alpha based on remaining lifetime
    const ratio = this.lifetime / this.maxLifetime;
    this.alpha = (ratio * 200 + 55);
    this.sprite.alpha = this.alpha / 255;

    // Return whether the bubble is still alive
    return this.lifetime > 0;
  }
}
