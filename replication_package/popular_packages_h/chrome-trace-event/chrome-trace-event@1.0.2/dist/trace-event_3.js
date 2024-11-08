"use strict";

/**
 * trace-event - A library to create a trace of your node app per
 * Google's Trace Event format.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const { Readable } = require("stream");

// Utility function to create common event fields
function evCommon() {
    const hrtime = process.hrtime(); // [seconds, nanoseconds]
    const ts = hrtime[0] * 1000000 + Math.round(hrtime[1] / 1000); // microseconds
    return {
        ts: ts,
        pid: process.pid,
        tid: process.pid // No meaningful tid in Node.js
    };
}

// Tracer class extending Readable stream
class Tracer extends Readable {
    constructor(opts = {}) {
        super();
        this.noStream = opts.noStream || false;
        this.events = [];
        
        if (typeof opts !== "object") {
            throw new Error("Invalid options passed (must be an object)");
        }
        
        this._verifyOptions(opts);

        this.fields = this._initializeFields(opts);
        
        if (this.parent) {
            this._push = this.parent._push.bind(this.parent);
        } else {
            this._setupStream(opts);
        }
    }

    // Verify passed options
    _verifyOptions(opts) {
        if (opts.parent && typeof opts.parent !== "object") {
            throw new Error("Invalid option (parent) passed (must be an object)");
        }
        if (opts.fields && typeof opts.fields !== "object") {
            throw new Error("Invalid option (fields) passed (must be an object)");
        }
        if (opts.objectMode != null && typeof opts.objectMode !== "boolean") {
            throw new Error("Invalid option (objectsMode) passed (must be a boolean)");
        }
    }

    // Initialize fields for events
    _initializeFields(opts) {
        let fields = opts.parent ? Object.assign({}, opts.parent.fields) : {};
        
        if (opts.fields) {
            Object.assign(fields, opts.fields);
        }
        
        // Ensure required fields are set
        fields.cat = fields.cat || "default";
        if (Array.isArray(fields.cat)) {
            fields.cat = fields.cat.join(",");
        }
        fields.args = fields.args || {};

        return fields;
    }

    // Setup stream based on options
    _setupStream(opts) {
        this._objectMode = Boolean(opts.objectMode);
        const streamOpts = { objectMode: this._objectMode };
        this._push = this._objectMode ? this.push : this._pushString.bind(this);
        if (!this._objectMode) {
            streamOpts.encoding = "utf8";
        }
        Readable.call(this, streamOpts);
    }

    // Flush stored events to stream
    flush() {
        if (this.noStream) {
            for (const evt of this.events) {
                this._push(evt);
            }
            this._flush();
        }
    }

    _read(_) {}

    _pushString(ev) {
        const separator = this.firstPush ? ",\n" : "[";
        this.push(separator + JSON.stringify(ev), "utf8");
        this.firstPush = true;
    }

    _flush() {
        if (!this._objectMode) {
            this.push("]");
        }
    }

    // Create a child tracer
    child(fields) {
        return new Tracer({
            parent: this,
            fields: fields
        });
    }

    // Event creation methods
    begin(fields) {
        return this.mkEventFunc("b")(fields);
    }

    end(fields) {
        return this.mkEventFunc("e")(fields);
    }

    completeEvent(fields) {
        return this.mkEventFunc("X")(fields);
    }

    instantEvent(fields) {
        return this.mkEventFunc("I")(fields);
    }

    // Helper to create event functions
    mkEventFunc(ph) {
        return (fields) => {
            const ev = evCommon();
            ev.ph = ph;

            if (fields) {
                if (typeof fields === "string") {
                    ev.name = fields;
                } else {
                    for (const k of Object.keys(fields)) {
                        if (k === "cat" && Array.isArray(fields.cat)) {
                            ev.cat = fields.cat.join(",");
                        } else {
                            ev[k] = fields[k];
                        }
                    }
                }
            }

            if (!this.noStream) {
                this._push(ev);
            } else {
                this.events.push(ev);
            }
        };
    }
}

exports.Tracer = Tracer;
