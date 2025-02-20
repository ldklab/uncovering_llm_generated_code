/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
let _DOM = null;
export function getDOM() {
    return _DOM;
}
export function setRootDomAdapter(adapter) {
    _DOM ??= adapter;
}
/* tslint:disable:requireParameterType */
/**
 * Provides DOM operations in an environment-agnostic way.
 *
 * @security Tread carefully! Interacting with the DOM directly is dangerous and
 * can introduce XSS risks.
 */
export class DomAdapter {
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tX2FkYXB0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RvbV9hZGFwdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILElBQUksSUFBSSxHQUFlLElBQUssQ0FBQztBQUU3QixNQUFNLFVBQVUsTUFBTTtJQUNwQixPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFFRCxNQUFNLFVBQVUsaUJBQWlCLENBQUMsT0FBbUI7SUFDbkQsSUFBSSxLQUFLLE9BQU8sQ0FBQztBQUNuQixDQUFDO0FBRUQseUNBQXlDO0FBQ3pDOzs7OztHQUtHO0FBQ0gsTUFBTSxPQUFnQixVQUFVO0NBZ0MvQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxubGV0IF9ET006IERvbUFkYXB0ZXIgPSBudWxsITtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldERPTSgpOiBEb21BZGFwdGVyIHtcbiAgcmV0dXJuIF9ET007XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRSb290RG9tQWRhcHRlcihhZGFwdGVyOiBEb21BZGFwdGVyKSB7XG4gIF9ET00gPz89IGFkYXB0ZXI7XG59XG5cbi8qIHRzbGludDpkaXNhYmxlOnJlcXVpcmVQYXJhbWV0ZXJUeXBlICovXG4vKipcbiAqIFByb3ZpZGVzIERPTSBvcGVyYXRpb25zIGluIGFuIGVudmlyb25tZW50LWFnbm9zdGljIHdheS5cbiAqXG4gKiBAc2VjdXJpdHkgVHJlYWQgY2FyZWZ1bGx5ISBJbnRlcmFjdGluZyB3aXRoIHRoZSBET00gZGlyZWN0bHkgaXMgZGFuZ2Vyb3VzIGFuZFxuICogY2FuIGludHJvZHVjZSBYU1Mgcmlza3MuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBEb21BZGFwdGVyIHtcbiAgLy8gTmVlZHMgRG9taW5vLWZyaWVuZGx5IHRlc3QgdXRpbGl0eVxuICBhYnN0cmFjdCBkaXNwYXRjaEV2ZW50KGVsOiBhbnksIGV2dDogYW55KTogYW55O1xuICBhYnN0cmFjdCByZWFkb25seSBzdXBwb3J0c0RPTUV2ZW50czogYm9vbGVhbjtcblxuICAvLyBVc2VkIGJ5IE1ldGFcbiAgYWJzdHJhY3QgcmVtb3ZlKGVsOiBhbnkpOiB2b2lkO1xuICBhYnN0cmFjdCBjcmVhdGVFbGVtZW50KHRhZ05hbWU6IGFueSwgZG9jPzogYW55KTogSFRNTEVsZW1lbnQ7XG4gIGFic3RyYWN0IGNyZWF0ZUh0bWxEb2N1bWVudCgpOiBEb2N1bWVudDtcbiAgYWJzdHJhY3QgZ2V0RGVmYXVsdERvY3VtZW50KCk6IERvY3VtZW50O1xuXG4gIC8vIFVzZWQgYnkgQnkuY3NzXG4gIGFic3RyYWN0IGlzRWxlbWVudE5vZGUobm9kZTogYW55KTogYm9vbGVhbjtcblxuICAvLyBVc2VkIGJ5IFRlc3RhYmlsaXR5XG4gIGFic3RyYWN0IGlzU2hhZG93Um9vdChub2RlOiBhbnkpOiBib29sZWFuO1xuXG4gIC8vIFVzZWQgYnkgS2V5RXZlbnRzUGx1Z2luXG4gIGFic3RyYWN0IG9uQW5kQ2FuY2VsKGVsOiBhbnksIGV2dDogYW55LCBsaXN0ZW5lcjogYW55KTogRnVuY3Rpb247XG5cbiAgLy8gVXNlZCBieSBQbGF0Zm9ybUxvY2F0aW9uIGFuZCBTZXJ2ZXJFdmVudE1hbmFnZXJQbHVnaW5cbiAgYWJzdHJhY3QgZ2V0R2xvYmFsRXZlbnRUYXJnZXQoZG9jOiBEb2N1bWVudCwgdGFyZ2V0OiBzdHJpbmcpOiBhbnk7XG5cbiAgLy8gVXNlZCBieSBQbGF0Zm9ybUxvY2F0aW9uXG4gIGFic3RyYWN0IGdldEJhc2VIcmVmKGRvYzogRG9jdW1lbnQpOiBzdHJpbmcgfCBudWxsO1xuICBhYnN0cmFjdCByZXNldEJhc2VFbGVtZW50KCk6IHZvaWQ7XG5cbiAgLy8gVE9ETzogcmVtb3ZlIGRlcGVuZGVuY3kgaW4gRGVmYXVsdFZhbHVlQWNjZXNzb3JcbiAgYWJzdHJhY3QgZ2V0VXNlckFnZW50KCk6IHN0cmluZztcblxuICAvLyBVc2VkIGluIHRoZSBsZWdhY3kgQGFuZ3VsYXIvaHR0cCBwYWNrYWdlIHdoaWNoIGhhcyBzb21lIHVzYWdlIGluIGczLlxuICBhYnN0cmFjdCBnZXRDb29raWUobmFtZTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbDtcbn1cbiJdfQ==