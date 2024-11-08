'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// Utility function to assert conditions.
function assertType(condition, message, ...args) {
    if (!condition) {
        throw new TypeError(format(message, args));
    }
}

// Format messages with arguments.
function format(message, args) {
    let i = 0;
    return message.replace(/%[os]/gu, () => anyToString(args[i++]));
}

// Convert a value to its string representation.
function anyToString(x) {
    return (typeof x !== "object" || x === null) ? String(x) : Object.prototype.toString.call(x);
}

let currentErrorHandler;

// Set error handler function.
function setErrorHandler(value) {
    assertType(typeof value === "function" || value === undefined, 
               "The error handler must be a function or undefined, but got %o.", value);
    currentErrorHandler = value;
}

// Report an error, using handlers or console.
function reportError(maybeError) {
    try {
        const error = maybeError instanceof Error ? maybeError : new Error(anyToString(maybeError));
        if (currentErrorHandler) {
            currentErrorHandler(error);
            return;
        }
        if (typeof dispatchEvent === "function" && typeof ErrorEvent === "function") {
            dispatchEvent(new ErrorEvent("error", { error, message: error.message }));
        }
        else if (typeof process !== "undefined" && typeof process.emit === "function") {
            process.emit("uncaughtException", error);
            return;
        }
        console.error(error);
    } catch (_) {
        // ignore.
    }
}

// Determine global object context.
const Global = typeof window !== "undefined" ? window
              : typeof self !== "undefined" ? self
              : typeof global !== "undefined" ? global
              : typeof globalThis !== "undefined" ? globalThis : undefined;

let currentWarnHandler;

// Set warning handler function.
function setWarningHandler(value) {
    assertType(typeof value === "function" || value === undefined, 
               "The warning handler must be a function or undefined, but got %o.", value);
    currentWarnHandler = value;
}

// Class to handle warnings.
class Warning {
    constructor(code, message) {
        this.code = code;
        this.message = message;
    }
    warn(...args) {
        try {
            if (currentWarnHandler) {
                currentWarnHandler({ ...this, args });
                return;
            }
            const stack = (new Error().stack ?? "").replace(/^(?:.+?\n){2}/gu, "\n");
            console.warn(this.message, ...args, stack);
        } catch (_) {
            // Ignore.
        }
    }
}

const warnings = {
    InitEventWhileDispatch: new Warning("W01", "Unable to initialize event under dispatching."),
    // More warnings defined here...
};

/*eslint-disable class-methods-use-this */
// Event class definition.
class Event {
    // Static properties representing event phases.
    static get NONE() { return NONE; }
    static get CAPTURING_PHASE() { return CAPTURING_PHASE; }
    static get AT_TARGET() { return AT_TARGET; }
    static get BUBBLING_PHASE() { return BUBBLING_PHASE; }

    constructor(type, eventInitDict = {}) {
        Object.defineProperty(this, "isTrusted", { value: false, enumerable: true });
        internalData.set(this, {
            type: String(type),
            bubbles: Boolean(eventInitDict.bubbles),
            cancelable: Boolean(eventInitDict.cancelable),
            composed: Boolean(eventInitDict.composed),
            target: null,
            currentTarget: null,
            stopPropagationFlag: false,
            stopImmediatePropagationFlag: false,
            canceledFlag: false,
            inPassiveListenerFlag: false,
            dispatchFlag: false,
            timeStamp: Date.now(),
        });
    }

