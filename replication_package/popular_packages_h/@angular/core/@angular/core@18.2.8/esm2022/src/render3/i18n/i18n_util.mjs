/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { assertEqual, assertGreaterThan, assertGreaterThanOrEqual, throwError, } from '../../util/assert';
import { assertTIcu, assertTNode } from '../assert';
import { createTNodeAtIndex } from '../instructions/shared';
import { assertTNodeType } from '../node_assert';
import { setI18nHandling } from '../node_manipulation';
import { getInsertInFrontOfRNodeWithI18n, processI18nInsertBefore } from '../node_manipulation_i18n';
import { addTNodeAndUpdateInsertBeforeIndex } from './i18n_insert_before_index';
/**
 * Retrieve `TIcu` at a given `index`.
 *
 * The `TIcu` can be stored either directly (if it is nested ICU) OR
 * it is stored inside tho `TIcuContainer` if it is top level ICU.
 *
 * The reason for this is that the top level ICU need a `TNode` so that they are part of the render
 * tree, but nested ICU's have no TNode, because we don't know ahead of time if the nested ICU is
 * expressed (parent ICU may have selected a case which does not contain it.)
 *
 * @param tView Current `TView`.
 * @param index Index where the value should be read from.
 */
export function getTIcu(tView, index) {
    const value = tView.data[index];
    if (value === null || typeof value === 'string')
        return null;
    if (ngDevMode &&
        !(value.hasOwnProperty('tView') || value.hasOwnProperty('currentCaseLViewIndex'))) {
        throwError("We expect to get 'null'|'TIcu'|'TIcuContainer', but got: " + value);
    }
    // Here the `value.hasOwnProperty('currentCaseLViewIndex')` is a polymorphic read as it can be
    // either TIcu or TIcuContainerNode. This is not ideal, but we still think it is OK because it
    // will be just two cases which fits into the browser inline cache (inline cache can take up to
    // 4)
    const tIcu = value.hasOwnProperty('currentCaseLViewIndex')
        ? value
        : value.value;
    ngDevMode && assertTIcu(tIcu);
    return tIcu;
}
/**
 * Store `TIcu` at a give `index`.
 *
 * The `TIcu` can be stored either directly (if it is nested ICU) OR
 * it is stored inside tho `TIcuContainer` if it is top level ICU.
 *
 * The reason for this is that the top level ICU need a `TNode` so that they are part of the render
 * tree, but nested ICU's have no TNode, because we don't know ahead of time if the nested ICU is
 * expressed (parent ICU may have selected a case which does not contain it.)
 *
 * @param tView Current `TView`.
 * @param index Index where the value should be stored at in `Tview.data`
 * @param tIcu The TIcu to store.
 */
export function setTIcu(tView, index, tIcu) {
    const tNode = tView.data[index];
    ngDevMode &&
        assertEqual(tNode === null || tNode.hasOwnProperty('tView'), true, "We expect to get 'null'|'TIcuContainer'");
    if (tNode === null) {
        tView.data[index] = tIcu;
    }
    else {
        ngDevMode && assertTNodeType(tNode, 32 /* TNodeType.Icu */);
        tNode.value = tIcu;
    }
}
/**
 * Set `TNode.insertBeforeIndex` taking the `Array` into account.
 *
 * See `TNode.insertBeforeIndex`
 */
export function setTNodeInsertBeforeIndex(tNode, index) {
    ngDevMode && assertTNode(tNode);
    let insertBeforeIndex = tNode.insertBeforeIndex;
    if (insertBeforeIndex === null) {
        setI18nHandling(getInsertInFrontOfRNodeWithI18n, processI18nInsertBefore);
        insertBeforeIndex = tNode.insertBeforeIndex = [
            null /* may be updated to number later */,
            index,
        ];
    }
    else {
        assertEqual(Array.isArray(insertBeforeIndex), true, 'Expecting array here');
        insertBeforeIndex.push(index);
    }
}
/**
 * Create `TNode.type=TNodeType.Placeholder` node.
 *
 * See `TNodeType.Placeholder` for more information.
 */
export function createTNodePlaceholder(tView, previousTNodes, index) {
    const tNode = createTNodeAtIndex(tView, index, 64 /* TNodeType.Placeholder */, null, null);
    addTNodeAndUpdateInsertBeforeIndex(previousTNodes, tNode);
    return tNode;
}
/**
 * Returns current ICU case.
 *
 * ICU cases are stored as index into the `TIcu.cases`.
 * At times it is necessary to communicate that the ICU case just switched and that next ICU update
 * should update all bindings regardless of the mask. In such a case the we store negative numbers
 * for cases which have just been switched. This function removes the negative flag.
 */
