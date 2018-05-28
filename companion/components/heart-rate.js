import * as Commands from "../../common/commands";

class HearRateTracker {
  constructor(app) {
    this.app = app;
  }
  
  initialize() {
    this.app.broker.registerHandler(Commands.UPDATE_HEART_RATE, (heartRate) => {
      this.app.state.currentHeartRate = heartRate;
      this.app.updateUi();
    });
    
    console.log(`[Companion] Initialized heart rate monitor`);
  }
}

export default HearRateTracker;
