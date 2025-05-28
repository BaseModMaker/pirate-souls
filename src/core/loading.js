import * as PIXI from 'pixi.js';

/**
 * Loading screen manager for displaying asset loading progress
 */
export class LoadingScreen {
    constructor(app) {
        this.app = app;
        this.container = new PIXI.Container();
        this.progressBar = null;
        this.loadingText = null;
        this.isVisible = false;
        
        this.createLoadingScreen();
    }
    
    createLoadingScreen() {
        // Create background
        const background = new PIXI.Graphics();
        background.beginFill(0x0a4265);
        background.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
        background.endFill();
        this.container.addChild(background);
        
        // Create loading text
        this.loadingText = new PIXI.Text('Loading Game Assets...', {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xffffff,
            align: 'center'
        });
        this.loadingText.anchor.set(0.5);
        this.loadingText.x = this.app.screen.width / 2;
        this.loadingText.y = this.app.screen.height / 2 - 50;
        this.container.addChild(this.loadingText);
        
        // Create progress bar background
        const progressBg = new PIXI.Graphics();
        progressBg.beginFill(0x333333);
        progressBg.drawRoundedRect(
            this.app.screen.width / 2 - 150,
            this.app.screen.height / 2,
            300,
            20,
            10
        );
        progressBg.endFill();
        this.container.addChild(progressBg);
        
        // Create progress bar
        this.progressBar = new PIXI.Graphics();
        this.container.addChild(this.progressBar);
    }
    
    show() {
        if (!this.isVisible) {
            this.app.stage.addChild(this.container);
            this.isVisible = true;
        }
    }
    
    hide() {
        if (this.isVisible) {
            this.app.stage.removeChild(this.container);
            this.isVisible = false;
        }
    }
    
    updateProgress(progress, message = 'Loading...') {
        // Update text
        this.loadingText.text = message;
        
        // Update progress bar
        this.progressBar.clear();
        this.progressBar.beginFill(0x3296ff);
        this.progressBar.drawRoundedRect(
            this.app.screen.width / 2 - 150,
            this.app.screen.height / 2,
            300 * Math.max(0, Math.min(1, progress)),
            20,
            10
        );
        this.progressBar.endFill();
    }
    
    destroy() {
        this.hide();
        this.container.destroy();
    }
}
