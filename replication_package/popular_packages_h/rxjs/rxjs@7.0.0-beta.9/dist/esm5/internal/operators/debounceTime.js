import { asyncScheduler } from '../scheduler/async';
import { debounce } from './debounce';
import { timer } from '../observable/timer';
export function debounceTime(dueTime, scheduler) {
    if (scheduler === void 0) { scheduler = asyncScheduler; }
    var duration = timer(dueTime, scheduler);
    return debounce(function () { return duration; });
}
//# sourceMappingURL=debounceTime.js.map