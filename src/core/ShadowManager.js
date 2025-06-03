/**
 * Class to manage shadow configurations across game objects.
 * Translated from pygame ShadowManager class.
 */
class ShadowManager {
  /**
   * Initialize the shadow manager
   * 
   * @param {boolean} enabled - Whether shadows are enabled by default
   */
  constructor(enabled = true) {
    this.enabled = enabled;
    this.gameObjects = []; // List of objects using this shadow manager
  }

  /**
   * Register a game object to be managed by this shadow manager
   * 
   * @param {object} obj - GameObject or Entity with a configureShadow method
   */
  registerObject(obj) {
    if (!this.gameObjects.includes(obj)) {
      this.gameObjects.push(obj);
    }
  }

  /**
   * Register multiple game objects at once
   * 
   * @param {Array} objects - List of GameObjects or Entities with configureShadow methods
   */
  registerObjects(objects) {
    for (const obj of objects) {
      this.registerObject(obj);
    }
  }

  /**
   * Update shadows for all registered objects based on sun position
   * 
   * @param {object} sun - Sun object with horizontalAngle and verticalAngle properties
   */
  updateAll(sun) {
    for (const obj of this.gameObjects) {
      if (obj && typeof obj.configureShadow === 'function') {
        obj.configureShadow(
          sun.horizontalAngle, 
          sun.verticalAngle,
          this.enabled
        );
      }
    }
  }

  /**
   * Set whether shadows are enabled
   * 
   * @param {boolean} enabled - Whether shadows should be enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    
    // Update all objects with the new shadow state
    for (const obj of this.gameObjects) {
      if (obj && typeof obj.configureShadow === 'function') {
        obj.configureShadow(
          obj.sunHorizontalAngle || 45,
          obj.sunVerticalAngle || 45,
          enabled
        );
      }
    }
  }

  /**
   * Toggle functionality is disabled, shadows are always enabled
   * 
   * @return {boolean} - Always returns true
   */
  toggleShadows() {
    this.enabled = true;
    return true;
  }

  /**
   * Remove an object from the shadow manager
   * 
   * @param {object} obj - The object to remove
   */
  unregisterObject(obj) {
    const index = this.gameObjects.indexOf(obj);
    if (index !== -1) {
      this.gameObjects.splice(index, 1);
    }
  }

  /**
   * Clear all registered objects
   */
  clear() {
    this.gameObjects = [];
  }

  /**
   * Check if an object is registered with this manager
   * 
   * @param {object} obj - The object to check
   * @return {boolean} - True if the object is registered
   */
  hasObject(obj) {
    return this.gameObjects.includes(obj);
  }

  /**
   * Get the current number of registered objects
   * 
   * @return {number} - Count of registered objects
   */
  getObjectCount() {
    return this.gameObjects.length;
  }
}

export default ShadowManager;
