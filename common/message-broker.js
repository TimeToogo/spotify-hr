import * as messaging from "messaging";

class MessageBroker {
  name = null;
  handlers = {};
  messageQueue = [];
  onConnectionLostHandlers = [];
  onConnectionOpenedHandlers = [];

  constructor(name) {
    this.name = name;
    
    messaging.peerSocket.onopen = this.onSocketOpen.bind(this);
    messaging.peerSocket.onclose = this.onSocketClose.bind(this);
    messaging.peerSocket.onmessage = this.onSocketMessage.bind(this);
    messaging.peerSocket.onerror = this.onSocketError.bind(this);
    messaging.peerSocket.onbufferedamountdecrease = this.onSocketBufferAmountDecrease.bind(this);
    
    setInterval(this.processMessageQueue.bind(this), 1000);
  }
  
  registerHandler(command, handler) {
    if(this.handlers[command]) {
      this.handlers[command].push(handler);
    } else {
      this.handlers[command] = [handler];
    }
  }
  
  sendCommand(command, ...args = []) {
    let data = {
      type: 'command',
      name: command,
      args
    };
    
    this.sendData(data);
    console.log(`${this.name} Sent command: ${JSON.stringify(data)}`);
  }

  onConnectionLost(callback) {
    this.onConnectionLostHandlers.push(callback);
  }

  onConnectionOpened(callback) {
    this.onConnectionOpenedHandlers.push(callback);
  }
  
  runCommandHandlers(command, args) {
    for (let handler of this.handlers[command] || []) {
      handler.apply(null, args);
      console.log(`${this.name} Running command handler for ${command}`);
    }
  }
  
  // Internal
  
  onSocketOpen() {
    console.log(`${this.name} App Socket Open`);
    
    for (let handler of this.onConnectionOpenedHandlers) {
      handler();
    }
  }
  
  onSocketClose() {
    console.log(`${this.name} App Socket Closed`);
    
    for (let handler of this.onConnectionLostHandlers) {
      handler();
    }
  }
  
  onSocketMessage(message) {
    if (message.data.type === 'command') {
      console.log(`${this.name} Recieved command: ${JSON.stringify(message.data)}`);
      this.runCommandHandlers(message.data.name, message.data.args);
    }
  }
  
  onSocketError(error) {
    console.log(`${this.name} App Socket Error: ${JSON.stringify(error)}`);
  }
  
  onSocketBufferAmountDecrease() {
    console.log(`${this.name} Companion Socket Buffer Decrease`);
  }
  
  sendData(data) {
    if (this.messageQueue.length) {
      this.pushToQueue(data);
      return;
    }
    
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
      messaging.peerSocket.send(data);
    } else {
      console.log(`${this.name} Could not set data: ${messaging.peerSocket.readyState}`);
      this.pushToQueue(data);
    }
  }

  pushToQueue(data) {
    this.messageQueue.push(JSON.stringify(data));
  }
  
  processMessageQueue() {
    let queue = this.messageQueue;
    this.messageQueue = [];
    for (let data in queue) {
      this.sendData(JSON.parse(data));
    }
  }
}

export default MessageBroker;