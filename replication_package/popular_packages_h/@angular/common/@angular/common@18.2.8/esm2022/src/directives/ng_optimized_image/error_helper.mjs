/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
// Assembles directive details string, useful for error messages.
export function imgDirectiveDetails(ngSrc, includeNgSrc = true) {
    const ngSrcInfo = includeNgSrc
        ? `(activated on an <img> element with the \`ngSrc="${ngSrc}"\`) `
        : '';
    return `The NgOptimizedImage directive ${ngSrcInfo}has detected that`;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JfaGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS9lcnJvcl9oZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsaUVBQWlFO0FBQ2pFLE1BQU0sVUFBVSxtQkFBbUIsQ0FBQyxLQUFhLEVBQUUsWUFBWSxHQUFHLElBQUk7SUFDcEUsTUFBTSxTQUFTLEdBQUcsWUFBWTtRQUM1QixDQUFDLENBQUMsb0RBQW9ELEtBQUssT0FBTztRQUNsRSxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQ1AsT0FBTyxrQ0FBa0MsU0FBUyxtQkFBbUIsQ0FBQztBQUN4RSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG4vLyBBc3NlbWJsZXMgZGlyZWN0aXZlIGRldGFpbHMgc3RyaW5nLCB1c2VmdWwgZm9yIGVycm9yIG1lc3NhZ2VzLlxuZXhwb3J0IGZ1bmN0aW9uIGltZ0RpcmVjdGl2ZURldGFpbHMobmdTcmM6IHN0cmluZywgaW5jbHVkZU5nU3JjID0gdHJ1ZSkge1xuICBjb25zdCBuZ1NyY0luZm8gPSBpbmNsdWRlTmdTcmNcbiAgICA/IGAoYWN0aXZhdGVkIG9uIGFuIDxpbWc+IGVsZW1lbnQgd2l0aCB0aGUgXFxgbmdTcmM9XCIke25nU3JjfVwiXFxgKSBgXG4gICAgOiAnJztcbiAgcmV0dXJuIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgJHtuZ1NyY0luZm99aGFzIGRldGVjdGVkIHRoYXRgO1xufVxuIl19