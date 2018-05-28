import { HeartRateSensor } from "heart-rate";
import { user } from "user-profile";
import * as Commands from "../../common/commands";

class HearRateTracker {
  constructor(ui, broker) {
    this.ui = ui; 
    this.broker = broker; 
  }
  
  initialize() {
    this.monitor = new HeartRateSensor({frequency: 1});

    setInterval(() => this.onReading(), 10 * 1000);
    this.monitor.onreading = () => this.ui.renderHeartRate(this.monitor.heartRate);
    this.monitor.start();
    
    console.log(`[FitBit] Initialized heart rate monitor`);
  }
  
  onReading() {
    this.broker.sendCommand(Commands.UPDATE_HEART_RATE, this.monitor.heartRate);
  }
}

export default HearRateTracker;
