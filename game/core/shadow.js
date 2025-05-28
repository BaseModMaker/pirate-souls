/**
 * Class to manage shadow configurations across game objects.
 */
export class ShadowManager {
    /**
     * Initialize the shadow manager.
     * @param {boolean} enabled - Whether shadows are enabled by default.
     */
    constructor(enabled = true) {
        this.enabled = enabled;
        /** @type {Array} */
        this.gameObjects = []; // List of objects using this shadow manager
    }

    /**
     * Register a single game object to be managed by this shadow manager.
     * @param {Object} obj - Object with a configureShadow method.
     */
    registerObject(obj) {
        if (this.gameObjects.indexOf(obj) === -1) {
            this.gameObjects.push(obj);
        }
    }

    /**
     * Register multiple game objects at once.
     * @param {Object[]} objects - List of objects with a configureShadow method.
     */
    registerObjects(objects) {
        for (const obj of objects) {
            this.registerObject(obj);
        }
    }

    /**
     * Update shadows for all registered objects based on sun position.
     * @param {Object} sun - Object with horizontalAngle and verticalAngle properties.
     */
    updateAll(sun) {
        for (const obj of this.gameObjects) {
            if (typeof obj.configureShadow === 'function') {
                obj.configureShadow(
                    sun.horizontalAngle,
                    sun.verticalAngle,
                    this.enabled
                );
            }
        }
    }

    /**
     * Shadow toggling is locked to enabled in this system.
     * @returns {boolean} Always returns true.
     */
    toggleShadows() {
        this.enabled = true;
        return true;
    }
}
