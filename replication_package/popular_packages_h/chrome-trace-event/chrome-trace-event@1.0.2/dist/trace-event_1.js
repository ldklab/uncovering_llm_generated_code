"use strict";
/**
 * trace-event - A library to create a trace of your node app per
 * Google's Trace Event format:
 * // JSSTYLED
 *      https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU
 */
Object.defineProperty(exports, "__esModule", { value: true });
const { Readable } = require("stream");

function getCommonEventData() {
    const [seconds, nanoseconds] = process.hrtime();
    const timestamp = seconds * 1000000 + Math.round(nanoseconds / 1000);
    return {
        ts: timestamp,
        pid: process.pid,
        tid: process.pid // no dedicated thread ID in Node.js
    };
}

class Tracer extends Readable {
    constructor(opts = {}) {
        super();
        this.noStream = Boolean(opts.noStream);
        this.events = [];
        this.validateOptions(opts);
        this.parent = opts.parent || null;
        this.fields = this.setupFields(opts);
        this._objectMode = Boolean(opts.objectMode);
        
        if (this.parent) {
            this._push = this.parent._push.bind(this.parent);
        } else {
            const streamOpts = { objectMode: this._objectMode };
            this._push = this._objectMode ? this.push : this._pushString;
            if (!this._objectMode) streamOpts.encoding = "utf8";
            Readable.call(this, streamOpts);
        }
    }

    validateOptions(opts) {
        if (typeof opts !== "object") throw new Error("Options must be an object");
        const validTypes = [
            { prop: "parent", type: "object" },
            { prop: "fields", type: "object" },
            { prop: "objectMode", type: "boolean" }
        ];
        validTypes.forEach(({ prop, type }) => {
            const val = opts[prop];
            if (val != null && typeof val !== type) {
                throw new Error(`Invalid option (${prop}) passed (must be a ${type})`);
            }
        });
    }

    setupFields(opts) {
        const inheritedFields = this.parent ? { ...this.parent.fields } : {};
        const eventFields = opts.fields ? { ...opts.fields } : {};
        const fields = { ...inheritedFields, ...eventFields };
        fields.cat = fields.cat ? (Array.isArray(fields.cat) ? fields.cat.join(",") : fields.cat) : "default";
        fields.args = fields.args || {};
        return fields;
    }

    flush() {
        if (!this.noStream) return;
        this.events.forEach(event => this._push(event));
        this._flush();
    }

    _read(_) {}

    _pushString(event) {
        const separator = this.firstPush ? ",\n" : "[";
        this.firstPush = true;
        this.push(separator + JSON.stringify(event), "utf8");
    }

    _flush() {
        if (!this._objectMode) this.push("]");
    }

    child(fields) {
        return new Tracer({ parent: this, fields });
    }

    begin(fields) {
        return this.createEventFunction("b")(fields);
    }

    end(fields) {
        return this.createEventFunction("e")(fields);
    }

    completeEvent(fields) {
        return this.createEventFunction("X")(fields);
    }

    instantEvent(fields) {
        return this.createEventFunction("I")(fields);
    }

    createEventFunction(phase) {
        return (fields) => {
            const event = getCommonEventData();
            event.ph = phase;
            if (fields) {
                if (typeof fields === "string") {
                    event.name = fields;
                } else {
                    for (const key in fields) {
                        if (key === "cat") {
                            event.cat = fields.cat.join(",");
                        } else {
                            event[key] = fields[key];
                        }
                    }
                }
            }
            if (!this.noStream) {
                this._push(event);
            } else {
                this.events.push(event);
            }
        };
    }
}

exports.Tracer = Tracer;
