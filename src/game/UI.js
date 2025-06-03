/**
 * UI class for managing game user interface
 */
class UI {
  /**
   * Create a new UI manager
   * 
   * @param {Phaser.Scene} scene - The scene this UI belongs to
   */
  constructor(scene) {
    this.scene = scene;
    this.elements = {};
    this.score = 0;
  }
  
  /**
   * Create a health bar
   * 
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Width of health bar
   * @returns {UI} - Returns this for chaining
   */
  createHealthBar(x = 20, y = 20, width = 200) {
    // Create background bar
    const bg = this.scene.add.rectangle(x, y, width, 20, 0x333333);
    bg.setOrigin(0, 0.5);
    bg.setScrollFactor(0);
    
    // Create health bar
    const bar = this.scene.add.rectangle(x, y, width, 16, 0x00ff00);
    bar.setOrigin(0, 0.5);
    bar.setScrollFactor(0);
    
    // Create label
    const text = this.scene.add.text(x, y - 16, 'HEALTH', { 
      fontSize: '12px', 
      fill: '#ffffff' 
    });
    text.setOrigin(0, 1);
    text.setScrollFactor(0);
    
    // Store references
    this.elements.healthBg = bg;
    this.elements.healthBar = bar;
    this.elements.healthText = text;
    
    return this;
  }
  
  /**
   * Create a stamina bar
   * 
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Width of stamina bar
   * @returns {UI} - Returns this for chaining
   */
  createStaminaBar(x = 20, y = 50, width = 200) {
    // Create background bar
    const bg = this.scene.add.rectangle(x, y, width, 20, 0x333333);
    bg.setOrigin(0, 0.5);
    bg.setScrollFactor(0);
    
    // Create stamina bar
    const bar = this.scene.add.rectangle(x, y, width, 16, 0x3296ff);
    bar.setOrigin(0, 0.5);
    bar.setScrollFactor(0);
    
    // Create label
    const text = this.scene.add.text(x, y - 16, 'STAMINA', { 
      fontSize: '12px', 
      fill: '#ffffff' 
    });
    text.setOrigin(0, 1);
    text.setScrollFactor(0);
    
    // Store references
    this.elements.staminaBg = bg;
    this.elements.staminaBar = bar;
    this.elements.staminaText = text;
    
    return this;
  }
  
  /**
   * Create a score display
   * 
   * @param {number} x - X position
   * @param {number} y - Y position
   * @returns {UI} - Returns this for chaining
   */
  createScoreDisplay(x = 20, y = 80) {
    const text = this.scene.add.text(x, y, 'SCORE: 0', {
      fontSize: '18px',
      fill: '#ffffff'
    });
    text.setScrollFactor(0);
    
    this.elements.scoreText = text;
    return this;
  }
  
  /**
   * Update the health bar
   * 
   * @param {number} current - Current health
   * @param {number} max - Maximum health
   */
  updateHealthBar(current, max) {
    if (!this.elements.healthBar) return;
    
    const bar = this.elements.healthBar;
    const width = this.elements.healthBg.width;
    const percentage = Math.max(0, Math.min(current / max, 1));
    
    bar.width = width * percentage;
    
    // Change color based on health
    if (percentage < 0.3) {
      bar.fillColor = 0xff0000; // Red
    } else if (percentage < 0.6) {
      bar.fillColor = 0xffff00; // Yellow
    } else {
      bar.fillColor = 0x00ff00; // Green
    }
  }
  
  /**
   * Update the stamina bar
   * 
   * @param {number} current - Current stamina
   * @param {number} max - Maximum stamina
   * @param {boolean} locked - Whether stamina is locked
   */
  updateStaminaBar(current, max, locked = false) {
    if (!this.elements.staminaBar) return;
    
    const bar = this.elements.staminaBar;
    const width = this.elements.staminaBg.width;
    const percentage = Math.max(0, Math.min(current / max, 1));
    
    bar.width = width * percentage;
    
    // Change color based on lock status
    bar.fillColor = locked ? 0xff3232 : 0x3296ff;
  }
  
  /**
   * Update the score display
   * 
   * @param {number} points - Points to add to score
   */
  updateScore(points) {
    this.score += points;
    
    if (this.elements.scoreText) {
      this.elements.scoreText.setText(`SCORE: ${this.score}`);
      
      // Flash score text
      this.scene.tweens.add({
        targets: this.elements.scoreText,
        scale: { from: 1.2, to: 1 },
        duration: 200
      });
    }
  }
  
  /**
   * Show a temporary game message
   * 
   * @param {string} message - Message to show
   * @param {number} duration - Duration in ms
   */
  showGameMessage(message, duration = 2000) {
    // Create text in center of screen
    const text = this.scene.add.text(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY,
      message,
      {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center'
      }
    );
    text.setOrigin(0.5);
    text.setScrollFactor(0);
    text.setDepth(1000);
    
    // Animate the message
    this.scene.tweens.add({
      targets: text,
      scale: { from: 0.5, to: 1 },
      alpha: { from: 0, to: 1 },
      duration: 300,
      onComplete: () => {
        this.scene.time.delayedCall(duration - 600, () => {
          this.scene.tweens.add({
            targets: text,
            scale: { from: 1, to: 0.8 },
            alpha: { from: 1, to: 0 },
            duration: 300,
            onComplete: () => text.destroy()
          });
        });
      }
    });
  }
}

export default UI;
