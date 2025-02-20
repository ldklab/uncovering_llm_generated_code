/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ɵisPromise as isPromise } from '@angular/core';
import { from, isObservable, of } from 'rxjs';
export function shallowEqualArrays(a, b) {
    if (a.length !== b.length)
        return false;
    for (let i = 0; i < a.length; ++i) {
        if (!shallowEqual(a[i], b[i]))
            return false;
    }
    return true;
}
export function shallowEqual(a, b) {
    // While `undefined` should never be possible, it would sometimes be the case in IE 11
    // and pre-chromium Edge. The check below accounts for this edge case.
    const k1 = a ? getDataKeys(a) : undefined;
    const k2 = b ? getDataKeys(b) : undefined;
    if (!k1 || !k2 || k1.length != k2.length) {
        return false;
    }
    let key;
    for (let i = 0; i < k1.length; i++) {
        key = k1[i];
        if (!equalArraysOrString(a[key], b[key])) {
            return false;
        }
    }
    return true;
}
/**
 * Gets the keys of an object, including `symbol` keys.
 */
export function getDataKeys(obj) {
    return [...Object.keys(obj), ...Object.getOwnPropertySymbols(obj)];
}
/**
 * Test equality for arrays of strings or a string.
 */
export function equalArraysOrString(a, b) {
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length)
            return false;
        const aSorted = [...a].sort();
        const bSorted = [...b].sort();
        return aSorted.every((val, index) => bSorted[index] === val);
    }
    else {
        return a === b;
    }
}
/**
 * Return the last element of an array.
 */
