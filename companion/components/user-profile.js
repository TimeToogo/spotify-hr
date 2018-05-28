import * as Commands from "../../common/commands";

class UserProfile {
  constructor(app) {
    this.app = app;
  }
  
  initialize() {
    this.app.broker.registerHandler(Commands.UPDATE_USER_SETTINGS, (user) => {
      this.app.state.userAge = user.age;
      this.app.state.restingHeartRate = user.restingHeartRate;
    });
    
    console.log(`[Companion] Initialized user profile`);
  }
}

export default UserProfile;
