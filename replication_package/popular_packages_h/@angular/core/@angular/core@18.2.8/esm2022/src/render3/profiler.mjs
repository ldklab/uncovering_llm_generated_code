/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
let profilerCallback = null;
/**
 * Sets the callback function which will be invoked before and after performing certain actions at
 * runtime (for example, before and after running change detection).
 *
 * Warning: this function is *INTERNAL* and should not be relied upon in application's code.
 * The contract of the function might be changed in any release and/or the function can be removed
 * completely.
 *
 * @param profiler function provided by the caller or null value to disable profiling.
 */
export const setProfiler = (profiler) => {
    profilerCallback = profiler;
};
/**
 * Profiler function which wraps user code executed by the runtime.
 *
 * @param event ProfilerEvent corresponding to the execution context
 * @param instance component instance
 * @param hookOrListener lifecycle hook function or output listener. The value depends on the
 *  execution context
 * @returns
 */
export const profiler = function (event, instance, hookOrListener) {
    if (profilerCallback != null /* both `null` and `undefined` */) {
        profilerCallback(event, instance, hookOrListener);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZmlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL3Byb2ZpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUlILElBQUksZ0JBQWdCLEdBQW9CLElBQUksQ0FBQztBQUU3Qzs7Ozs7Ozs7O0dBU0c7QUFDSCxNQUFNLENBQUMsTUFBTSxXQUFXLEdBQUcsQ0FBQyxRQUF5QixFQUFFLEVBQUU7SUFDdkQsZ0JBQWdCLEdBQUcsUUFBUSxDQUFDO0FBQzlCLENBQUMsQ0FBQztBQUVGOzs7Ozs7OztHQVFHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sUUFBUSxHQUFhLFVBQVUsS0FBSyxFQUFFLFFBQVEsRUFBRSxjQUFjO0lBQ3pFLElBQUksZ0JBQWdCLElBQUksSUFBSSxDQUFDLGlDQUFpQyxFQUFFLENBQUM7UUFDL0QsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUNwRCxDQUFDO0FBQ0gsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3R5cGUgUHJvZmlsZXJ9IGZyb20gJy4vcHJvZmlsZXJfdHlwZXMnO1xuXG5sZXQgcHJvZmlsZXJDYWxsYmFjazogUHJvZmlsZXIgfCBudWxsID0gbnVsbDtcblxuLyoqXG4gKiBTZXRzIHRoZSBjYWxsYmFjayBmdW5jdGlvbiB3aGljaCB3aWxsIGJlIGludm9rZWQgYmVmb3JlIGFuZCBhZnRlciBwZXJmb3JtaW5nIGNlcnRhaW4gYWN0aW9ucyBhdFxuICogcnVudGltZSAoZm9yIGV4YW1wbGUsIGJlZm9yZSBhbmQgYWZ0ZXIgcnVubmluZyBjaGFuZ2UgZGV0ZWN0aW9uKS5cbiAqXG4gKiBXYXJuaW5nOiB0aGlzIGZ1bmN0aW9uIGlzICpJTlRFUk5BTCogYW5kIHNob3VsZCBub3QgYmUgcmVsaWVkIHVwb24gaW4gYXBwbGljYXRpb24ncyBjb2RlLlxuICogVGhlIGNvbnRyYWN0IG9mIHRoZSBmdW5jdGlvbiBtaWdodCBiZSBjaGFuZ2VkIGluIGFueSByZWxlYXNlIGFuZC9vciB0aGUgZnVuY3Rpb24gY2FuIGJlIHJlbW92ZWRcbiAqIGNvbXBsZXRlbHkuXG4gKlxuICogQHBhcmFtIHByb2ZpbGVyIGZ1bmN0aW9uIHByb3ZpZGVkIGJ5IHRoZSBjYWxsZXIgb3IgbnVsbCB2YWx1ZSB0byBkaXNhYmxlIHByb2ZpbGluZy5cbiAqL1xuZXhwb3J0IGNvbnN0IHNldFByb2ZpbGVyID0gKHByb2ZpbGVyOiBQcm9maWxlciB8IG51bGwpID0+IHtcbiAgcHJvZmlsZXJDYWxsYmFjayA9IHByb2ZpbGVyO1xufTtcblxuLyoqXG4gKiBQcm9maWxlciBmdW5jdGlvbiB3aGljaCB3cmFwcyB1c2VyIGNvZGUgZXhlY3V0ZWQgYnkgdGhlIHJ1bnRpbWUuXG4gKlxuICogQHBhcmFtIGV2ZW50IFByb2ZpbGVyRXZlbnQgY29ycmVzcG9uZGluZyB0byB0aGUgZXhlY3V0aW9uIGNvbnRleHRcbiAqIEBwYXJhbSBpbnN0YW5jZSBjb21wb25lbnQgaW5zdGFuY2VcbiAqIEBwYXJhbSBob29rT3JMaXN0ZW5lciBsaWZlY3ljbGUgaG9vayBmdW5jdGlvbiBvciBvdXRwdXQgbGlzdGVuZXIuIFRoZSB2YWx1ZSBkZXBlbmRzIG9uIHRoZVxuICogIGV4ZWN1dGlvbiBjb250ZXh0XG4gKiBAcmV0dXJuc1xuICovXG5leHBvcnQgY29uc3QgcHJvZmlsZXI6IFByb2ZpbGVyID0gZnVuY3Rpb24gKGV2ZW50LCBpbnN0YW5jZSwgaG9va09yTGlzdGVuZXIpIHtcbiAgaWYgKHByb2ZpbGVyQ2FsbGJhY2sgIT0gbnVsbCAvKiBib3RoIGBudWxsYCBhbmQgYHVuZGVmaW5lZGAgKi8pIHtcbiAgICBwcm9maWxlckNhbGxiYWNrKGV2ZW50LCBpbnN0YW5jZSwgaG9va09yTGlzdGVuZXIpO1xuICB9XG59O1xuIl19