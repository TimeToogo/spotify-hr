import document from "document";
import * as Commands from "../../common/commands";

class PhysicalButtons {
  constructor(ui, broker) {
    this.ui = ui; 
    this.broker = broker; 
  }
  
  initialize() {
    const ui = this.ui;
    
    document.onkeypress = (e) => {
      console.log(`Key pressed: ${e.key}`);
      
      this.broker.sendCommand(Commands.PHYSICAL_KEY_PRESS, e.key);
    }

    console.log(`[FitBit] Initialized physical buttons`);
  }
}

export default PhysicalButtons;
