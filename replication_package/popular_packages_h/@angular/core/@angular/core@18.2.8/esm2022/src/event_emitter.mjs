/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { setActiveConsumer } from '@angular/core/primitives/signals';
import { Subject, Subscription } from 'rxjs';
import { isInInjectionContext } from './di/contextual';
import { inject } from './di/injector_compatibility';
import { DestroyRef } from './linker/destroy_ref';
import { PendingTasks } from './pending_tasks';
class EventEmitter_ extends Subject {
    constructor(isAsync = false) {
        super();
        this.destroyRef = undefined;
        this.pendingTasks = undefined;
        this.__isAsync = isAsync;
        // Attempt to retrieve a `DestroyRef` and `PendingTasks` optionally.
        // For backwards compatibility reasons, this cannot be required.
        if (isInInjectionContext()) {
            this.destroyRef = inject(DestroyRef, { optional: true }) ?? undefined;
            this.pendingTasks = inject(PendingTasks, { optional: true }) ?? undefined;
        }
    }
    emit(value) {
        const prevConsumer = setActiveConsumer(null);
        try {
            super.next(value);
        }
        finally {
            setActiveConsumer(prevConsumer);
        }
    }
    subscribe(observerOrNext, error, complete) {
        let nextFn = observerOrNext;
        let errorFn = error || (() => null);
        let completeFn = complete;
        if (observerOrNext && typeof observerOrNext === 'object') {
            const observer = observerOrNext;
            nextFn = observer.next?.bind(observer);
            errorFn = observer.error?.bind(observer);
            completeFn = observer.complete?.bind(observer);
        }
        if (this.__isAsync) {
            errorFn = this.wrapInTimeout(errorFn);
            if (nextFn) {
                nextFn = this.wrapInTimeout(nextFn);
            }
            if (completeFn) {
                completeFn = this.wrapInTimeout(completeFn);
            }
        }
        const sink = super.subscribe({ next: nextFn, error: errorFn, complete: completeFn });
        if (observerOrNext instanceof Subscription) {
            observerOrNext.add(sink);
        }
        return sink;
    }
    wrapInTimeout(fn) {
        return (value) => {
            const taskId = this.pendingTasks?.add();
            setTimeout(() => {
                fn(value);
                if (taskId !== undefined) {
                    this.pendingTasks?.remove(taskId);
                }
            });
        };
    }
}
/**
 * @publicApi
 */
