/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Used to resolve resource URLs on `@Component` when used with JIT compilation.
 *
 * Example:
 * ```
 * @Component({
 *   selector: 'my-comp',
 *   templateUrl: 'my-comp.html', // This requires asynchronous resolution
 * })
 * class MyComponent{
 * }
 *
 * // Calling `renderComponent` will fail because `renderComponent` is a synchronous process
 * // and `MyComponent`'s `@Component.templateUrl` needs to be resolved asynchronously.
 *
 * // Calling `resolveComponentResources()` will resolve `@Component.templateUrl` into
 * // `@Component.template`, which allows `renderComponent` to proceed in a synchronous manner.
 *
 * // Use browser's `fetch()` function as the default resource resolution strategy.
 * resolveComponentResources(fetch).then(() => {
 *   // After resolution all URLs have been converted into `template` strings.
 *   renderComponent(MyComponent);
 * });
 *
 * ```
 *
 * NOTE: In AOT the resolution happens during compilation, and so there should be no need
 * to call this method outside JIT mode.
 *
 * @param resourceResolver a function which is responsible for returning a `Promise` to the
 * contents of the resolved URL. Browser's `fetch()` method is a good default implementation.
 */
export function resolveComponentResources(resourceResolver) {
    // Store all promises which are fetching the resources.
    const componentResolved = [];
    // Cache so that we don't fetch the same resource more than once.
    const urlMap = new Map();
    function cachedResourceResolve(url) {
        let promise = urlMap.get(url);
        if (!promise) {
            const resp = resourceResolver(url);
            urlMap.set(url, (promise = resp.then(unwrapResponse)));
        }
        return promise;
    }
    componentResourceResolutionQueue.forEach((component, type) => {
        const promises = [];
        if (component.templateUrl) {
            promises.push(cachedResourceResolve(component.templateUrl).then((template) => {
                component.template = template;
            }));
        }
        const styles = typeof component.styles === 'string' ? [component.styles] : component.styles || [];
        component.styles = styles;
        if (component.styleUrl && component.styleUrls?.length) {
            throw new Error('@Component cannot define both `styleUrl` and `styleUrls`. ' +
                'Use `styleUrl` if the component has one stylesheet, or `styleUrls` if it has multiple');
        }
        else if (component.styleUrls?.length) {
            const styleOffset = component.styles.length;
            const styleUrls = component.styleUrls;
            component.styleUrls.forEach((styleUrl, index) => {
                styles.push(''); // pre-allocate array.
                promises.push(cachedResourceResolve(styleUrl).then((style) => {
                    styles[styleOffset + index] = style;
                    styleUrls.splice(styleUrls.indexOf(styleUrl), 1);
                    if (styleUrls.length == 0) {
                        component.styleUrls = undefined;
                    }
                }));
            });
        }
        else if (component.styleUrl) {
            promises.push(cachedResourceResolve(component.styleUrl).then((style) => {
                styles.push(style);
                component.styleUrl = undefined;
            }));
        }
        const fullyResolved = Promise.all(promises).then(() => componentDefResolved(type));
        componentResolved.push(fullyResolved);
    });
    clearResolutionOfComponentResourcesQueue();
    return Promise.all(componentResolved).then(() => undefined);
}
let componentResourceResolutionQueue = new Map();
// Track when existing ɵcmp for a Type is waiting on resources.
const componentDefPendingResolution = new Set();
export function maybeQueueResolutionOfComponentResources(type, metadata) {
    if (componentNeedsResolution(metadata)) {
        componentResourceResolutionQueue.set(type, metadata);
        componentDefPendingResolution.add(type);
    }
}
export function isComponentDefPendingResolution(type) {
    return componentDefPendingResolution.has(type);
}
export function componentNeedsResolution(component) {
    return !!((component.templateUrl && !component.hasOwnProperty('template')) ||
        (component.styleUrls && component.styleUrls.length) ||
        component.styleUrl);
}
export function clearResolutionOfComponentResourcesQueue() {
    const old = componentResourceResolutionQueue;
    componentResourceResolutionQueue = new Map();
    return old;
}
export function restoreComponentResolutionQueue(queue) {
    componentDefPendingResolution.clear();
    queue.forEach((_, type) => componentDefPendingResolution.add(type));
    componentResourceResolutionQueue = queue;
}
export function isComponentResourceResolutionQueueEmpty() {
    return componentResourceResolutionQueue.size === 0;
}
function unwrapResponse(response) {
    return typeof response == 'string' ? response : response.text();
}
function componentDefResolved(type) {
    componentDefPendingResolution.delete(type);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2VfbG9hZGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL21ldGFkYXRhL3Jlc291cmNlX2xvYWRpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBTUg7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0ErQkc7QUFDSCxNQUFNLFVBQVUseUJBQXlCLENBQ3ZDLGdCQUE4RTtJQUU5RSx1REFBdUQ7SUFDdkQsTUFBTSxpQkFBaUIsR0FBb0IsRUFBRSxDQUFDO0lBRTlDLGlFQUFpRTtJQUNqRSxNQUFNLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBMkIsQ0FBQztJQUNsRCxTQUFTLHFCQUFxQixDQUFDLEdBQVc7UUFDeEMsSUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM5QixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDYixNQUFNLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNuQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6RCxDQUFDO1FBQ0QsT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQztJQUVELGdDQUFnQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQW9CLEVBQUUsSUFBZSxFQUFFLEVBQUU7UUFDakYsTUFBTSxRQUFRLEdBQW9CLEVBQUUsQ0FBQztRQUNyQyxJQUFJLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUMxQixRQUFRLENBQUMsSUFBSSxDQUNYLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRTtnQkFDN0QsU0FBUyxDQUFDLFFBQVEsR0FB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QUMzQyw2QkFBNkIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDN0MsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtUeXBlfSBmcm9tICcuLi9pbnRlcmZhY2UvdHlwZSc7XG5cbmltcG9ydCB7Q29tcG9uZW50fSBmcm9tICcuL2RpcmVjdGl2ZXMnO1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSByZXNvdXJjZSBVUkxzIG9uIGBAQ29tcG9uZW50YCB3aGVuIHVzZWQgd2l0aCBKSVQgY29tcGlsYXRpb24uXG4gKlxuICogRXhhbXBsZTpcbiAqIGBgYFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnbXktY29tcCcsXG4gKiAgIHRlbXBsYXRlVXJsOiAnbXktY29tcC5odG1sJywgLy8gVGhpcyByZXF1aXJlcyBhc3luY2hyb25vdXMgcmVzb2x1dGlvblxuICogfSlcbiAqIGNsYXNzIE15Q29tcG9uZW50e1xuICogfVxuICpcbiAqIC8vIENhbGxpbmcgYHJlbmRlckNvbXBvbmVudGAgd2lsbCBmYWlsIGJlY2F1c2UgYHJlbmRlckNvbXBvbmVudGAgaXMgYSBzeW5jaHJvbm91cyBwcm9jZXNzXG4gKiAvLyBhbmQgYE15Q29tcG9uZW50YCdzIGBAQ29tcG9uZW50LnRlbXBsYXRlVXJsYCBuZWVkcyB0byBiZSByZXNvbHZlZCBhc3luY2hyb25vdXNseS5cbiAqXG4gKiAvLyBDYWxsaW5nIGByZXNvbHZlQ29tcG9uZW50UmVzb3VyY2VzKClgIHdpbGwgcmVzb2x2ZSBgQENvbXBvbmVudC50ZW1wbGF0ZVVybGAgaW50b1xuICogLy8gYEBDb21wb25lbnQudGVtcGxhdGVgLCB3aGljaCBhbGxvd3MgYHJlbmRlckNvbXBvbmVudGAgdG8gcHJvY2VlZCBpbiBhIHN5bmNocm9ub3VzIG1hbm5lci5cbiAqXG4gKiAvLyBVc2UgYnJvd3NlcidzIGBmZXRjaCgpYCBmdW5jdGlvbiBhcyB0aGUgZGVmYXVsdCByZXNvdXJjZSByZXNvbHV0aW9uIHN0cmF0ZWd5LlxuICogcmVzb2x2ZUNvbXBvbmVudFJlc291cmNlcyhmZXRjaCkudGhlbigoKSA9PiB7XG4gKiAgIC8vIEFmdGVyIHJlc29sdXRpb24gYWxsIFVSTHMgaGF2ZSBiZWVuIGNvbnZlcnRlZCBpbnRvIGB0ZW1wbGF0ZWAgc3RyaW5ncy5cbiAqICAgcmVuZGVyQ29tcG9uZW50KE15Q29tcG9uZW50KTtcbiAqIH0pO1xuICpcbiAqIGBgYFxuICpcbiAqIE5PVEU6IEluIEFPVCB0aGUgcmVzb2x1dGlvbiBoYXBwZW5zIGR1cmluZyBjb21waWxhdGlvbiwgYW5kIHNvIHRoZXJlIHNob3VsZCBiZSBubyBuZWVkXG4gKiB0byBjYWxsIHRoaXMgbWV0aG9kIG91dHNpZGUgSklUIG1vZGUuXG4gKlxuICogQHBhcmFtIHJlc291cmNlUmVzb2x2ZXIgYSBmdW5jdGlvbiB3aGljaCBpcyByZXNwb25zaWJsZSBmb3IgcmV0dXJuaW5nIGEgYFByb21pc2VgIHRvIHRoZVxuICogY29udGVudHMgb2YgdGhlIHJlc29sdmVkIFVSTC4gQnJvd3NlcidzIGBmZXRjaCgpYCBtZXRob2QgaXMgYSBnb29kIGRlZmF1bHQgaW1wbGVtZW50YXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlQ29tcG9uZW50UmVzb3VyY2VzKFxuICByZXNvdXJjZVJlc29sdmVyOiAodXJsOiBzdHJpbmcpID0+IFByb21pc2U8c3RyaW5nIHwge3RleHQoKTogUHJvbWlzZTxzdHJpbmc+fT4sXG4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgLy8gU3RvcmUgYWxsIHByb21pc2VzIHdoaWNoIGFyZSBmZXRjaGluZyB0aGUgcmVzb3VyY2VzLlxuICBjb25zdCBjb21wb25lbnRSZXNvbHZlZDogUHJvbWlzZTx2b2lkPltdID0gW107XG5cbiAgLy8gQ2FjaGUgc28gdGhhdCB3ZSBkb24ndCBmZXRjaCB0aGUgc2FtZSByZXNvdXJjZSBtb3JlIHRoYW4gb25jZS5cbiAgY29uc3QgdXJsTWFwID0gbmV3IE1hcDxzdHJpbmcsIFByb21pc2U8c3RyaW5nPj4oKTtcbiAgZnVuY3Rpb24gY2FjaGVkUmVzb3VyY2VSZXNvbHZlKHVybDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBsZXQgcHJvbWlzZSA9IHVybE1hcC5nZXQodXJsKTtcbiAgICBpZiAoIXByb21pc2UpIHtcbiAgICAgIGNvbnN0IHJlc3AgPSByZXNvdXJjZVJlc29sdmVyKHVybCk7XG4gICAgICB1cmxNYXAuc2V0KHVybCwgKHByb21pc2UgPSByZXNwLnRoZW4odW53cmFwUmVzcG9uc2UpKSk7XG4gICAgfVxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbiAgY29tcG9uZW50UmVzb3VyY2VSZXNvbHV0aW9uUXVldWUuZm9yRWFjaCgoY29tcG9uZW50OiBDb21wb25lbnQsIHR5cGU6IFR5cGU8YW55PikgPT4ge1xuICAgIGNvbnN0IHByb21pc2VzOiBQcm9taXNlPHZvaWQ+W10gPSBbXTtcbiAgICBpZiAoY29tcG9uZW50LnRlbXBsYXRlVXJsKSB7XG4gICAgICBwcm9taXNlcy5wdXNoKFxuICAgICAgICBjYWNoZWRSZXNvdXJjZVJlc29sdmUoY29tcG9uZW50LnRlbXBsYXRlVXJsKS50aGVuKCh0ZW1wbGF0ZSkgPT4ge1xuICAgICAgICAgIGNvbXBvbmVudC50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAgICAgICB9KSxcbiAgICAgICk7XG4gICAgfVxuICAgIGNvbnN0IHN0eWxlcyA9XG4gICAgICB0eXBlb2YgY29tcG9uZW50LnN0eWxlcyA9PT0gJ3N0cmluZycgPyBbY29tcG9uZW50LnN0eWxlc10gOiBjb21wb25lbnQuc3R5bGVzIHx8IFtdO1xuICAgIGNvbXBvbmVudC5zdHlsZXMgPSBzdHlsZXM7XG5cbiAgICBpZiAoY29tcG9uZW50LnN0eWxlVXJsICYmIGNvbXBvbmVudC5zdHlsZVVybHM/Lmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnQENvbXBvbmVudCBjYW5ub3QgZGVmaW5lIGJvdGggYHN0eWxlVXJsYCBhbmQgYHN0eWxlVXJsc2AuICcgK1xuICAgICAgICAgICdVc2UgYHN0eWxlVXJsYCBpZiB0aGUgY29tcG9uZW50IGhhcyBvbmUgc3R5bGVzaGVldCwgb3IgYHN0eWxlVXJsc2AgaWYgaXQgaGFzIG11bHRpcGxlJyxcbiAgICAgICk7XG4gICAgfSBlbHNlIGlmIChjb21wb25lbnQuc3R5bGVVcmxzPy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHN0eWxlT2Zmc2V0ID0gY29tcG9uZW50LnN0eWxlcy5sZW5ndGg7XG4gICAgICBjb25zdCBzdHlsZVVybHMgPSBjb21wb25lbnQuc3R5bGVVcmxzO1xuICAgICAgY29tcG9uZW50LnN0eWxlVXJscy5mb3JFYWNoKChzdHlsZVVybCwgaW5kZXgpID0+IHtcbiAgICAgICAgc3R5bGVzLnB1c2goJycpOyAvLyBwcmUtYWxsb2NhdGUgYXJyYXkuXG4gICAgICAgIHByb21pc2VzLnB1c2goXG4gICAgICAgICAgY2FjaGVkUmVzb3VyY2VSZXNvbHZlKHN0eWxlVXJsKS50aGVuKChzdHlsZSkgPT4ge1xuICAgICAgICAgICAgc3R5bGVzW3N0eWxlT2Zmc2V0ICsgaW5kZXhdID0gc3R5bGU7XG4gICAgICAgICAgICBzdHlsZVVybHMuc3BsaWNlKHN0eWxlVXJscy5pbmRleE9mKHN0eWxlVXJsKSwgMSk7XG4gICAgICAgICAgICBpZiAoc3R5bGVVcmxzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICAgIGNvbXBvbmVudC5zdHlsZVVybHMgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSksXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKGNvbXBvbmVudC5zdHlsZVVybCkge1xuICAgICAgcHJvbWlzZXMucHVzaChcbiAgICAgICAgY2FjaGVkUmVzb3VyY2VSZXNvbHZlKGNvbXBvbmVudC5zdHlsZVVybCkudGhlbigoc3R5bGUpID0+IHtcbiAgICAgICAgICBzdHlsZXMucHVzaChzdHlsZSk7XG4gICAgICAgICAgY29tcG9uZW50LnN0eWxlVXJsID0gdW5kZWZpbmVkO1xuICAgICAgICB9KSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgZnVsbHlSZXNvbHZlZCA9IFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKCgpID0+IGNvbXBvbmVudERlZlJlc29sdmVkKHR5cGUpKTtcbiAgICBjb21wb25lbnRSZXNvbHZlZC5wdXNoKGZ1bGx5UmVzb2x2ZWQpO1xuICB9KTtcbiAgY2xlYXJSZXNvbHV0aW9uT2ZDb21wb25lbnRSZXNvdXJjZXNRdWV1ZSgpO1xuICByZXR1cm4gUHJvbWlzZS5hbGwoY29tcG9uZW50UmVzb2x2ZWQpLnRoZW4oKCkgPT4gdW5kZWZpbmVkKTtcbn1cblxubGV0IGNvbXBvbmVudFJlc291cmNlUmVzb2x1dGlvblF1ZXVlID0gbmV3IE1hcDxUeXBlPGFueT4sIENvbXBvbmVudD4oKTtcblxuLy8gVHJhY2sgd2hlbiBleGlzdGluZyDJtWNtcCBmb3IgYSBUeXBlIGlzIHdhaXRpbmcgb24gcmVzb3VyY2VzLlxuY29uc3QgY29tcG9uZW50RGVmUGVuZGluZ1Jlc29sdXRpb24gPSBuZXcgU2V0PFR5cGU8YW55Pj4oKTtcblxuZXhwb3J0IGZ1bmN0aW9uIG1heWJlUXVldWVSZXNvbHV0aW9uT2ZDb21wb25lbnRSZXNvdXJjZXModHlwZTogVHlwZTxhbnk+LCBtZXRhZGF0YTogQ29tcG9uZW50KSB7XG4gIGlmIChjb21wb25lbnROZWVkc1Jlc29sdXRpb24obWV0YWRhdGEpKSB7XG4gICAgY29tcG9uZW50UmVzb3VyY2VSZXNvbHV0aW9uUXVldWUuc2V0KHR5cGUsIG1ldGFkYXRhKTtcbiAgICBjb21wb25lbnREZWZQZW5kaW5nUmVzb2x1dGlvbi5hZGQodHlwZSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQ29tcG9uZW50RGVmUGVuZGluZ1Jlc29sdXRpb24odHlwZTogVHlwZTxhbnk+KTogYm9vbGVhbiB7XG4gIHJldHVybiBjb21wb25lbnREZWZQZW5kaW5nUmVzb2x1dGlvbi5oYXModHlwZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21wb25lbnROZWVkc1Jlc29sdXRpb24oY29tcG9uZW50OiBDb21wb25lbnQpOiBib29sZWFuIHtcbiAgcmV0dXJuICEhKFxuICAgIChjb21wb25lbnQudGVtcGxhdGVVcmwgJiYgIWNvbXBvbmVudC5oYXNPd25Qcm9wZXJ0eSgndGVtcGxhdGUnKSkgfHxcbiAgICAoY29tcG9uZW50LnN0eWxlVXJscyAmJiBjb21wb25lbnQuc3R5bGVVcmxzLmxlbmd0aCkgfHxcbiAgICBjb21wb25lbnQuc3R5bGVVcmxcbiAgKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjbGVhclJlc29sdXRpb25PZkNvbXBvbmVudFJlc291cmNlc1F1ZXVlKCk6IE1hcDxUeXBlPGFueT4sIENvbXBvbmVudD4ge1xuICBjb25zdCBvbGQgPSBjb21wb25lbnRSZXNvdXJjZVJlc29sdXRpb25RdWV1ZTtcbiAgY29tcG9uZW50UmVzb3VyY2VSZXNvbHV0aW9uUXVldWUgPSBuZXcgTWFwKCk7XG4gIHJldHVybiBvbGQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXN0b3JlQ29tcG9uZW50UmVzb2x1dGlvblF1ZXVlKHF1ZXVlOiBNYXA8VHlwZTxhbnk+LCBDb21wb25lbnQ+KTogdm9pZCB7XG4gIGNvbXBvbmVudERlZlBlbmRpbmdSZXNvbHV0aW9uLmNsZWFyKCk7XG4gIHF1ZXVlLmZvckVhY2goKF8sIHR5cGUpID0+IGNvbXBvbmVudERlZlBlbmRpbmdSZXNvbHV0aW9uLmFkZCh0eXBlKSk7XG4gIGNvbXBvbmVudFJlc291cmNlUmVzb2x1dGlvblF1ZXVlID0gcXVldWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NvbXBvbmVudFJlc291cmNlUmVzb2x1dGlvblF1ZXVlRW1wdHkoKSB7XG4gIHJldHVybiBjb21wb25lbnRSZXNvdXJjZVJlc29sdXRpb25RdWV1ZS5zaXplID09PSAwO1xufVxuXG5mdW5jdGlvbiB1bndyYXBSZXNwb25zZShyZXNwb25zZTogc3RyaW5nIHwge3RleHQoKTogUHJvbWlzZTxzdHJpbmc+fSk6IHN0cmluZyB8IFByb21pc2U8c3RyaW5nPiB7XG4gIHJldHVybiB0eXBlb2YgcmVzcG9uc2UgPT0gJ3N0cmluZycgPyByZXNwb25zZSA6IHJlc3BvbnNlLnRleHQoKTtcbn1cblxuZnVuY3Rpb24gY29tcG9uZW50RGVmUmVzb2x2ZWQodHlwZTogVHlwZTxhbnk+KTogdm9pZCB7XG4gIGNvbXBvbmVudERlZlBlbmRpbmdSZXNvbHV0aW9uLmRlbGV0ZSh0eXBlKTtcbn1cbiJdfQ==