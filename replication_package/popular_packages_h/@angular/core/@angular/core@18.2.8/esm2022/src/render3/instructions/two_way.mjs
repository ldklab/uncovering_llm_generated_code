/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { bindingUpdated } from '../bindings';
import { RENDERER } from '../interfaces/view';
import { isWritableSignal } from '../reactivity/signal';
import { getCurrentTNode, getLView, getSelectedTNode, getTView, nextBindingIndex } from '../state';
import { listenerInternal } from './listener';
import { elementPropertyInternal, storePropertyBindingMetadata } from './shared';
/**
 * Update a two-way bound property on a selected element.
 *
 * Operates on the element selected by index via the {@link select} instruction.
 *
 * @param propName Name of property.
 * @param value New value to write.
 * @param sanitizer An optional function used to sanitize the value.
 * @returns This function returns itself so that it may be chained
 * (e.g. `twoWayProperty('name', ctx.name)('title', ctx.title)`)
 *
 * @codeGenApi
 */
export function ɵɵtwoWayProperty(propName, value, sanitizer) {
    // TODO(crisbeto): perf impact of re-evaluating this on each change detection?
    if (isWritableSignal(value)) {
        value = value();
    }
    const lView = getLView();
    const bindingIndex = nextBindingIndex();
    if (bindingUpdated(lView, bindingIndex, value)) {
        const tView = getTView();
        const tNode = getSelectedTNode();
        elementPropertyInternal(tView, tNode, lView, propName, value, lView[RENDERER], sanitizer, false);
        ngDevMode && storePropertyBindingMetadata(tView.data, tNode, propName, bindingIndex);
    }
    return ɵɵtwoWayProperty;
}
/**
 * Function used inside two-way listeners to conditionally set the value of the bound expression.
 *
 * @param target Field on which to set the value.
 * @param value Value to be set to the field.
 *
 * @codeGenApi
 */
export function ɵɵtwoWayBindingSet(target, value) {
    const canWrite = isWritableSignal(target);
    canWrite && target.set(value);
    return canWrite;
}
/**
 * Adds an event listener that updates a two-way binding to the current node.
 *
 * @param eventName Name of the event.
 * @param listenerFn The function to be called when event emits.
 *
 * @codeGenApi
 */
