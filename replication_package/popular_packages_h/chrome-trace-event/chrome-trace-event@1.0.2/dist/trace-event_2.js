"use strict";

/**
 * trace-event - A library to create a trace of your node app per
 * Google's Trace Event format:
 * Reference: https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU
 */
const { Readable } = require("stream");

function evCommon() {
    const hrtime = process.hrtime(); // [seconds, nanoseconds]
    const ts = hrtime[0] * 1000000 + Math.round(hrtime[1] / 1000); // microseconds
    return {
        ts,
        pid: process.pid,
        tid: process.pid // no meaningful tid for node.js
    };
}

class Tracer extends Readable {
    constructor(opts = {}) {
        if (typeof opts !== "object")
            throw new Error("Invalid options passed (must be an object)");

        super(opts.objectMode ? { objectMode: true } : { encoding: "utf8" });

        this.noStream = opts.noStream || false;
        this.events = [];
        this.fields = opts.fields || {};
        
        if (Array.isArray(this.fields.cat)) {
            this.fields.cat = this.fields.cat.join(",");
        } else {
            this.fields.cat = this.fields.cat || "default";
        }
        
        this.fields.args = this.fields.args || {};

        if (opts.parent) {
            if (typeof opts.parent !== "object")
                throw new Error("Invalid option (parent) passed (must be an object)");

            this.parent = opts.parent;
            this.fields = { ...opts.parent.fields, ...this.fields };
            this._push = this.parent._push.bind(this.parent);
        } else {
            this.parent = null;
            this._push = opts.objectMode ? this.push : this._pushString.bind(this);
        }
    }

    flush() {
        if (this.noStream) {
            for (const evt of this.events) {
                this._push(evt);
            }
            this._flush();
        }
    }

    _read() {}

    _pushString(ev) {
        if (!this.firstPush) {
            this.push("[");
            this.firstPush = true;
        } else {
            this.push(",\n");
        }
        this.push(JSON.stringify(ev), "utf8");
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
        return this._handleEvent("b", fields);
    }

    end(fields) {
        return this._handleEvent("e", fields);
    }

    completeEvent(fields) {
        return this._handleEvent("X", fields);
    }

    instantEvent(fields) {
        return this._handleEvent("I", fields);
    }

    _handleEvent(ph, fields) {
        const ev = evCommon();
        ev.ph = ph;

        if (fields) {
            if (typeof fields === "string") {
                ev.name = fields;
            } else {
                for (const [k, v] of Object.entries(fields)) {
                    ev[k] = k === "cat" ? v.join(",") : v;
                }
            }
        }
        
        if (!this.noStream) {
            this._push(ev);
        } else {
            this.events.push(ev);
        }
    }
}

exports.Tracer = Tracer;
