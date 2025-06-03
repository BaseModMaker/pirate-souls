/**
 * Manager for multiple bubble particles.
 * Extends the functionality of the Bubble class.
 */
import Bubble from './Bubble';

class BubbleManager {
  /**
   * Initialize a bubble manager
   * 
   * @param {Phaser.Scene} scene - The scene this manager belongs to
   * @param {object} options - Optional settings
   */
  constructor(scene, options = {}) {
    this.scene = scene;
    this.bubbles = [];
    
    // Default options
    this.options = {
      maxBubbles: 50,
      emitFrequency: 5, // Bubbles per second
      ...options
    };
    
    // Create graphics object for all bubbles
    this.graphics = scene.add.graphics();
    
    // Counter for emission timing
    this.emitCounter = 0;
  }
  
  /**
   * Add a new bubble to the manager
   * 
   * @param {Bubble} bubble - Bubble to add
   */
  addBubble(bubble) {
    // If we reached max bubbles, remove the oldest one
    if (this.bubbles.length >= this.options.maxBubbles) {
      this.bubbles.shift(); // Remove the first/oldest bubble
    }
    
    this.bubbles.push(bubble);
  }
  
  /**
   * Create a burst of bubbles at a specific position
   * 
   * @param {number} x - X position to emit from
   * @param {number} y - Y position to emit from
   * @param {number} count - Number of bubbles to emit
   * @param {object} options - Optional bubble settings
   */
  emitBurst(x, y, count = 10, options = {}) {
    for (let i = 0; i < count; i++) {
      const bubble = Bubble.createRandom(this.scene, x, y, options);
      this.addBubble(bubble);
    }
  }
  
  /**
   * Create bubbles continuously from a point
   * 
   * @param {number} x - X position to emit from
   * @param {number} y - Y position to emit from
   * @param {number} delta - Time elapsed (ms)
   * @param {object} options - Optional bubble settings
   */
  emit(x, y, delta, options = {}) {
    // Calculate how many bubbles to emit based on frequency and delta time
    this.emitCounter += delta * this.options.emitFrequency / 1000;
    
    // Emit whole number of bubbles
    const bubblesThisFrame = Math.floor(this.emitCounter);
    this.emitCounter -= bubblesThisFrame;
    
    // Create the bubbles
    for (let i = 0; i < bubblesThisFrame; i++) {
      const offsetX = Phaser.Math.Between(-10, 10);
      const offsetY = Phaser.Math.Between(-5, 5);
      const bubble = Bubble.createRandom(this.scene, x + offsetX, y + offsetY, options);
      this.addBubble(bubble);
    }
  }
  
  /**
   * Update all bubbles
   * 
   * @param {number} delta - Time elapsed since last update (ms)
   */
  update(delta) {
    let i = 0;
    while (i < this.bubbles.length) {
      if (!this.bubbles[i].update(delta)) {
        // Remove dead bubbles
        this.bubbles.splice(i, 1);
      } else {
        i++;
      }
    }
    
    // Redraw all bubbles
    this.render();
  }
  
  /**
   * Render all bubbles
   */
  render() {
    this.graphics.clear();
    
    for (const bubble of this.bubbles) {
      // Set fill style for this bubble
      this.graphics.fillStyle(0xffffff, bubble.alphaValue);
      this.graphics.fillCircle(bubble.x, bubble.y, bubble.size);
    }
  }
  
  /**
   * Clear all bubbles
   */
  clear() {
    this.bubbles = [];
    this.graphics.clear();
  }
  
  /**
   * Destroy the bubble manager and its resources
   */
  destroy() {
    this.bubbles = [];
    if (this.graphics) {
      this.graphics.destroy();
    }
  }
}

export default BubbleManager;
