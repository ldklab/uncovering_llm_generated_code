"use strict";

const rawAsap = require("./raw");
const freeTasks = [];

/**
 * Schedules a task to be executed as soon as possible, prioritizing over I/O events.
 * An exception in the task will either crash the process or can be handled using
 * `process.on("uncaughtException")` or `domain.on("error")`.
 *
 * @param {Function} task - A function to be executed with no arguments.
 */
module.exports = asap;
function asap(task) {
    // Retrieve a reusable task or create a new one
    const rawTask = freeTasks.length ? freeTasks.pop() : new RawTask();
    rawTask.initialize(task, process.domain);
    rawAsap(rawTask);
}

class RawTask {
    constructor() {
        this.task = null;
        this.domain = null;
    }

    /**
     * Initializes the RawTask with a task and a domain.
     * @param {Function} task
     * @param {Domain} domain
     */
    initialize(task, domain) {
        this.task = task;
        this.domain = domain;
    }

    /**
     * Calls the stored task and handles exceptions and domain management.
     */
    call() {
        if (this.domain) {
            this.domain.enter();
        }
        let threw = true;
        try {
            this.task();
            threw = false;
            if (this.domain) {
                this.domain.exit();
            }
        } finally {
            if (threw) {
                rawAsap.requestFlush();
            }
            this.reset();
            freeTasks.push(this);
        }
    }

    /**
     * Resets the state of the RawTask for reuse.
     */
    reset() {
        this.task = null;
        this.domain = null;
    }
}
