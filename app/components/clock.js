import * as Commands from "../../common/commands";
import clock from "clock";

class Clock {
  constructor(ui, broker) {
    this.ui = ui;
    this.broker = broker; 
  }
  
  initialize() {
    clock.granularity = "minutes";
    clock.addEventListener('tick', (event) => this.updateClock(event.date));
    this.updateClock(new Date());

    console.log(`[FitBit] Initialized clock`);
  }
  
  updateClock(date) {
    this.ui.elements.page.player.clock.text = 
      this.leftPadZeros(date.getHours() > 12 ? date.getHours() - 12 : date.getHours())
      + ':' 
      + this.leftPadZeros(date.getMinutes())
      + ' '
      + (date.getHours() >= 12 ? 'PM' : 'AM');
  }
  
  leftPadZeros(number) {
    return number < 10 ? '0' + '' + number : number;
  }
}

export default Clock;
