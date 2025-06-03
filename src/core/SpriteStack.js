import OutlineManager from './OutlineManager';

/**
 * A class for handling sprite stacking technique rendering.
 * This can be used by any game object that needs sprite stacking visualization.
 * Translated from pygame SpriteStack class.
 */
class SpriteStack {
  /**
   * Initialize a sprite stack
   * 
   * @param {Phaser.Scene} scene - The Phaser scene this sprite stack belongs to
   * @param {string} textureKey - Key of the texture to use
   * @param {number} numLayers - Number of layers to stack
   * @param {number} layerOffset - Vertical pixels between each layer
   * @param {number} defaultWidth - Default width if no image is provided
   * @param {number} defaultHeight - Default height if no image is provided
   * @param {boolean} outlineEnabled - Whether to draw an outline around the sprite
   * @param {number} outlineColor - Color for the outline
   * @param {number} outlineThickness - Thickness of the outline in pixels
   * @param {number} outlineOffset - Offset for the outline
   */
  constructor(scene, textureKey = null, numLayers = 8, layerOffset = 0.5, 
              defaultWidth = 32, defaultHeight = 32, outlineEnabled = false, 
              outlineColor = 0x000000, outlineThickness = 1, outlineOffset = 1) {
    this.scene = scene;
    this.numLayers = numLayers;
    this.layerOffset = layerOffset;
    this.defaultWidth = defaultWidth;
    this.defaultHeight = defaultHeight;
    
    // Layers storage
    this.layerSprites = [];
    this.layerTextures = [];
    this.layerContainer = null;
    
    // Initialize the outline manager
    this.outlineManager = new OutlineManager(
      scene,
      outlineEnabled,
      outlineColor,
      outlineThickness,
      outlineOffset
    );
    
    // Shadow properties
    this.shadowOffsetX = 0;
    this.shadowOffsetY = 0;
    
    // Sun position properties
    this.sunHorizontalAngle = 45;
    this.sunVerticalAngle = 45;
    this.shadowEnabled = true;
    
    // Global scale (matching pygame)
    this.globalScale = 2.0;
    
    // Create the container for all layers
    this.container = this.scene.add.container(0, 0);
    
    // Load texture if provided
    if (textureKey) {
      this.loadTextureKey(textureKey);
    } else {
      this.createDefaultLayers();
    }
  }
  
  /**
   * Load sprite stack from a texture key
   * 
   * @param {string} textureKey - Key of the texture in the Phaser cache
   */
  loadTextureKey(textureKey) {
    // Clear any existing layers
    this.destroyLayers();
    
    // Check if texture exists
    if (!this.scene.textures.exists(textureKey)) {
      console.warn(`Texture ${textureKey} not found, using default layers`);
      this.createDefaultLayers();
      return;
    }
    
    const texture = this.scene.textures.get(textureKey);
    const frame = texture.getSourceImage();
    const frameWidth = frame.width;
    const frameHeight = frame.height;
    const layerHeight = Math.floor(frameHeight / this.numLayers);
    
    // Create a dynamic texture for each layer
    this.width = frameWidth;
    this.height = layerHeight;
    
    // Create layers
    for (let i = 0; i < this.numLayers; i++) {
      // Create a texture for this layer
      const layerKey = `${textureKey}_layer_${i}`;
      
      // Check if we need to create the texture or if it already exists
      if (!this.scene.textures.exists(layerKey)) {
        // Create a new canvas texture for this layer
        this.scene.textures.createCanvas(layerKey, frameWidth, layerHeight);
        const layerTexture = this.scene.textures.get(layerKey);
        const canvas = layerTexture.getSourceImage();
        const ctx = canvas.getContext('2d');
        
        // Calculate y position in the source image for this layer
        // In pygame we start from bottom, in Phaser we start from top
        const yStart = frameHeight - (i + 1) * layerHeight;
        
        // Draw the appropriate part of the source image to this canvas
        ctx.drawImage(
          frame, 
          0, yStart,          // Source position
          frameWidth, layerHeight, // Source dimensions
          0, 0,               // Destination position
          frameWidth, layerHeight  // Destination dimensions
        );
        
        // Update texture
        layerTexture.refresh();
      }
      
      // Create sprite with this texture
      const layerSprite = this.scene.add.sprite(0, 0, layerKey);
      
      // Apply global scale
      layerSprite.setScale(this.globalScale);
      
      // Add to the container with appropriate depth
      this.container.add(layerSprite);
      
      // Store reference to this layer
      this.layerSprites.push(layerSprite);
      this.layerTextures.push(layerKey);
    }
    
    // Set dimensions based on the first layer and global scale
    this.width = frameWidth * this.globalScale;
    this.height = layerHeight * this.globalScale;
  }
  
