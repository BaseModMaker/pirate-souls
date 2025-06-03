/**
 * World class for managing world creation and environment
 */
class World {
  /**
   * Create a new game world
   * 
   * @param {Phaser.Scene} scene - The scene this world belongs to
   */
  constructor(scene) {
    this.scene = scene;
    this.width = 3200;
    this.height = 3200;
    this.ambientLight = 0x0a4150; // Dark blue ambient underwater light
    this.background = null;
  }
  
  /**
   * Create the map with the specified background
   * 
   * @param {string} backgroundKey - The key of the background texture to use
   */
  createMap(backgroundKey = 'background') {
    console.log("Creating game world");
    // Create background image or generate one if texture not found
    if (this.scene.textures.exists(backgroundKey)) {
      this.createImageBackground(backgroundKey);
    } else {
      this.createProceduralBackground();
    }
    
    // Set world bounds if using physics
    if (this.scene.physics && this.scene.physics.world) {
      this.scene.physics.world.setBounds(
        -this.width/2, -this.height/2, 
        this.width, this.height
      );
    }
    
    // Create ambient underwater effects
    this.createAmbientEffects();
  }
  
  /**
   * Create a background from an image
   * 
   * @param {string} backgroundKey - The key of the background texture
   */
  createImageBackground(backgroundKey) {
    console.log("Creating image background");
    // Create a repeating background
    this.background = this.scene.add.tileSprite(
      0, 0,
      this.scene.cameras.main.width * 2,
      this.scene.cameras.main.height * 2,
      backgroundKey
    );
    
    // Set depth to ensure it's behind everything else
    this.background.setDepth(-1000);
    
    // Add a blue tint for underwater effect
    this.background.setTint(0x80a0c0);
  }
  
  /**
   * Create a procedural underwater background
   */
  createProceduralBackground() {
    console.log("Creating procedural background");
    // Create a gradient background graphic
    const background = this.scene.add.graphics();
    
    // Fixed: Graphics doesn't have createLinearGradient, so we'll do it manually
    background.clear();
    
    // Create a vertical gradient by drawing rectangles with different colors
    const height = this.height;
    const width = this.width;
    const steps = 20;  // Number of gradient steps
    const stepHeight = height / steps;
    
    for (let i = 0; i < steps; i++) {
      // Calculate color for this step
      // Darker blue as we go deeper
      const blendFactor = i / (steps - 1);
      
      // Start with light blue (#0a6080) and end with dark blue (#0a3050)
      const r = 10; // Red component is constant
      const g = Math.floor(96 - (blendFactor * 48)); // Green from 96 to 48
      const b = Math.floor(128 - (blendFactor * 48)); // Blue from 128 to 80
      
      const color = (r << 16) | (g << 8) | b;
      
      // Draw rectangle for this gradient step
      background.fillStyle(color, 1);
      background.fillRect(
        -width/2, 
        -height/2 + i * stepHeight, 
        width, 
        stepHeight + 1 // Add 1 to avoid gaps
      );
    }
    
    // Set depth to ensure it's behind everything else
    background.setDepth(-1000);
    
    // Store reference
    this.background = background;
  }
  
  /**
   * Create ambient underwater effects like bubbles and particles
   */
  createAmbientEffects() {
    console.log("Creating ambient effects");
    
    // Remove bubble creation entirely
    // this.createSimpleBubbles();
    
    // Create light rays only
    this.createLightRays();
  }
  
  /**
   * Create simple bubble effects without using particle emitter
   * This method is no longer called to prevent infinite bubble spawning
   */
  createSimpleBubbles() {
    // Method kept for reference but no longer called
    // Do not add the recursive timer that was causing infinite spawning
  }
  
  /**
   * Create light rays coming from the water surface
   */
  createLightRays() {
    console.log("Creating light rays");
    
    // Create several light ray graphics for the underwater effect
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(-this.width/2, this.width/2);
      const ray = this.scene.add.graphics();
      
      // Draw a semi-transparent white triangle
      ray.fillStyle(0xffffff, 0.1);
      ray.beginPath();
      ray.moveTo(x, -this.height/2);
      ray.lineTo(x - 100, this.height/2);
      ray.lineTo(x + 100, this.height/2);
      ray.closePath();
      ray.fill();
      
      // Set depth to be just above the background
      ray.setDepth(-999);
      
      // Animate the ray to slowly pulse
      this.scene.tweens.add({
        targets: ray,
        alpha: { from: 0.05, to: 0.15 },
        duration: 3000 + i * 500,
        yoyo: true,
        repeat: -1
      });
    }
  }
  
  /**
   * Update the world
   * 
   * @param {number} time - Current time
   * @param {number} delta - Time since last update
   */
  update(time, delta) {
    // Update world effects if needed
  }
}

export default World;
