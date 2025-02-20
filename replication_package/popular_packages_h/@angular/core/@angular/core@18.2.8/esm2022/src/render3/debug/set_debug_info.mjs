/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { getComponentDef } from '../definition';
/**
 * Sets the debug info for an Angular class.
 *
 * This runtime is guarded by ngDevMode flag.
 */
export function ɵsetClassDebugInfo(type, debugInfo) {
    const def = getComponentDef(type);
    if (def !== null) {
        def.debugInfo = debugInfo;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0X2RlYnVnX2luZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2RlYnVnL3NldF9kZWJ1Z19pbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUdILE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFHOUM7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxrQkFBa0IsQ0FBQyxJQUFlLEVBQUUsU0FBeUI7SUFDM0UsTUFBTSxHQUFHLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2xDLElBQUksR0FBRyxLQUFLLElBQUksRUFBRSxDQUFDO1FBQ2pCLEdBQUcsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0lBQzVCLENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1R5cGV9IGZyb20gJy4uLy4uL2ludGVyZmFjZS90eXBlJztcbmltcG9ydCB7Z2V0Q29tcG9uZW50RGVmfSBmcm9tICcuLi9kZWZpbml0aW9uJztcbmltcG9ydCB7Q2xhc3NEZWJ1Z0luZm99IGZyb20gJy4uL2ludGVyZmFjZXMvZGVmaW5pdGlvbic7XG5cbi8qKlxuICogU2V0cyB0aGUgZGVidWcgaW5mbyBmb3IgYW4gQW5ndWxhciBjbGFzcy5cbiAqXG4gKiBUaGlzIHJ1bnRpbWUgaXMgZ3VhcmRlZCBieSBuZ0Rldk1vZGUgZmxhZy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1c2V0Q2xhc3NEZWJ1Z0luZm8odHlwZTogVHlwZTxhbnk+LCBkZWJ1Z0luZm86IENsYXNzRGVidWdJbmZvKTogdm9pZCB7XG4gIGNvbnN0IGRlZiA9IGdldENvbXBvbmVudERlZih0eXBlKTtcbiAgaWYgKGRlZiAhPT0gbnVsbCkge1xuICAgIGRlZi5kZWJ1Z0luZm8gPSBkZWJ1Z0luZm87XG4gIH1cbn1cbiJdfQ==