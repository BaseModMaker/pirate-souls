import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import PirateGame from './PirateGame';  // We'll create this file

// Render React app
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// Initialize the game after React has rendered
document.addEventListener('DOMContentLoaded', () => {
  // Start our custom game
  const game = new PirateGame();
});