    get type() { return internalData.get(this).type; }
    get target() { return internalData.get(this).target; }
    get currentTarget() { return internalData.get(this).currentTarget; }
    composedPath() {
        return internalData.get(this).currentTarget ? [internalData.get(this).currentTarget] : [];
    }
    get eventPhase() { return internalData.get(this).dispatchFlag ? 2 : 0; }
    stopPropagation() { internalData.get(this).stopPropagationFlag = true; }
    get cancelBubble() { return internalData.get(this).stopPropagationFlag; }
    set cancelBubble(value) {
        if (value) {
            internalData.get(this).stopPropagationFlag = true;
        } else {
            warnings.InitEventWhileDispatch.warn();
        }
    }
    stopImmediatePropagation() {
        const data = internalData.get(this);
        data.stopPropagationFlag = data.stopImmediatePropagationFlag = true;
    }
    get bubbles() { return internalData.get(this).bubbles; }
    get cancelable() { return internalData.get(this).cancelable; }
    get returnValue() { return !internalData.get(this).canceledFlag; }
    set returnValue(value) {
        if (!value) setCancelFlag(internalData.get(this));
    }
    preventDefault() { setCancelFlag(internalData.get(this)); }
    get defaultPrevented() { return internalData.get(this).canceledFlag; }
    get composed() { return internalData.get(this).composed; }
    get isTrusted() { return false; }
    get timeStamp() { return internalData.get(this).timeStamp; }

    initEvent(type, bubbles = false, cancelable = false) {
        const data = internalData.get(this);
        if (data.dispatchFlag) {
            warnings.InitEventWhileDispatch.warn();
            return;
        }
        internalData.set(this, {
            ...data,
            type: String(type),
            bubbles: Boolean(bubbles),
            cancelable: Boolean(cancelable),
            target: null,
            currentTarget: null,
            stopPropagationFlag: false,
            stopImmediatePropagationFlag: false,
            canceledFlag: false,
        });
    }
}

// Constants for event phases.
const NONE = 0;
const CAPTURING_PHASE = 1;
const AT_TARGET = 2;
const BUBBLING_PHASE = 3;

// Internal data storage.
const internalData = new WeakMap();

// Helper function to access internal data.
function $(event) {
    const data = internalData.get(event);
    assertType(data != null, "'this' must be an Event object");
    return data;
}

// Function to set the canceled flag properly.
function setCancelFlag(data) {
    if (data.inPassiveListenerFlag) {
        warnings.InitEventWhileDispatch.warn();
        return;
    }
    if (!data.cancelable) {
        warnings.InitEventWhileDispatch.warn();
        return;
    }
    data.canceledFlag = true;
}

// Define enumerable properties for static methods on Event.
Object.defineProperty(Event, "NONE", { enumerable: true });
Object.defineProperty(Event, "CAPTURING_PHASE", { enumerable: true });
Object.defineProperty(Event, "AT_TARGET", { enumerable: true });
Object.defineProperty(Event, "BUBBLING_PHASE", { enumerable: true });

if (typeof Global !== "undefined" && typeof Global.Event !== "undefined") {
    Object.setPrototypeOf(Event.prototype, Global.Event.prototype);
}

// Define InvalidStateError creation function.
function createInvalidStateError(message) {
    if (Global.DOMException) {
        return new Global.DOMException(message, "InvalidStateError");
    }
    if (DOMException == null) {
        DOMException = class DOMException extends Error {
            constructor(msg) {
                super(msg);
                if (Error.captureStackTrace) {
                    Error.captureStackTrace(this, DOMException);
                }
            }
            get code() { return 11; }
            get name() { return "InvalidStateError"; }
        };
        Object.defineProperties(DOMException.prototype, {
            code: { enumerable: true },
            name: { enumerable: true },
        });
        defineErrorCodeProperties(DOMException);
        defineErrorCodeProperties(DOMException.prototype);
    }
    return new DOMException(message);
}

// Define error codes.
let DOMException;
const ErrorCodeMap = {
    INDEX_SIZE_ERR: 1,
    DOMSTRING_SIZE_ERR: 2,
    HIERARCHY_REQUEST_ERR: 3,
    // More error codes...
};

// Define error code properties on given object.
function defineErrorCodeProperties(obj) {
    for (let key of Object.keys(ErrorCodeMap)) {
        Object.defineProperty(obj, key, {
            get() { return ErrorCodeMap[key]; },
            configurable: true,
            enumerable: true,
        });
    }
}

