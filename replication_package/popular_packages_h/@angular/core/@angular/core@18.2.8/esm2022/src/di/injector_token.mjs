/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { InjectionToken } from './injection_token';
/**
 * An InjectionToken that gets the current `Injector` for `createInjector()`-style injectors.
 *
 * Requesting this token instead of `Injector` allows `StaticInjector` to be tree-shaken from a
 * project.
 *
 * @publicApi
 */
export const INJECTOR = new InjectionToken(ngDevMode ? 'INJECTOR' : '', 
// Disable tslint because this is const enum which gets inlined not top level prop access.
// tslint:disable-next-line: no-toplevel-property-access
-1 /* InjectorMarkers.Injector */);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0b3JfdG9rZW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9kaS9pbmplY3Rvcl90b2tlbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFJakQ7Ozs7Ozs7R0FPRztBQUNILE1BQU0sQ0FBQyxNQUFNLFFBQVEsR0FBRyxJQUFJLGNBQWMsQ0FDeEMsU0FBUyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDM0IsMEZBQTBGO0FBQzFGLHdEQUF3RDtBQUN4RCxpQ0FBK0IsQ0FDaEMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3Rpb25Ub2tlbn0gZnJvbSAnLi9pbmplY3Rpb25fdG9rZW4nO1xuaW1wb3J0IHR5cGUge0luamVjdG9yfSBmcm9tICcuL2luamVjdG9yJztcbmltcG9ydCB7SW5qZWN0b3JNYXJrZXJzfSBmcm9tICcuL2luamVjdG9yX21hcmtlcic7XG5cbi8qKlxuICogQW4gSW5qZWN0aW9uVG9rZW4gdGhhdCBnZXRzIHRoZSBjdXJyZW50IGBJbmplY3RvcmAgZm9yIGBjcmVhdGVJbmplY3RvcigpYC1zdHlsZSBpbmplY3RvcnMuXG4gKlxuICogUmVxdWVzdGluZyB0aGlzIHRva2VuIGluc3RlYWQgb2YgYEluamVjdG9yYCBhbGxvd3MgYFN0YXRpY0luamVjdG9yYCB0byBiZSB0cmVlLXNoYWtlbiBmcm9tIGFcbiAqIHByb2plY3QuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgSU5KRUNUT1IgPSBuZXcgSW5qZWN0aW9uVG9rZW48SW5qZWN0b3I+KFxuICBuZ0Rldk1vZGUgPyAnSU5KRUNUT1InIDogJycsXG4gIC8vIERpc2FibGUgdHNsaW50IGJlY2F1c2UgdGhpcyBpcyBjb25zdCBlbnVtIHdoaWNoIGdldHMgaW5saW5lZCBub3QgdG9wIGxldmVsIHByb3AgYWNjZXNzLlxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLXRvcGxldmVsLXByb3BlcnR5LWFjY2Vzc1xuICBJbmplY3Rvck1hcmtlcnMuSW5qZWN0b3IgYXMgYW55LCAvLyBTcGVjaWFsIHZhbHVlIHVzZWQgYnkgSXZ5IHRvIGlkZW50aWZ5IGBJbmplY3RvcmAuXG4pO1xuIl19