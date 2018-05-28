import { user } from "user-profile";
import * as Commands from "../../common/commands";

class UserProfile {
  constructor(ui, broker) {
    this.ui = ui; 
    this.broker = broker; 
  }
  
  initialize() {
    // Wait for companion to initialize
    setTimeout(() => {
      this.broker.sendCommand(Commands.UPDATE_USER_SETTINGS, {
        age: user.age,
        restingHeartRate: user.restingHeartRate,
      });
    }, 4000);
    
    console.log(`[FitBit] Initialized user`);
  }
}

export default UserProfile;