// EventWrapper class wraps an event to control states.
class EventWrapper extends Event {
    static wrap(event) {
        return new (getWrapperClassOf(event))(event);
    }
    constructor(event) {
        super(event.type, {
            bubbles: event.bubbles,
            cancelable: event.cancelable,
            composed: event.composed,
        });
        if (event.cancelBubble) super.stopPropagation();
        if (event.defaultPrevented) super.preventDefault();
        internalDataWrapper.set(this, { original: event });

        // Redirect accessors to original properties.
        for (let key of Object.keys(event)) {
            if (!(key in this)) {
                Object.defineProperty(this, key, defineRedirectDescriptor(event, key));
            }
        }
    }

    stopPropagation() {
        super.stopPropagation();
        const { original } = $$wrapper(this);
        if ("stopPropagation" in original) original.stopPropagation();
    }

    get cancelBubble() {
        return super.cancelBubble;
    }
    set cancelBubble(value) {
        super.cancelBubble = value;
        const { original } = $$wrapper(this);
        if ("cancelBubble" in original) original.cancelBubble = value;
    }

    stopImmediatePropagation() {
        super.stopImmediatePropagation();
        const { original } = $$wrapper(this);
        if ("stopImmediatePropagation" in original) original.stopImmediatePropagation();
    }

    get returnValue() {
        return super.returnValue;
    }
    set returnValue(value) {
        super.returnValue = value;
        const { original } = $$wrapper(this);
        if ("returnValue" in original) original.returnValue = value;
    }

    preventDefault() {
        super.preventDefault();
        const { original } = $$wrapper(this);
        if ("preventDefault" in original) original.preventDefault();
    }

    get timeStamp() {
        const { original } = $$wrapper(this);
        if ("timeStamp" in original) return original.timeStamp;
        return super.timeStamp;
    }
}

const internalDataWrapper = new WeakMap();

function $$wrapper(event) {
    const data = internalDataWrapper.get(event);
    assertType(data != null, "'this' is expected to be an EventWrapper object");
    return data;
}

const wrapperClassCache = new WeakMap();
wrapperClassCache.set(Object.prototype, EventWrapper);
if (typeof Global !== "undefined" && typeof Global.Event !== "undefined") {
    wrapperClassCache.set(Global.Event.prototype, EventWrapper);
}

function getWrapperClassOf(originalEvent) {
    const prototype = Object.getPrototypeOf(originalEvent);
    if (prototype == null) {
        return EventWrapper;
    }
    let wrapper = wrapperClassCache.get(prototype);
    if (wrapper == null) {
        wrapper = defineWrapper(getWrapperClassOf(prototype), prototype);
        wrapperClassCache.set(prototype, wrapper);
    }
    return wrapper;
}

function defineWrapper(BaseEventWrapper, originalPrototype) {
    class CustomEventWrapper extends BaseEventWrapper { }
    for (let key of Object.keys(originalPrototype)) {
        Object.defineProperty(CustomEventWrapper.prototype, key, defineRedirectDescriptor(originalPrototype, key));
    }
    return CustomEventWrapper;
}

function defineRedirectDescriptor(obj, key) {
    const descriptor = Object.getOwnPropertyDescriptor(obj, key);
    return {
        get() {
            const original = $$wrapper(this).original;
            const value = original[key];
            return typeof value === "function" ? value.bind(original) : value;
        },
        set(value) {
            $$wrapper(this).original[key] = value;
        },
        configurable: descriptor.configurable,
        enumerable: descriptor.enumerable,
    };
}

// Create listener with given parameters.
function createListener(callback, capture, passive, once, signal, signalListener) {
    return {
        callback,
        flags: (capture ? 1 : 0) | (passive ? 2 : 0) | (once ? 4 : 0),
        signal,
        signalListener,
    };
}

function setRemoved(listener) {
    listener.flags |= 8;
}

function isCapture(listener) {
    return (listener.flags & 1) === 1;
}

function isPassive(listener) {
    return (listener.flags & 2) === 2;
}

function isOnce(listener) {
    return (listener.flags & 4) === 4;
}

function isRemoved(listener) {
    return (listener.flags & 8) === 8;
}

function invokeCallback({ callback }, target, event) {
    try {
        if (typeof callback === "function") {
            callback.call(target, event);
        } else if (typeof callback.handleEvent === "function") {
            callback.handleEvent(event);
        }
    } catch (error) {
        reportError(error);
    }
}

