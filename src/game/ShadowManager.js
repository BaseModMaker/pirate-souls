/**
 * Shadow manager for Pirate Souls
 * Translated from pygame ShadowManager class
 */

class ShadowManager {
  constructor(enabled = true) {
    this.enabled = enabled;
    this.objects = [];
  }
  
  registerObject(object) {
    if (!this.objects.includes(object)) {
      this.objects.push(object);
    }
  }
  
  registerObjects(objectsArray) {
    objectsArray.forEach(object => this.registerObject(object));
  }
  
  unregisterObject(object) {
    const index = this.objects.indexOf(object);
    if (index !== -1) {
      this.objects.splice(index, 1);
    }
  }
  
  updateObject(object, sun) {
    if (!this.enabled || !object.shadowEnabled) return;
    
    // Get object height - use display height if available, otherwise 30 as default
    const objectHeight = object.displayHeight || 30;
    
    // Calculate shadow offset
    const shadowOffset = sun.getShadowOffset(objectHeight);
    
    // Store shadow offset in object for rendering
    object.shadowOffsetX = shadowOffset.x;
    object.shadowOffsetY = shadowOffset.y;
  }
  
  updateAll(sun) {
    if (!this.enabled) return;
    
    this.objects.forEach(object => {
      this.updateObject(object, sun);
    });
  }
  
  setEnabled(enabled) {
    this.enabled = enabled;
  }
}

export default ShadowManager;
