import { ReplaySubject } from '../ReplaySubject';
import { multicast } from './multicast';
import { isFunction } from '../util/isFunction';
export function publishReplay(bufferSize, windowTime, selectorOrScheduler, scheduler) {
    if (selectorOrScheduler && !isFunction(selectorOrScheduler)) {
        scheduler = selectorOrScheduler;
    }
    var selector = isFunction(selectorOrScheduler) ? selectorOrScheduler : undefined;
    var subject = new ReplaySubject(bufferSize, windowTime, scheduler);
    return function (source) { return multicast(function () { return subject; }, selector)(source); };
}
//# sourceMappingURL=publishReplay.js.map