/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * @description
 *
 * Represents a type that a Component or other object is instances of.
 *
 * An example of a `Type` is `MyCustomComponent` class, which in JavaScript is represented by
 * the `MyCustomComponent` constructor function.
 *
 * @publicApi
 */
export const Type = Function;
export function isType(v) {
    return typeof v === 'function';
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL2ludGVyZmFjZS90eXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVIOzs7Ozs7Ozs7R0FTRztBQUNILE1BQU0sQ0FBQyxNQUFNLElBQUksR0FBRyxRQUFRLENBQUM7QUFFN0IsTUFBTSxVQUFVLE1BQU0sQ0FBQyxDQUFNO0lBQzNCLE9BQU8sT0FBTyxDQUFDLEtBQUssVUFBVSxDQUFDO0FBQ2pDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogUmVwcmVzZW50cyBhIHR5cGUgdGhhdCBhIENvbXBvbmVudCBvciBvdGhlciBvYmplY3QgaXMgaW5zdGFuY2VzIG9mLlxuICpcbiAqIEFuIGV4YW1wbGUgb2YgYSBgVHlwZWAgaXMgYE15Q3VzdG9tQ29tcG9uZW50YCBjbGFzcywgd2hpY2ggaW4gSmF2YVNjcmlwdCBpcyByZXByZXNlbnRlZCBieVxuICogdGhlIGBNeUN1c3RvbUNvbXBvbmVudGAgY29uc3RydWN0b3IgZnVuY3Rpb24uXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgVHlwZSA9IEZ1bmN0aW9uO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNUeXBlKHY6IGFueSk6IHYgaXMgVHlwZTxhbnk+IHtcbiAgcmV0dXJuIHR5cGVvZiB2ID09PSAnZnVuY3Rpb24nO1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIFJlcHJlc2VudHMgYW4gYWJzdHJhY3QgY2xhc3MgYFRgLCBpZiBhcHBsaWVkIHRvIGEgY29uY3JldGUgY2xhc3MgaXQgd291bGQgc3RvcCBiZWluZ1xuICogaW5zdGFudGlhYmxlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBYnN0cmFjdFR5cGU8VD4gZXh0ZW5kcyBGdW5jdGlvbiB7XG4gIHByb3RvdHlwZTogVDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBUeXBlPFQ+IGV4dGVuZHMgRnVuY3Rpb24ge1xuICBuZXcgKC4uLmFyZ3M6IGFueVtdKTogVDtcbn1cblxuZXhwb3J0IHR5cGUgTXV0YWJsZTxUIGV4dGVuZHMge1t4OiBzdHJpbmddOiBhbnl9LCBLIGV4dGVuZHMgc3RyaW5nPiA9IHtcbiAgW1AgaW4gS106IFRbUF07XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSB3cml0YWJsZSB0eXBlIHZlcnNpb24gb2YgdHlwZS5cbiAqXG4gKiBVU0FHRTpcbiAqIEdpdmVuOlxuICogYGBgXG4gKiBpbnRlcmZhY2UgUGVyc29uIHtyZWFkb25seSBuYW1lOiBzdHJpbmd9XG4gKiBgYGBcbiAqXG4gKiBXZSB3b3VsZCBsaWtlIHRvIGdldCBhIHJlYWQvd3JpdGUgdmVyc2lvbiBvZiBgUGVyc29uYC5cbiAqIGBgYFxuICogY29uc3QgV3JpdGFibGVQZXJzb24gPSBXcml0YWJsZTxQZXJzb24+O1xuICogYGBgXG4gKlxuICogVGhlIHJlc3VsdCBpcyB0aGF0IHlvdSBjYW4gZG86XG4gKlxuICogYGBgXG4gKiBjb25zdCByZWFkb25seVBlcnNvbjogUGVyc29uID0ge25hbWU6ICdNYXJyeSd9O1xuICogcmVhZG9ubHlQZXJzb24ubmFtZSA9ICdKb2huJzsgLy8gVHlwZUVycm9yXG4gKiAocmVhZG9ubHlQZXJzb24gYXMgV3JpdGFibGVQZXJzb24pLm5hbWUgPSAnSm9obic7IC8vIE9LXG4gKlxuICogLy8gRXJyb3I6IENvcnJlY3RseSBkZXRlY3RzIHRoYXQgYFBlcnNvbmAgZGlkIG5vdCBoYXZlIGBhZ2VgIHByb3BlcnR5LlxuICogKHJlYWRvbmx5UGVyc29uIGFzIFdyaXRhYmxlUGVyc29uKS5hZ2UgPSAzMDtcbiAqIGBgYFxuICovXG5leHBvcnQgdHlwZSBXcml0YWJsZTxUPiA9IHtcbiAgLXJlYWRvbmx5IFtLIGluIGtleW9mIFRdOiBUW0tdO1xufTtcbiJdfQ==