import * as Commands from "../../common/commands";

class Logo {
  constructor(app) {
    this.app = app;
  }
  
  initialize() {
    const app = this.app;
    
    app.broker.registerHandler(Commands.LOGO_CLICK, () => {
      switch(app.state.page) {
        case 'playlists':
        case 'volume':
        case 'menu':
          app.state.page = 'player';
          app.updateUi();
          return;
          
        default:
          app.broker.runCommandHandlers(Commands.OPEN_MENU);
          return;
      }
    });
    
    console.log(`[Companion] Initialized logo`);
  }
}

export default Logo;
