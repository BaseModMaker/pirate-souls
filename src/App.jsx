import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import './App.css';

// Import core game components
import BootScene from './scenes/Boot';
import GameScene from './scenes/Game';
import GameOverScene from './scenes/GameOver';

function App() {
  const gameRef = useRef(null);
  
  useEffect(() => {
    // Create the game configuration
    const config = {
      type: Phaser.AUTO,
      parent: 'phaser-container',
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#0a4150',
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      scene: [BootScene, GameScene, GameOverScene],
      pixelArt: true,
      roundPixels: true
    };
    
    // Destroy any existing game instance
    if (gameRef.current) {
      gameRef.current.destroy(true);
    }
    
    // Create new game instance with our translated pygame components
    gameRef.current = new Phaser.Game(config);
    
    console.log("Abyssal Gears: Depths of Iron and Steam initialized");
    
    // Handle window resize
    const resizeGame = () => {
      if (gameRef.current) {
        gameRef.current.scale.resize(window.innerWidth, window.innerHeight);
      }
    };
    
    window.addEventListener('resize', resizeGame);
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', resizeGame);
      if (gameRef.current) {
        gameRef.current.destroy(true);
      }
    };
  }, []);
  
  return (
    <div className="App">
      <div id="phaser-container"></div>
      <div className="game-ui">
        {/* Game UI elements can be added here if needed */}
      </div>
    </div>
  );
}

export default App;
