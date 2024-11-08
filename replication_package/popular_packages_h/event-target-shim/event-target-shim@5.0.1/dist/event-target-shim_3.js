'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class EventWrapper {
    constructor(eventTarget, event) {
        this.initPrivateData(eventTarget, event);
        Object.defineProperty(this, "isTrusted", { value: false, enumerable: true });
        this.defineAccessors(event);
    }

    initPrivateData(eventTarget, event) {
        const data = {
            eventTarget,
            event,
            eventPhase: EventWrapper.AT_TARGET,
            currentTarget: eventTarget,
            canceled: false,
            stopped: false,
            immediateStopped: false,
            passiveListener: null,
            timeStamp: event.timeStamp || Date.now(),
        };
        EventWrapper.privateData.set(this, data);
    }

    defineAccessors(event) {
        Object.keys(event).forEach(key => {
            if (!(key in this)) {
                Object.defineProperty(this, key, EventWrapper.createPropertyDescriptor(key));
            }
        });
    }

    static createPropertyDescriptor(key) {
        return {
            get() { return EventWrapper.getPrivateData(this).event[key]; },
            set(value) { EventWrapper.getPrivateData(this).event[key] = value; },
            configurable: true,
            enumerable: true,
        };
    }

    static getPrivateData(event) {
        const data = EventWrapper.privateData.get(event);
        console.assert(data, `'this' is expected an Event object, but got ${event}`);
        return data;
    }

    static setCancelFlag(data) {
        if (data.passiveListener) {
            console.error('Unable to preventDefault inside passive event listener invocation.', data.passiveListener);
            return;
        }
        if (!data.event.cancelable) return;
        data.canceled = true;
        if (data.event.preventDefault) data.event.preventDefault();
    }

    get type() { return EventWrapper.getPrivateData(this).event.type; }
    get target() { return EventWrapper.getPrivateData(this).eventTarget; }
    get currentTarget() { return EventWrapper.getPrivateData(this).currentTarget; }
    get eventPhase() { return EventWrapper.getPrivateData(this).eventPhase; }
    
    composedPath() {
        const currentTarget = EventWrapper.getPrivateData(this).currentTarget;
        return currentTarget ? [currentTarget] : [];
    }

    stopPropagation() {
        const data = EventWrapper.getPrivateData(this);
        data.stopped = true;
        if (data.event.stopPropagation) data.event.stopPropagation();
    }

    stopImmediatePropagation() {
        const data = EventWrapper.getPrivateData(this);
        data.stopped = true;
        data.immediateStopped = true;
        if (data.event.stopImmediatePropagation) data.event.stopImmediatePropagation();
    }

    get bubbles() { return Boolean(EventWrapper.getPrivateData(this).event.bubbles); }
    get cancelable() { return Boolean(EventWrapper.getPrivateData(this).event.cancelable); }
    preventDefault() { EventWrapper.setCancelFlag(EventWrapper.getPrivateData(this)); }
    get defaultPrevented() { return EventWrapper.getPrivateData(this).canceled; }
    get composed() { return Boolean(EventWrapper.getPrivateData(this).event.composed); }
    get timeStamp() { return EventWrapper.getPrivateData(this).timeStamp; }
    get srcElement() { return EventWrapper.getPrivateData(this).eventTarget; }
    get cancelBubble() { return EventWrapper.getPrivateData(this).stopped; }
    set cancelBubble(value) { if (value) this.stopPropagation(); }
    get returnValue() { return !EventWrapper.getPrivateData(this).canceled; }
    set returnValue(value) { if (!value) this.preventDefault(); }
    
    initEvent() {}

    static setEventPhase(event, phase) {
        EventWrapper.getPrivateData(event).eventPhase = phase;
    }

    static setCurrentTarget(event, currentTarget) {
        EventWrapper.getPrivateData(event).currentTarget = currentTarget;
    }

    static setPassiveListener(event, passiveListener) {
        EventWrapper.getPrivateData(event).passiveListener = passiveListener;
    }
}
EventWrapper.privateData = new WeakMap();
EventWrapper.NONE = 0;
EventWrapper.CAPTURING_PHASE = 1;
EventWrapper.AT_TARGET = 2;
EventWrapper.BUBBLING_PHASE = 3;

class EventTargetWrapper {
    constructor() {
        this.listeners = new Map();
    }

    addEventListener(eventName, listener, options = {}) {
        if (!listener) return;
        const capture = typeof options === 'object' ? !!options.capture : !!options;
        const listenerType = capture ? EventTargetWrapper.CAPTURE : EventTargetWrapper.BUBBLE;
        
        let node = this.listeners.get(eventName);
        if (!node) {
            this.listeners.set(eventName, { listener, listenerType, passive: !!options.passive, once: !!options.once, next: null });
            return;
        }

        while (node) {
            if (node.listener === listener && node.listenerType === listenerType) return;
            if (!node.next) {
                node.next = { listener, listenerType, passive: !!options.passive, once: !!options.once, next: null };
                return;
            }
            node = node.next;
        }
    }

    removeEventListener(eventName, listener, options = {}) {
        if (!listener) return;
        const capture = typeof options === 'object' ? !!options.capture : !!options;
        const listenerType = capture ? EventTargetWrapper.CAPTURE : EventTargetWrapper.BUBBLE;
        
        let node = this.listeners.get(eventName);
        let prev = null;
        while (node) {
            if (node.listener === listener && node.listenerType === listenerType) {
                if (prev) prev.next = node.next;
                else if (node.next) this.listeners.set(eventName, node.next);
                else this.listeners.delete(eventName);
                return;
            }
            prev = node;
            node = node.next;
        }
    }

    dispatchEvent(event) {
        if (!event || typeof event.type !== 'string') throw new TypeError('"event.type" should be a string.');
        const node = this.listeners.get(event.type);
        if (!node) return true;

        const wrappedEvent = new EventWrapper(this, event);
        let currNode = node;
        while (currNode) {
            if (currNode.once) this.removeEventListener(event.type, currNode.listener);
            EventWrapper.setPassiveListener(wrappedEvent, currNode.passive ? currNode.listener : null);
            try {
                if (typeof currNode.listener === "function") {
                    currNode.listener.call(this, wrappedEvent);
                } else if (currNode.listener && typeof currNode.listener.handleEvent === "function") {
                    currNode.listener.handleEvent(wrappedEvent);
                }
            } catch (err) {
                console.error(err);
            }

            if (wrappedEvent.stopImmediate) break;
            currNode = currNode.next;
        }
        EventWrapper.setPassiveListener(wrappedEvent, null);
        EventWrapper.setEventPhase(wrappedEvent, 0);
        EventWrapper.setCurrentTarget(wrappedEvent, null);

        return !wrappedEvent.defaultPrevented;
    }
}
EventTargetWrapper.CAPTURE = 1;
EventTargetWrapper.BUBBLE = 2;

function defineEventAttribute(eventTargetPrototype, eventName) {
    Object.defineProperty(eventTargetPrototype, `on${eventName}`, {
        get: function() { return this.listeners.get(eventName)?.listener || null; },
        set: function(listener) {
            if (!listener) listener = null;
            this.addEventListener(eventName, listener);
        },
        configurable: true,
        enumerable: true,
    });
}

exports.EventTarget = EventTargetWrapper;
exports.defineEventAttribute = defineEventAttribute;

module.exports = EventTargetWrapper;
module.exports.EventTarget = exports["default"] = EventTargetWrapper;
module.exports.defineEventAttribute = defineEventAttribute;
