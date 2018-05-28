import * as Commands from "../../common/commands";

const HOVER_OPACITY = 0.5;

class OnScreenButtons {
  constructor(ui, broker) {
    this.ui = ui; 
    this.broker = broker; 
  }
  
  initialize() {
    let ui = this.ui;
    
    ui.elements.shared.buttons.forEach(button => {
      let previousOpacity = 1;
      let previousChildOpacity = 1;
      
      button.addEventListener('mousedown', () => {
        previousOpacity = button.style.opacity || 1;
        button.style.opacity = HOVER_OPACITY;
        
        ui.getElementChildren(button).forEach((child) => {
          child.style.opacity = HOVER_OPACITY;
        });
      });
      
      button.addEventListener('mouseup', () => {
        button.style.opacity = previousOpacity;
        
        ui.getElementChildren(button).forEach((child) => {
          child.style.opacity = previousOpacity;
        });
      });
    });
    
    console.log(`[FitBit] Initialized on screen buttons`);
  }
}

export default OnScreenButtons;