export function getCurrentICUCaseIndex(tIcu, lView) {
    const currentCase = lView[tIcu.currentCaseLViewIndex];
    return currentCase === null ? currentCase : currentCase < 0 ? ~currentCase : currentCase;
}
export function getParentFromIcuCreateOpCode(mergedCode) {
    return mergedCode >>> 17 /* IcuCreateOpCode.SHIFT_PARENT */;
}
export function getRefFromIcuCreateOpCode(mergedCode) {
    return (mergedCode & 131070 /* IcuCreateOpCode.MASK_REF */) >>> 1 /* IcuCreateOpCode.SHIFT_REF */;
}
export function getInstructionFromIcuCreateOpCode(mergedCode) {
    return mergedCode & 1 /* IcuCreateOpCode.MASK_INSTRUCTION */;
}
export function icuCreateOpCode(opCode, parentIdx, refIdx) {
    ngDevMode && assertGreaterThanOrEqual(parentIdx, 0, 'Missing parent index');
    ngDevMode && assertGreaterThan(refIdx, 0, 'Missing ref index');
    return (opCode | (parentIdx << 17 /* IcuCreateOpCode.SHIFT_PARENT */) | (refIdx << 1 /* IcuCreateOpCode.SHIFT_REF */));
}
// Returns whether the given value corresponds to a root template message,
// or a sub-template.
export function isRootTemplateMessage(subTemplateIndex) {
    return subTemplateIndex === -1;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl91dGlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9pMThuL2kxOG5fdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsV0FBVyxFQUNYLGlCQUFpQixFQUNqQix3QkFBd0IsRUFDeEIsVUFBVSxHQUNYLE1BQU0sbUJBQW1CLENBQUM7QUFDM0IsT0FBTyxFQUFDLFVBQVUsRUFBRSxXQUFXLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFDbEQsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFJMUQsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQy9DLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUNyRCxPQUFPLEVBQUMsK0JBQStCLEVBQUUsdUJBQXVCLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUVuRyxPQUFPLEVBQUMsa0NBQWtDLEVBQUMsTUFBTSw0QkFBNEIsQ0FBQztBQUU5RTs7Ozs7Ozs7Ozs7O0dBWUc7QUFDSCxNQUFNLFVBQVUsT0FBTyxDQUFDLEtBQVksRUFBRSxLQUFhO0lBQ2pELE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUE2QyxDQUFDO0lBQzVFLElBQUksS0FBSyxLQUFLLElBQUksSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRO1FBQUUsT0FBTyxJQUFJLENBQUM7SUFDN0QsSUFDRSxTQUFTO1FBQ1QsQ0FBQyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLEVBQ2pGLENBQUM7UUFDRCxVQUFVLENBQUMsMkRBQTJELEdBQUcsS0FBSyxDQUFDLENBQUM7SUFDbEYsQ0FBQztJQUNELDhGQUE4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VUFBa0I7SUFDbEUsT0FBTyxVQUFVLDJDQUFtQyxDQUFDO0FBQ3ZELENBQUM7QUFFRCxNQUFNLFVBQVUsZUFBZSxDQUFDLE1BQXVCLEVBQUUsU0FBaUIsRUFBRSxNQUFjO0lBQ3hGLFNBQVMsSUFBSSx3QkFBd0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLHNCQUFzQixDQUFDLENBQUM7SUFDNUUsU0FBUyxJQUFJLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztJQUMvRCxPQUFPLENBQ0wsTUFBTSxHQUFHLENBQUMsU0FBUyx5Q0FBZ0MsQ0FBQyxHQUFHLENBQUMsTUFBTSxxQ0FBNkIsQ0FBQyxDQUM3RixDQUFDO0FBQ0osQ0FBQztBQUVELDBFQUEwRTtBQUMxRSxxQkFBcUI7QUFDckIsTUFBTSxVQUFVLHFCQUFxQixDQUFDLGdCQUF3QjtJQUM1RCxPQUFPLGdCQUFnQixLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ2pDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIGFzc2VydEVxdWFsLFxuICBhc3NlcnRHcmVhdGVyVGhhbixcbiAgYXNzZXJ0R3JlYXRlclRoYW5PckVxdWFsLFxuICB0aHJvd0Vycm9yLFxufSBmcm9tICcuLi8uLi91dGlsL2Fzc2VydCc7XG5pbXBvcnQge2Fzc2VydFRJY3UsIGFzc2VydFROb2RlfSBmcm9tICcuLi9hc3NlcnQnO1xuaW1wb3J0IHtjcmVhdGVUTm9kZUF0SW5kZXh9IGZyb20gJy4uL2luc3RydWN0aW9ucy9zaGFyZWQnO1xuaW1wb3J0IHtJY3VDcmVhdGVPcENvZGUsIFRJY3V9IGZyb20gJy4uL2ludGVyZmFjZXMvaTE4bic7XG5pbXBvcnQge1RJY3VDb250YWluZXJOb2RlLCBUTm9kZSwgVE5vZGVUeXBlfSBmcm9tICcuLi9pbnRlcmZhY2VzL25vZGUnO1xuaW1wb3J0IHtMVmlldywgVFZpZXd9IGZyb20gJy4uL2ludGVyZmFjZXMvdmlldyc7XG5pbXBvcnQge2Fzc2VydFROb2RlVHlwZX0gZnJvbSAnLi4vbm9kZV9hc3NlcnQnO1xuaW1wb3J0IHtzZXRJMThuSGFuZGxpbmd9IGZyb20gJy4uL25vZGVfbWFuaXB1bGF0aW9uJztcbmltcG9ydCB7Z2V0SW5zZXJ0SW5Gcm9udE9mUk5vZGVXaXRoSTE4biwgcHJvY2Vzc0kxOG5JbnNlcnRCZWZvcmV9IGZyb20gJy4uL25vZGVfbWFuaXB1bGF0aW9uX2kxOG4nO1xuXG5pbXBvcnQge2FkZFROb2RlQW5kVXBkYXRlSW5zZXJ0QmVmb3JlSW5kZXh9IGZyb20gJy4vaTE4bl9pbnNlcnRfYmVmb3JlX2luZGV4JztcblxuLyoqXG4gKiBSZXRyaWV2ZSBgVEljdWAgYXQgYSBnaXZlbiBgaW5kZXhgLlxuICpcbiAqIFRoZSBgVEljdWAgY2FuIGJlIHN0b3JlZCBlaXRoZXIgZGlyZWN0bHkgKGlmIGl0IGlzIG5lc3RlZCBJQ1UpIE9SXG4gKiBpdCBpcyBzdG9yZWQgaW5zaWRlIHRobyBgVEljdUNvbnRhaW5lcmAgaWYgaXQgaXMgdG9wIGxldmVsIElDVS5cbiAqXG4gKiBUaGUgcmVhc29uIGZvciB0aGlzIGlzIHRoYXQgdGhlIHRvcCBsZXZlbCBJQ1UgbmVlZCBhIGBUTm9kZWAgc28gdGhhdCB0aGV5IGFyZSBwYXJ0IG9mIHRoZSByZW5kZXJcbiAqIHRyZWUsIGJ1dCBuZXN0ZWQgSUNVJ3MgaGF2ZSBubyBUTm9kZSwgYmVjYXVzZSB3ZSBkb24ndCBrbm93IGFoZWFkIG9mIHRpbWUgaWYgdGhlIG5lc3RlZCBJQ1UgaXNcbiAqIGV4cHJlc3NlZCAocGFyZW50IElDVSBtYXkgaGF2ZSBzZWxlY3RlZCBhIGNhc2Ugd2hpY2ggZG9lcyBub3QgY29udGFpbiBpdC4pXG4gKlxuICogQHBhcmFtIHRWaWV3IEN1cnJlbnQgYFRWaWV3YC5cbiAqIEBwYXJhbSBpbmRleCBJbmRleCB3aGVyZSB0aGUgdmFsdWUgc2hvdWxkIGJlIHJlYWQgZnJvbS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRJY3UodFZpZXc6IFRWaWV3LCBpbmRleDogbnVtYmVyKTogVEljdSB8IG51bGwge1xuICBjb25zdCB2YWx1ZSA9IHRWaWV3LmRhdGFbaW5kZXhdIGFzIG51bGwgfCBUSWN1IHwgVEljdUNvbnRhaW5lck5vZGUgfCBzdHJpbmc7XG4gIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSByZXR1cm4gbnVsbDtcbiAgaWYgKFxuICAgIG5nRGV2TW9kZSAmJlxuICAgICEodmFsdWUuaGFzT3duUHJvcGVydHkoJ3RWaWV3JykgfHwgdmFsdWUuaGFzT3duUHJvcGVydHkoJ2N1cnJlbnRDYXNlTFZpZXdJbmRleCcpKVxuICApIHtcbiAgICB0aHJvd0Vycm9yKFwiV2UgZXhwZWN0IHRvIGdldCAnbnVsbCd8J1RJY3UnfCdUSWN1Q29udGFpbmVyJywgYnV0IGdvdDogXCIgKyB2YWx1ZSk7XG4gIH1cbiAgLy8gSGVyZSB0aGUgYHZhbHVlLmhhc093blByb3BlcnR5KCdjdXJyZW50Q2FzZUxWaWV3SW5kZXgnKWAgaXMgYSBwb2x5bW9ycGhpYyByZWFkIGFzIGl0IGNhbiBiZVxuICAvLyBlaXRoZXIgVEljdSBvciBUSWN1Q29udGFpbmVyTm9kZS4gVGhpcyBpcyBub3QgaWRlYWwsIGJ1dCB3ZSBzdGlsbCB0aGluayBpdCBpcyBPSyBiZWNhdXNlIGl0XG4gIC8vIHdpbGwgYmUganVzdCB0d28gY2FzZXMgd2hpY2ggZml0cyBpbnRvIHRoZSBicm93c2VyIGlubGluZSBjYWNoZSAoaW5saW5lIGNhY2hlIGNhbiB0YWtlIHVwIHRvXG4gIC8vIDQpXG4gIGNvbnN0IHRJY3UgPSB2YWx1ZS5oYXNPd25Qcm9wZXJ0eSgnY3VycmVudENhc2VMVmlld0luZGV4JylcbiAgICA/ICh2YWx1ZSBhcyBUSWN1KVxuICAgIDogKHZhbHVlIGFzIFRJY3VDb250YWluZXJOb2RlKS52YWx1ZTtcbiAgbmdEZXZNb2RlICYmIGFzc2VydFRJY3UodEljdSk7XG4gIHJldHVybiB0SWN1O1xufVxuXG4vKipcbiAqIFN0b3JlIGBUSWN1YCBhdCBhIGdpdmUgYGluZGV4YC5cbiAqXG4gKiBUaGUgYFRJY3VgIGNhbiBiZSBzdG9yZWQgZWl0aGVyIGRpcmVjdGx5IChpZiBpdCBpcyBuZXN0ZWQgSUNVKSBPUlxuICogaXQgaXMgc3RvcmVkIGluc2lkZSB0aG8gYFRJY3VDb250YWluZXJgIGlmIGl0IGlzIHRvcCBsZXZlbCBJQ1UuXG4gKlxuICogVGhlIHJlYXNvbiBmb3IgdGhpcyBpcyB0aGF0IHRoZSB0b3AgbGV2ZWwgSUNVIG5lZWQgYSBgVE5vZGVgIHNvIHRoYXQgdGhleSBhcmUgcGFydCBvZiB0aGUgcmVuZGVyXG4gKiB0cmVlLCBidXQgbmVzdGVkIElDVSdzIGhhdmUgbm8gVE5vZGUsIGJlY2F1c2Ugd2UgZG9uJ3Qga25vdyBhaGVhZCBvZiB0aW1lIGlmIHRoZSBuZXN0ZWQgSUNVIGlzXG4gKiBleHByZXNzZWQgKHBhcmVudCBJQ1UgbWF5IGhhdmUgc2VsZWN0ZWQgYSBjYXNlIHdoaWNoIGRvZXMgbm90IGNvbnRhaW4gaXQuKVxuICpcbiAqIEBwYXJhbSB0VmlldyBDdXJyZW50IGBUVmlld2AuXG4gKiBAcGFyYW0gaW5kZXggSW5kZXggd2hlcmUgdGhlIHZhbHVlIHNob3VsZCBiZSBzdG9yZWQgYXQgaW4gYFR2aWV3LmRhdGFgXG4gKiBAcGFyYW0gdEljdSBUaGUgVEljdSB0byBzdG9yZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldFRJY3UodFZpZXc6IFRWaWV3LCBpbmRleDogbnVtYmVyLCB0SWN1OiBUSWN1KTogdm9pZCB7XG4gIGNvbnN0IHROb2RlID0gdFZpZXcuZGF0YVtpbmRleF0gYXMgbnVsbCB8IFRJY3VDb250YWluZXJOb2RlO1xuICBuZ0Rldk1vZGUgJiZcbiAgICBhc3NlcnRFcXVhbChcbiAgICAgIHROb2RlID09PSBudWxsIHx8IHROb2RlLmhhc093blByb3BlcnR5KCd0VmlldycpLFxuICAgICAgdHJ1ZSxcbiAgICAgIFwiV2UgZXhwZWN0IHRvIGdldCAnbnVsbCd8J1RJY3VDb250YWluZXInXCIsXG4gICAgKTtcbiAgaWYgKHROb2RlID09PSBudWxsKSB7XG4gICAgdFZpZXcuZGF0YVtpbmRleF0gPSB0SWN1O1xuICB9IGVsc2Uge1xuICAgIG5nRGV2TW9kZSAmJiBhc3NlcnRUTm9kZVR5cGUodE5vZGUsIFROb2RlVHlwZS5JY3UpO1xuICAgIHROb2RlLnZhbHVlID0gdEljdTtcbiAgfVxufVxuXG4vKipcbiAqIFNldCBgVE5vZGUuaW5zZXJ0QmVmb3JlSW5kZXhgIHRha2luZyB0aGUgYEFycmF5YCBpbnRvIGFjY291bnQuXG4gKlxuICogU2VlIGBUTm9kZS5pbnNlcnRCZWZvcmVJbmRleGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldFROb2RlSW5zZXJ0QmVmb3JlSW5kZXgodE5vZGU6IFROb2RlLCBpbmRleDogbnVtYmVyKSB7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnRUTm9kZSh0Tm9kZSk7XG4gIGxldCBpbnNlcnRCZWZvcmVJbmRleCA9IHROb2RlLmluc2VydEJlZm9yZUluZGV4O1xuICBpZiAoaW5zZXJ0QmVmb3JlSW5kZXggPT09IG51bGwpIHtcbiAgICBzZXRJMThuSGFuZGxpbmcoZ2V0SW5zZXJ0SW5Gcm9udE9mUk5vZGVXaXRoSTE4biwgcHJvY2Vzc0kxOG5JbnNlcnRCZWZvcmUpO1xuICAgIGluc2VydEJlZm9yZUluZGV4ID0gdE5vZGUuaW5zZXJ0QmVmb3JlSW5kZXggPSBbXG4gICAgICBudWxsISAvKiBtYXkgYmUgdXBkYXRlZCB0byBudW1iZXIgbGF0ZXIgKi8sXG4gICAgICBpbmRleCxcbiAgICBdO1xuICB9IGVsc2Uge1xuICAgIGFzc2VydEVxdWFsKEFycmF5LmlzQXJyYXkoaW5zZXJ0QmVmb3JlSW5kZXgpLCB0cnVlLCAnRXhwZWN0aW5nIGFycmF5IGhlcmUnKTtcbiAgICAoaW5zZXJ0QmVmb3JlSW5kZXggYXMgbnVtYmVyW10pLnB1c2goaW5kZXgpO1xuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlIGBUTm9kZS50eXBlPVROb2RlVHlwZS5QbGFjZWhvbGRlcmAgbm9kZS5cbiAqXG4gKiBTZWUgYFROb2RlVHlwZS5QbGFjZWhvbGRlcmAgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVUTm9kZVBsYWNlaG9sZGVyKFxuICB0VmlldzogVFZpZXcsXG4gIHByZXZpb3VzVE5vZGVzOiBUTm9kZVtdLFxuICBpbmRleDogbnVtYmVyLFxuKTogVE5vZGUge1xuICBjb25zdCB0Tm9kZSA9IGNyZWF0ZVROb2RlQXRJbmRleCh0VmlldywgaW5kZXgsIFROb2RlVHlwZS5QbGFjZWhvbGRlciwgbnVsbCwgbnVsbCk7XG4gIGFkZFROb2RlQW5kVXBkYXRlSW5zZXJ0QmVmb3JlSW5kZXgocHJldmlvdXNUTm9kZXMsIHROb2RlKTtcbiAgcmV0dXJuIHROb2RlO1xufVxuXG4vKipcbiAqIFJldHVybnMgY3VycmVudCBJQ1UgY2FzZS5cbiAqXG4gKiBJQ1UgY2FzZXMgYXJlIHN0b3JlZCBhcyBpbmRleCBpbnRvIHRoZSBgVEljdS5jYXNlc2AuXG4gKiBBdCB0aW1lcyBpdCBpcyBuZWNlc3NhcnkgdG8gY29tbXVuaWNhdGUgdGhhdCB0aGUgSUNVIGNhc2UganVzdCBzd2l0Y2hlZCBhbmQgdGhhdCBuZXh0IElDVSB1cGRhdGVcbiAqIHNob3VsZCB1cGRhdGUgYWxsIGJpbmRpbmdzIHJlZ2FyZGxlc3Mgb2YgdGhlIG1hc2suIEluIHN1Y2ggYSBjYXNlIHRoZSB3ZSBzdG9yZSBuZWdhdGl2ZSBudW1iZXJzXG4gKiBmb3IgY2FzZXMgd2hpY2ggaGF2ZSBqdXN0IGJlZW4gc3dpdGNoZWQuIFRoaXMgZnVuY3Rpb24gcmVtb3ZlcyB0aGUgbmVnYXRpdmUgZmxhZy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEN1cnJlbnRJQ1VDYXNlSW5kZXgodEljdTogVEljdSwgbFZpZXc6IExWaWV3KSB7XG4gIGNvbnN0IGN1cnJlbnRDYXNlOiBudW1iZXIgfCBudWxsID0gbFZpZXdbdEljdS5jdXJyZW50Q2FzZUxWaWV3SW5kZXhdO1xuICByZXR1cm4gY3VycmVudENhc2UgPT09IG51bGwgPyBjdXJyZW50Q2FzZSA6IGN1cnJlbnRDYXNlIDwgMCA/IH5jdXJyZW50Q2FzZSA6IGN1cnJlbnRDYXNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGFyZW50RnJvbUljdUNyZWF0ZU9wQ29kZShtZXJnZWRDb2RlOiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gbWVyZ2VkQ29kZSA+Pj4gSWN1Q3JlYXRlT3BDb2RlLlNISUZUX1BBUkVOVDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFJlZkZyb21JY3VDcmVhdGVPcENvZGUobWVyZ2VkQ29kZTogbnVtYmVyKTogbnVtYmVyIHtcbiAgcmV0dXJuIChtZXJnZWRDb2RlICYgSWN1Q3JlYXRlT3BDb2RlLk1BU0tfUkVGKSA+Pj4gSWN1Q3JlYXRlT3BDb2RlLlNISUZUX1JFRjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEluc3RydWN0aW9uRnJvbUljdUNyZWF0ZU9wQ29kZShtZXJnZWRDb2RlOiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gbWVyZ2VkQ29kZSAmIEljdUNyZWF0ZU9wQ29kZS5NQVNLX0lOU1RSVUNUSU9OO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaWN1Q3JlYXRlT3BDb2RlKG9wQ29kZTogSWN1Q3JlYXRlT3BDb2RlLCBwYXJlbnRJZHg6IG51bWJlciwgcmVmSWR4OiBudW1iZXIpIHtcbiAgbmdEZXZNb2RlICYmIGFzc2VydEdyZWF0ZXJUaGFuT3JFcXVhbChwYXJlbnRJZHgsIDAsICdNaXNzaW5nIHBhcmVudCBpbmRleCcpO1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0R3JlYXRlclRoYW4ocmVmSWR4LCAwLCAnTWlzc2luZyByZWYgaW5kZXgnKTtcbiAgcmV0dXJuIChcbiAgICBvcENvZGUgfCAocGFyZW50SWR4IDw8IEljdUNyZWF0ZU9wQ29kZS5TSElGVF9QQVJFTlQpIHwgKHJlZklkeCA8PCBJY3VDcmVhdGVPcENvZGUuU0hJRlRfUkVGKVxuICApO1xufVxuXG4vLyBSZXR1cm5zIHdoZXRoZXIgdGhlIGdpdmVuIHZhbHVlIGNvcnJlc3BvbmRzIHRvIGEgcm9vdCB0ZW1wbGF0ZSBtZXNzYWdlLFxuLy8gb3IgYSBzdWItdGVtcGxhdGUuXG5leHBvcnQgZnVuY3Rpb24gaXNSb290VGVtcGxhdGVNZXNzYWdlKHN1YlRlbXBsYXRlSW5kZXg6IG51bWJlcik6IHN1YlRlbXBsYXRlSW5kZXggaXMgLTEge1xuICByZXR1cm4gc3ViVGVtcGxhdGVJbmRleCA9PT0gLTE7XG59XG4iXX0=