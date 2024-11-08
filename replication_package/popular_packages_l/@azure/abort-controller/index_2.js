class AbortError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AbortError';
  }
}

class AbortSignal {
  constructor() {
    this.aborted = false;
    this._abortEventListeners = [];
  }

  addEventListener(event, listener) {
    if (event === 'abort') {
      this._abortEventListeners.push(listener);
    }
  }

  removeEventListener(event, listener) {
    if (event === 'abort') {
      const index = this._abortEventListeners.indexOf(listener);
      if (index !== -1) {
        this._abortEventListeners.splice(index, 1);
      }
    }
  }

  _dispatchEvent(event) {
    if (event === 'abort') {
      this.aborted = true;
      this._abortEventListeners.forEach(listener => listener({ type: 'abort' }));
    }
  }

  static timeout(ms) {
    const signal = new AbortSignal();
    setTimeout(() => {
      signal._dispatchEvent('abort');
    }, ms);
    return signal;
  }
}

class AbortController {
  constructor() {
    this.signal = new AbortSignal();
  }

  abort() {
    if (!this.signal.aborted) {
      this.signal._dispatchEvent('abort');
    }
  }
}

module.exports = {
  AbortError,
  AbortController,
  AbortSignal,
};
