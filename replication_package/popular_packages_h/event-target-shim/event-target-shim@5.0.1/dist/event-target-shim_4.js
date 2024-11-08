'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const privateData = new WeakMap();
const wrappers = new WeakMap();

class Event {
    constructor(eventTarget, event) {
        privateData.set(this, {
            eventTarget,
            event,
            eventPhase: 2,
            currentTarget: eventTarget,
            canceled: false,
            stopped: false,
            immediateStopped: false,
            passiveListener: null,
            timeStamp: event.timeStamp || Date.now(),
        });
        Object.defineProperty(this, "isTrusted", { value: false, enumerable: true });

        Object.keys(event).forEach(key => {
            if (!(key in this)) {
                Object.defineProperty(this, key, defineRedirectDescriptor(key));
            }
        });
    }

    get type() {
        return pd(this).event.type;
    }
    
    get target() {
        return pd(this).eventTarget;
    }
    
    get currentTarget() {
        return pd(this).currentTarget;
    }
    
    composedPath() {
        const currentTarget = pd(this).currentTarget;
        return currentTarget == null ? [] : [currentTarget];
    }

    get NONE() {
        return 0;
    }

    get CAPTURING_PHASE() {
        return 1;
    }

    get AT_TARGET() {
        return 2;
    }

    get BUBBLING_PHASE() {
        return 3;
    }

    stopPropagation() {
        const data = pd(this);
        data.stopped = true;
        if (typeof data.event.stopPropagation === "function") {
            data.event.stopPropagation();
        }
    }

    stopImmediatePropagation() {
        const data = pd(this);
        data.stopped = true;
        data.immediateStopped = true;
        if (typeof data.event.stopImmediatePropagation === "function") {
            data.event.stopImmediatePropagation();
        }
    }

    get bubbles() {
        return Boolean(pd(this).event.bubbles);
    }

    get cancelable() {
        return Boolean(pd(this).event.cancelable);
    }

    preventDefault() {
        setCancelFlag(pd(this));
    }

    get defaultPrevented() {
        return pd(this).canceled;
    }

    get composed() {
        return Boolean(pd(this).event.composed);
    }

    get timeStamp() {
        return pd(this).timeStamp;
    }

    get srcElement() {
        return pd(this).eventTarget;
    }

    get cancelBubble() {
        return pd(this).stopped;
    }
    set cancelBubble(value) {
        if (!value) return;
        const data = pd(this);
        data.stopped = true;
        if (typeof data.event.cancelBubble === "boolean") {
            data.event.cancelBubble = true;
        }
    }

    get returnValue() {
        return !pd(this).canceled;
    }
    set returnValue(value) {
        if (!value) {
            setCancelFlag(pd(this));
        }
    }

    initEvent() { }
}

Object.defineProperty(Event.prototype, "constructor", {
    value: Event,
    configurable: true,
    writable: true,
});

if (typeof window !== "undefined" && typeof window.Event !== "undefined") {
    Object.setPrototypeOf(Event.prototype, window.Event.prototype);
    wrappers.set(window.Event.prototype, Event);
}

function pd(event) {
    const retv = privateData.get(event);
    console.assert(retv != null, "'this' is expected an Event object, but got", event);
    return retv;
}

function setCancelFlag(data) {
    if (data.passiveListener != null) {
        if (typeof console !== "undefined" && typeof console.error === "function") {
            console.error("Unable to preventDefault inside passive event listener invocation.", data.passiveListener);
        }
        return;
    }
    if (!data.event.cancelable) {
        return;
    }
    data.canceled = true;
    if (typeof data.event.preventDefault === "function") {
        data.event.preventDefault();
    }
}

function defineRedirectDescriptor(key) {
    return {
        get() {
            return pd(this).event[key];
        },
        set(value) {
            pd(this).event[key] = value;
        },
        configurable: true,
        enumerable: true,
    };
}

class EventTarget {
    constructor() {
        listenersMap.set(this, new Map());
    }

