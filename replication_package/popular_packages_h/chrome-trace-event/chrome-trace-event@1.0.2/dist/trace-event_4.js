"use strict";
/**
 * trace-event - A library to create a trace of your node app per
 * Google's Trace Event format:
 * // JSSTYLED
 *      https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU
 */
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var stream_1 = require("stream");

function evCommon() {
    const hrtime = process.hrtime(); // [seconds, nanoseconds]
    const ts = hrtime[0] * 1e6 + Math.round(hrtime[1] / 1e3); // microseconds
    return {
        ts,
        pid: process.pid,
        tid: process.pid // Node.js doesn't provide separate thread IDs
    };
}

class Tracer extends stream_1.Readable {
    constructor(opts = {}) {
        super();
        this.noStream = false;
        this.events = [];
        
        if (typeof opts !== "object") throw new Error("Invalid options passed (must be an object)");
        if (opts.parent && typeof opts.parent !== "object") throw new Error("Invalid option (parent) passed (must be an object)");
        if (opts.fields && typeof opts.fields !== "object") throw new Error("Invalid option (fields) passed (must be an object)");
        if (opts.objectMode !== undefined && typeof opts.objectMode !== "boolean") throw new Error("Invalid option (objectMode) passed (must be a boolean)");

        this.noStream = opts.noStream || false;
        this.parent = opts.parent;

        this.fields = this.parent ? { ...opts.parent.fields } : {};
        
        if (opts.fields) {
            Object.assign(this.fields, opts.fields);
        }
        
        // Ensure required fields
        if (!this.fields.cat) this.fields.cat = "default";
        else if (Array.isArray(this.fields.cat)) this.fields.cat = this.fields.cat.join(",");
        
        if (!this.fields.args) this.fields.args = {};

        if (this.parent) {
            this._push = this.parent._push.bind(this.parent);
        } else {
            this._objectMode = Boolean(opts.objectMode);
            const streamOpts = { objectMode: this._objectMode };
            if (this._objectMode) {
                this._push = this.push;
            } else {
                this._push = this._pushString;
                streamOpts.encoding = "utf8";
            }
            stream_1.Readable.call(this, streamOpts);
        }
    }

    flush() {
        if (this.noStream === true) {
            for (const evt of this.events) {
                this._push(evt);
            }
            this._flush();
        }
    }

    _read(_) {}

    _pushString(ev) {
        const separator = this.firstPush ? ",\n" : "[" ;
        if (!this.firstPush) this.push("[");
        this.firstPush = true;
        this.push(separator + JSON.stringify(ev), "utf8");
    }

    _flush() {
        if (!this._objectMode) {
            this.push("]");
        }
    }

    child(fields) {
        return new Tracer({ parent: this, fields });
    }

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

    mkEventFunc(ph) {
        return (fields) => {
            const ev = evCommon();
            ev.ph = ph;
            if (fields) {
                if (typeof fields === "string") {
                    ev.name = fields;
                } else {
                    for (const k of Object.keys(fields)) {
                        if (k === "cat") {
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
/*
 * These correspond to the "Async events" in the Trace Events doc.
 *
 * Required fields:
 * - name
 * - id
 *
 * Optional fields:
 * - cat (array)
 * - args (object)
 * - TODO: stack fields, other optional fields?
 *
 * Dev Note: We don't explicitly assert that correct fields are
 * used for speed (premature optimization alert!).
 */
//# sourceMappingURL=trace-event.js.map
