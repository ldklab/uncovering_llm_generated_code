/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { HEADER_OFFSET } from '../interfaces/view';
import { getContextLView } from '../state';
import { load } from '../util/view_utils';
/** Store a value in the `data` at a given `index`. */
export function store(tView, lView, index, value) {
    // We don't store any static data for local variables, so the first time
    // we see the template, we should store as null to avoid a sparse array
    if (index >= tView.data.length) {
        tView.data[index] = null;
        tView.blueprint[index] = null;
    }
    lView[index] = value;
}
/**
 * Retrieves a local reference from the current contextViewData.
 *
 * If the reference to retrieve is in a parent view, this instruction is used in conjunction
 * with a nextContext() call, which walks up the tree and updates the contextViewData instance.
 *
 * @param index The index of the local ref in contextViewData.
 *
 * @codeGenApi
 */
export function ɵɵreference(index) {
    const contextLView = getContextLView();
    return load(contextLView, HEADER_OFFSET + index);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvaW5zdHJ1Y3Rpb25zL3N0b3JhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFDLGFBQWEsRUFBZSxNQUFNLG9CQUFvQixDQUFDO0FBQy9ELE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDekMsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBRXhDLHNEQUFzRDtBQUN0RCxNQUFNLFVBQVUsS0FBSyxDQUFJLEtBQVksRUFBRSxLQUFZLEVBQUUsS0FBYSxFQUFFLEtBQVE7SUFDMUUsd0VBQXdFO0lBQ3hFLHVFQUF1RTtJQUN2RSxJQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQy9CLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDO0lBQ2hDLENBQUM7SUFDRCxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDO0FBQ3ZCLENBQUM7QUFFRDs7Ozs7Ozs7O0dBU0c7QUFDSCxNQUFNLFVBQVUsV0FBVyxDQUFJLEtBQWE7SUFDMUMsTUFBTSxZQUFZLEdBQUcsZUFBZSxFQUFFLENBQUM7SUFDdkMsT0FBTyxJQUFJLENBQUksWUFBWSxFQUFFLGFBQWEsR0FBRyxLQUFLLENBQUMsQ0FBQztBQUN0RCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtIRUFERVJfT0ZGU0VULCBMVmlldywgVFZpZXd9IGZyb20gJy4uL2ludGVyZmFjZXMvdmlldyc7XG5pbXBvcnQge2dldENvbnRleHRMVmlld30gZnJvbSAnLi4vc3RhdGUnO1xuaW1wb3J0IHtsb2FkfSBmcm9tICcuLi91dGlsL3ZpZXdfdXRpbHMnO1xuXG4vKiogU3RvcmUgYSB2YWx1ZSBpbiB0aGUgYGRhdGFgIGF0IGEgZ2l2ZW4gYGluZGV4YC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdG9yZTxUPih0VmlldzogVFZpZXcsIGxWaWV3OiBMVmlldywgaW5kZXg6IG51bWJlciwgdmFsdWU6IFQpOiB2b2lkIHtcbiAgLy8gV2UgZG9uJ3Qgc3RvcmUgYW55IHN0YXRpYyBkYXRhIGZvciBsb2NhbCB2YXJpYWJsZXMsIHNvIHRoZSBmaXJzdCB0aW1lXG4gIC8vIHdlIHNlZSB0aGUgdGVtcGxhdGUsIHdlIHNob3VsZCBzdG9yZSBhcyBudWxsIHRvIGF2b2lkIGEgc3BhcnNlIGFycmF5XG4gIGlmIChpbmRleCA+PSB0Vmlldy5kYXRhLmxlbmd0aCkge1xuICAgIHRWaWV3LmRhdGFbaW5kZXhdID0gbnVsbDtcbiAgICB0Vmlldy5ibHVlcHJpbnRbaW5kZXhdID0gbnVsbDtcbiAgfVxuICBsVmlld1tpbmRleF0gPSB2YWx1ZTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgYSBsb2NhbCByZWZlcmVuY2UgZnJvbSB0aGUgY3VycmVudCBjb250ZXh0Vmlld0RhdGEuXG4gKlxuICogSWYgdGhlIHJlZmVyZW5jZSB0byByZXRyaWV2ZSBpcyBpbiBhIHBhcmVudCB2aWV3LCB0aGlzIGluc3RydWN0aW9uIGlzIHVzZWQgaW4gY29uanVuY3Rpb25cbiAqIHdpdGggYSBuZXh0Q29udGV4dCgpIGNhbGwsIHdoaWNoIHdhbGtzIHVwIHRoZSB0cmVlIGFuZCB1cGRhdGVzIHRoZSBjb250ZXh0Vmlld0RhdGEgaW5zdGFuY2UuXG4gKlxuICogQHBhcmFtIGluZGV4IFRoZSBpbmRleCBvZiB0aGUgbG9jYWwgcmVmIGluIGNvbnRleHRWaWV3RGF0YS5cbiAqXG4gKiBAY29kZUdlbkFwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gybXJtXJlZmVyZW5jZTxUPihpbmRleDogbnVtYmVyKSB7XG4gIGNvbnN0IGNvbnRleHRMVmlldyA9IGdldENvbnRleHRMVmlldygpO1xuICByZXR1cm4gbG9hZDxUPihjb250ZXh0TFZpZXcsIEhFQURFUl9PRkZTRVQgKyBpbmRleCk7XG59XG4iXX0=