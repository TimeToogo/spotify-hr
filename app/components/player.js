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
    
    console.log(`[FitBit] Initialized player page`);
  }
}

export default PlayerPage;
