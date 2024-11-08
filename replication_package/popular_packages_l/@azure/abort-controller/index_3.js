class AbortError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AbortError';
  }
}

class AbortSignal {
  constructor() {
    this.aborted = false;
    this._listeners = [];
  }

  addEventListener(type, callback) {
    if (type === 'abort') {
      this._listeners.push(callback);
    }
  }

  removeEventListener(type, callback) {
    if (type === 'abort') {
      const idx = this._listeners.indexOf(callback);
      if (idx !== -1) {
        this._listeners.splice(idx, 1);
      }
    }
  }

  _dispatch(type) {
    if (type === 'abort') {
      this.aborted = true;
      this._listeners.forEach(callback => callback({ type: 'abort' }));
    }
  }

  static timeout(ms) {
    const signal = new AbortSignal();
    setTimeout(() => signal._dispatch('abort'), ms);
    return signal;
  }
}

class AbortController {
  constructor() {
    this.signal = new AbortSignal();
  }

  abort() {
    if (!this.signal.aborted) {
      this.signal._dispatch('abort');
    }
  }
}

module.exports = {
  AbortError,
  AbortController,
  AbortSignal,
};