export function ɵɵtwoWayListener(eventName, listenerFn) {
    const lView = getLView();
    const tView = getTView();
    const tNode = getCurrentTNode();
    listenerInternal(tView, lView, lView[RENDERER], tNode, eventName, listenerFn);
    return ɵɵtwoWayListener;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHdvX3dheS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvaW5zdHJ1Y3Rpb25zL3R3b193YXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUUzQyxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDNUMsT0FBTyxFQUFDLGdCQUFnQixFQUFpQixNQUFNLHNCQUFzQixDQUFDO0FBQ3RFLE9BQU8sRUFBQyxlQUFlLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUVqRyxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDNUMsT0FBTyxFQUFDLHVCQUF1QixFQUFFLDRCQUE0QixFQUFDLE1BQU0sVUFBVSxDQUFDO0FBRS9FOzs7Ozs7Ozs7Ozs7R0FZRztBQUNILE1BQU0sVUFBVSxnQkFBZ0IsQ0FDOUIsUUFBZ0IsRUFDaEIsS0FBNEIsRUFDNUIsU0FBOEI7SUFFOUIsOEVBQThFO0lBQzlFLElBQUksZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUM1QixLQUFLLEdBQUcsS0FBSyxFQUFFLENBQUM7SUFDbEIsQ0FBQztJQUVELE1BQU0sS0FBSyxHQUFHLFFBQVEsRUFBRSxDQUFDO0lBQ3pCLE1BQU0sWUFBWSxHQUFHLGdCQUFnQixFQUFFLENBQUM7SUFDeEMsSUFBSSxjQUFjLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQy9DLE1BQU0sS0FBSyxHQUFHLFFBQVEsRUFBRSxDQUFDO1FBQ3pCLE1BQU0sS0FBSyxHQUFHLGdCQUFnQixFQUFFLENBQUM7UUFDakMsdUJBQXVCLENBQ3JCLEtBQUssRUFDTCxLQUFLLEVBQ0wsS0FBSyxFQUNMLFFBQVEsRUFDUixLQUFLLEVBQ0wsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUNmLFNBQVMsRUFDVCxLQUFLLENBQ04sQ0FBQztRQUNGLFNBQVMsSUFBSSw0QkFBNEIsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDdkYsQ0FBQztJQUVELE9BQU8sZ0JBQWdCLENBQUM7QUFDMUIsQ0FBQztBQUVEOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLFVBQVUsa0JBQWtCLENBQUksTUFBZSxFQUFFLEtBQVE7SUFDN0QsTUFBTSxRQUFRLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDMUMsUUFBUSxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDOUIsT0FBTyxRQUFRLENBQUM7QUFDbEIsQ0FBQztBQUVEOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLFVBQVUsZ0JBQWdCLENBQzlCLFNBQWlCLEVBQ2pCLFVBQTRCO0lBRTVCLE1BQU0sS0FBSyxHQUFHLFFBQVEsRUFBYSxDQUFDO0lBQ3BDLE1BQU0sS0FBSyxHQUFHLFFBQVEsRUFBRSxDQUFDO0lBQ3pCLE1BQU0sS0FBSyxHQUFHLGVBQWUsRUFBRyxDQUFDO0lBQ2pDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDOUUsT0FBTyxnQkFBZ0IsQ0FBQztBQUMxQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyohXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2JpbmRpbmdVcGRhdGVkfSBmcm9tICcuLi9iaW5kaW5ncyc7XG5pbXBvcnQge1Nhbml0aXplckZufSBmcm9tICcuLi9pbnRlcmZhY2VzL3Nhbml0aXphdGlvbic7XG5pbXBvcnQge1JFTkRFUkVSfSBmcm9tICcuLi9pbnRlcmZhY2VzL3ZpZXcnO1xuaW1wb3J0IHtpc1dyaXRhYmxlU2lnbmFsLCBXcml0YWJsZVNpZ25hbH0gZnJvbSAnLi4vcmVhY3Rpdml0eS9zaWduYWwnO1xuaW1wb3J0IHtnZXRDdXJyZW50VE5vZGUsIGdldExWaWV3LCBnZXRTZWxlY3RlZFROb2RlLCBnZXRUVmlldywgbmV4dEJpbmRpbmdJbmRleH0gZnJvbSAnLi4vc3RhdGUnO1xuXG5pbXBvcnQge2xpc3RlbmVySW50ZXJuYWx9IGZyb20gJy4vbGlzdGVuZXInO1xuaW1wb3J0IHtlbGVtZW50UHJvcGVydHlJbnRlcm5hbCwgc3RvcmVQcm9wZXJ0eUJpbmRpbmdNZXRhZGF0YX0gZnJvbSAnLi9zaGFyZWQnO1xuXG4vKipcbiAqIFVwZGF0ZSBhIHR3by13YXkgYm91bmQgcHJvcGVydHkgb24gYSBzZWxlY3RlZCBlbGVtZW50LlxuICpcbiAqIE9wZXJhdGVzIG9uIHRoZSBlbGVtZW50IHNlbGVjdGVkIGJ5IGluZGV4IHZpYSB0aGUge0BsaW5rIHNlbGVjdH0gaW5zdHJ1Y3Rpb24uXG4gKlxuICogQHBhcmFtIHByb3BOYW1lIE5hbWUgb2YgcHJvcGVydHkuXG4gKiBAcGFyYW0gdmFsdWUgTmV3IHZhbHVlIHRvIHdyaXRlLlxuICogQHBhcmFtIHNhbml0aXplciBBbiBvcHRpb25hbCBmdW5jdGlvbiB1c2VkIHRvIHNhbml0aXplIHRoZSB2YWx1ZS5cbiAqIEByZXR1cm5zIFRoaXMgZnVuY3Rpb24gcmV0dXJucyBpdHNlbGYgc28gdGhhdCBpdCBtYXkgYmUgY2hhaW5lZFxuICogKGUuZy4gYHR3b1dheVByb3BlcnR5KCduYW1lJywgY3R4Lm5hbWUpKCd0aXRsZScsIGN0eC50aXRsZSlgKVxuICpcbiAqIEBjb2RlR2VuQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiDJtcm1dHdvV2F5UHJvcGVydHk8VD4oXG4gIHByb3BOYW1lOiBzdHJpbmcsXG4gIHZhbHVlOiBUIHwgV3JpdGFibGVTaWduYWw8VD4sXG4gIHNhbml0aXplcj86IFNhbml0aXplckZuIHwgbnVsbCxcbik6IHR5cGVvZiDJtcm1dHdvV2F5UHJvcGVydHkge1xuICAvLyBUT0RPKGNyaXNiZXRvKTogcGVyZiBpbXBhY3Qgb2YgcmUtZXZhbHVhdGluZyB0aGlzIG9uIGVhY2ggY2hhbmdlIGRldGVjdGlvbj9cbiAgaWYgKGlzV3JpdGFibGVTaWduYWwodmFsdWUpKSB7XG4gICAgdmFsdWUgPSB2YWx1ZSgpO1xuICB9XG5cbiAgY29uc3QgbFZpZXcgPSBnZXRMVmlldygpO1xuICBjb25zdCBiaW5kaW5nSW5kZXggPSBuZXh0QmluZGluZ0luZGV4KCk7XG4gIGlmIChiaW5kaW5nVXBkYXRlZChsVmlldywgYmluZGluZ0luZGV4LCB2YWx1ZSkpIHtcbiAgICBjb25zdCB0VmlldyA9IGdldFRWaWV3KCk7XG4gICAgY29uc3QgdE5vZGUgPSBnZXRTZWxlY3RlZFROb2RlKCk7XG4gICAgZWxlbWVudFByb3BlcnR5SW50ZXJuYWwoXG4gICAgICB0VmlldyxcbiAgICAgIHROb2RlLFxuICAgICAgbFZpZXcsXG4gICAgICBwcm9wTmFtZSxcbiAgICAgIHZhbHVlLFxuICAgICAgbFZpZXdbUkVOREVSRVJdLFxuICAgICAgc2FuaXRpemVyLFxuICAgICAgZmFsc2UsXG4gICAgKTtcbiAgICBuZ0Rldk1vZGUgJiYgc3RvcmVQcm9wZXJ0eUJpbmRpbmdNZXRhZGF0YSh0Vmlldy5kYXRhLCB0Tm9kZSwgcHJvcE5hbWUsIGJpbmRpbmdJbmRleCk7XG4gIH1cblxuICByZXR1cm4gybXJtXR3b1dheVByb3BlcnR5O1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHVzZWQgaW5zaWRlIHR3by13YXkgbGlzdGVuZXJzIHRvIGNvbmRpdGlvbmFsbHkgc2V0IHRoZSB2YWx1ZSBvZiB0aGUgYm91bmQgZXhwcmVzc2lvbi5cbiAqXG4gKiBAcGFyYW0gdGFyZ2V0IEZpZWxkIG9uIHdoaWNoIHRvIHNldCB0aGUgdmFsdWUuXG4gKiBAcGFyYW0gdmFsdWUgVmFsdWUgdG8gYmUgc2V0IHRvIHRoZSBmaWVsZC5cbiAqXG4gKiBAY29kZUdlbkFwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gybXJtXR3b1dheUJpbmRpbmdTZXQ8VD4odGFyZ2V0OiB1bmtub3duLCB2YWx1ZTogVCk6IGJvb2xlYW4ge1xuICBjb25zdCBjYW5Xcml0ZSA9IGlzV3JpdGFibGVTaWduYWwodGFyZ2V0KTtcbiAgY2FuV3JpdGUgJiYgdGFyZ2V0LnNldCh2YWx1ZSk7XG4gIHJldHVybiBjYW5Xcml0ZTtcbn1cblxuLyoqXG4gKiBBZGRzIGFuIGV2ZW50IGxpc3RlbmVyIHRoYXQgdXBkYXRlcyBhIHR3by13YXkgYmluZGluZyB0byB0aGUgY3VycmVudCBub2RlLlxuICpcbiAqIEBwYXJhbSBldmVudE5hbWUgTmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcGFyYW0gbGlzdGVuZXJGbiBUaGUgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gZXZlbnQgZW1pdHMuXG4gKlxuICogQGNvZGVHZW5BcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1ybV0d29XYXlMaXN0ZW5lcihcbiAgZXZlbnROYW1lOiBzdHJpbmcsXG4gIGxpc3RlbmVyRm46IChlPzogYW55KSA9PiBhbnksXG4pOiB0eXBlb2YgybXJtXR3b1dheUxpc3RlbmVyIHtcbiAgY29uc3QgbFZpZXcgPSBnZXRMVmlldzx7fSB8IG51bGw+KCk7XG4gIGNvbnN0IHRWaWV3ID0gZ2V0VFZpZXcoKTtcbiAgY29uc3QgdE5vZGUgPSBnZXRDdXJyZW50VE5vZGUoKSE7XG4gIGxpc3RlbmVySW50ZXJuYWwodFZpZXcsIGxWaWV3LCBsVmlld1tSRU5ERVJFUl0sIHROb2RlLCBldmVudE5hbWUsIGxpc3RlbmVyRm4pO1xuICByZXR1cm4gybXJtXR3b1dheUxpc3RlbmVyO1xufVxuIl19