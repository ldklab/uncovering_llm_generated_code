"use strict";

/**
 * trace-event - A library to create a trace of your node app per
 * Google's Trace Event format:
 * // JSSTYLED
 *      https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU
 */
const { Readable } = require("stream");

function evCommon() {
    const hrtime = process.hrtime();
    const ts = hrtime[0] * 1000000 + Math.round(hrtime[1] / 1000);
    return {
        ts,
        pid: process.pid,
        tid: process.pid
    };
}

class Tracer extends Readable {
    constructor(opts = {}) {
        super();
        this.noStream = Boolean(opts.noStream);
        this.events = [];
        this._objectMode = Boolean(opts.objectMode);
        this.parent = opts.parent;
        this.fields = Object.assign({}, opts.parent?.fields, opts.fields);

        if (!this.fields.cat) {
            this.fields.cat = "default";
        } else if (Array.isArray(this.fields.cat)) {
            this.fields.cat = this.fields.cat.join(",");
        }

        if (!this.fields.args) {
            this.fields.args = {};
        }

        this._push = this.parent ? this.parent._push.bind(this.parent) :
            this._objectMode ? this.push : this._pushString.bind(this);

        if (!this.parent) {
            const streamOpts = { objectMode: this._objectMode };
            if (!this._objectMode) streamOpts.encoding = "utf8";
            Readable.call(this, streamOpts);
        }
    }

    flush() {
        if (this.noStream) {
            this.events.forEach(evt => this._push(evt));
            this._flush();
        }
    }

    _read(_) {}

    _pushString(ev) {
        const separator = this.firstPush ? ",\n" : "[";
        this.firstPush = true;
        this.push(separator + JSON.stringify(ev), "utf8");
    }

    _flush() {
        if (!this._objectMode) {
            this.push("]");
        }
    }

    child(fields) {
        return new Tracer({
            parent: this,
            fields: fields
        });
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
            const ev = { ...evCommon(), ph };
            if (fields) {
                if (typeof fields === "string") {
                    ev.name = fields;
                } else {
                    Object.keys(fields).forEach(k => {
                        ev[k] = k === "cat" ? fields.cat.join(",") : fields[k];
                    });
                }
            }
            this.noStream ? this.events.push(ev) : this._push(ev);
        };
    }
}

module.exports = { Tracer };
