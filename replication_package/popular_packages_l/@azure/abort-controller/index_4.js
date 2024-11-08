class AbortError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AbortError';
  }
}

class AbortSignal {
  constructor() {
    this.aborted = false;
    this.listeners = [];
  }

  addEventListener(event, listener) {
    if (event === 'abort') {
      this.listeners.push(listener);
    }
  }

  removeEventListener(event, listener) {
    if (event === 'abort') {
      const idx = this.listeners.indexOf(listener);
      if (idx !== -1) {
        this.listeners.splice(idx, 1);
      }
    }
  }

  _triggerAbort() {
    if (!this.aborted) {
      this.aborted = true;
      this.listeners.forEach(listener => listener({ type: 'abort' }));
    }
  }

  static timeout(ms) {
    const signal = new AbortSignal();
    setTimeout(() => signal._triggerAbort(), ms);
    return signal;
  }
}

class AbortController {
  constructor() {
    this.signal = new AbortSignal();
  }

  abort() {
    this.signal._triggerAbort();
  }
}

module.exports = {
  AbortError,
  AbortSignal,
  AbortController,
};
