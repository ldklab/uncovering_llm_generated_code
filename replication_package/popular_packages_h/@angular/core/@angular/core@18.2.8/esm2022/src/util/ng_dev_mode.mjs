/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { global } from './global';
export function ngDevModeResetPerfCounters() {
    const locationString = typeof location !== 'undefined' ? location.toString() : '';
    const newCounters = {
        namedConstructors: locationString.indexOf('ngDevMode=namedConstructors') != -1,
        firstCreatePass: 0,
        tNode: 0,
        tView: 0,
        rendererCreateTextNode: 0,
        rendererSetText: 0,
        rendererCreateElement: 0,
        rendererAddEventListener: 0,
        rendererSetAttribute: 0,
        rendererRemoveAttribute: 0,
        rendererSetProperty: 0,
        rendererSetClassName: 0,
        rendererAddClass: 0,
        rendererRemoveClass: 0,
        rendererSetStyle: 0,
        rendererRemoveStyle: 0,
        rendererDestroy: 0,
        rendererDestroyNode: 0,
        rendererMoveNode: 0,
        rendererRemoveNode: 0,
        rendererAppendChild: 0,
        rendererInsertBefore: 0,
        rendererCreateComment: 0,
        hydratedNodes: 0,
        hydratedComponents: 0,
        dehydratedViewsRemoved: 0,
        dehydratedViewsCleanupRuns: 0,
        componentsSkippedHydration: 0,
    };
    // Make sure to refer to ngDevMode as ['ngDevMode'] for closure.
    const allowNgDevModeTrue = locationString.indexOf('ngDevMode=false') === -1;
    if (!allowNgDevModeTrue) {
        global['ngDevMode'] = false;
    }
    else {
        if (typeof global['ngDevMode'] !== 'object') {
            global['ngDevMode'] = {};
        }
        Object.assign(global['ngDevMode'], newCounters);
    }
    return newCounters;
}
/**
 * This function checks to see if the `ngDevMode` has been set. If yes,
 * then we honor it, otherwise we default to dev mode with additional checks.
 *
 * The idea is that unless we are doing production build where we explicitly
 * set `ngDevMode == false` we should be helping the developer by providing
 * as much early warning and errors as possible.
 *
 * `ɵɵdefineComponent` is guaranteed to have been called before any component template functions
 * (and thus Ivy instructions), so a single initialization there is sufficient to ensure ngDevMode
 * is defined for the entire instruction set.
 *
 * When checking `ngDevMode` on toplevel, always init it before referencing it
 * (e.g. `((typeof ngDevMode === 'undefined' || ngDevMode) && initNgDevMode())`), otherwise you can
 *  get a `ReferenceError` like in https://github.com/angular/angular/issues/31595.
 *
 * Details on possible values for `ngDevMode` can be found on its docstring.
 *
 * NOTE:
 * - changes to the `ngDevMode` name must be synced with `compiler-cli/src/tooling.ts`.
 */
