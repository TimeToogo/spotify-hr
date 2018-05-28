import * as Commands from "../../common/commands";

class VolumePage {
  constructor(ui, broker) {
    this.ui = ui; 
    this.broker = broker; 
  }
  
  initialize() {
    const ui = this.ui;
    
    ui.elements.page.volume.increaseButton.onclick = () => {
      this.broker.sendCommand(Commands.INCREASE_VOLUME);
    };
    
    ui.elements.page.volume.decreaseButton.onclick = () => {
      this.broker.sendCommand(Commands.DECREASE_VOLUME);
    };

    ui.elements.page.volume.doneButton.onclick = () => {
      this.broker.sendCommand(Commands.SELECT_PAGE, 'player');
    };
    
    console.log(`[FitBit] Initialized volume page`);
  }
}

export default VolumePage;
