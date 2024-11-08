/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { assertInInjectionContext, DestroyRef, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
/**
 * Operator which completes the Observable when the calling context (component, directive, service,
 * etc) is destroyed.
 *
 * @param destroyRef optionally, the `DestroyRef` representing the current context. This can be
 *     passed explicitly to use `takeUntilDestroyed` outside of an [injection
 * context](guide/di/dependency-injection-context). Otherwise, the current `DestroyRef` is injected.
 *
 * @developerPreview
 */
export function takeUntilDestroyed(destroyRef) {
    if (!destroyRef) {
        assertInInjectionContext(takeUntilDestroyed);
        destroyRef = inject(DestroyRef);
    }
    const destroyed$ = new Observable((observer) => {
        const unregisterFn = destroyRef.onDestroy(observer.next.bind(observer));
        return unregisterFn;
    });
    return (source) => {
        return source.pipe(takeUntil(destroyed$));
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFrZV91bnRpbF9kZXN0cm95ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3J4anMtaW50ZXJvcC9zcmMvdGFrZV91bnRpbF9kZXN0cm95ZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLHdCQUF3QixFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDM0UsT0FBTyxFQUEyQixVQUFVLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDMUQsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRXpDOzs7Ozs7Ozs7R0FTRztBQUNILE1BQU0sVUFBVSxrQkFBa0IsQ0FBSSxVQUF1QjtJQUMzRCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDaEIsd0JBQXdCLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUM3QyxVQUFVLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRCxNQUFNLFVBQVUsR0FBRyxJQUFJLFVBQVUsQ0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFO1FBQ25ELE1BQU0sWUFBWSxHQUFHLFVBQVcsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUN6RSxPQUFPLFlBQVksQ0FBQztJQUN0QixDQUFDLENBQUMsQ0FBQztJQUVILE9BQU8sQ0FBSSxNQUFxQixFQUFFLEVBQUU7UUFDbEMsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBQzVDLENBQUMsQ0FBQztBQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7YXNzZXJ0SW5JbmplY3Rpb25Db250ZXh0LCBEZXN0cm95UmVmLCBpbmplY3R9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtNb25vVHlwZU9wZXJhdG9yRnVuY3Rpb24sIE9ic2VydmFibGV9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHt0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuLyoqXG4gKiBPcGVyYXRvciB3aGljaCBjb21wbGV0ZXMgdGhlIE9ic2VydmFibGUgd2hlbiB0aGUgY2FsbGluZyBjb250ZXh0IChjb21wb25lbnQsIGRpcmVjdGl2ZSwgc2VydmljZSxcbiAqIGV0YykgaXMgZGVzdHJveWVkLlxuICpcbiAqIEBwYXJhbSBkZXN0cm95UmVmIG9wdGlvbmFsbHksIHRoZSBgRGVzdHJveVJlZmAgcmVwcmVzZW50aW5nIHRoZSBjdXJyZW50IGNvbnRleHQuIFRoaXMgY2FuIGJlXG4gKiAgICAgcGFzc2VkIGV4cGxpY2l0bHkgdG8gdXNlIGB0YWtlVW50aWxEZXN0cm95ZWRgIG91dHNpZGUgb2YgYW4gW2luamVjdGlvblxuICogY29udGV4dF0oZ3VpZGUvZGkvZGVwZW5kZW5jeS1pbmplY3Rpb24tY29udGV4dCkuIE90aGVyd2lzZSwgdGhlIGN1cnJlbnQgYERlc3Ryb3lSZWZgIGlzIGluamVjdGVkLlxuICpcbiAqIEBkZXZlbG9wZXJQcmV2aWV3XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0YWtlVW50aWxEZXN0cm95ZWQ8VD4oZGVzdHJveVJlZj86IERlc3Ryb3lSZWYpOiBNb25vVHlwZU9wZXJhdG9yRnVuY3Rpb248VD4ge1xuICBpZiAoIWRlc3Ryb3lSZWYpIHtcbiAgICBhc3NlcnRJbkluamVjdGlvbkNvbnRleHQodGFrZVVudGlsRGVzdHJveWVkKTtcbiAgICBkZXN0cm95UmVmID0gaW5qZWN0KERlc3Ryb3lSZWYpO1xuICB9XG5cbiAgY29uc3QgZGVzdHJveWVkJCA9IG5ldyBPYnNlcnZhYmxlPHZvaWQ+KChvYnNlcnZlcikgPT4ge1xuICAgIGNvbnN0IHVucmVnaXN0ZXJGbiA9IGRlc3Ryb3lSZWYhLm9uRGVzdHJveShvYnNlcnZlci5uZXh0LmJpbmQob2JzZXJ2ZXIpKTtcbiAgICByZXR1cm4gdW5yZWdpc3RlckZuO1xuICB9KTtcblxuICByZXR1cm4gPFQ+KHNvdXJjZTogT2JzZXJ2YWJsZTxUPikgPT4ge1xuICAgIHJldHVybiBzb3VyY2UucGlwZSh0YWtlVW50aWwoZGVzdHJveWVkJCkpO1xuICB9O1xufVxuIl19