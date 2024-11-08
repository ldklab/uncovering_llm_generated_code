"use strict";
const { Readable } = require("stream");

function generateEventCommon() {
    const hrtime = process.hrtime();
    const timestamp = hrtime[0] * 1e6 + Math.round(hrtime[1] / 1e3);
    return { ts: timestamp, pid: process.pid, tid: process.pid };
}

class Tracer extends Readable {
    constructor(options = {}) {
        super();
        this.events = [];
        this.noStream = options.noStream || false;
        this.parent = options.parent || null;
        this.fields = options.fields ? { ...options.fields } : {};

        if (!this.fields.cat) {
            this.fields.cat = "default";
        } else if (Array.isArray(this.fields.cat)) {
            this.fields.cat = this.fields.cat.join(",");
        }

        if (!this.fields.args) {
            this.fields.args = {};
        }

        if (this.parent) {
            this._push = this.parent._push.bind(this.parent);
        } else {
            const objectMode = options.objectMode || false;
            this._objectMode = Boolean(objectMode);
            this._push = objectMode ? this.push : this._pushString;
            if (!objectMode) {
                this.setEncoding("utf8");
            }
        }
    }

    flush() {
        if (this.noStream) {
            for (const event of this.events) {
                this._push(event);
            }
            this._endStream();
        }
    }

    _read() {}

    _pushString(event) {
        if (!this.firstPush) {
            this.push("[");
            this.firstPush = true;
        } else {
            this.push(",\n");
        }
        this.push(JSON.stringify(event), "utf8");
    }

    _endStream() {
        if (!this._objectMode) {
            this.push("]");
        }
    }

    child(fields) {
        return new Tracer({ parent: this, fields });
    }

    begin(fields) {
        return this._createEvent("B", fields);
    }

    end(fields) {
        return this._createEvent("E", fields);
    }

    completeEvent(fields) {
        return this._createEvent("X", fields);
    }

    instantEvent(fields) {
        return this._createEvent("I", fields);
    }

    _createEvent(phase, fields) {
        return () => {
            let event = generateEventCommon();
            event.ph = phase;

            if (fields) {
                if (typeof fields === "string") {
                    event.name = fields;
                } else {
                    for (const key in fields) {
                        event[key] = key === "cat" ? fields[key].join(",") : fields[key];
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

module.exports = { Tracer };
