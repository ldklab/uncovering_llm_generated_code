"use strict";

const rawAsap = require("./raw");
const freeTasks = [];

/**
 * Schedules a task to be executed as soon as possible, but before any IO events.
 * If an exception is thrown, it can be caught using `process.on("uncaughtException")`
 * or `domain.on("error")`. Otherwise, the process will terminate. If handled,
 * subsequent tasks will continue to execute.
 *
 * @param {{call}} task A callable object, typically a function that takes no
 * arguments.
 */
module.exports = asap;

function asap(task) {
    const rawTask = freeTasks.length ? freeTasks.pop() : new RawTask();
    rawTask.task = task;
    rawTask.domain = process.domain;
    rawAsap(rawTask);
}

function RawTask() {
    this.task = null;
    this.domain = null;
}

RawTask.prototype.call = function () {
    if (this.domain) {
        this.domain.enter();
    }
    
    let threw = true;
    try {
        this.task.call();
        threw = false;
    } finally {
        if (threw) {
            rawAsap.requestFlush();
        }
        this.task = null;
        this.domain = null;
        freeTasks.push(this);
    }
};
