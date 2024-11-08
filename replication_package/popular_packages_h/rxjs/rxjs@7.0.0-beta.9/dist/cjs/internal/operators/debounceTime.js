"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debounceTime = void 0;
var async_1 = require("../scheduler/async");
var debounce_1 = require("./debounce");
var timer_1 = require("../observable/timer");
function debounceTime(dueTime, scheduler) {
    if (scheduler === void 0) { scheduler = async_1.asyncScheduler; }
    var duration = timer_1.timer(dueTime, scheduler);
    return debounce_1.debounce(function () { return duration; });
}
exports.debounceTime = debounceTime;
//# sourceMappingURL=debounceTime.js.map