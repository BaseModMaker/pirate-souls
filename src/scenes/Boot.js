import { Scene } from 'phaser';

class Boot extends Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Add loading text
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '32px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Create loading bar
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
    
    // Loading progress events
    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });
    
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      console.log('All assets loaded');
    });

    // Load initial assets
    this.loadInitialAssets();
  }

  loadInitialAssets() {
    // Base paths for assets (equivalent to pygame paths setup)
    const fontPath = 'assets/fonts/';
    const imagePath = 'assets/images/';
    const soundPath = 'assets/sounds/';
    
    console.log('Loading initial assets...');
    
    // Load fonts
    this.load.image('font_title', `${fontPath}title_font.png`);
    
    // Load essential images needed for boot/loading
    this.load.image('logo', `${imagePath}/ui/logo.png`);
    this.load.image('background', `${imagePath}/ui/start_background.png`);
    
    // Load essential sounds
    this.load.audio('menu_select', `${soundPath}/menu_select.wav`);
  }

  create() {
    console.log('Boot scene completed');
    
    // Check the device performance to set quality settings
    // (equivalent to performance_mode in pygame)
    const fps = this.game.loop.actualFps;
    let performanceMode = 1; // Default to high performance
    
    if (fps < 30 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      performanceMode = 0; // Lower settings for mobile/low performance devices
      console.log('Detected lower performance device, adjusting settings');
      
      // Apply lower quality settings
      this.game.renderer.setPixelRatio(1);
      this.scale.setZoom(1);
    }
    
    // Store performance mode in registry for other scenes to use
    this.registry.set('performanceMode', performanceMode);
    
    // Start the main game scene
    this.scene.start('GameScene');
  }
}

export default Boot;
