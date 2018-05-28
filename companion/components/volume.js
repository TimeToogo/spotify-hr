import * as Commands from "../../common/commands";

class VolumePage {
  constructor(app) {
    this.app = app;
  }
  
  initialize() {
    const app = this.app;
    
    this.app.broker.registerHandler(Commands.INCREASE_VOLUME, async () => {
      const newVolume = Math.min(100, app.state.playerPage.volumePercent + 10);
      await app.apiClient.setVolume(newVolume);
      app.state.playerPage.volumePercent = newVolume;
      app.updateUi();
    });
    
    this.app.broker.registerHandler(Commands.DECREASE_VOLUME, async () => {
      const newVolume = Math.max(0, app.state.playerPage.volumePercent - 10);
      await app.apiClient.setVolume(newVolume);
      app.state.playerPage.volumePercent = newVolume;
      app.updateUi();
    });

    console.log(`[Companion] Initialized volume page`);
  }
}

export default VolumePage;