// Helper functions to work with listener list.
function findIndexOfListener({ listeners }, callback, capture) {
    return listeners.findIndex(listener => listener.callback === callback && isCapture(listener) === capture);
}

function addListener(list, callback, capture, passive, once, signal) {
    let signalListener;
    if (signal) {
        signalListener = removeListener.bind(null, list, callback, capture);
        signal.addEventListener("abort", signalListener);
    }
    const listener = createListener(callback, capture, passive, once, signal, signalListener);
    if (list.cow) {
        list.cow = false;
        list.listeners = [...list.listeners, listener];
    } else {
        list.listeners.push(listener);
    }
    return listener;
}

function removeListener(list, callback, capture) {
    const index = findIndexOfListener(list, callback, capture);
    if (index !== -1) {
        return removeListenerAt(list, index);
    }
    return false;
}

function removeListenerAt(list, index, disableCow = false) {
    const listener = list.listeners[index];
    setRemoved(listener);
    if (listener.signal) {
        listener.signal.removeEventListener("abort", listener.signalListener);
    }
    if (list.cow && !disableCow) {
        list.cow = false;
        list.listeners = list.listeners.filter((_, i) => i !== index);
        return false;
    }
    list.listeners.splice(index, 1);
    return true;
}

// Listener list management.
function createListenerListMap() {
    return Object.create(null);
}

function ensureListenerList(listenerMap, type) {
    return listenerMap[type] ?? (listenerMap[type] = { attrCallback: undefined, attrListener: undefined, cow: false, listeners: [] });
}

// EventTarget class implementing EventTarget interface.
class EventTarget {
    constructor() {
        internalTargetData.set(this, createListenerListMap());
    }

    addEventListener(type0, callback0, options0) {
        const listenerMap = internalTargetData.get(this);
        const { callback, capture, once, passive, signal, type } = normalizeAddOptions(type0, callback0, options0);
        if (callback == null || signal?.aborted) return;

        const list = ensureListenerList(listenerMap, type);
        if (findIndexOfListener(list, callback, capture) !== -1) {
            warnDuplicate(list.listeners[i], passive, once, signal);
            return;
        }
        addListener(list, callback, capture, passive, once, signal);
    }

    removeEventListener(type0, callback0, options0) {
        const listenerMap = internalTargetData.get(this);
        const { callback, capture, type } = normalizeOptions(type0, callback0, options0);
        const list = listenerMap[type];
        if (callback != null && list) {
            removeListener(list, callback, capture);
        }
    }

    dispatchEvent(e) {
        const list = internalTargetData.get(this)[String(e.type)];
        if (list == null) return true;

        const event = e instanceof Event ? e : EventWrapper.wrap(e);
        const eventData = $(event, "event");
        if (eventData.dispatchFlag) throw createInvalidStateError("This event has been in dispatching.");

        eventData.dispatchFlag = true;
        eventData.target = eventData.currentTarget = this;
        if (!eventData.stopPropagationFlag) {
            const { cow, listeners } = list;
            list.cow = true;
            for (let i = 0; i < listeners.length; ++i) {
                const listener = listeners[i];
                if (isRemoved(listener)) continue;
                if (isOnce(listener) && removeListenerAt(list, i, !cow)) i -= 1;

                eventData.inPassiveListenerFlag = isPassive(listener);
                invokeCallback(listener, this, event);
                eventData.inPassiveListenerFlag = false;
                if (eventData.stopImmediatePropagationFlag) break;
            }
            if (!cow) list.cow = false;
        }
        eventData.target = null;
        eventData.currentTarget = null;
        eventData.stopImmediatePropagationFlag = false;
        eventData.stopPropagationFlag = false;
        eventData.dispatchFlag = false;
        return !eventData.canceledFlag;
    }
}

const internalTargetData = new WeakMap();

function $$2(target, name = "this") {
    const data = internalTargetData.get(target);
    assertType(data != null, `'${name}' must be an EventTarget object`);
    return data;
}

