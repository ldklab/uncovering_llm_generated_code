'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function assertType(condition, message, ...args) {
    if (!condition) {
        throw new TypeError(format(message, args));
    }
}

function format(message, args) {
    let i = 0;
    return message.replace(/%[os]/gu, () => anyToString(args[i++]));
}

function anyToString(x) {
    return typeof x !== "object" || x === null ? String(x) : Object.prototype.toString.call(x);
}

let currentErrorHandler;

function setErrorHandler(value) {
    assertType(typeof value === "function" || value === undefined, "The error handler must be a function or undefined, but got %o.", value);
    currentErrorHandler = value;
}

function reportError(maybeError) {
    try {
        const error = maybeError instanceof Error ? maybeError : new Error(anyToString(maybeError));
        if (currentErrorHandler) {
            currentErrorHandler(error);
            return;
        }
        if (typeof dispatchEvent === "function" && typeof ErrorEvent === "function") {
            dispatchEvent(new ErrorEvent("error", { error, message: error.message }));
        } else if (typeof process !== "undefined" && typeof process.emit === "function") {
            process.emit("uncaughtException", error);
        } else {
            console.error(error);
        }
    } catch (_a) {}
}

const Global = typeof window !== "undefined"
    ? window
    : typeof self !== "undefined"
        ? self
        : typeof global !== "undefined"
            ? global
            : typeof globalThis !== "undefined"
                ? globalThis
                : undefined;

let currentWarnHandler;

function setWarningHandler(value) {
    assertType(typeof value === "function" || value === undefined, "The warning handler must be a function or undefined, but got %o.", value);
    currentWarnHandler = value;
}

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
            const stack = (new Error().stack || "").replace(/^(?:.+?\n){2}/gu, "\n");
            console.warn(this.message, ...args, stack);
        } catch (_b) {}
    }
}

const InitEventWasCalledWhileDispatching = new Warning("W01", "Unable to initialize event under dispatching.");
const FalsyWasAssignedToCancelBubble = new Warning("W02", "Assigning any falsy value to 'cancelBubble' property has no effect.");
const TruthyWasAssignedToReturnValue = new Warning("W03", "Assigning any truthy value to 'returnValue' property has no effect.");
const NonCancelableEventWasCanceled = new Warning("W04", "Unable to preventDefault on non-cancelable events.");
const CanceledInPassiveListener = new Warning("W05", "Unable to preventDefault inside passive event listener invocation.");
const EventListenerWasDuplicated = new Warning("W06", "An event listener wasn't added because it has been added already: %o, %o");
const OptionWasIgnored = new Warning("W07", "The %o option value was abandoned because the event listener wasn't added as duplicated.");
const InvalidEventListener = new Warning("W08", "The 'callback' argument must be a function or an object that has 'handleEvent' method: %o");
const InvalidAttributeHandler = new Warning("W09", "Event attribute handler must be a function: %o");

