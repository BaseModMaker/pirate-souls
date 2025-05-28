import * as PIXI from 'pixi.js';
import { GameObject } from './gameobject.js';

export class Entity extends GameObject {
    /**
     * An entity is a game object that can move and has physics.
     * @param {object} options - Entity configuration.
     */    constructor({
        x = 0,
        y = 0,
        texture = null,
        imagePath = null,
        numLayers = 8,
        layerOffset = 0.5,
        width = 32,
        height = 32,
        entityType = 'generic',
        outlineEnabled = false,
        outlineColor = 0x000000,
        outlineThickness = 1,
        outlineOffset = 1,
        rotation = 0,
        shadowEnabled = true
    } = {}) {
        super({
            x,
            y,
            texture,
            imagePath,
            numLayers,
            layerOffset,
            width,
            height,
            outlineEnabled,
            outlineColor,
            outlineThickness,
            outlineOffset,
            shadowEnabled
        });

        this.speed = 0;
        this.maxSpeed = 5;
        this.acceleration = 0.2;
        this.deceleration = 0.1;
        this.friction = 0.98;
        this.rotation = rotation;
        this.baseAngle = rotation;
        this.rotationSpeed = 2;
        this.direction = 0;
        this.controller = null;

        if (entityType === 'car' && this.spriteStack.layers.length === 0) {
            this.spriteStack.createCarLayers(width, height);
            this.width = this.spriteStack.width;
            this.height = this.spriteStack.height;
        }
    }

    setController(controller) {
        this.controller = controller;
        controller.entity = this;
    }

    applyPhysics() {
        this.speed *= this.friction;

        let effectiveRotation = this.rotation;
        if (this.controller && 'directionOffset' in this.controller) {
            effectiveRotation = (this.rotation + this.controller.directionOffset) % 360;
        }

        const angleRad = effectiveRotation * (Math.PI / 180);
        const moveX = -Math.sin(angleRad) * this.speed;
        const moveY = Math.cos(angleRad) * this.speed;

        this.x += moveX;
        this.y += moveY;

        if (this.spriteStack) {
            this.spriteStack.setPosition(this.x, this.y);
        }
    }

    applyBoost() {
        this.speed = Math.min(this.maxSpeed * 2, this.speed + this.acceleration * 2);
    }

    update(delta, ...args) {
        if (this.controller && typeof this.controller.update === 'function') {
            this.controller.update(delta, ...args);
        }

        this.applyPhysics();
    }

    draw(renderer, drawShadow = true, performanceMode = 0) {
        this.spriteStack.draw(renderer, this.x, this.y, this.rotation, drawShadow, performanceMode);
    }

    keepInBounds(width, height) {
        // No-op to allow infinite world movement
    }
}
