import * as Commands from "../../common/commands";

class Logo {
  constructor(ui, broker) {
    this.ui = ui;
    this.broker = broker; 
  }
  
  initialize() {
    const ui = this.ui;
    
    ui.elements.logo.onclick = () => {
      this.broker.sendCommand(Commands.LOGO_CLICK);
    };
    
    console.log(`[FitBit] Initialized logo`);
  }
}

export default Logo;