class Event {
    static get NONE() {
        return NONE;
    }
    static get CAPTURING_PHASE() {
        return CAPTURING_PHASE;
    }
    static get AT_TARGET() {
        return AT_TARGET;
    }
    static get BUBBLING_PHASE() {
        return BUBBLING_PHASE;
    }
    constructor(type, eventInitDict) {
        Object.defineProperty(this, "isTrusted", {
            value: false,
            enumerable: true,
        });
        const opts = eventInitDict || {};
        internalDataMap.set(this, {
            type: String(type),
            bubbles: Boolean(opts.bubbles),
            cancelable: Boolean(opts.cancelable),
            composed: Boolean(opts.composed),
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
    get type() {
        return $(this).type;
    }
    get target() {
        return $(this).target;
    }
    get srcElement() {
        return $(this).target;
    }
    get currentTarget() {
        return $(this).currentTarget;
    }
    composedPath() {
        const currentTarget = $(this).currentTarget;
        return currentTarget ? [currentTarget] : [];
    }
    get NONE() {
        return NONE;
    }
    get CAPTURING_PHASE() {
        return CAPTURING_PHASE;
    }
    get AT_TARGET() {
        return AT_TARGET;
    }
    get BUBBLING_PHASE() {
        return BUBBLING_PHASE;
    }
    get eventPhase() {
        return $(this).dispatchFlag ? 2 : 0;
    }
    stopPropagation() {
        $(this).stopPropagationFlag = true;
    }
    get cancelBubble() {
        return $(this).stopPropagationFlag;
    }
    set cancelBubble(value) {
        if (value) {
            $(this).stopPropagationFlag = true;
        } else {
            FalsyWasAssignedToCancelBubble.warn();
        }
    }
    stopImmediatePropagation() {
        const data = $(this);
        data.stopPropagationFlag = data.stopImmediatePropagationFlag = true;
    }
    get bubbles() {
        return $(this).bubbles;
    }
    get cancelable() {
        return $(this).cancelable;
    }
    get returnValue() {
        return !$(this).canceledFlag;
    }
    set returnValue(value) {
        if (!value) {
            setCancelFlag($(this));
        } else {
            TruthyWasAssignedToReturnValue.warn();
        }
    }
    preventDefault() {
        setCancelFlag($(this));
    }
    get defaultPrevented() {
        return $(this).canceledFlag;
    }
    get composed() {
        return $(this).composed;
    }
    get isTrusted() {
        return false;
    }
    get timeStamp() {
        return $(this).timeStamp;
    }
    initEvent(type, bubbles = false, cancelable = false) {
        const data = $(this);
        if (data.dispatchFlag) {
            InitEventWasCalledWhileDispatching.warn();
            return;
        }
        internalDataMap.set(this, {
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

const NONE = 0;
const CAPTURING_PHASE = 1;
const AT_TARGET = 2;
const BUBBLING_PHASE = 3;

const internalDataMap = new WeakMap();

function $(event, name = "this") {
    const retv = internalDataMap.get(event);
    assertType(retv != null, "'%s' must be an object that Event constructor created, but got another one: %o", name, event);
    return retv;
}

function setCancelFlag(data) {
    if (data.inPassiveListenerFlag) {
        CanceledInPassiveListener.warn();
        return;
    }
    if (!data.cancelable) {
        NonCancelableEventWasCanceled.warn();
        return;
    }
    data.canceledFlag = true;
}

Object.defineProperty(Event, "NONE", { enumerable: true });
Object.defineProperty(Event, "CAPTURING_PHASE", { enumerable: true });
Object.defineProperty(Event, "AT_TARGET", { enumerable: true });
Object.defineProperty(Event, "BUBBLING_PHASE", { enumerable: true });

const keys = Object.getOwnPropertyNames(Event.prototype);
for (let i = 0; i < keys.length; ++i) {
    if (keys[i] === "constructor") continue;
    Object.defineProperty(Event.prototype, keys[i], { enumerable: true });
}

if (typeof Global !== "undefined" && typeof Global.Event !== "undefined") {
    Object.setPrototypeOf(Event.prototype, Global.Event.prototype);
}

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
            get code() {
                return 11;
            }
            get name() {
                return "InvalidStateError";
            }
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

let DOMException;

const ErrorCodeMap = {
    INDEX_SIZE_ERR: 1,
    DOMSTRING_SIZE_ERR: 2,
    HIERARCHY_REQUEST_ERR: 3,
    WRONG_DOCUMENT_ERR: 4,
    INVALID_CHARACTER_ERR: 5,
    NO_DATA_ALLOWED_ERR: 6,
    NO_MODIFICATION_ALLOWED_ERR: 7,
    NOT_FOUND_ERR: 8,
    NOT_SUPPORTED_ERR: 9,
    INUSE_ATTRIBUTE_ERR: 10,
    INVALID_STATE_ERR: 11,
    SYNTAX_ERR: 12,
    INVALID_MODIFICATION_ERR: 13,
    NAMESPACE_ERR: 14,
    INVALID_ACCESS_ERR: 15,
    VALIDATION_ERR: 16,
    TYPE_MISMATCH_ERR: 17,
    SECURITY_ERR: 18,
    NETWORK_ERR: 19,
    ABORT_ERR: 20,
    URL_MISMATCH_ERR: 21,
    QUOTA_EXCEEDED_ERR: 22,
    TIMEOUT_ERR: 23,
    INVALID_NODE_TYPE_ERR: 24,
    DATA_CLONE_ERR: 25,
};

function defineErrorCodeProperties(obj) {
    const keys = Object.keys(ErrorCodeMap);
    for (let i = 0; i < keys.length; ++i) {
        const key = keys[i];
        const value = ErrorCodeMap[key];
        Object.defineProperty(obj, key, {
            get() {
                return value;
            },
            configurable: true,
            enumerable: true,
        });
    }
}

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
        if (event.cancelBubble) {
            super.stopPropagation();
        }
        if (event.defaultPrevented) {
            super.preventDefault();
        }
        internalDataMap$1.set(this, { original: event });
        const keys = Object.keys(event);
        for (let i = 0; i < keys.length; ++i) {
            if (!(key in this)) {
                Object.defineProperty(this, key, defineRedirectDescriptor(event, key));
            }
        }
    }
    stopPropagation() {
        super.stopPropagation();
        const { original } = $$1(this);
        if ("stopPropagation" in original) {
            original.stopPropagation();
        }
    }
    get cancelBubble() {
        return super.cancelBubble;
    }
    set cancelBubble(value) {
        super.cancelBubble = value;
        const { original } = $$1(this);
        if ("cancelBubble" in original) {
            original.cancelBubble = value;
        }
    }
    stopImmediatePropagation() {
        super.stopImmediatePropagation();
        const { original } = $$1(this);
        if ("stopImmediatePropagation" in original) {
            original.stopImmediatePropagation();
        }
    }
    get returnValue() {
        return super.returnValue;
    }
    set returnValue(value) {
        super.returnValue = value;
        const { original } = $$1(this);
        if ("returnValue" in original) {
            original.returnValue = value;
        }
    }
    preventDefault() {
        super.preventDefault();
        const { original } = $$1(this);
        if ("preventDefault" in original) {
            original.preventDefault();
        }
    }
    get timeStamp() {
        const { original } = $$1(this);
        if ("timeStamp" in original) {
            return original.timeStamp;
        }
        return super.timeStamp;
    }
}

const internalDataMap$1 = new WeakMap();

function $$1(event) {
    const retv = internalDataMap$1.get(event);
    assertType(retv != null, "'this' is expected an Event object, but got", event);
    return retv;
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
    class CustomEventWrapper extends BaseEventWrapper {}
    const keys = Object.keys(originalPrototype);
    for (let i = 0; i < keys.length; ++i) {
        Object.defineProperty(CustomEventWrapper.prototype, keys[i], defineRedirectDescriptor(originalPrototype, keys[i]));
    }
    return CustomEventWrapper;
}

function defineRedirectDescriptor(obj, key) {
    const d = Object.getOwnPropertyDescriptor(obj, key);
    return {
        get() {
            const original = $$1(this).original;
            const value = original[key];
            if (typeof value === "function") {
                return value.bind(original);
            }
            return value;
        },
        set(value) {
            const original = $$1(this).original;
            original[key] = value;
        },
        configurable: d.configurable,
        enumerable: d.enumerable,
    };
}

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
    } catch (thrownError) {
        reportError(thrownError);
    }
}

function findIndexOfListener({ listeners }, callback, capture) {
    for (let i = 0; i < listeners.length; ++i) {
        if (listeners[i].callback === callback && isCapture(listeners[i]) === capture) {
            return i;
        }
    }
    return -1;
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

function createListenerListMap() {
    return Object.create(null);
}

function ensureListenerList(listenerMap, type) {
    return (listenerMap[type] || (listenerMap[type] = {
        attrCallback: undefined,
        attrListener: undefined,
        cow: false,
        listeners: [],
    }));
}

class EventTarget {
    constructor() {
        internalDataMap$2.set(this, createListenerListMap());
    }
    addEventListener(type0, callback0, options0) {
        const listenerMap = $$2(this);
        const { callback, capture, once, passive, signal, type, } = normalizeAddOptions(type0, callback0, options0);
        if (callback == null || (signal && signal.aborted)) {
            return;
        }
        const list = ensureListenerList(listenerMap, type);
        const i = findIndexOfListener(list, callback, capture);
        if (i !== -1) {
            warnDuplicate(list.listeners[i], passive, once, signal);
            return;
        }
        addListener(list, callback, capture, passive, once, signal);
    }
    removeEventListener(type0, callback0, options0) {
        const listenerMap = $$2(this);
        const { callback, capture, type } = normalizeOptions(type0, callback0, options0);
        const list = listenerMap[type];
        if (callback != null && list) {
            removeListener(list, callback, capture);
        }
    }
    dispatchEvent(e) {
        const list = $$2(this)[String(e.type)];
        if (list == null) {
            return true;
        }
        const event = e instanceof Event ? e : EventWrapper.wrap(e);
        const eventData = $(event, "event");
        if (eventData.dispatchFlag) {
            throw createInvalidStateError("This event has been in dispatching.");
        }
        eventData.dispatchFlag = true;
        eventData.target = eventData.currentTarget = this;
        if (!eventData.stopPropagationFlag) {
            const { cow, listeners } = list;
            list.cow = true;
            for (let i = 0; i < listeners.length; ++i) {
                const listener = listeners[i];
                if (isRemoved(listener)) continue;
                if (isOnce(listener) && removeListenerAt(list, i, !cow)) {
                    i -= 1;
                }
                eventData.inPassiveListenerFlag = isPassive(listener);
                invokeCallback(listener, this, event);
                eventData.inPassiveListenerFlag = false;
                if (eventData.stopImmediatePropagationFlag) {
                    break;
                }
            }
            if (!cow) {
                list.cow = false;
            }
        }
        eventData.target = null;
        eventData.currentTarget = null;
        eventData.stopImmediatePropagationFlag = false;
        eventData.stopPropagationFlag = false;
        eventData.dispatchFlag = false;
        return !eventData.canceledFlag;
    }
}

const internalDataMap$2 = new WeakMap();

function $$2(target, name = "this") {
    const retv = internalDataMap$2.get(target);
    assertType(retv != null, "'%s' must be an object that EventTarget constructor created, but got another one: %o", name, target);
    return retv;
}

function normalizeAddOptions(type, callback, options) {
    assertCallback(callback);
    if (typeof options === "object" && options !== null) {
        return {
            type: String(type),
            callback: callback || undefined,
            capture: Boolean(options.capture),
            passive: Boolean(options.passive),
            once: Boolean(options.once),
            signal: options.signal || undefined,
        };
    }
    return {
        type: String(type),
        callback: callback || undefined,
        capture: Boolean(options),
        passive: false,
        once: false,
        signal: undefined,
    };
}

function normalizeOptions(type, callback, options) {
    assertCallback(callback);
    if (typeof options === "object" && options !== null) {
        return {
            type: String(type),
            callback: callback || undefined,
            capture: Boolean(options.capture),
        };
    }
    return {
        type: String(type),
        callback: callback || undefined,
        capture: Boolean(options),
    };
}

function assertCallback(callback) {
    if (typeof callback === "function" || (typeof callback === "object" && callback !== null && typeof callback.handleEvent === "function")) {
        return;
    }
    if (callback == null || typeof callback === "object") {
        InvalidEventListener.warn(callback);
        return;
    }
    throw new TypeError(format(InvalidEventListener.message, [callback]));
}

function warnDuplicate(listener, passive, once, signal) {
    EventListenerWasDuplicated.warn(isCapture(listener) ? "capture" : "bubble", listener.callback);
    if (isPassive(listener) !== passive) {
        OptionWasIgnored.warn("passive");
    }
    if (isOnce(listener) !== once) {
        OptionWasIgnored.warn("once");
    }
    if (listener.signal !== signal) {
        OptionWasIgnored.warn("signal");
    }
}

const keys$1 = Object.getOwnPropertyNames(EventTarget.prototype);
for (let i = 0; i < keys$1.length; ++i) {
    if (keys$1[i] === "constructor") continue;
    Object.defineProperty(EventTarget.prototype, keys$1[i], { enumerable: true });
}

if (typeof Global !== "undefined" && typeof Global.EventTarget !== "undefined") {
    Object.setPrototypeOf(EventTarget.prototype, Global.EventTarget.prototype);
}

function getEventAttributeValue(target, type) {
    const listMap = $$2(target, "target");
    return (listMap[type]?.attrCallback) || null;
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

function defineCustomEventTarget(...types) {
    class CustomEventTarget extends EventTarget {}
    for (let i = 0; i < types.length; ++i) {
        defineEventAttribute(CustomEventTarget.prototype, types[i]);
    }
    return CustomEventTarget;
}

function defineEventAttribute(target, type, _eventClass) {
    Object.defineProperty(target, `on${type}`, {
        get() {
            return getEventAttributeValue(this, type);
        },
        set(value) {
            setEventAttributeValue(this, type, value);
        },
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
//# sourceMappingURL=index.js.map