    addEventListener(eventName, listener, options) {
        if (!listener) return;
        if (typeof listener !== "function" && !isObject(listener)) {
            throw new TypeError("'listener' should be a function or an object.");
        }

        const listeners = getListeners(this);
        const optionsIsObj = isObject(options);
        const capture = optionsIsObj ? Boolean(options.capture) : Boolean(options);
        const listenerType = capture ? CAPTURE : BUBBLE;
        const newNode = {
            listener,
            listenerType,
            passive: optionsIsObj && Boolean(options.passive),
            once: optionsIsObj && Boolean(options.once),
            next: null,
        };

        let node = listeners.get(eventName);
        if (!node) {
            listeners.set(eventName, newNode);
            return;
        }

        let prev = null;
        while (node) {
            if (node.listener === listener && node.listenerType === listenerType) return;

            prev = node;
            node = node.next;
        }

        prev.next = newNode;
    }

    removeEventListener(eventName, listener, options) {
        if (!listener) return;

        const listeners = getListeners(this);
        const capture = isObject(options) ? Boolean(options.capture) : Boolean(options);
        const listenerType = capture ? CAPTURE : BUBBLE;

        let prev = null;
        let node = listeners.get(eventName);
        while (node) {
            if (node.listener === listener && node.listenerType === listenerType) {
                if (prev) prev.next = node.next;
                else if (node.next) listeners.set(eventName, node.next);
                else listeners.delete(eventName);
                return;
            }

            prev = node;
            node = node.next;
        }
    }

    dispatchEvent(event) {
        if (!event || typeof event.type !== "string") {
            throw new TypeError('"event.type" should be a string.');
        }

        const listeners = getListeners(this);
        const eventName = event.type;
        let node = listeners.get(eventName);
        if (!node) return true;

        const wrappedEvent = wrapEvent(this, event);

        let prev = null;
        while (node) {
            if (node.once) {
                if (prev) prev.next = node.next;
                else if (node.next) listeners.set(eventName, node.next);
                else listeners.delete(eventName);
            } else prev = node;

            setPassiveListener(wrappedEvent, node.passive ? node.listener : null);
            if (typeof node.listener === "function") {
                try {
                    node.listener.call(this, wrappedEvent);
                } catch (err) {
                    if (typeof console !== "undefined" && typeof console.error === "function") {
                        console.error(err);
                    }
                }
            } else if (node.listenerType !== ATTRIBUTE && typeof node.listener.handleEvent === "function") {
                node.listener.handleEvent(wrappedEvent);
            }

            if (isStopped(wrappedEvent)) break;

            node = node.next;
        }
        setPassiveListener(wrappedEvent, null);
        setEventPhase(wrappedEvent, 0);
        setCurrentTarget(wrappedEvent, null);

        return !wrappedEvent.defaultPrevented;
    }
}

Object.defineProperty(EventTarget.prototype, "constructor", {
    value: EventTarget,
    configurable: true,
    writable: true,
});

if (typeof window !== "undefined" && typeof window.EventTarget !== "undefined") {
    Object.setPrototypeOf(EventTarget.prototype, window.EventTarget.prototype);
}

const listenersMap = new WeakMap();

const CAPTURE = 1;
const BUBBLE = 2;
const ATTRIBUTE = 3;

function isObject(x) {
    return x !== null && typeof x === "object";
}

function getListeners(eventTarget) {
    const listeners = listenersMap.get(eventTarget);
    if (!listeners) {
        throw new TypeError("'this' is expected an EventTarget object, but got another value.");
    }
    return listeners;
}

function wrapEvent(eventTarget, event) {
    const Wrapper = getWrapper(Object.getPrototypeOf(event));
    return new Wrapper(eventTarget, event);
}

function isStopped(event) {
    return pd(event).immediateStopped;
}

function setEventPhase(event, eventPhase) {
    pd(event).eventPhase = eventPhase;
}

function setCurrentTarget(event, currentTarget) {
    pd(event).currentTarget = currentTarget;
}

function setPassiveListener(event, passiveListener) {
    pd(event).passiveListener = passiveListener;
}

exports.EventTarget = EventTarget;
exports.default = EventTarget;
