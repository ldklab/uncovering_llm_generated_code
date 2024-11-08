"use strict";

const rawAsap = require("./raw");
const freeTasks = [];

/**
 * Schedules a task to be executed as soon as possible, with high priority.
 * If an exception occurs, it needs to be handled by Node.js error listeners.
 *
 * @param {Function} task - A callable object, typically a function with no arguments.
 */
module.exports = asap;

function asap(task) {
    let rawTask = freeTasks.length ? freeTasks.pop() : new RawTask();
    rawTask.task = task;
    rawTask.domain = process.domain;
    rawAsap(rawTask);
}

class RawTask {
    constructor() {
        this.task = null;
        this.domain = null;
    }

    call() {
        let threw = true;
        if (this.domain) {
            this.domain.enter();
        }
        try {
            this.task.call();
            threw = false;
            if (this.domain) {
                this.domain.exit();
            }
        } finally {
            if (threw) {
                rawAsap.requestFlush();
            }
            this.task = null;
            this.domain = null;
            freeTasks.push(this);
        }
    }
}