export function initNgDevMode() {
    // The below checks are to ensure that calling `initNgDevMode` multiple times does not
    // reset the counters.
    // If the `ngDevMode` is not an object, then it means we have not created the perf counters
    // yet.
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
        if (typeof ngDevMode !== 'object' || Object.keys(ngDevMode).length === 0) {
            ngDevModeResetPerfCounters();
        }
        return typeof ngDevMode !== 'undefined' && !!ngDevMode;
    }
    return false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfZGV2X21vZGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy91dGlsL25nX2Rldl9tb2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFtRGhDLE1BQU0sVUFBVSwwQkFBMEI7SUFDeEMsTUFBTSxjQUFjLEdBQUcsT0FBTyxRQUFRLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUNsRixNQUFNLFdBQVcsR0FBMEI7UUFDekMsaUJBQWlCLEVBQUUsY0FBYyxDQUFDLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5RSxlQUFlLEVBQUUsQ0FBQztRQUNsQixLQUFLLEVBQUUsQ0FBQztRQUNSLEtBQUssRUFBRSxDQUFDO1FBQ1Isc0JBQXNCLEVBQUUsQ0FBQztRQUN6QixlQUFlLEVBQUUsQ0FBQztRQUNsQixxQkFBcUIsRUFBRSxDQUFDO1FBQ3hCLHdCQUF3QixFQUFFLENBQUM7UUFDM0Isb0JBQW9CLEVBQUUsQ0FBQztRQUN2Qix1QkFBdUIsRUFBRSxDQUFDO1FBQzFCLG1CQUFtQixFQUFFLENBQUM7UUFDdEIsb0JBQW9CLEVBQUUsQ0FBQztRQUN2QixnQkFBZ0IsRUFBRSxDQUFDO1FBQ25CLG1CQUFtQixFQUFFLENBQUM7UUFDdEIsZ0JBQWdCLEVBQUUsQ0FBQztRQUNuQixtQkFBbUIsRUFBRSxDQUFDO1FBQ3RCLGVBQWUsRUFBRSxDQUFDO1FBQ2xCLG1CQUFtQixFQUFFLENBQUM7UUFDdEIsZ0JBQWdCLEVBQUUsQ0FBQztRQUNuQixrQkFBa0IsRUFBRSxDQUFDO1FBQ3JCLG1CQUFtQixFQUFFLENBQUM7UUFDdEIsb0JBQW9CLEVBQUUsQ0FBQztRQUN2QixxQkFBcUIsRUFBRSxDQUFDO1FBQ3hCLGFBQWEsRUFBRSxDQUFDO1FBQ2hCLGtCQUFrQixFQUFFLENBQUM7UUFDckIsc0JBQXNCLEVBQUUsQ0FBQztRQUN6QiwwQkFBMEIsRUFBRSxDQUFDO1FBQzdCLDBCQUEwQixFQUFFLENBQUM7S0FDOUIsQ0FBQztJQUVGLGdFQUFnRTtJQUNoRSxNQUFNLGtCQUFrQixHQUFHLGNBQWMsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUM1RSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUN4QixNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBQzlCLENBQUM7U0FBTSxDQUFDO1FBQ04sSUFBSSxPQUFPLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUM1QyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFDRCxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBQ0QsT0FBTyxXQUFXLENBQUM7QUFDckIsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW9CRztBQUNILE1BQU0sVUFBVSxhQUFhO0lBQzNCLHNGQUFzRjtJQUN0RixzQkFBc0I7SUFDdEIsMkZBQTJGO0lBQzNGLE9BQU87SUFDUCxJQUFJLE9BQU8sU0FBUyxLQUFLLFdBQVcsSUFBSSxTQUFTLEVBQUUsQ0FBQztRQUNsRCxJQUFJLE9BQU8sU0FBUyxLQUFLLFFBQVEsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUN6RSwwQkFBMEIsRUFBRSxDQUFDO1FBQy9CLENBQUM7UUFDRCxPQUFPLE9BQU8sU0FBUyxLQUFLLFdBQVcsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDO0lBQ3pELENBQUM7SUFDRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7Z2xvYmFsfSBmcm9tICcuL2dsb2JhbCc7XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgLyoqXG4gICAqIFZhbHVlcyBvZiBuZ0Rldk1vZGVcbiAgICogRGVwZW5kaW5nIG9uIHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBhcHBsaWNhdGlvbiwgbmdEZXZNb2RlIG1heSBoYXZlIG9uZSBvZiBzZXZlcmFsIHZhbHVlcy5cbiAgICpcbiAgICogRm9yIGNvbnZlbmllbmNlLCB0aGUg4oCcdHJ1dGh54oCdIHZhbHVlIHdoaWNoIGVuYWJsZXMgZGV2IG1vZGUgaXMgYWxzbyBhbiBvYmplY3Qgd2hpY2ggY29udGFpbnNcbiAgICogQW5ndWxhcuKAmXMgcGVyZm9ybWFuY2UgY291bnRlcnMuIFRoaXMgaXMgbm90IG5lY2Vzc2FyeSwgYnV0IGN1dHMgZG93biBvbiBib2lsZXJwbGF0ZSBmb3IgdGhlXG4gICAqIHBlcmYgY291bnRlcnMuXG4gICAqXG4gICAqIG5nRGV2TW9kZSBtYXkgYWxzbyBiZSBzZXQgdG8gZmFsc2UuIFRoaXMgY2FuIGhhcHBlbiBpbiBvbmUgb2YgYSBmZXcgd2F5czpcbiAgICogLSBUaGUgdXNlciBleHBsaWNpdGx5IHNldHMgYHdpbmRvdy5uZ0Rldk1vZGUgPSBmYWxzZWAgc29tZXdoZXJlIGluIHRoZWlyIGFwcC5cbiAgICogLSBUaGUgdXNlciBjYWxscyBgZW5hYmxlUHJvZE1vZGUoKWAuXG4gICAqIC0gVGhlIFVSTCBjb250YWlucyBhIGBuZ0Rldk1vZGU9ZmFsc2VgIHRleHQuXG4gICAqIEZpbmFsbHksIG5nRGV2TW9kZSBtYXkgbm90IGhhdmUgYmVlbiBkZWZpbmVkIGF0IGFsbC5cbiAgICovXG4gIGNvbnN0IG5nRGV2TW9kZTogbnVsbCB8IE5nRGV2TW9kZVBlcmZDb3VudGVycztcblxuICBpbnRlcmZhY2UgTmdEZXZNb2RlUGVyZkNvdW50ZXJzIHtcbiAgICBuYW1lZENvbnN0cnVjdG9yczogYm9vbGVhbjtcbiAgICBmaXJzdENyZWF0ZVBhc3M6IG51bWJlcjtcbiAgICB0Tm9kZTogbnVtYmVyO1xuICAgIHRWaWV3OiBudW1iZXI7XG4gICAgcmVuZGVyZXJDcmVhdGVUZXh0Tm9kZTogbnVtYmVyO1xuICAgIHJlbmRlcmVyU2V0VGV4dDogbnVtYmVyO1xuICAgIHJlbmRlcmVyQ3JlYXRlRWxlbWVudDogbnVtYmVyO1xuICAgIHJlbmRlcmVyQWRkRXZlbnRMaXN0ZW5lcjogbnVtYmVyO1xuICAgIHJlbmRlcmVyU2V0QXR0cmlidXRlOiBudW1iZXI7XG4gICAgcmVuZGVyZXJSZW1vdmVBdHRyaWJ1dGU6IG51bWJlcjtcbiAgICByZW5kZXJlclNldFByb3BlcnR5OiBudW1iZXI7XG4gICAgcmVuZGVyZXJTZXRDbGFzc05hbWU6IG51bWJlcjtcbiAgICByZW5kZXJlckFkZENsYXNzOiBudW1iZXI7XG4gICAgcmVuZGVyZXJSZW1vdmVDbGFzczogbnVtYmVyO1xuICAgIHJlbmRlcmVyU2V0U3R5bGU6IG51bWJlcjtcbiAgICByZW5kZXJlclJlbW92ZVN0eWxlOiBudW1iZXI7XG4gICAgcmVuZGVyZXJEZXN0cm95OiBudW1iZXI7XG4gICAgcmVuZGVyZXJEZXN0cm95Tm9kZTogbnVtYmVyO1xuICAgIHJlbmRlcmVyTW92ZU5vZGU6IG51bWJlcjtcbiAgICByZW5kZXJlclJlbW92ZU5vZGU6IG51bWJlcjtcbiAgICByZW5kZXJlckFwcGVuZENoaWxkOiBudW1iZXI7XG4gICAgcmVuZGVyZXJJbnNlcnRCZWZvcmU6IG51bWJlcjtcbiAgICByZW5kZXJlckNyZWF0ZUNvbW1lbnQ6IG51bWJlcjtcbiAgICBoeWRyYXRlZE5vZGVzOiBudW1iZXI7XG4gICAgaHlkcmF0ZWRDb21wb25lbnRzOiBudW1iZXI7XG4gICAgZGVoeWRyYXRlZFZpZXdzUmVtb3ZlZDogbnVtYmVyO1xuICAgIGRlaHlkcmF0ZWRWaWV3c0NsZWFudXBSdW5zOiBudW1iZXI7XG4gICAgY29tcG9uZW50c1NraXBwZWRIeWRyYXRpb246IG51bWJlcjtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbmdEZXZNb2RlUmVzZXRQZXJmQ291bnRlcnMoKTogTmdEZXZNb2RlUGVyZkNvdW50ZXJzIHtcbiAgY29uc3QgbG9jYXRpb25TdHJpbmcgPSB0eXBlb2YgbG9jYXRpb24gIT09ICd1bmRlZmluZWQnID8gbG9jYXRpb24udG9TdHJpbmcoKSA6ICcnO1xuICBjb25zdCBuZXdDb3VudGVyczogTmdEZXZNb2RlUGVyZkNvdW50ZXJzID0ge1xuICAgIG5hbWVkQ29uc3RydWN0b3JzOiBsb2NhdGlvblN0cmluZy5pbmRleE9mKCduZ0Rldk1vZGU9bmFtZWRDb25zdHJ1Y3RvcnMnKSAhPSAtMSxcbiAgICBmaXJzdENyZWF0ZVBhc3M6IDAsXG4gICAgdE5vZGU6IDAsXG4gICAgdFZpZXc6IDAsXG4gICAgcmVuZGVyZXJDcmVhdGVUZXh0Tm9kZTogMCxcbiAgICByZW5kZXJlclNldFRleHQ6IDAsXG4gICAgcmVuZGVyZXJDcmVhdGVFbGVtZW50OiAwLFxuICAgIHJlbmRlcmVyQWRkRXZlbnRMaXN0ZW5lcjogMCxcbiAgICByZW5kZXJlclNldEF0dHJpYnV0ZTogMCxcbiAgICByZW5kZXJlclJlbW92ZUF0dHJpYnV0ZTogMCxcbiAgICByZW5kZXJlclNldFByb3BlcnR5OiAwLFxuICAgIHJlbmRlcmVyU2V0Q2xhc3NOYW1lOiAwLFxuICAgIHJlbmRlcmVyQWRkQ2xhc3M6IDAsXG4gICAgcmVuZGVyZXJSZW1vdmVDbGFzczogMCxcbiAgICByZW5kZXJlclNldFN0eWxlOiAwLFxuICAgIHJlbmRlcmVyUmVtb3ZlU3R5bGU6IDAsXG4gICAgcmVuZGVyZXJEZXN0cm95OiAwLFxuICAgIHJlbmRlcmVyRGVzdHJveU5vZGU6IDAsXG4gICAgcmVuZGVyZXJNb3ZlTm9kZTogMCxcbiAgICByZW5kZXJlclJlbW92ZU5vZGU6IDAsXG4gICAgcmVuZGVyZXJBcHBlbmRDaGlsZDogMCxcbiAgICByZW5kZXJlckluc2VydEJlZm9yZTogMCxcbiAgICByZW5kZXJlckNyZWF0ZUNvbW1lbnQ6IDAsXG4gICAgaHlkcmF0ZWROb2RlczogMCxcbiAgICBoeWRyYXRlZENvbXBvbmVudHM6IDAsXG4gICAgZGVoeWRyYXRlZFZpZXdzUmVtb3ZlZDogMCxcbiAgICBkZWh5ZHJhdGVkVmlld3NDbGVhbnVwUnVuczogMCxcbiAgICBjb21wb25lbnRzU2tpcHBlZEh5ZHJhdGlvbjogMCxcbiAgfTtcblxuICAvLyBNYWtlIHN1cmUgdG8gcmVmZXIgdG8gbmdEZXZNb2RlIGFzIFsnbmdEZXZNb2RlJ10gZm9yIGNsb3N1cmUuXG4gIGNvbnN0IGFsbG93TmdEZXZNb2RlVHJ1ZSA9IGxvY2F0aW9uU3RyaW5nLmluZGV4T2YoJ25nRGV2TW9kZT1mYWxzZScpID09PSAtMTtcbiAgaWYgKCFhbGxvd05nRGV2TW9kZVRydWUpIHtcbiAgICBnbG9iYWxbJ25nRGV2TW9kZSddID0gZmFsc2U7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHR5cGVvZiBnbG9iYWxbJ25nRGV2TW9kZSddICE9PSAnb2JqZWN0Jykge1xuICAgICAgZ2xvYmFsWyduZ0Rldk1vZGUnXSA9IHt9O1xuICAgIH1cbiAgICBPYmplY3QuYXNzaWduKGdsb2JhbFsnbmdEZXZNb2RlJ10sIG5ld0NvdW50ZXJzKTtcbiAgfVxuICByZXR1cm4gbmV3Q291bnRlcnM7XG59XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiBjaGVja3MgdG8gc2VlIGlmIHRoZSBgbmdEZXZNb2RlYCBoYXMgYmVlbiBzZXQuIElmIHllcyxcbiAqIHRoZW4gd2UgaG9ub3IgaXQsIG90aGVyd2lzZSB3ZSBkZWZhdWx0IHRvIGRldiBtb2RlIHdpdGggYWRkaXRpb25hbCBjaGVja3MuXG4gKlxuICogVGhlIGlkZWEgaXMgdGhhdCB1bmxlc3Mgd2UgYXJlIGRvaW5nIHByb2R1Y3Rpb24gYnVpbGQgd2hlcmUgd2UgZXhwbGljaXRseVxuICogc2V0IGBuZ0Rldk1vZGUgPT0gZmFsc2VgIHdlIHNob3VsZCBiZSBoZWxwaW5nIHRoZSBkZXZlbG9wZXIgYnkgcHJvdmlkaW5nXG4gKiBhcyBtdWNoIGVhcmx5IHdhcm5pbmcgYW5kIGVycm9ycyBhcyBwb3NzaWJsZS5cbiAqXG4gKiBgybXJtWRlZmluZUNvbXBvbmVudGAgaXMgZ3VhcmFudGVlZCB0byBoYXZlIGJlZW4gY2FsbGVkIGJlZm9yZSBhbnkgY29tcG9uZW50IHRlbXBsYXRlIGZ1bmN0aW9uc1xuICogKGFuZCB0aHVzIEl2eSBpbnN0cnVjdGlvbnMpLCBzbyBhIHNpbmdsZSBpbml0aWFsaXphdGlvbiB0aGVyZSBpcyBzdWZmaWNpZW50IHRvIGVuc3VyZSBuZ0Rldk1vZGVcbiAqIGlzIGRlZmluZWQgZm9yIHRoZSBlbnRpcmUgaW5zdHJ1Y3Rpb24gc2V0LlxuICpcbiAqIFdoZW4gY2hlY2tpbmcgYG5nRGV2TW9kZWAgb24gdG9wbGV2ZWwsIGFsd2F5cyBpbml0IGl0IGJlZm9yZSByZWZlcmVuY2luZyBpdFxuICogKGUuZy4gYCgodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSAmJiBpbml0TmdEZXZNb2RlKCkpYCksIG90aGVyd2lzZSB5b3UgY2FuXG4gKiAgZ2V0IGEgYFJlZmVyZW5jZUVycm9yYCBsaWtlIGluIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzMxNTk1LlxuICpcbiAqIERldGFpbHMgb24gcG9zc2libGUgdmFsdWVzIGZvciBgbmdEZXZNb2RlYCBjYW4gYmUgZm91bmQgb24gaXRzIGRvY3N0cmluZy5cbiAqXG4gKiBOT1RFOlxuICogLSBjaGFuZ2VzIHRvIHRoZSBgbmdEZXZNb2RlYCBuYW1lIG11c3QgYmUgc3luY2VkIHdpdGggYGNvbXBpbGVyLWNsaS9zcmMvdG9vbGluZy50c2AuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbml0TmdEZXZNb2RlKCk6IGJvb2xlYW4ge1xuICAvLyBUaGUgYmVsb3cgY2hlY2tzIGFyZSB0byBlbnN1cmUgdGhhdCBjYWxsaW5nIGBpbml0TmdEZXZNb2RlYCBtdWx0aXBsZSB0aW1lcyBkb2VzIG5vdFxuICAvLyByZXNldCB0aGUgY291bnRlcnMuXG4gIC8vIElmIHRoZSBgbmdEZXZNb2RlYCBpcyBub3QgYW4gb2JqZWN0LCB0aGVuIGl0IG1lYW5zIHdlIGhhdmUgbm90IGNyZWF0ZWQgdGhlIHBlcmYgY291bnRlcnNcbiAgLy8geWV0LlxuICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgaWYgKHR5cGVvZiBuZ0Rldk1vZGUgIT09ICdvYmplY3QnIHx8IE9iamVjdC5rZXlzKG5nRGV2TW9kZSkubGVuZ3RoID09PSAwKSB7XG4gICAgICBuZ0Rldk1vZGVSZXNldFBlcmZDb3VudGVycygpO1xuICAgIH1cbiAgICByZXR1cm4gdHlwZW9mIG5nRGV2TW9kZSAhPT0gJ3VuZGVmaW5lZCcgJiYgISFuZ0Rldk1vZGU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuIl19