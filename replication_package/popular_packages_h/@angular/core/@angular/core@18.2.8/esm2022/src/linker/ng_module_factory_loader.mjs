/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { NgModuleFactory as R3NgModuleFactory } from '../render3/ng_module_ref';
import { getRegisteredNgModuleType } from './ng_module_registration';
/**
 * Returns the NgModuleFactory with the given id (specified using [@NgModule.id
 * field](api/core/NgModule#id)), if it exists and has been loaded. Factories for NgModules that do
 * not specify an `id` cannot be retrieved. Throws if an NgModule cannot be found.
 * @publicApi
 * @deprecated Use `getNgModuleById` instead.
 */
export function getModuleFactory(id) {
    const type = getRegisteredNgModuleType(id);
    if (!type)
        throw noModuleError(id);
    return new R3NgModuleFactory(type);
}
/**
 * Returns the NgModule class with the given id (specified using [@NgModule.id
 * field](api/core/NgModule#id)), if it exists and has been loaded. Classes for NgModules that do
 * not specify an `id` cannot be retrieved. Throws if an NgModule cannot be found.
 * @publicApi
 */
export function getNgModuleById(id) {
    const type = getRegisteredNgModuleType(id);
    if (!type)
        throw noModuleError(id);
    return type;
}
function noModuleError(id) {
    return new Error(`No module with ID ${id} loaded`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfbW9kdWxlX2ZhY3RvcnlfbG9hZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvbGlua2VyL25nX21vZHVsZV9mYWN0b3J5X2xvYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFHSCxPQUFPLEVBQUMsZUFBZSxJQUFJLGlCQUFpQixFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFHOUUsT0FBTyxFQUFDLHlCQUF5QixFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFFbkU7Ozs7OztHQU1HO0FBQ0gsTUFBTSxVQUFVLGdCQUFnQixDQUFDLEVBQVU7SUFDekMsTUFBTSxJQUFJLEdBQUcseUJBQXlCLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDM0MsSUFBSSxDQUFDLElBQUk7UUFBRSxNQUFNLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNuQyxPQUFPLElBQUksaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDckMsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsTUFBTSxVQUFVLGVBQWUsQ0FBSSxFQUFVO0lBQzNDLE1BQU0sSUFBSSxHQUFHLHlCQUF5QixDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzNDLElBQUksQ0FBQyxJQUFJO1FBQUUsTUFBTSxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDbkMsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBRUQsU0FBUyxhQUFhLENBQUMsRUFBVTtJQUMvQixPQUFPLElBQUksS0FBSyxDQUFDLHFCQUFxQixFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQ3JELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7VHlwZX0gZnJvbSAnLi4vaW50ZXJmYWNlL3R5cGUnO1xuaW1wb3J0IHtOZ01vZHVsZUZhY3RvcnkgYXMgUjNOZ01vZHVsZUZhY3Rvcnl9IGZyb20gJy4uL3JlbmRlcjMvbmdfbW9kdWxlX3JlZic7XG5cbmltcG9ydCB7TmdNb2R1bGVGYWN0b3J5fSBmcm9tICcuL25nX21vZHVsZV9mYWN0b3J5JztcbmltcG9ydCB7Z2V0UmVnaXN0ZXJlZE5nTW9kdWxlVHlwZX0gZnJvbSAnLi9uZ19tb2R1bGVfcmVnaXN0cmF0aW9uJztcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBOZ01vZHVsZUZhY3Rvcnkgd2l0aCB0aGUgZ2l2ZW4gaWQgKHNwZWNpZmllZCB1c2luZyBbQE5nTW9kdWxlLmlkXG4gKiBmaWVsZF0oYXBpL2NvcmUvTmdNb2R1bGUjaWQpKSwgaWYgaXQgZXhpc3RzIGFuZCBoYXMgYmVlbiBsb2FkZWQuIEZhY3RvcmllcyBmb3IgTmdNb2R1bGVzIHRoYXQgZG9cbiAqIG5vdCBzcGVjaWZ5IGFuIGBpZGAgY2Fubm90IGJlIHJldHJpZXZlZC4gVGhyb3dzIGlmIGFuIE5nTW9kdWxlIGNhbm5vdCBiZSBmb3VuZC5cbiAqIEBwdWJsaWNBcGlcbiAqIEBkZXByZWNhdGVkIFVzZSBgZ2V0TmdNb2R1bGVCeUlkYCBpbnN0ZWFkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TW9kdWxlRmFjdG9yeShpZDogc3RyaW5nKTogTmdNb2R1bGVGYWN0b3J5PGFueT4ge1xuICBjb25zdCB0eXBlID0gZ2V0UmVnaXN0ZXJlZE5nTW9kdWxlVHlwZShpZCk7XG4gIGlmICghdHlwZSkgdGhyb3cgbm9Nb2R1bGVFcnJvcihpZCk7XG4gIHJldHVybiBuZXcgUjNOZ01vZHVsZUZhY3RvcnkodHlwZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgTmdNb2R1bGUgY2xhc3Mgd2l0aCB0aGUgZ2l2ZW4gaWQgKHNwZWNpZmllZCB1c2luZyBbQE5nTW9kdWxlLmlkXG4gKiBmaWVsZF0oYXBpL2NvcmUvTmdNb2R1bGUjaWQpKSwgaWYgaXQgZXhpc3RzIGFuZCBoYXMgYmVlbiBsb2FkZWQuIENsYXNzZXMgZm9yIE5nTW9kdWxlcyB0aGF0IGRvXG4gKiBub3Qgc3BlY2lmeSBhbiBgaWRgIGNhbm5vdCBiZSByZXRyaWV2ZWQuIFRocm93cyBpZiBhbiBOZ01vZHVsZSBjYW5ub3QgYmUgZm91bmQuXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXROZ01vZHVsZUJ5SWQ8VD4oaWQ6IHN0cmluZyk6IFR5cGU8VD4ge1xuICBjb25zdCB0eXBlID0gZ2V0UmVnaXN0ZXJlZE5nTW9kdWxlVHlwZShpZCk7XG4gIGlmICghdHlwZSkgdGhyb3cgbm9Nb2R1bGVFcnJvcihpZCk7XG4gIHJldHVybiB0eXBlO1xufVxuXG5mdW5jdGlvbiBub01vZHVsZUVycm9yKGlkOiBzdHJpbmcpOiBFcnJvciB7XG4gIHJldHVybiBuZXcgRXJyb3IoYE5vIG1vZHVsZSB3aXRoIElEICR7aWR9IGxvYWRlZGApO1xufVxuIl19