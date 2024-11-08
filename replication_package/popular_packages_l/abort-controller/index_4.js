// abort-controller.js

class AbortSignal {
  constructor() {
    this.aborted = false; // Aborted state
    this.listeners = []; // Event listeners
  }

  addEventListener(event, callback) {
    if (event === 'abort') {
      this.listeners.push(callback);
    }
  }

  emitEvent(event) {
    if (event.type === 'abort') {
      this.listeners.forEach(callback => callback());
    }
  }
}

class AbortController {
  constructor() {
    this.signal = new AbortSignal();
  }

  abort() {
    if (!this.signal.aborted) {
      this.signal.aborted = true;
      this.signal.emitEvent({ type: 'abort' });
    }
  }
}

module.exports = AbortController;

// Example usage
const AbortController = require('./abort-controller');

const controller = new AbortController();
const signal = controller.signal;

signal.addEventListener("abort", () => {
  console.log("aborted!");
});

controller.abort(); // Output: "aborted!"
