"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishReplay = void 0;
var ReplaySubject_1 = require("../ReplaySubject");
var multicast_1 = require("./multicast");
var isFunction_1 = require("../util/isFunction");
function publishReplay(bufferSize, windowTime, selectorOrScheduler, scheduler) {
    if (selectorOrScheduler && !isFunction_1.isFunction(selectorOrScheduler)) {
        scheduler = selectorOrScheduler;
    }
    var selector = isFunction_1.isFunction(selectorOrScheduler) ? selectorOrScheduler : undefined;
    var subject = new ReplaySubject_1.ReplaySubject(bufferSize, windowTime, scheduler);
    return function (source) { return multicast_1.multicast(function () { return subject; }, selector)(source); };
}
exports.publishReplay = publishReplay;
//# sourceMappingURL=publishReplay.js.map