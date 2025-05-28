import { Bubble } from '../core/bubble.js';
import { Cannonball } from '../core/cannonball.js';

export class PlayerController {
  constructor() {
    this.entity = null;
    this.directionOffset = 0;
    this.boostActive = false;
    this.camera = null;
    this.previousBoostActive = false;
    this.boostCooldown = 0;
    this.maxBoostCooldown = 60;

    this.maxStamina = 100;
    this.stamina = this.maxStamina;
    this.staminaRegenRate = 0.5;
    this.boostStaminaCost = 1.0;
    this.teleportStaminaCost = 30.0;
    this.staminaLocked = false;

    this.spacePressTime = 0;
    this.teleportDistance = 100;
    this.maxTeleportHold = 45;
    this.isTeleporting = false;

    this.firingLeft = false;
    this.firingRight = false;
    this.fireCooldownLeft = 0;
    this.fireCooldownRight = 0;
    this.fireRate = 15;
    this.cannonballSpeed = 8.0;
    this.cannonballs = [];
    this.cannonOffset = 30;

    this.tiltAmount = 0;
    this.maxTilt = 1.0;
    this.tiltSpeed = 0.2;
    this.layerOffset = 1;

    this.bubbles = [];
    this.bubbleSpawnTimer = 0;
    this.bubbleSpawnRate = 10;
    this.boostBubbleRate = 5;
    this.bubbleLifetime = 60;
    this.minBubbleSize = 2;
    this.maxBubbleSize = 4;
    this.bubbleSpeed = 0.5;
    this.bubbleSpread = 10;
  }

  setCamera(camera) {
    this.camera = camera;
  }

  boostJustStarted() {
    return this.boostActive && !this.previousBoostActive;
  }

  update(inputState) {
    if (!this.entity) return;

    this.previousBoostActive = this.boostActive;
    this.boostActive = inputState.keys['KeyW'] && this.stamina > 0 && this.boostCooldown <= 0;
    const rotationDelta = (inputState.keys['KeyA'] ? -1 : 0) + (inputState.keys['KeyD'] ? 1 : 0);
    this.entity.rotation += rotationDelta;

    if (this.boostActive) {
      this.stamina -= this.boostStaminaCost;
      this.entity.applyBoost();
    } else if (!this.staminaLocked) {
      this.stamina = Math.min(this.maxStamina, this.stamina + this.staminaRegenRate);
    }

    if (this.boostJustStarted()) {
      this.boostCooldown = this.maxBoostCooldown;
    }

    if (this.boostCooldown > 0) {
      this.boostCooldown--;
    }

    if (inputState.keys['Space']) {
      this.spacePressTime++;
    } else {
      if (this.spacePressTime > 0 && this.stamina >= this.teleportStaminaCost) {
        const duration = Math.min(this.spacePressTime, this.maxTeleportHold);
        this.teleportPolar(duration * 2);
        this.stamina -= this.teleportStaminaCost;
        this.staminaLocked = true;
      }
      this.spacePressTime = 0;
    }

    if (!inputState.keys['Space']) {
      this.staminaLocked = false;
    }

    // Handle firing
    this.fireCooldownLeft = Math.max(0, this.fireCooldownLeft - 1);
    this.fireCooldownRight = Math.max(0, this.fireCooldownRight - 1);    if (inputState.leftMouse && this.fireCooldownLeft === 0) {
      this._fireCannon(-1);
      this.fireCooldownLeft = this.fireRate;
    }

    if (inputState.rightMouse && this.fireCooldownRight === 0) {
      this._fireCannon(1);
      this.fireCooldownRight = this.fireRate;
    }    // Handle tilt based on input
    const targetTilt = (inputState.keys['KeyA'] ? -1 : 0) + (inputState.keys['KeyD'] ? 1 : 0);
    this.tiltAmount += (targetTilt - this.tiltAmount) * this.tiltSpeed;
    // Note: Tilt effect can be applied to the spriteStack if needed
    // this.entity.spriteStack.tiltAmount = this.tiltAmount * 0.02;

    // Bubble updates
    this._updateBubbles();
  }

  _updateBubbles() {
    this.bubbleSpawnTimer++;

    const rate = this.boostActive ? this.boostBubbleRate : this.bubbleSpawnRate;
    if (this.bubbleSpawnTimer >= rate) {
      this.bubbleSpawnTimer = 0;
      this._spawnBubble();
    }    this.bubbles = this.bubbles.filter((bubble) => {
      const alive = bubble.update();
      if (!bubble.age) bubble.age = 0;
      bubble.age++;
      return alive && bubble.age < this.bubbleLifetime;
    });
  }
  _spawnBubble() {
    // Update to use rotation directly without the offset
    const direction = this.entity.rotation + (Math.random() - 0.5) * this.bubbleSpread;
    const speed = this.bubbleSpeed;
    const size = this.minBubbleSize + Math.random() * (this.maxBubbleSize - this.minBubbleSize);
    const bubble = new Bubble(this.entity.x, this.entity.y, speed, direction, size, this.bubbleLifetime);
    bubble.age = 0; // Add age property for filtering
    this.bubbles.push(bubble);
  }

  teleportPolar(distance) {
    // Update to use rotation directly without the offset
    const radians = this.entity.rotation * (Math.PI / 180);
    const dx = Math.cos(radians) * distance;
    const dy = Math.sin(radians) * distance;
    this.entity.x += dx;
    this.entity.y += dy;

    if (this.camera) {
      this.camera.x += dx;
      this.camera.y += dy;
    }
  }
  _fireCannon(side) {
    // Update to use rotation directly without the offset
    const rotationRad = this.entity.rotation * (Math.PI / 180);
    const perpRad = rotationRad + side * (Math.PI / 2);
    const offsetX = Math.cos(perpRad) * this.cannonOffset;
    const offsetY = Math.sin(perpRad) * this.cannonOffset;

    const fireX = this.entity.x + offsetX;
    const fireY = this.entity.y + offsetY;
    const direction = this.entity.rotation;

    const cannonball = new Cannonball(fireX, fireY, 'assets/images/cannonball-3x3x2.png', direction, this.cannonballSpeed);
    this.cannonballs.push(cannonball);
  }
}
