import { ReplaySubject } from '../ReplaySubject';
import { multicast } from './multicast';
import { isFunction } from '../util/isFunction';
export function publishReplay(bufferSize, windowTime, selectorOrScheduler, scheduler) {
    if (selectorOrScheduler && !isFunction(selectorOrScheduler)) {
        scheduler = selectorOrScheduler;
    }
    const selector = isFunction(selectorOrScheduler) ? selectorOrScheduler : undefined;
    const subject = new ReplaySubject(bufferSize, windowTime, scheduler);
    return (source) => multicast(() => subject, selector)(source);
}
//# sourceMappingURL=publishReplay.js.map