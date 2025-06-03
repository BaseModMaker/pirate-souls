/**
 * Input handling system for Pirate Souls
 * Translated from pygame InputState and InputHandler classes
 */

class InputState {
  /**
   * Represents the current state of all inputs
   */
  constructor() {
    // Movement keys
    this.forward = false;      // Z/W
    this.backward = false;     // S
    this.turnLeft = false;     // Q/A
    this.turnRight = false;    // D
    this.boostTeleport = false; // SPACE
    
    // System keys
    this.escape = false;       // ESC
    this.performanceToggle = false; // P
    
    // Mouse buttons
    this.leftMouse = false;    // Fire left cannon
    this.rightMouse = false;   // Fire right cannon
    this.middleMouse = false;  
    
    // Special states
    this.anyKeyPressed = false;    // For starting the game
    this.quitRequested = false;
  }
  
  /**
   * Copy state from another InputState
   * 
   * @param {InputState} source - The state to copy from
   */
  copy(source) {
    this.forward = source.forward;
    this.backward = source.backward;
    this.turnLeft = source.turnLeft;
    this.turnRight = source.turnRight;
    this.boostTeleport = source.boostTeleport;
    this.escape = source.escape;
    this.performanceToggle = source.performanceToggle;
    this.leftMouse = source.leftMouse;
    this.rightMouse = source.rightMouse;
    this.middleMouse = source.middleMouse;
    this.anyKeyPressed = source.anyKeyPressed;
    this.quitRequested = source.quitRequested;
  }
}

class InputHandler {
  /**
   * Handles all input processing and converts Phaser inputs to game states
   * 
   * @param {Phaser.Scene} scene - The Phaser scene to handle input for
   */
  constructor(scene) {
    this.scene = scene;
    this.currentState = new InputState();
    this.previousState = new InputState();
    
    // Detect if we're on mobile
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Setup input handlers
    this.setupKeyboardInputs();
    this.setupMouseInputs();
  }
  
  /**
   * Set up keyboard input handlers
   */
  setupKeyboardInputs() {
    // Create key objects for detection
    this.keyMap = this.scene.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      z: Phaser.Input.Keyboard.KeyCodes.Z,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      q: Phaser.Input.Keyboard.KeyCodes.Q,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      esc: Phaser.Input.Keyboard.KeyCodes.ESC,
      p: Phaser.Input.Keyboard.KeyCodes.P
    });
    
    // Handle 'any key' pressed events for starting the game
    this.scene.input.keyboard.on('keydown', () => {
      this.currentState.anyKeyPressed = true;
    });
    
    // Set up specific key event handlers
    this.scene.input.keyboard.on('keyup-ESC', () => {
      this.currentState.quitRequested = true;
    });
    
    this.scene.input.keyboard.on('keyup-P', () => {
      this.currentState.performanceToggle = true;
    });
  }
  
  /**
   * Set up mouse input handlers
   */
  setupMouseInputs() {
    // Track mouse button states
    this.scene.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.currentState.leftMouse = true;
      }
      if (pointer.rightButtonDown()) {
        this.currentState.rightMouse = true;
      }
      if (pointer.middleButtonDown()) {
        this.currentState.middleMouse = true;
      }
      
      // Any pointer down counts as an "any key press" for the start screen
      this.currentState.anyKeyPressed = true;
    });
    
    this.scene.input.on('pointerup', (pointer) => {
      if (pointer.leftButtonReleased()) {
        this.currentState.leftMouse = false;
      }
      if (pointer.rightButtonReleased()) {
        this.currentState.rightMouse = false;
      }
      if (pointer.middleButtonReleased()) {
        this.currentState.middleMouse = false;
      }
    });
  }
  
  /**
   * Update input states based on current Phaser input state
   * Call this method in the scene's update loop
   */
  update() {
    // Store previous state
    this.previousState.copy(this.currentState);
    
    // Reset special states
    this.currentState.anyKeyPressed = false;
    this.currentState.performanceToggle = false;
    this.currentState.quitRequested = false;
    
    // Update movement keys based on keyboard state
    if (this.isMobile) {
      // For mobile, prioritize WASD keys (more common on mobile game controls)
      this.currentState.forward = this.keyMap.w.isDown;
      this.currentState.backward = this.keyMap.s.isDown;
      this.currentState.turnLeft = this.keyMap.a.isDown;
      this.currentState.turnRight = this.keyMap.d.isDown;
    } else {
      // For desktop, check both WASD and ZQSD
      // Prefer ZQSD controls but fall back to WASD
      this.currentState.forward = this.keyMap.z.isDown || this.keyMap.w.isDown;
      this.currentState.backward = this.keyMap.s.isDown;
      this.currentState.turnLeft = this.keyMap.q.isDown || this.keyMap.a.isDown;
      this.currentState.turnRight = this.keyMap.d.isDown;
    }
    
    // Update other keyboard controls
    this.currentState.boostTeleport = this.keyMap.space.isDown;
    this.currentState.escape = this.keyMap.esc.isDown;
  }
}

export { InputState, InputHandler };