  /**
   * Create default colored layers when no image is provided
   */
  createDefaultLayers() {
    // Clear any existing layers
    this.destroyLayers();
    
    const colors = [
      0xb4b4c8, // Light gray (top)
      0xa0a0b4,
      0x8c8ca0,
      0x78788c,
      0x646478,
      0x505064,
      0x3c3c50,
      0x28283c  // Dark gray (bottom)
    ];
    
    // Extend colors list if needed
    while (colors.length < this.numLayers) {
      colors.push(colors[colors.length - 1]);
    }
    
    // Create layers
    for (let i = 0; i < this.numLayers; i++) {
      const colorIndex = Math.min(i, colors.length - 1);
      
      // Create a graphics object for this layer
      const layerKey = `default_layer_${i}`;
      
      // Create a sprite with a colored rectangle
      const graphics = this.scene.add.graphics();
      
      // Draw a rectangle with the appropriate color
      const rectWidth = this.defaultWidth * 0.8;
      const rectHeight = this.defaultHeight * 0.8;
      const xOffset = (this.defaultWidth - rectWidth) / 2;
      const yOffset = (this.defaultHeight - rectHeight) / 2;
      
      graphics.fillStyle(colors[colorIndex]);
      graphics.fillRect(xOffset, yOffset, rectWidth, rectHeight);
      
      // Generate a texture from the graphics
      if (!this.scene.textures.exists(layerKey)) {
        graphics.generateTexture(layerKey, this.defaultWidth, this.defaultHeight);
      }
      graphics.destroy();
      
      // Create a sprite with this texture
      const layerSprite = this.scene.add.sprite(0, 0, layerKey);
      
      // Apply global scale
      layerSprite.setScale(this.globalScale);
      
      // Add to the container
      this.container.add(layerSprite);
      
      // Store reference to this layer
      this.layerSprites.push(layerSprite);
      this.layerTextures.push(layerKey);
    }
    
    // Set dimensions based on the default size and global scale
    this.width = this.defaultWidth * this.globalScale;
    this.height = this.defaultHeight * this.globalScale;
  }
  
  /**
   * Destroy all layer sprites and textures
   */
  destroyLayers() {
    // Remove all sprites
    if (this.layerSprites.length > 0) {
      this.layerSprites.forEach(sprite => {
        sprite.destroy();
      });
      this.layerSprites = [];
    }
    
    // Remove container children
    this.container.removeAll();
  }
  
  /**
   * Draw the stacked sprite at the specified position
   * 
   * @param {number} x - X position to draw at
   * @param {number} y - Y position to draw at
   * @param {number} rotation - Rotation angle in degrees
   * @param {boolean} drawShadow - Whether to draw a shadow
   * @param {number} performanceMode - Optimization level (ignored in this version)
   * @param {number} tiltAmount - Amount to tilt the layers (-1 to 1, negative = left tilt)
   */
  draw(x, y, rotation = 0, drawShadow = true, performanceMode = 1, tiltAmount = 0) {
    // Position the container
    this.container.setPosition(x, y);
    this.container.setRotation(rotation * Math.PI / 180);
    
    // Draw shadow if enabled
    if (drawShadow && this.shadowEnabled) {
      this.drawShadow(x, y, rotation);
    }
    
    // Update layer positions for stacking and tilt effect
    const originalX = x;
    
    for (let i = 0; i < this.layerSprites.length; i++) {
      const sprite = this.layerSprites[i];
      
      // Calculate layer factor for tilt effect
      const layerFactor = i / Math.max(1, this.layerSprites.length - 1);
      const horizontalOffset = tiltAmount * layerFactor * 4; // Same tilt multiplier as pygame
      
      // Set layer position with vertical stacking and horizontal tilt
      sprite.setPosition(horizontalOffset, -i * this.layerOffset);
    }
    
    // Draw outline if enabled
    if (this.outlineManager.enabled) {
      this.outlineManager.drawOutline(
        x, y, rotation,
        this.layerSprites, this.width, this.height,
        this.layerSprites.length, this.layerOffset,
        tiltAmount
      );
    }
  }
  
