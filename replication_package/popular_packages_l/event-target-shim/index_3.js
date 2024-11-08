// event-target-shim.js

class EventShim {
  constructor(type, options = {}) {
    this.type = type;
    this.cancelable = !!options.cancelable;
    this.defaultPrevented = false;
  }

  preventDefault() {
    if (this.cancelable) {
      this.defaultPrevented = true;
    } else {
      console.warn('Ignored as event is passive.');
    }
  }
}

class EventTargetShim {
  constructor() {
    this.listeners = {};
  }

  addEventListener(type, listener, options = {}) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }

    const listenerOptions = typeof options === 'boolean' ? { capture: options } : options;

    if (listenerOptions.signal) {
      listenerOptions.signal.addEventListener('abort', () => {
        this.removeEventListener(type, listener);
      });
    }

    this.listeners[type].push({ listener, options: listenerOptions });
  }

  removeEventListener(type, listener) {
    if (!this.listeners[type]) return;
    this.listeners[type] = this.listeners[type].filter(entry => entry.listener !== listener);
  }

  dispatchEvent(event) {
    const registeredListeners = this.listeners[event.type] || [];
    for (const { listener, options } of registeredListeners) {
      if (options.once) {
        this.removeEventListener(event.type, listener);
      }
      listener.call(this, event);
    }
  }
}

module.exports = {
  EventShim,
  EventTargetShim,
};
