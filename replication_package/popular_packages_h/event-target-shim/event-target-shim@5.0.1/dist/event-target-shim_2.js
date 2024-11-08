'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const privateData = new WeakMap();
const wrappers = new WeakMap();

function pd(event) {
    const retv = privateData.get(event);
    console.assert(
        retv != null,
        "'this' is expected an Event object, but got",
        event
    );
    return retv;
}

function setCancelFlag(data) {
    if (data.passiveListener != null) {
        console.error(
            "Unable to preventDefault inside passive event listener invocation.",
            data.passiveListener
        );
        return;
    }
    if (!data.event.cancelable) return;
    data.canceled = true;
    if (typeof data.event.preventDefault === "function") {
        data.event.preventDefault();
    }
}

function Event(eventTarget, event) {
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

    const keys = Object.keys(event);
    for (let i = 0; i < keys.length; ++i) {
        const key = keys[i];
        if (!(key in this)) {
            Object.defineProperty(this, key, defineRedirectDescriptor(key));
        }
    }
}

Event.prototype = {
    get type() { return pd(this).event.type; },
    get target() { return pd(this).eventTarget; },
    get currentTarget() { return pd(this).currentTarget; },
    composedPath() {
        const currentTarget = pd(this).currentTarget;
        return currentTarget == null ? [] : [currentTarget];
    },
    get NONE() { return 0; },
    get CAPTURING_PHASE() { return 1; },
    get AT_TARGET() { return 2; },
    get BUBBLING_PHASE() { return 3; },
    get eventPhase() { return pd(this).eventPhase; },
    stopPropagation() {
        const data = pd(this);
        data.stopped = true;
        if (typeof data.event.stopPropagation === "function") {
            data.event.stopPropagation();
        }
    },
    stopImmediatePropagation() {
        const data = pd(this);
        data.stopped = true;
        data.immediateStopped = true;
        if (typeof data.event.stopImmediatePropagation === "function") {
            data.event.stopImmediatePropagation();
        }
    },
    get bubbles() { return Boolean(pd(this).event.bubbles); },
    get cancelable() { return Boolean(pd(this).event.cancelable); },
    preventDefault() { setCancelFlag(pd(this)); },
    get defaultPrevented() { return pd(this).canceled; },
    get composed() { return Boolean(pd(this).event.composed); },
    get timeStamp() { return pd(this).timeStamp; },
    get srcElement() { return pd(this).eventTarget; },
    get cancelBubble() { return pd(this).stopped; },
    set cancelBubble(value) {
        if (!value) return;
        const data = pd(this);
        data.stopped = true;
        if (typeof data.event.cancelBubble === "boolean") {
            data.event.cancelBubble = true;
        }
    },
    get returnValue() { return !pd(this).canceled; },
    set returnValue(value) {
        if (!value) { setCancelFlag(pd(this)); }
    },
    initEvent() {}
};

Object.defineProperty(Event.prototype, "constructor", {
    value: Event,
    configurable: true,
    writable: true,
});

if (typeof window !== "undefined" && typeof window.Event !== "undefined") {
    Object.setPrototypeOf(Event.prototype, window.Event.prototype);
    wrappers.set(window.Event.prototype, Event);
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

function defineCallDescriptor(key) {
    return {
        value() {
            const event = pd(this).event;
            return event[key].apply(event, arguments);
        },
        configurable: true,
        enumerable: true,
    };
}

function defineWrapper(BaseEvent, proto) {
    const keys = Object.keys(proto);
    if (!keys.length) return BaseEvent;

    function CustomEvent(eventTarget, event) {
        BaseEvent.call(this, eventTarget, event);
    }

    CustomEvent.prototype = Object.create(BaseEvent.prototype, {
        constructor: { value: CustomEvent, configurable: true, writable: true },
    });

    keys.forEach(key => {
        if (!(key in BaseEvent.prototype)) {
            const descriptor = Object.getOwnPropertyDescriptor(proto, key);
            Object.defineProperty(
                CustomEvent.prototype,
                key,
                typeof descriptor.value === "function"
                    ? defineCallDescriptor(key)
                    : defineRedirectDescriptor(key)
            );
        }
    });

    return CustomEvent;
}

function getWrapper(proto) {
    if (!proto || proto === Object.prototype) return Event;

    let wrapper = wrappers.get(proto);
    if (!wrapper) {
        wrapper = defineWrapper(getWrapper(Object.getPrototypeOf(proto)), proto);
        wrappers.set(proto, wrapper);
    }
    return wrapper;
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
        throw new TypeError(
            "'this' is expected an EventTarget object, but got another value."
        );
    }
    return listeners;
}