function normalizeAddOptions(type, callback, options) {
    assertCallback(callback);
    if (typeof options === "object" && options !== null) {
        return {
            type: String(type),
            callback: callback ?? undefined,
            capture: Boolean(options.capture),
            passive: Boolean(options.passive),
            once: Boolean(options.once),
            signal: options.signal ?? undefined,
        };
    }
    return { type: String(type), callback: callback ?? undefined, capture: Boolean(options), passive: false, once: false, signal: undefined };
}

function normalizeOptions(type, callback, options) {
    assertCallback(callback);
    if (typeof options === "object" && options !== null) {
        return { type: String(type), callback: callback ?? undefined, capture: Boolean(options.capture) };
    }
    return { type: String(type), callback: callback ?? undefined, capture: Boolean(options) };
}

function assertCallback(callback) {
    if (callback == null || 
        typeof callback !== "function" && 
        (typeof callback !== "object" || typeof callback.handleEvent !== "function")) {
        if (callback == null || typeof callback === "object") {
            InvalidEventListener.warn(callback);
            return;
        }
        throw new TypeError(format(InvalidEventListener.message, [callback]));
    }
}

function warnDuplicate(listener, passive, once, signal) {
    EventListenerWasDuplicated.warn(isCapture(listener) ? "capture" : "bubble", listener.callback);
    if (isPassive(listener) !== passive) OptionWasIgnored.warn("passive");
    if (isOnce(listener) !== once) OptionWasIgnored.warn("once");
    if (listener.signal !== signal) OptionWasIgnored.warn("signal");
}

const keys$1 = Object.getOwnPropertyNames(EventTarget.prototype);
for (let key of keys$1) {
    if (key !== "constructor") Object.defineProperty(EventTarget.prototype, key, { enumerable: true });
}

if (typeof Global !== "undefined" && typeof Global.EventTarget !== "undefined") {
    Object.setPrototypeOf(EventTarget.prototype, Global.EventTarget.prototype);
}

// Manage event attributes.
function getEventAttributeValue(target, type) {
    const listMap = $$2(target, "target");
    return listMap[type]?.attrCallback ?? null;
}

function setEventAttributeValue(target, type, callback) {
    if (callback != null && typeof callback !== "function") {
        InvalidAttributeHandler.warn(callback);
    }
    if (typeof callback === "function" || (typeof callback === "object" && callback !== null)) {
        upsertEventAttributeListener(target, type, callback);
    } else {
        removeEventAttributeListener(target, type);
    }
}

function upsertEventAttributeListener(target, type, callback) {
    const list = ensureListenerList($$2(target, "target"), String(type));
    list.attrCallback = callback;
    if (list.attrListener == null) {
        list.attrListener = addListener(list, defineEventAttributeCallback(list), false, false, false, undefined);
    }
}

function removeEventAttributeListener(target, type) {
    const listMap = $$2(target, "target");
    const list = listMap[String(type)];
    if (list && list.attrListener) {
        removeListener(list, list.attrListener.callback, false);
        list.attrCallback = list.attrListener = undefined;
    }
}

function defineEventAttributeCallback(list) {
    return function (event) {
        const callback = list.attrCallback;
        if (typeof callback === "function") {
            callback.call(this, event);
        }
    };
}

// Define a custom event target class based on given types.
function defineCustomEventTarget(...types) {
    class CustomEventTarget extends EventTarget { }

    for (let type of types) {
        defineEventAttribute(CustomEventTarget.prototype, type);
    }
    return CustomEventTarget;
}

function defineEventAttribute(target, type, _eventClass) {
    Object.defineProperty(target, `on${type}`, {
        get() { return getEventAttributeValue(this, type); },
        set(value) { setEventAttributeValue(this, type, value); },
        configurable: true,
        enumerable: true,
    });
}

exports.Event = Event;
exports.EventTarget = EventTarget;
exports.default = EventTarget;
exports.defineCustomEventTarget = defineCustomEventTarget;
exports.defineEventAttribute = defineEventAttribute;
exports.getEventAttributeValue = getEventAttributeValue;
exports.setErrorHandler = setErrorHandler;
exports.setEventAttributeValue = setEventAttributeValue;
exports.setWarningHandler = setWarningHandler;
