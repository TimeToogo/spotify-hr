import * as Commands from "../../common/commands";

class PlaylistsPage {
  constructor(ui, broker) {
    this.ui = ui; 
    this.broker = broker; 
  }
  
  initialize() {
    const ui = this.ui;
    
    ui.elements.page.playlists.previousButton.onclick = () => {
      this.broker.sendCommand(Commands.SCROLL_UP_PLAYLIST);
    }

    ui.elements.page.playlists.nextButton.onclick = () => {
      this.broker.sendCommand(Commands.SCROLL_DOWN_PLAYLIST);
    }

    ui.elements.page.playlists.currentButton.onclick = () => {
      this.broker.sendCommand(Commands.SELECT_PLAYLIST);
    }

    ui.elements.page.playlists.doneButton.onclick = () => {
      this.broker.sendCommand(Commands.SELECT_PLAYLIST);
    }

    console.log(`[FitBit] Initialized playlists page`);
  }
}

export default PlaylistsPage;
