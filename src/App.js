import React, { useEffect } from 'react';
import './App.css';

function App() {
  useEffect(() => {
    // This will run when the component mounts
    // Make sure any template demos are removed
    const phaserContainer = document.getElementById('phaser-container');
    if (phaserContainer) {
      // Clear any existing content
      while (phaserContainer.firstChild) {
        phaserContainer.removeChild(phaserContainer.firstChild);
      }
    }
  }, []);

  return (
    <div className="App">
      {/* Container for the Phaser game */}
      <div id="phaser-container"></div>
      
      {/* Optional UI overlay for React elements */}
      <div className="game-ui">
        {/* React UI elements can be added here if needed */}
      </div>
    </div>
  );
}

export default App;