  /**
   * Draw a shadow beneath the sprite based on sun position and object layers
   * 
   * @param {number} x - X position of the object
   * @param {number} y - Y position of the object
   * @param {number} rotation - Rotation angle in degrees
   */
  drawShadow(x, y, rotation) {
    if (!this.shadowEnabled || !this.scene) return;
    
    // Remove any existing shadow
    if (this.shadowContainer) {
      this.shadowContainer.destroy();
    }
    
    // Calculate vertical factor (affects shadow length and intensity)
    // 0° = sun at horizon (long shadows), 90° = sun directly overhead (no shadows)
    const verticalFactor = this.sunVerticalAngle / 90.0;
    
    // Convert horizontal angle to radians for shadow direction calculations
    const horizontalRad = this.sunHorizontalAngle * Math.PI / 180;
    
    // Calculate shadow length based on vertical angle
    // Lower sun = longer shadow (inverse relationship with verticalFactor)
    const baseShadowLength = this.height * (1.0 - verticalFactor) * 2.5;
    
    // Calculate shadow offset based on horizontal angle
    const shadowOffsetX = -Math.sin(horizontalRad) * baseShadowLength;
    const shadowOffsetY = -Math.cos(horizontalRad) * baseShadowLength;
    
    // Calculate shadow opacity based on vertical angle - make shadows darker
    // Higher sun = lighter shadow, but with a higher minimum opacity
    const shadowAlpha = 0.86 * (1.0 - (verticalFactor * 0.3));
    
    // Create shadow container
    this.shadowContainer = this.scene.add.container(x, y);
    
    // Optimization: Use a subset of layers to balance performance and visual quality
    // Use more layers for smaller sprites, fewer for larger ones
    const layerCount = this.layerSprites.length;
    let layerIndices = [];
    
    if (layerCount <= 8) {
      // For few layers, use all of them
      for (let i = 0; i < layerCount; i++) {
        layerIndices.push(i);
      }
    } else {
      // For many layers, sample evenly
      const step = Math.max(1, Math.floor(layerCount / 5)); // At least 5 layers for shadow
      for (let i = 0; i < layerCount; i += step) {
        layerIndices.push(i);
      }
    }
    
    // Create shadow sprites for selected layers
    layerIndices.forEach(i => {
      if (i >= this.layerSprites.length) return;
      
      const originalSprite = this.layerSprites[i];
      const layerTexture = this.layerTextures[i];
      
      // Calculate layer factor based on position in stack (0.0 for bottom, 1.0 for top)
      const layerFactor = i / Math.max(1, layerCount - 1);
      
      // Calculate layer-specific shadow offset
      let layerOffsetX = 0;
      let layerOffsetY = 0;
      
      if (i > 0) {
        // Other layers follow the sun angle
        layerOffsetX = shadowOffsetX * layerFactor * 0.6;
        layerOffsetY = shadowOffsetY * layerFactor * 0.6;
      }
      
      // Create shadow sprite
      const shadowSprite = this.scene.add.sprite(
        layerOffsetX, 
        layerOffsetY, 
        layerTexture
      );
      
      // Make shadow dark and semi-transparent
      shadowSprite.setTint(0x000000);
      shadowSprite.setAlpha(shadowAlpha);
      
      // Apply same scale as original
      shadowSprite.setScale(this.globalScale);
      
      // Apply rotation
      shadowSprite.setRotation(rotation * Math.PI / 180);
      
      // Add to shadow container
      this.shadowContainer.add(shadowSprite);
    });
    
    // Set shadow container depth to ensure it's below the main sprite
    this.shadowContainer.setDepth(this.container.depth - 1);
  }
  
  /**
   * Configure the sun position for shadow calculations
   * 
   * @param {number} horizontalAngle - Horizontal angle of the sun (0-360 degrees)
   * @param {number} verticalAngle - Vertical angle of the sun (0-90 degrees)
   * @param {boolean} shadowEnabled - Whether shadows are enabled at all
   * @return {SpriteStack} Returns self for method chaining
   */
  configureSun(horizontalAngle = 45, verticalAngle = 45, shadowEnabled = true) {
    this.sunHorizontalAngle = horizontalAngle;
    this.sunVerticalAngle = verticalAngle;
    this.shadowEnabled = shadowEnabled;
    return this;
  }
  
  /**
   * Set position of the sprite stack
   * 
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  setPosition(x, y) {
    this.container.setPosition(x, y);
    if (this.shadowContainer) {
      this.shadowContainer.setPosition(x, y);
    }
  }
  
  /**
   * Set rotation of the sprite stack
   * 
   * @param {number} rotation - Rotation angle in degrees
   */
  setRotation(rotation) {
    const rotationRadians = rotation * Math.PI / 180;
    this.container.setRotation(rotationRadians);
    if (this.shadowContainer) {
      this.shadowContainer.setRotation(rotationRadians);
    }
  }
  
  /**
   * Set visibility of the sprite stack
   * 
   * @param {boolean} visible - Whether the sprite stack should be visible
   */
  setVisible(visible) {
    this.container.setVisible(visible);
    if (this.shadowContainer) {
      this.shadowContainer.setVisible(visible);
    }
  }
  
  /**
   * Set depth (rendering order) of the sprite stack
   * 
   * @param {number} depth - The depth value
   */
  setDepth(depth) {
    this.container.setDepth(depth);
    if (this.shadowContainer) {
      this.shadowContainer.setDepth(depth - 1);
    }
  }
  
  /**
   * Destroy the sprite stack and clean up resources
   */
  destroy() {
    // Destroy outline
    if (this.outlineManager) {
      this.outlineManager.destroy();
    }
    
    // Destroy shadow container
    if (this.shadowContainer) {
      this.shadowContainer.destroy();
    }
    
    // Destroy main container and all children
    if (this.container) {
      this.container.destroy();
    }
    
    // Clean up textures
    this.layerTextures.forEach(textureKey => {
      // Only destroy dynamically created textures (those with "layer" in the name)
      if (textureKey.includes('layer') && this.scene.textures.exists(textureKey)) {
        this.scene.textures.remove(textureKey);
      }
    });
    
    this.layerSprites = [];
    this.layerTextures = [];
  }
}

export default SpriteStack;
