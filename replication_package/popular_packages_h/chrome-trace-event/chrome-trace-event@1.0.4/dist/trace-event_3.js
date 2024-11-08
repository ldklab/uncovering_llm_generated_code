"use strict";

const { Readable } = require("stream");

function getEventCommonData() {
    const [seconds, nanoseconds] = process.hrtime();
    const ts = seconds * 1e6 + Math.round(nanoseconds / 1e3);
    return { ts, pid: process.pid, tid: process.pid };
}

class Tracer extends Readable {
    constructor(options = {}) {
        super({ objectMode: options.objectMode || false, encoding: options.objectMode ? undefined : "utf8" });

        this.noStream = options.noStream || false;
        this.parent = options.parent || null;
        this.fields = Object.assign({}, this.parent?.fields, options.fields || {});
        this.fields.cat = Array.isArray(this.fields.cat) ? this.fields.cat.join(",") : this.fields.cat || "default";
        this.fields.args = this.fields.args || {};
        
        this.events = [];
        this.initStream(options.objectMode);

        if (this.parent) {
            this._push = this.parent._push.bind(this.parent);
        }
    }

    initStream(objectMode) {
        if (this.parent) return;
        this._push = objectMode ? this.push : this.pushString;
    }

    pushString(event) {
        const separator = this.firstPush ? ",\n" : "[";
        this.firstPush = true;
        this.push(`${separator}${JSON.stringify(event)}`, "utf8");
    }

    flush() {
        if (this.noStream) {
            this.events.forEach(event => this._push(event));
            this._flush();
        }
    }

    _read() {}

    _flush() {
        if (!this._objectMode) {
            this.push("]");
        }
    }

    child(fields) {
        return new Tracer({ parent: this, fields });
    }

    begin(fields) {
        this.createEvent("B", fields);
    }

    end(fields) {
        this.createEvent("E", fields);
    }

    completeEvent(fields) {
        this.createEvent("X", fields);
    }

    instantEvent(fields) {
        this.createEvent("I", fields);
    }

    createEvent(phase, fields) {
        const event = { ...getEventCommonData(), ph: phase };

        if (fields) {
            if (typeof fields === "string") {
                event.name = fields;
            } else {
                for (const [key, value] of Object.entries(fields)) {
                    event[key] = key === "cat" ? value.join(",") : value;
                }
            }
        }

        if (this.noStream) {
            this.events.push(event);
        } else {
            this._push(event);
        }
    }
}

exports.Tracer = Tracer;
