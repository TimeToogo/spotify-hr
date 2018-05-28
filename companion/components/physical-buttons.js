import * as Commands from "../../common/commands";

class PhysicalButtons {
  constructor(app) {
    this.app = app;
  }
  
  initialize() {
    const app = this.app;
    
    app.broker.registerHandler(Commands.PHYSICAL_KEY_PRESS, (key) => {
      switch(app.state.page) {
        case 'player':
          switch(key) {
            case 'up':
              app.broker.runCommandHandlers(Commands.NEXT_TRACK);
              return;
            case 'down':
              app.broker.runCommandHandlers(Commands.PREVIOUS_TRACK);
              return;
          }
          return;
        case 'playlists':
          switch(key) {
            case 'up':
              app.broker.runCommandHandlers(Commands.SCROLL_UP_PLAYLIST);
              return;
            case 'down':
              app.broker.runCommandHandlers(Commands.SCROLL_DOWN_PLAYLIST);
              return;
          }
          return;
        case 'volume':
          switch(key) {
            case 'up':
              app.broker.runCommandHandlers(Commands.INCREASE_VOLUME);
              return;
            case 'down':
              app.broker.runCommandHandlers(Commands.DECREASE_VOLUME);
              return;
          }
          return;
      }
    });

    console.log(`[Companion] Initialized physical buttons`);
  }
}

export default PhysicalButtons;
