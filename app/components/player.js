import * as Commands from "../../common/commands";

class PlayerPage {
  constructor(ui, broker) {
    this.ui = ui; 
    this.broker = broker; 
  }
  
  initialize() {
    const ui = this.ui;
    
    ui.elements.page.player.backButton.onclick = () => {
      this.broker.sendCommand(Commands.PREVIOUS_TRACK);
    }

    ui.elements.page.player.playButton.onclick = () => {
      this.broker.sendCommand(Commands.PLAY_MUSIC);
    }

    ui.elements.page.player.pauseButton.onclick = () => {
      this.broker.sendCommand(Commands.PAUSE_MUSIC);
    }

    ui.elements.page.player.nextButton.onclick = () => {
      this.broker.sendCommand(Commands.NEXT_TRACK);
    }

    ui.elements.page.player.menuButton.onclick = () => {
      this.broker.sendCommand(Commands.OPEN_MENU);
    }

    ui.elements.page.player.heartRateShuffleButton.onclick = () => {
      this.broker.sendCommand(Commands.TOGGLE_HEART_RATE_SHUFFLE);
    }
    
    setInterval(() => this.updateProgressBar(), 1000);
    
    console.log(`[FitBit] Initialized player page`);
  }
  
  updateProgressBar() {
    this.ui.renderPlayerProgressBar(this.getCurrentTrackProgress());
  }
  
  getCurrentTrackProgress() {
    if (!this.ui.currentState || !this.ui.currentState.playerPage || !this.ui.currentState.playerPage.progressMs) {
      return null;
    }
    
    const durationSinceUpdate = this.ui.currentState.playerPage.isPlaying
      ? new Date().getTime() - this.ui.currentState.playerPage.recievedUpdateAt
      : 0;
    
    const progress = (this.ui.currentState.playerPage.progressMs + durationSinceUpdate) / this.ui.currentState.playerPage.durationMs;
    
    return Math.min(1, progress);
  }
}

export default PlayerPage;
