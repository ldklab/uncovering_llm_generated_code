/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { DefaultIterableDifferFactory } from './differs/default_iterable_differ';
import { DefaultKeyValueDifferFactory } from './differs/default_keyvalue_differ';
import { IterableDiffers } from './differs/iterable_differs';
import { KeyValueDiffers } from './differs/keyvalue_differs';
export { SimpleChange } from '../interface/simple_change';
export { devModeEqual } from '../util/comparison';
export { ChangeDetectorRef } from './change_detector_ref';
export { ChangeDetectionStrategy } from './constants';
export { DefaultIterableDiffer, DefaultIterableDifferFactory, } from './differs/default_iterable_differ';
export { DefaultKeyValueDifferFactory } from './differs/default_keyvalue_differ';
export { IterableDiffers, } from './differs/iterable_differs';
export { KeyValueDiffers, } from './differs/keyvalue_differs';
/**
 * Structural diffing for `Object`s and `Map`s.
 */
const keyValDiff = [new DefaultKeyValueDifferFactory()];
/**
 * Structural diffing for `Iterable` types such as `Array`s.
 */
const iterableDiff = [new DefaultIterableDifferFactory()];
export const defaultIterableDiffers = new IterableDiffers(iterableDiff);
export const defaultKeyValueDiffers = new KeyValueDiffers(keyValDiff);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlX2RldGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL2NoYW5nZV9kZXRlY3Rpb24vY2hhbmdlX2RldGVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsNEJBQTRCLEVBQUMsTUFBTSxtQ0FBbUMsQ0FBQztBQUMvRSxPQUFPLEVBQUMsNEJBQTRCLEVBQUMsTUFBTSxtQ0FBbUMsQ0FBQztBQUMvRSxPQUFPLEVBQXdCLGVBQWUsRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBQ2xGLE9BQU8sRUFBd0IsZUFBZSxFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFFbEYsT0FBTyxFQUFDLFlBQVksRUFBZ0IsTUFBTSw0QkFBNEIsQ0FBQztBQUN2RSxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDaEQsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDeEQsT0FBTyxFQUFDLHVCQUF1QixFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3BELE9BQU8sRUFDTCxxQkFBcUIsRUFDckIsNEJBQTRCLEdBQzdCLE1BQU0sbUNBQW1DLENBQUM7QUFDM0MsT0FBTyxFQUFDLDRCQUE0QixFQUFDLE1BQU0sbUNBQW1DLENBQUM7QUFDL0UsT0FBTyxFQUtMLGVBQWUsR0FHaEIsTUFBTSw0QkFBNEIsQ0FBQztBQUNwQyxPQUFPLEVBS0wsZUFBZSxHQUNoQixNQUFNLDRCQUE0QixDQUFDO0FBR3BDOztHQUVHO0FBQ0gsTUFBTSxVQUFVLEdBQTRCLENBQUMsSUFBSSw0QkFBNEIsRUFBRSxDQUFDLENBQUM7QUFFakY7O0dBRUc7QUFDSCxNQUFNLFlBQVksR0FBNEIsQ0FBQyxJQUFJLDRCQUE0QixFQUFFLENBQUMsQ0FBQztBQUVuRixNQUFNLENBQUMsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUV4RSxNQUFNLENBQUMsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEZWZhdWx0SXRlcmFibGVEaWZmZXJGYWN0b3J5fSBmcm9tICcuL2RpZmZlcnMvZGVmYXVsdF9pdGVyYWJsZV9kaWZmZXInO1xuaW1wb3J0IHtEZWZhdWx0S2V5VmFsdWVEaWZmZXJGYWN0b3J5fSBmcm9tICcuL2RpZmZlcnMvZGVmYXVsdF9rZXl2YWx1ZV9kaWZmZXInO1xuaW1wb3J0IHtJdGVyYWJsZURpZmZlckZhY3RvcnksIEl0ZXJhYmxlRGlmZmVyc30gZnJvbSAnLi9kaWZmZXJzL2l0ZXJhYmxlX2RpZmZlcnMnO1xuaW1wb3J0IHtLZXlWYWx1ZURpZmZlckZhY3RvcnksIEtleVZhbHVlRGlmZmVyc30gZnJvbSAnLi9kaWZmZXJzL2tleXZhbHVlX2RpZmZlcnMnO1xuXG5leHBvcnQge1NpbXBsZUNoYW5nZSwgU2ltcGxlQ2hhbmdlc30gZnJvbSAnLi4vaW50ZXJmYWNlL3NpbXBsZV9jaGFuZ2UnO1xuZXhwb3J0IHtkZXZNb2RlRXF1YWx9IGZyb20gJy4uL3V0aWwvY29tcGFyaXNvbic7XG5leHBvcnQge0NoYW5nZURldGVjdG9yUmVmfSBmcm9tICcuL2NoYW5nZV9kZXRlY3Rvcl9yZWYnO1xuZXhwb3J0IHtDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneX0gZnJvbSAnLi9jb25zdGFudHMnO1xuZXhwb3J0IHtcbiAgRGVmYXVsdEl0ZXJhYmxlRGlmZmVyLFxuICBEZWZhdWx0SXRlcmFibGVEaWZmZXJGYWN0b3J5LFxufSBmcm9tICcuL2RpZmZlcnMvZGVmYXVsdF9pdGVyYWJsZV9kaWZmZXInO1xuZXhwb3J0IHtEZWZhdWx0S2V5VmFsdWVEaWZmZXJGYWN0b3J5fSBmcm9tICcuL2RpZmZlcnMvZGVmYXVsdF9rZXl2YWx1ZV9kaWZmZXInO1xuZXhwb3J0IHtcbiAgSXRlcmFibGVDaGFuZ2VSZWNvcmQsXG4gIEl0ZXJhYmxlQ2hhbmdlcyxcbiAgSXRlcmFibGVEaWZmZXIsXG4gIEl0ZXJhYmxlRGlmZmVyRmFjdG9yeSxcbiAgSXRlcmFibGVEaWZmZXJzLFxuICBOZ0l0ZXJhYmxlLFxuICBUcmFja0J5RnVuY3Rpb24sXG59IGZyb20gJy4vZGlmZmVycy9pdGVyYWJsZV9kaWZmZXJzJztcbmV4cG9ydCB7XG4gIEtleVZhbHVlQ2hhbmdlUmVjb3JkLFxuICBLZXlWYWx1ZUNoYW5nZXMsXG4gIEtleVZhbHVlRGlmZmVyLFxuICBLZXlWYWx1ZURpZmZlckZhY3RvcnksXG4gIEtleVZhbHVlRGlmZmVycyxcbn0gZnJvbSAnLi9kaWZmZXJzL2tleXZhbHVlX2RpZmZlcnMnO1xuZXhwb3J0IHtQaXBlVHJhbnNmb3JtfSBmcm9tICcuL3BpcGVfdHJhbnNmb3JtJztcblxuLyoqXG4gKiBTdHJ1Y3R1cmFsIGRpZmZpbmcgZm9yIGBPYmplY3RgcyBhbmQgYE1hcGBzLlxuICovXG5jb25zdCBrZXlWYWxEaWZmOiBLZXlWYWx1ZURpZmZlckZhY3RvcnlbXSA9IFtuZXcgRGVmYXVsdEtleVZhbHVlRGlmZmVyRmFjdG9yeSgpXTtcblxuLyoqXG4gKiBTdHJ1Y3R1cmFsIGRpZmZpbmcgZm9yIGBJdGVyYWJsZWAgdHlwZXMgc3VjaCBhcyBgQXJyYXlgcy5cbiAqL1xuY29uc3QgaXRlcmFibGVEaWZmOiBJdGVyYWJsZURpZmZlckZhY3RvcnlbXSA9IFtuZXcgRGVmYXVsdEl0ZXJhYmxlRGlmZmVyRmFjdG9yeSgpXTtcblxuZXhwb3J0IGNvbnN0IGRlZmF1bHRJdGVyYWJsZURpZmZlcnMgPSBuZXcgSXRlcmFibGVEaWZmZXJzKGl0ZXJhYmxlRGlmZik7XG5cbmV4cG9ydCBjb25zdCBkZWZhdWx0S2V5VmFsdWVEaWZmZXJzID0gbmV3IEtleVZhbHVlRGlmZmVycyhrZXlWYWxEaWZmKTtcbiJdfQ==