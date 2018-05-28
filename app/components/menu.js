import * as Commands from "../../common/commands";

class Menu {
  constructor(ui, broker) {
    this.ui = ui;
    this.broker = broker; 
  }
  
  initialize() {
    const ui = this.ui;
    
    ui.elements.page.menu.playerButton.onclick = () => {
      this.broker.sendCommand(Commands.SELECT_PAGE, 'player');
    };
    
    ui.elements.page.menu.playlistsButton.onclick = () => {
      this.broker.sendCommand(Commands.SELECT_PAGE, 'playlists');
    };
    
    ui.elements.page.menu.volumeButton.onclick = () => {
      this.broker.sendCommand(Commands.SELECT_PAGE, 'volume');
    };
    
    console.log(`[FitBit] Initialized menu`);
  }
}

export default Menu;
