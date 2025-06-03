import { Scene } from 'phaser';

class GameOver extends Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create() {
    console.log("Game Over scene created");
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Game over text
    this.add.text(width/2, height/2 - 100, 'GAME OVER', {
      fontFamily: 'Arial',
      fontSize: '64px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);
    
    // Score display
    const score = this.registry.get('score') || 0;
    this.add.text(width/2, height/2, `Score: ${score}`, {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // Restart prompt
    this.add.text(width/2, height/2 + 100, 'Click or press any key to try again', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    // Listen for restart inputs
    this.input.keyboard.once('keydown', this.restartGame, this);
    this.input.once('pointerdown', this.restartGame, this);
  }
  
  restartGame() {
    console.log("Restarting game");
    this.scene.start('GameScene');
  }
}

export default GameOver;