export function last(a) {
    return a.length > 0 ? a[a.length - 1] : null;
}
export function wrapIntoObservable(value) {
    if (isObservable(value)) {
        return value;
    }
    if (isPromise(value)) {
        // Use `Promise.resolve()` to wrap promise-like instances.
        // Required ie when a Resolver returns a AngularJS `$q` promise to correctly trigger the
        // change detection.
        return from(Promise.resolve(value));
    }
    return of(value);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3JvdXRlci9zcmMvdXRpbHMvY29sbGVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxJQUFJLFNBQVMsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN0RCxPQUFPLEVBQUMsSUFBSSxFQUFFLFlBQVksRUFBYyxFQUFFLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFFeEQsTUFBTSxVQUFVLGtCQUFrQixDQUFDLENBQVEsRUFBRSxDQUFRO0lBQ25ELElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsTUFBTTtRQUFFLE9BQU8sS0FBSyxDQUFDO0lBQ3hDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDbEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQUUsT0FBTyxLQUFLLENBQUM7SUFDOUMsQ0FBQztJQUNELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVELE1BQU0sVUFBVSxZQUFZLENBQzFCLENBQWdDLEVBQ2hDLENBQWdDO0lBRWhDLHNGQUFzRjtJQUN0RixzRUFBc0U7SUFDdEUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztJQUMxQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0lBQzFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDekMsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBQ0QsSUFBSSxHQUFvQixDQUFDO0lBQ3pCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDbkMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNaLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUN6QyxPQUFPLEtBQUssQ0FBQztRQUNmLENBQUM7SUFDSCxDQUFDO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLFVBQVUsV0FBVyxDQUFDLEdBQVc7SUFDckMsT0FBTyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLENBQUM7QUFFRDs7R0FFRztBQUNILE1BQU0sVUFBVSxtQkFBbUIsQ0FBQyxDQUFvQixFQUFFLENBQW9CO0lBQzVFLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDekMsSUFBSSxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxNQUFNO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFDeEMsTUFBTSxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzlCLE1BQU0sT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUM5QixPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7SUFDL0QsQ0FBQztTQUFNLENBQUM7UUFDTixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakIsQ0FBQztBQUNILENBQUM7QUFFRDs7R0FFRztBQUNILE1BQU0sVUFBVSxJQUFJLENBQUksQ0FBTTtJQUM1QixPQUFPLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQy9DLENBQUM7QUFFRCxNQUFNLFVBQVUsa0JBQWtCLENBQUksS0FBcUM7SUFDekUsSUFBSSxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUN4QixPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCxJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ3JCLDBEQUEwRDtRQUMxRCx3RkFBd0Y7UUFDeEYsb0JBQW9CO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRUQsT0FBTyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbkIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHvJtWlzUHJvbWlzZSBhcyBpc1Byb21pc2V9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtmcm9tLCBpc09ic2VydmFibGUsIE9ic2VydmFibGUsIG9mfSBmcm9tICdyeGpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIHNoYWxsb3dFcXVhbEFycmF5cyhhOiBhbnlbXSwgYjogYW55W10pOiBib29sZWFuIHtcbiAgaWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGEubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoIXNoYWxsb3dFcXVhbChhW2ldLCBiW2ldKSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hhbGxvd0VxdWFsKFxuICBhOiB7W2tleTogc3RyaW5nIHwgc3ltYm9sXTogYW55fSxcbiAgYjoge1trZXk6IHN0cmluZyB8IHN5bWJvbF06IGFueX0sXG4pOiBib29sZWFuIHtcbiAgLy8gV2hpbGUgYHVuZGVmaW5lZGAgc2hvdWxkIG5ldmVyIGJlIHBvc3NpYmxlLCBpdCB3b3VsZCBzb21ldGltZXMgYmUgdGhlIGNhc2UgaW4gSUUgMTFcbiAgLy8gYW5kIHByZS1jaHJvbWl1bSBFZGdlLiBUaGUgY2hlY2sgYmVsb3cgYWNjb3VudHMgZm9yIHRoaXMgZWRnZSBjYXNlLlxuICBjb25zdCBrMSA9IGEgPyBnZXREYXRhS2V5cyhhKSA6IHVuZGVmaW5lZDtcbiAgY29uc3QgazIgPSBiID8gZ2V0RGF0YUtleXMoYikgOiB1bmRlZmluZWQ7XG4gIGlmICghazEgfHwgIWsyIHx8IGsxLmxlbmd0aCAhPSBrMi5sZW5ndGgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgbGV0IGtleTogc3RyaW5nIHwgc3ltYm9sO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGsxLmxlbmd0aDsgaSsrKSB7XG4gICAga2V5ID0gazFbaV07XG4gICAgaWYgKCFlcXVhbEFycmF5c09yU3RyaW5nKGFba2V5XSwgYltrZXldKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBrZXlzIG9mIGFuIG9iamVjdCwgaW5jbHVkaW5nIGBzeW1ib2xgIGtleXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXREYXRhS2V5cyhvYmo6IE9iamVjdCk6IEFycmF5PHN0cmluZyB8IHN5bWJvbD4ge1xuICByZXR1cm4gWy4uLk9iamVjdC5rZXlzKG9iaiksIC4uLk9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMob2JqKV07XG59XG5cbi8qKlxuICogVGVzdCBlcXVhbGl0eSBmb3IgYXJyYXlzIG9mIHN0cmluZ3Mgb3IgYSBzdHJpbmcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlcXVhbEFycmF5c09yU3RyaW5nKGE6IHN0cmluZyB8IHN0cmluZ1tdLCBiOiBzdHJpbmcgfCBzdHJpbmdbXSkge1xuICBpZiAoQXJyYXkuaXNBcnJheShhKSAmJiBBcnJheS5pc0FycmF5KGIpKSB7XG4gICAgaWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IGFTb3J0ZWQgPSBbLi4uYV0uc29ydCgpO1xuICAgIGNvbnN0IGJTb3J0ZWQgPSBbLi4uYl0uc29ydCgpO1xuICAgIHJldHVybiBhU29ydGVkLmV2ZXJ5KCh2YWwsIGluZGV4KSA9PiBiU29ydGVkW2luZGV4XSA9PT0gdmFsKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYSA9PT0gYjtcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybiB0aGUgbGFzdCBlbGVtZW50IG9mIGFuIGFycmF5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gbGFzdDxUPihhOiBUW10pOiBUIHwgbnVsbCB7XG4gIHJldHVybiBhLmxlbmd0aCA+IDAgPyBhW2EubGVuZ3RoIC0gMV0gOiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd3JhcEludG9PYnNlcnZhYmxlPFQ+KHZhbHVlOiBUIHwgUHJvbWlzZTxUPiB8IE9ic2VydmFibGU8VD4pOiBPYnNlcnZhYmxlPFQ+IHtcbiAgaWYgKGlzT2JzZXJ2YWJsZSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICBpZiAoaXNQcm9taXNlKHZhbHVlKSkge1xuICAgIC8vIFVzZSBgUHJvbWlzZS5yZXNvbHZlKClgIHRvIHdyYXAgcHJvbWlzZS1saWtlIGluc3RhbmNlcy5cbiAgICAvLyBSZXF1aXJlZCBpZSB3aGVuIGEgUmVzb2x2ZXIgcmV0dXJucyBhIEFuZ3VsYXJKUyBgJHFgIHByb21pc2UgdG8gY29ycmVjdGx5IHRyaWdnZXIgdGhlXG4gICAgLy8gY2hhbmdlIGRldGVjdGlvbi5cbiAgICByZXR1cm4gZnJvbShQcm9taXNlLnJlc29sdmUodmFsdWUpKTtcbiAgfVxuXG4gIHJldHVybiBvZih2YWx1ZSk7XG59XG4iXX0=