export const EventEmitter = EventEmitter_;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRfZW1pdHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL2V2ZW50X2VtaXR0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sa0NBQWtDLENBQUM7QUFDbkUsT0FBTyxFQUFrQixPQUFPLEVBQUUsWUFBWSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBRzVELE9BQU8sRUFBQyxvQkFBb0IsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3JELE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUNuRCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDaEQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBZ0c3QyxNQUFNLGFBQWMsU0FBUSxPQUFZO0lBS3RDLFlBQVksVUFBbUIsS0FBSztRQUNsQyxLQUFLLEVBQUUsQ0FBQztRQUpWLGVBQVUsR0FBMkIsU0FBUyxDQUFDO1FBQzlCLGlCQUFZLEdBQTZCLFNBQVMsQ0FBQztRQUlsRSxJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQztRQUV6QixvRUFBb0U7UUFDcEUsZ0VBQWdFO1FBQ2hFLElBQUksb0JBQW9CLEVBQUUsRUFBRSxDQUFDO1lBQzNCLElBQUksQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDLFVBQVUsRUFBRSxFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQztZQUNwRSxJQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLEVBQUUsRUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFDLENBQUMsSUFBSSxTQUFTLENBQUM7UUFDMUUsQ0FBQztJQUNILENBQUM7SUFFRCxJQUFJLENBQUMsS0FBVztRQUNkLE1BQU0sWUFBWSxHQUFHLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdDLElBQUksQ0FBQztZQUNILEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEIsQ0FBQztnQkFBUyxDQUFDO1lBQ1QsaUJBQWlCLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDbEMsQ0FBQztJQUNILENBQUM7SUFFUSxTQUFTLENBQUMsY0FBb0IsRUFBRSxLQUFXLEVBQUUsUUFBYztRQUNsRSxJQUFJLE1BQU0sR0FBRyxjQUFjLENBQUM7UUFDNUIsSUFBSSxPQUFPLEdBQUcsS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEMsSUFBSSxVQUFVLEdBQUcsUUFBUSxDQUFDO1FBRTFCLElBQUksY0FBYyxJQUFJLE9BQU8sY0FBYyxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQ3pELE1BQU0sUUFBUSxHQUFHLGNBQTBDLENBQUM7WUFDNUQsTUFBTSxHQUFHLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZDLE9BQU8sR0FBRyxRQUFRLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN6QyxVQUFVLEdBQUcsUUFBUSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDakQsQ0FBQztRQUVELElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ25CLE9BQU8sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRXRDLElBQUksTUFBTSxFQUFFLENBQUM7Z0JBQ1gsTUFBTSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDdEMsQ0FBQztZQUVELElBQUksVUFBVSxFQUFFLENBQUM7Z0JBQ2YsVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDOUMsQ0FBQztRQUNILENBQUM7UUFFRCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUMsQ0FBQyxDQUFDO1FBRW5GLElBQUksY0FBYyxZQUFZLFlBQVksRUFBRSxDQUFDO1lBQzNDLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0IsQ0FBQztRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVPLGFBQWEsQ0FBQyxFQUEyQjtRQUMvQyxPQUFPLENBQUMsS0FBYyxFQUFFLEVBQUU7WUFDeEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUUsQ0FBQztZQUN4QyxVQUFVLENBQUMsR0FBRyxFQUFFO2dCQUNkLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDVixJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUUsQ0FBQztvQkFDekIsSUFBSSxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3BDLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQUVEOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUlyQixhQUFvQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3NldEFjdGl2ZUNvbnN1bWVyfSBmcm9tICdAYW5ndWxhci9jb3JlL3ByaW1pdGl2ZXMvc2lnbmFscyc7XG5pbXBvcnQge1BhcnRpYWxPYnNlcnZlciwgU3ViamVjdCwgU3Vic2NyaXB0aW9ufSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHtPdXRwdXRSZWZ9IGZyb20gJy4vYXV0aG9yaW5nL291dHB1dC9vdXRwdXRfcmVmJztcbmltcG9ydCB7aXNJbkluamVjdGlvbkNvbnRleHR9IGZyb20gJy4vZGkvY29udGV4dHVhbCc7XG5pbXBvcnQge2luamVjdH0gZnJvbSAnLi9kaS9pbmplY3Rvcl9jb21wYXRpYmlsaXR5JztcbmltcG9ydCB7RGVzdHJveVJlZn0gZnJvbSAnLi9saW5rZXIvZGVzdHJveV9yZWYnO1xuaW1wb3J0IHtQZW5kaW5nVGFza3N9IGZyb20gJy4vcGVuZGluZ190YXNrcyc7XG5cbi8qKlxuICogVXNlIGluIGNvbXBvbmVudHMgd2l0aCB0aGUgYEBPdXRwdXRgIGRpcmVjdGl2ZSB0byBlbWl0IGN1c3RvbSBldmVudHNcbiAqIHN5bmNocm9ub3VzbHkgb3IgYXN5bmNocm9ub3VzbHksIGFuZCByZWdpc3RlciBoYW5kbGVycyBmb3IgdGhvc2UgZXZlbnRzXG4gKiBieSBzdWJzY3JpYmluZyB0byBhbiBpbnN0YW5jZS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIEV4dGVuZHNcbiAqIFtSeEpTIGBTdWJqZWN0YF0oaHR0cHM6Ly9yeGpzLmRldi9hcGkvaW5kZXgvY2xhc3MvU3ViamVjdClcbiAqIGZvciBBbmd1bGFyIGJ5IGFkZGluZyB0aGUgYGVtaXQoKWAgbWV0aG9kLlxuICpcbiAqIEluIHRoZSBmb2xsb3dpbmcgZXhhbXBsZSwgYSBjb21wb25lbnQgZGVmaW5lcyB0d28gb3V0cHV0IHByb3BlcnRpZXNcbiAqIHRoYXQgY3JlYXRlIGV2ZW50IGVtaXR0ZXJzLiBXaGVuIHRoZSB0aXRsZSBpcyBjbGlja2VkLCB0aGUgZW1pdHRlclxuICogZW1pdHMgYW4gb3BlbiBvciBjbG9zZSBldmVudCB0byB0b2dnbGUgdGhlIGN1cnJlbnQgdmlzaWJpbGl0eSBzdGF0ZS5cbiAqXG4gKiBgYGBodG1sXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICd6aXBweScsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgIDxkaXYgY2xhc3M9XCJ6aXBweVwiPlxuICogICAgIDxkaXYgKGNsaWNrKT1cInRvZ2dsZSgpXCI+VG9nZ2xlPC9kaXY+XG4gKiAgICAgPGRpdiBbaGlkZGVuXT1cIiF2aXNpYmxlXCI+XG4gKiAgICAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XG4gKiAgICAgPC9kaXY+XG4gKiAgPC9kaXY+YH0pXG4gKiBleHBvcnQgY2xhc3MgWmlwcHkge1xuICogICB2aXNpYmxlOiBib29sZWFuID0gdHJ1ZTtcbiAqICAgQE91dHB1dCgpIG9wZW46IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICogICBAT3V0cHV0KCkgY2xvc2U6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICpcbiAqICAgdG9nZ2xlKCkge1xuICogICAgIHRoaXMudmlzaWJsZSA9ICF0aGlzLnZpc2libGU7XG4gKiAgICAgaWYgKHRoaXMudmlzaWJsZSkge1xuICogICAgICAgdGhpcy5vcGVuLmVtaXQobnVsbCk7XG4gKiAgICAgfSBlbHNlIHtcbiAqICAgICAgIHRoaXMuY2xvc2UuZW1pdChudWxsKTtcbiAqICAgICB9XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEFjY2VzcyB0aGUgZXZlbnQgb2JqZWN0IHdpdGggdGhlIGAkZXZlbnRgIGFyZ3VtZW50IHBhc3NlZCB0byB0aGUgb3V0cHV0IGV2ZW50XG4gKiBoYW5kbGVyOlxuICpcbiAqIGBgYGh0bWxcbiAqIDx6aXBweSAob3Blbik9XCJvbk9wZW4oJGV2ZW50KVwiIChjbG9zZSk9XCJvbkNsb3NlKCRldmVudClcIj48L3ppcHB5PlxuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEV2ZW50RW1pdHRlcjxUPiBleHRlbmRzIFN1YmplY3Q8VD4sIE91dHB1dFJlZjxUPiB7XG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIF9faXNBc3luYzogYm9vbGVhbjtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiB0aGlzIGNsYXNzIHRoYXQgY2FuXG4gICAqIGRlbGl2ZXIgZXZlbnRzIHN5bmNocm9ub3VzbHkgb3IgYXN5bmNocm9ub3VzbHkuXG4gICAqXG4gICAqIEBwYXJhbSBbaXNBc3luYz1mYWxzZV0gV2hlbiB0cnVlLCBkZWxpdmVyIGV2ZW50cyBhc3luY2hyb25vdXNseS5cbiAgICpcbiAgICovXG4gIG5ldyAoaXNBc3luYz86IGJvb2xlYW4pOiBFdmVudEVtaXR0ZXI8VD47XG5cbiAgLyoqXG4gICAqIEVtaXRzIGFuIGV2ZW50IGNvbnRhaW5pbmcgYSBnaXZlbiB2YWx1ZS5cbiAgICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byBlbWl0LlxuICAgKi9cbiAgZW1pdCh2YWx1ZT86IFQpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgaGFuZGxlcnMgZm9yIGV2ZW50cyBlbWl0dGVkIGJ5IHRoaXMgaW5zdGFuY2UuXG4gICAqIEBwYXJhbSBuZXh0IFdoZW4gc3VwcGxpZWQsIGEgY3VzdG9tIGhhbmRsZXIgZm9yIGVtaXR0ZWQgZXZlbnRzLlxuICAgKiBAcGFyYW0gZXJyb3IgV2hlbiBzdXBwbGllZCwgYSBjdXN0b20gaGFuZGxlciBmb3IgYW4gZXJyb3Igbm90aWZpY2F0aW9uIGZyb20gdGhpcyBlbWl0dGVyLlxuICAgKiBAcGFyYW0gY29tcGxldGUgV2hlbiBzdXBwbGllZCwgYSBjdXN0b20gaGFuZGxlciBmb3IgYSBjb21wbGV0aW9uIG5vdGlmaWNhdGlvbiBmcm9tIHRoaXNcbiAgICogICAgIGVtaXR0ZXIuXG4gICAqL1xuICBzdWJzY3JpYmUoXG4gICAgbmV4dD86ICh2YWx1ZTogVCkgPT4gdm9pZCxcbiAgICBlcnJvcj86IChlcnJvcjogYW55KSA9PiB2b2lkLFxuICAgIGNvbXBsZXRlPzogKCkgPT4gdm9pZCxcbiAgKTogU3Vic2NyaXB0aW9uO1xuICAvKipcbiAgICogUmVnaXN0ZXJzIGhhbmRsZXJzIGZvciBldmVudHMgZW1pdHRlZCBieSB0aGlzIGluc3RhbmNlLlxuICAgKiBAcGFyYW0gb2JzZXJ2ZXJPck5leHQgV2hlbiBzdXBwbGllZCwgYSBjdXN0b20gaGFuZGxlciBmb3IgZW1pdHRlZCBldmVudHMsIG9yIGFuIG9ic2VydmVyXG4gICAqICAgICBvYmplY3QuXG4gICAqIEBwYXJhbSBlcnJvciBXaGVuIHN1cHBsaWVkLCBhIGN1c3RvbSBoYW5kbGVyIGZvciBhbiBlcnJvciBub3RpZmljYXRpb24gZnJvbSB0aGlzIGVtaXR0ZXIuXG4gICAqIEBwYXJhbSBjb21wbGV0ZSBXaGVuIHN1cHBsaWVkLCBhIGN1c3RvbSBoYW5kbGVyIGZvciBhIGNvbXBsZXRpb24gbm90aWZpY2F0aW9uIGZyb20gdGhpc1xuICAgKiAgICAgZW1pdHRlci5cbiAgICovXG4gIHN1YnNjcmliZShvYnNlcnZlck9yTmV4dD86IGFueSwgZXJyb3I/OiBhbnksIGNvbXBsZXRlPzogYW55KTogU3Vic2NyaXB0aW9uO1xufVxuXG5jbGFzcyBFdmVudEVtaXR0ZXJfIGV4dGVuZHMgU3ViamVjdDxhbnk+IGltcGxlbWVudHMgT3V0cHV0UmVmPGFueT4ge1xuICBfX2lzQXN5bmM6IGJvb2xlYW47IC8vIHRzbGludDpkaXNhYmxlLWxpbmVcbiAgZGVzdHJveVJlZjogRGVzdHJveVJlZiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgcHJpdmF0ZSByZWFkb25seSBwZW5kaW5nVGFza3M6IFBlbmRpbmdUYXNrcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICBjb25zdHJ1Y3Rvcihpc0FzeW5jOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX19pc0FzeW5jID0gaXNBc3luYztcblxuICAgIC8vIEF0dGVtcHQgdG8gcmV0cmlldmUgYSBgRGVzdHJveVJlZmAgYW5kIGBQZW5kaW5nVGFza3NgIG9wdGlvbmFsbHkuXG4gICAgLy8gRm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5IHJlYXNvbnMsIHRoaXMgY2Fubm90IGJlIHJlcXVpcmVkLlxuICAgIGlmIChpc0luSW5qZWN0aW9uQ29udGV4dCgpKSB7XG4gICAgICB0aGlzLmRlc3Ryb3lSZWYgPSBpbmplY3QoRGVzdHJveVJlZiwge29wdGlvbmFsOiB0cnVlfSkgPz8gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5wZW5kaW5nVGFza3MgPSBpbmplY3QoUGVuZGluZ1Rhc2tzLCB7b3B0aW9uYWw6IHRydWV9KSA/PyB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgZW1pdCh2YWx1ZT86IGFueSkge1xuICAgIGNvbnN0IHByZXZDb25zdW1lciA9IHNldEFjdGl2ZUNvbnN1bWVyKG51bGwpO1xuICAgIHRyeSB7XG4gICAgICBzdXBlci5uZXh0KHZhbHVlKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0QWN0aXZlQ29uc3VtZXIocHJldkNvbnN1bWVyKTtcbiAgICB9XG4gIH1cblxuICBvdmVycmlkZSBzdWJzY3JpYmUob2JzZXJ2ZXJPck5leHQ/OiBhbnksIGVycm9yPzogYW55LCBjb21wbGV0ZT86IGFueSk6IFN1YnNjcmlwdGlvbiB7XG4gICAgbGV0IG5leHRGbiA9IG9ic2VydmVyT3JOZXh0O1xuICAgIGxldCBlcnJvckZuID0gZXJyb3IgfHwgKCgpID0+IG51bGwpO1xuICAgIGxldCBjb21wbGV0ZUZuID0gY29tcGxldGU7XG5cbiAgICBpZiAob2JzZXJ2ZXJPck5leHQgJiYgdHlwZW9mIG9ic2VydmVyT3JOZXh0ID09PSAnb2JqZWN0Jykge1xuICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSBvYnNlcnZlck9yTmV4dCBhcyBQYXJ0aWFsT2JzZXJ2ZXI8dW5rbm93bj47XG4gICAgICBuZXh0Rm4gPSBvYnNlcnZlci5uZXh0Py5iaW5kKG9ic2VydmVyKTtcbiAgICAgIGVycm9yRm4gPSBvYnNlcnZlci5lcnJvcj8uYmluZChvYnNlcnZlcik7XG4gICAgICBjb21wbGV0ZUZuID0gb2JzZXJ2ZXIuY29tcGxldGU/LmJpbmQob2JzZXJ2ZXIpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9faXNBc3luYykge1xuICAgICAgZXJyb3JGbiA9IHRoaXMud3JhcEluVGltZW91dChlcnJvckZuKTtcblxuICAgICAgaWYgKG5leHRGbikge1xuICAgICAgICBuZXh0Rm4gPSB0aGlzLndyYXBJblRpbWVvdXQobmV4dEZuKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGNvbXBsZXRlRm4pIHtcbiAgICAgICAgY29tcGxldGVGbiA9IHRoaXMud3JhcEluVGltZW91dChjb21wbGV0ZUZuKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBzaW5rID0gc3VwZXIuc3Vic2NyaWJlKHtuZXh0OiBuZXh0Rm4sIGVycm9yOiBlcnJvckZuLCBjb21wbGV0ZTogY29tcGxldGVGbn0pO1xuXG4gICAgaWYgKG9ic2VydmVyT3JOZXh0IGluc3RhbmNlb2YgU3Vic2NyaXB0aW9uKSB7XG4gICAgICBvYnNlcnZlck9yTmV4dC5hZGQoc2luayk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNpbms7XG4gIH1cblxuICBwcml2YXRlIHdyYXBJblRpbWVvdXQoZm46ICh2YWx1ZTogdW5rbm93bikgPT4gYW55KSB7XG4gICAgcmV0dXJuICh2YWx1ZTogdW5rbm93bikgPT4ge1xuICAgICAgY29uc3QgdGFza0lkID0gdGhpcy5wZW5kaW5nVGFza3M/LmFkZCgpO1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGZuKHZhbHVlKTtcbiAgICAgICAgaWYgKHRhc2tJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5wZW5kaW5nVGFza3M/LnJlbW92ZSh0YXNrSWQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG59XG5cbi8qKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgRXZlbnRFbWl0dGVyOiB7XG4gIG5ldyAoaXNBc3luYz86IGJvb2xlYW4pOiBFdmVudEVtaXR0ZXI8YW55PjtcbiAgbmV3IDxUPihpc0FzeW5jPzogYm9vbGVhbik6IEV2ZW50RW1pdHRlcjxUPjtcbiAgcmVhZG9ubHkgcHJvdG90eXBlOiBFdmVudEVtaXR0ZXI8YW55Pjtcbn0gPSBFdmVudEVtaXR0ZXJfIGFzIGFueTtcbiJdfQ==