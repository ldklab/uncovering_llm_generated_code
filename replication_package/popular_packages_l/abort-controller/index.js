// abort-controller.js

class AbortSignal {
  constructor() {
    this.aborted = false; // Initially not aborted
    this._listeners = []; // Store event listeners
  }

  addEventListener(event, listener) {
    if (event === 'abort') {
      this._listeners.push(listener);
    }
  }

  dispatchEvent(event) {
    if (event.type === 'abort') {
      this._listeners.forEach(listener => listener());
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
      this.signal.dispatchEvent({ type: 'abort' }); // Trigger abort event
    }
  }
}

module.exports = AbortController;

// Example use
const AbortController = require('./abort-controller');

const controller = new AbortController();
const signal = controller.signal;

signal.addEventListener("abort", () => {
  console.log("aborted!");
});

controller.abort(); // This will trigger the "aborted!" log