function defineEventAttributeDescriptor(eventName) {
    return {
        get() {
            const listeners = getListeners(this);
            let node = listeners.get(eventName);
            while (node) {
                if (node.listenerType === ATTRIBUTE) {
                    return node.listener;
                }
                node = node.next;
            }
            return null;
        },
        set(listener) {
            if (typeof listener !== "function" && !isObject(listener)) {
                listener = null;
            }
            const listeners = getListeners(this);
            let prev = null;
            let node = listeners.get(eventName);
            while (node) {
                if (node.listenerType === ATTRIBUTE) {
                    if (prev) {
                        prev.next = node.next;
                    } else if (node.next) {
                        listeners.set(eventName, node.next);
                    } else {
                        listeners.delete(eventName);
                    }
                    break;
                }
                prev = node;
                node = node.next;
            }
            if (listener) {
                const newNode = {
                    listener,
                    listenerType: ATTRIBUTE,
                    passive: false,
                    once: false,
                    next: null,
                };
                if (!prev) {
                    listeners.set(eventName, newNode);
                } else {
                    prev.next = newNode;
                }
            }
        },
        configurable: true,
        enumerable: true,
    };
}

function defineEventAttribute(eventTargetPrototype, eventName) {
    Object.defineProperty(
        eventTargetPrototype,
        `on${eventName}`,
        defineEventAttributeDescriptor(eventName)
    );
}

function defineCustomEventTarget(eventNames) {
    function CustomEventTarget() {
        EventTarget.call(this);
    }

    CustomEventTarget.prototype = Object.create(EventTarget.prototype, {
        constructor: {
            value: CustomEventTarget,
            configurable: true,
            writable: true,
        },
    });

    eventNames.forEach(eventName => {
        defineEventAttribute(CustomEventTarget.prototype, eventName);
    });

    return CustomEventTarget;
}

function EventTarget() {
    if (this instanceof EventTarget) {
        listenersMap.set(this, new Map());
        return;
    }
    if (arguments.length === 1 && Array.isArray(arguments[0])) {
        return defineCustomEventTarget(arguments[0]);
    }
    if (arguments.length) {
        const types = Array.from(arguments);
        return defineCustomEventTarget(types);
    }
    throw new TypeError("Cannot call a class as a function");
}

EventTarget.prototype = {
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
            if (node.listener === listener && node.listenerType === listenerType) {
                return;
            }
            prev = node;
            node = node.next;
        }

        prev.next = newNode;
    },
    removeEventListener(eventName, listener, options) {
        if (!listener) return;

        const listeners = getListeners(this);
        const capture = isObject(options) ? Boolean(options.capture) : Boolean(options);
        const listenerType = capture ? CAPTURE : BUBBLE;

        let prev = null;
        let node = listeners.get(eventName);
        while (node) {
            if (node.listener === listener && node.listenerType === listenerType) {
                if (prev) {
                    prev.next = node.next;
                } else if (node.next) {
                    listeners.set(eventName, node.next);
                } else {
                    listeners.delete(eventName);
                }
                return;
            }
            prev = node;
            node = node.next;
        }
    },
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
                if (prev) {
                    prev.next = node.next;
                } else if (node.next) {
                    listeners.set(eventName, node.next);
                } else {
                    listeners.delete(eventName);
                }
            } else {
                prev = node;
            }

            setPassiveListener(
                wrappedEvent,
                node.passive ? node.listener : null
            );
            if (typeof node.listener === "function") {
                try {
                    node.listener.call(this, wrappedEvent);
                } catch (err) {
                    console.error(err);
                }
            } else if (
                node.listenerType !== ATTRIBUTE &&
                typeof node.listener.handleEvent === "function"
            ) {
                node.listener.handleEvent(wrappedEvent);
            }

            if (isStopped(wrappedEvent)) break;
            node = node.next;
        }
        setPassiveListener(wrappedEvent, null);
        setEventPhase(wrappedEvent, 0);
        setCurrentTarget(wrappedEvent, null);

        return !wrappedEvent.defaultPrevented;
    },
};

Object.defineProperty(EventTarget.prototype, "constructor", {
    value: EventTarget,
    configurable: true,
    writable: true,
});

if (typeof window !== "undefined" && typeof window.EventTarget !== "undefined") {
    Object.setPrototypeOf(EventTarget.prototype, window.EventTarget.prototype);
}

exports.defineEventAttribute = defineEventAttribute;
exports.EventTarget = EventTarget;
exports.default = EventTarget;

module.exports = EventTarget;
module.exports.EventTarget = module.exports["default"] = EventTarget;
module.exports.defineEventAttribute = defineEventAttribute;
//# sourceMappingURL=event-target-shim.js.map
