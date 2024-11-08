import { asyncScheduler } from '../scheduler/async';
import { debounce } from './debounce';
import { timer } from '../observable/timer';
export function debounceTime(dueTime, scheduler = asyncScheduler) {
    const duration = timer(dueTime, scheduler);
    return debounce(() => duration);
}
//# sourceMappingURL=debounceTime.js.map