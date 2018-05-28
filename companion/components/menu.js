import * as Commands from "../../common/commands";

class Menu {
  constructor(app) {
    this.app = app;
  }
  
  initialize() {
    const app = this.app;
    
    app.broker.registerHandler(Commands.OPEN_MENU, async () => {
      app.state.page = 'menu';
      app.updateUi();
    });
    
    app.broker.registerHandler(Commands.SELECT_PAGE, (page) => {
      app.state.page = page;
      app.updateUi();
    });
    
    console.log(`[Companion] Initialized menu`);
  }
}

export default Menu;
