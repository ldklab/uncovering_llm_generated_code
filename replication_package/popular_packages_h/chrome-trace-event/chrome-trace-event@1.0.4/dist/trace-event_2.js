"use strict";

/**
 * trace-event - A library to create a trace of your node app per
 * Google's Trace Event format.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tracer = void 0;
const { Readable } = require("stream");

function evCommon() {
    const hrtime = process.hrtime();
    const ts = hrtime[0] * 1e6 + Math.round(hrtime[1] / 1e3);
    return {
        ts,
        pid: process.pid,
        tid: process.pid
    };
}

class Tracer extends Readable {
    constructor(opts = {}) {
        super();
        this.noStream = false;
        this.events = [];
        this.validateOptions(opts);

        this.noStream = opts.noStream || false;
        this.parent = opts.parent;
        this.fields = this.parent ? { ...opts.parent.fields } : {};
        if (opts.fields) Object.assign(this.fields, opts.fields);
        if (!this.fields.cat) this.fields.cat = "default";
        else if (Array.isArray(this.fields.cat)) this.fields.cat = this.fields.cat.join(",");
        if (!this.fields.args) this.fields.args = {};

        if (this.parent) {
            this._push = this.parent._push.bind(this.parent);
        } else {
            this._objectMode = Boolean(opts.objectMode);
            const streamOpts = { objectMode: this._objectMode, encoding: this._objectMode ? undefined : "utf8" };
            this._push = this._objectMode ? this.push : this._pushString;
            Readable.call(this, streamOpts);
        }
    }

    validateOptions(opts) {
        if (typeof opts !== "object") throw new Error("Invalid options passed (must be an object)");
        if (opts.parent !== null && typeof opts.parent !== "object") throw new Error("Invalid parent option (must be an object)");
        if (opts.fields !== null && typeof opts.fields !== "object") throw new Error("Invalid fields option (must be an object)");
        if (opts.objectMode !== null && typeof opts.objectMode !== "boolean") throw new Error("Invalid objectsMode option (must be a boolean)");
    }

    flush() {
        if (this.noStream) {
            for (const evt of this.events) this._push(evt);
            this._flush();
        }
    }

    _read(_) {}

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
        if (!this._objectMode) this.push("]");
    }

    child(fields) {
        return new Tracer({ parent: this, fields });
    }

    begin(fields) {
        return this.mkEventFunc("B")(fields);
    }

    end(fields) {
        return this.mkEventFunc("E")(fields);
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
                    for (const k in fields) {
                        if (k === "cat") ev.cat = fields.cat.join(",");
                        else ev[k] = fields[k];
                    }
                }
            }
            if (!this.noStream) this._push(ev);
            else this.events.push(ev);
        };
    }
}

exports.Tracer = Tracer;
