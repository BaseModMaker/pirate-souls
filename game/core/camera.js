import * as PIXI from 'pixi.js';

export class Camera {
  constructor(screenWidth, screenHeight) {
    this.width = screenWidth;
    this.height = screenHeight;

    this.x = 0;
    this.y = 0;
    this.rotation = 0; // In degrees
    this.smoothing = 0.1;

    // The container where world elements will be added
    this.container = new PIXI.Container();
    this.container.sortableChildren = true; // Optional: enables zIndex ordering
  }

  follow(targetX, targetY, targetRotation = null) {
    if (targetRotation !== null) {
      const rad = (targetRotation * Math.PI) / 180;

      // Smooth follow position
      this.x += (targetX - this.x) * this.smoothing;
      this.y += (targetY - this.y) * this.smoothing;

      // Counter-rotate world to keep player upright
      this.rotation = (-targetRotation) % 360;
    } else {
      this.x += (targetX - this.x) * this.smoothing;
      this.y += (targetY - this.y) * this.smoothing;
    }

    this._updateTransform();
  }

  _updateTransform() {
    // Center camera on target (negate position)
    this.container.x = this.width / 2 - this.x;
    this.container.y = this.height / 2 - this.y;

    // Apply rotation around the screen center
    const rad = (this.rotation * Math.PI) / 180;

    this.container.pivot.set(this.width / 2, this.height / 2);
    this.container.position.set(this.width / 2, this.height / 2);
    this.container.rotation = rad;
  }

  worldToScreen(worldX, worldY) {
    // Translate coordinates relative to camera
    let dx = worldX - this.x;
    let dy = worldY - this.y;

    if (this.rotation !== 0) {
      const rad = (this.rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      const rotatedX = dx * cos - dy * sin;
      const rotatedY = dx * sin + dy * cos;

      dx = rotatedX;
      dy = rotatedY;
    }

    return [
      Math.round(this.width / 2 + dx),
      Math.round(this.height / 2 + dy),
    ];
  }

  screenToWorld(screenX, screenY) {
    // Offset from center
    let dx = screenX - this.width / 2;
    let dy = screenY - this.height / 2;

    if (this.rotation !== 0) {
      const rad = (-this.rotation * Math.PI) / 180; // Reverse rotation
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      const rotatedX = dx * cos - dy * sin;
      const rotatedY = dx * sin + dy * cos;

      dx = rotatedX;
      dy = rotatedY;
    }

    return [this.x + dx, this.y + dy];
  }

  setRotation(angle) {
    this.rotation = angle % 360;
    this._updateTransform();
    return this.rotation;
  }

  move(dx, dy) {
    this.x += dx;
    this.y += dy;
    this._updateTransform();
  }

  getContainer() {
    return this.container;
  }
}
