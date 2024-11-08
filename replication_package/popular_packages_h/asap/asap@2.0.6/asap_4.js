"use strict";

const rawAsap = require("./raw");
const freeTasks = [];

/**
 * Schedule a task for execution as soon as possible.
 * 
 * @param {{call}} task - A callable object, typically a function.
 */
module.exports = asap;
function asap(task) {
    const rawTask = freeTasks.length ? freeTasks.pop() : new RawTask();
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
        const { domain, task } = this;
        if (domain) {
            domain.enter();
        }
        let threw = true;
        try {
            task.call();
            threw = false;
            if (domain) {
                domain.exit();
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
