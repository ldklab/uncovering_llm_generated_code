/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * This class wraps the platform Navigation API which allows server-specific and test
 * implementations.
 */
export class PlatformNavigation {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: PlatformNavigation, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: PlatformNavigation, providedIn: 'platform', useFactory: () => window.navigation }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: PlatformNavigation, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'platform', useFactory: () => window.navigation }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm1fbmF2aWdhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvbmF2aWdhdGlvbi9wbGF0Zm9ybV9uYXZpZ2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7O0FBZXpDOzs7R0FHRztBQUVILE1BQU0sT0FBZ0Isa0JBQWtCO3lIQUFsQixrQkFBa0I7NkhBQWxCLGtCQUFrQixjQURmLFVBQVUsY0FBYyxHQUFHLEVBQUUsQ0FBRSxNQUFjLENBQUMsVUFBVTs7c0dBQzNELGtCQUFrQjtrQkFEdkMsVUFBVTttQkFBQyxFQUFDLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxDQUFFLE1BQWMsQ0FBQyxVQUFVLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7XG4gIE5hdmlnYXRlRXZlbnQsXG4gIE5hdmlnYXRpb24sXG4gIE5hdmlnYXRpb25DdXJyZW50RW50cnlDaGFuZ2VFdmVudCxcbiAgTmF2aWdhdGlvbkhpc3RvcnlFbnRyeSxcbiAgTmF2aWdhdGlvbk5hdmlnYXRlT3B0aW9ucyxcbiAgTmF2aWdhdGlvbk9wdGlvbnMsXG4gIE5hdmlnYXRpb25SZWxvYWRPcHRpb25zLFxuICBOYXZpZ2F0aW9uUmVzdWx0LFxuICBOYXZpZ2F0aW9uVHJhbnNpdGlvbixcbiAgTmF2aWdhdGlvblVwZGF0ZUN1cnJlbnRFbnRyeU9wdGlvbnMsXG59IGZyb20gJy4vbmF2aWdhdGlvbl90eXBlcyc7XG5cbi8qKlxuICogVGhpcyBjbGFzcyB3cmFwcyB0aGUgcGxhdGZvcm0gTmF2aWdhdGlvbiBBUEkgd2hpY2ggYWxsb3dzIHNlcnZlci1zcGVjaWZpYyBhbmQgdGVzdFxuICogaW1wbGVtZW50YXRpb25zLlxuICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3BsYXRmb3JtJywgdXNlRmFjdG9yeTogKCkgPT4gKHdpbmRvdyBhcyBhbnkpLm5hdmlnYXRpb259KVxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFBsYXRmb3JtTmF2aWdhdGlvbiBpbXBsZW1lbnRzIE5hdmlnYXRpb24ge1xuICBhYnN0cmFjdCBlbnRyaWVzKCk6IE5hdmlnYXRpb25IaXN0b3J5RW50cnlbXTtcbiAgYWJzdHJhY3QgY3VycmVudEVudHJ5OiBOYXZpZ2F0aW9uSGlzdG9yeUVudHJ5IHwgbnVsbDtcbiAgYWJzdHJhY3QgdXBkYXRlQ3VycmVudEVudHJ5KG9wdGlvbnM6IE5hdmlnYXRpb25VcGRhdGVDdXJyZW50RW50cnlPcHRpb25zKTogdm9pZDtcbiAgYWJzdHJhY3QgdHJhbnNpdGlvbjogTmF2aWdhdGlvblRyYW5zaXRpb24gfCBudWxsO1xuICBhYnN0cmFjdCBjYW5Hb0JhY2s6IGJvb2xlYW47XG4gIGFic3RyYWN0IGNhbkdvRm9yd2FyZDogYm9vbGVhbjtcbiAgYWJzdHJhY3QgbmF2aWdhdGUodXJsOiBzdHJpbmcsIG9wdGlvbnM/OiBOYXZpZ2F0aW9uTmF2aWdhdGVPcHRpb25zIHwgdW5kZWZpbmVkKTogTmF2aWdhdGlvblJlc3VsdDtcbiAgYWJzdHJhY3QgcmVsb2FkKG9wdGlvbnM/OiBOYXZpZ2F0aW9uUmVsb2FkT3B0aW9ucyB8IHVuZGVmaW5lZCk6IE5hdmlnYXRpb25SZXN1bHQ7XG4gIGFic3RyYWN0IHRyYXZlcnNlVG8oa2V5OiBzdHJpbmcsIG9wdGlvbnM/OiBOYXZpZ2F0aW9uT3B0aW9ucyB8IHVuZGVmaW5lZCk6IE5hdmlnYXRpb25SZXN1bHQ7XG4gIGFic3RyYWN0IGJhY2sob3B0aW9ucz86IE5hdmlnYXRpb25PcHRpb25zIHwgdW5kZWZpbmVkKTogTmF2aWdhdGlvblJlc3VsdDtcbiAgYWJzdHJhY3QgZm9yd2FyZChvcHRpb25zPzogTmF2aWdhdGlvbk9wdGlvbnMgfCB1bmRlZmluZWQpOiBOYXZpZ2F0aW9uUmVzdWx0O1xuICBhYnN0cmFjdCBvbm5hdmlnYXRlOiAoKHRoaXM6IE5hdmlnYXRpb24sIGV2OiBOYXZpZ2F0ZUV2ZW50KSA9PiBhbnkpIHwgbnVsbDtcbiAgYWJzdHJhY3Qgb25uYXZpZ2F0ZXN1Y2Nlc3M6ICgodGhpczogTmF2aWdhdGlvbiwgZXY6IEV2ZW50KSA9PiBhbnkpIHwgbnVsbDtcbiAgYWJzdHJhY3Qgb25uYXZpZ2F0ZWVycm9yOiAoKHRoaXM6IE5hdmlnYXRpb24sIGV2OiBFcnJvckV2ZW50KSA9PiBhbnkpIHwgbnVsbDtcbiAgYWJzdHJhY3Qgb25jdXJyZW50ZW50cnljaGFuZ2U6XG4gICAgfCAoKHRoaXM6IE5hdmlnYXRpb24sIGV2OiBOYXZpZ2F0aW9uQ3VycmVudEVudHJ5Q2hhbmdlRXZlbnQpID0+IGFueSlcbiAgICB8IG51bGw7XG4gIGFic3RyYWN0IGFkZEV2ZW50TGlzdGVuZXIodHlwZTogdW5rbm93biwgbGlzdGVuZXI6IHVua25vd24sIG9wdGlvbnM/OiB1bmtub3duKTogdm9pZDtcbiAgYWJzdHJhY3QgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlOiB1bmtub3duLCBsaXN0ZW5lcjogdW5rbm93biwgb3B0aW9ucz86IHVua25vd24pOiB2b2lkO1xuICBhYnN0cmFjdCBkaXNwYXRjaEV2ZW50KGV2ZW50OiBFdmVudCk6IGJvb2xlYW47XG59XG4iXX0=