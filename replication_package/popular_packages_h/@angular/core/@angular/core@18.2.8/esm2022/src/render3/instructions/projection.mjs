/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { findMatchingDehydratedView } from '../../hydration/views';
import { newArray } from '../../util/array_utils';
import { assertLContainer, assertTNode } from '../assert';
import { DECLARATION_COMPONENT_VIEW, HEADER_OFFSET, HYDRATION, T_HOST, } from '../interfaces/view';
import { applyProjection } from '../node_manipulation';
import { getProjectAsAttrValue, isNodeMatchingSelectorList, isSelectorInSelectorList, } from '../node_selector_matcher';
import { getLView, getTView, isInSkipHydrationBlock, setCurrentTNodeAsNotParent } from '../state';
import { addLViewToLContainer, createAndRenderEmbeddedLView, shouldAddViewToDom, } from '../view_manipulation';
import { getOrCreateTNode } from './shared';
import { declareTemplate } from './template';
/**
 * Checks a given node against matching projection slots and returns the
 * determined slot index. Returns "null" if no slot matched the given node.
 *
 * This function takes into account the parsed ngProjectAs selector from the
 * node's attributes. If present, it will check whether the ngProjectAs selector
 * matches any of the projection slot selectors.
 */
export function matchingProjectionSlotIndex(tNode, projectionSlots) {
    let wildcardNgContentIndex = null;
    const ngProjectAsAttrVal = getProjectAsAttrValue(tNode);
    for (let i = 0; i < projectionSlots.length; i++) {
        const slotValue = projectionSlots[i];
        // The last wildcard projection slot should match all nodes which aren't matching
        // any selector. This is necessary to be backwards compatible with view engine.
        if (slotValue === '*') {
            wildcardNgContentIndex = i;
            continue;
        }
        // If we ran into an `ngProjectAs` attribute, we should match its parsed selector
        // to the list of selectors, otherwise we fall back to matching against the node.
        if (ngProjectAsAttrVal === null
            ? isNodeMatchingSelectorList(tNode, slotValue, /* isProjectionMode */ true)
            : isSelectorInSelectorList(ngProjectAsAttrVal, slotValue)) {
            return i; // first matching selector "captures" a given node
        }
    }
    return wildcardNgContentIndex;
}
/**
 * Instruction to distribute projectable nodes among <ng-content> occurrences in a given template.
 * It takes all the selectors from the entire component's template and decides where
 * each projected node belongs (it re-distributes nodes among "buckets" where each "bucket" is
 * backed by a selector).
 *
 * This function requires CSS selectors to be provided in 2 forms: parsed (by a compiler) and text,
 * un-parsed form.
 *
 * The parsed form is needed for efficient matching of a node against a given CSS selector.
 * The un-parsed, textual form is needed for support of the ngProjectAs attribute.
 *
 * Having a CSS selector in 2 different formats is not ideal, but alternatives have even more
 * drawbacks:
 * - having only a textual form would require runtime parsing of CSS selectors;
 * - we can't have only a parsed as we can't re-construct textual form from it (as entered by a
 * template author).
 *
 * @param projectionSlots? A collection of projection slots. A projection slot can be based
 *        on a parsed CSS selectors or set to the wildcard selector ("*") in order to match
 *        all nodes which do not match any selector. If not specified, a single wildcard
 *        selector projection slot will be defined.
 *
 * @codeGenApi
 */
export function ɵɵprojectionDef(projectionSlots) {
    const componentNode = getLView()[DECLARATION_COMPONENT_VIEW][T_HOST];
    if (!componentNode.projection) {
        // If no explicit projection slots are defined, fall back to a single
        // projection slot with the wildcard selector.
        const numProjectionSlots = projectionSlots ? projectionSlots.length : 1;
        const projectionHeads = (componentNode.projection = newArray(numProjectionSlots, null));
        const tails = projectionHeads.slice();
        let componentChild = componentNode.child;
        while (componentChild !== null) {
            // Do not project let declarations so they don't occupy a slot.
            if (componentChild.type !== 128 /* TNodeType.LetDeclaration */) {
                const slotIndex = projectionSlots
                    ? matchingProjectionSlotIndex(componentChild, projectionSlots)
                    : 0;
                if (slotIndex !== null) {
                    if (tails[slotIndex]) {
                        tails[slotIndex].projectionNext = componentChild;
                    }
                    else {
                        projectionHeads[slotIndex] = componentChild;
                    }
                    tails[slotIndex] = componentChild;
                }
            }
            componentChild = componentChild.next;
        }
    }
}
/**
 * Inserts previously re-distributed projected nodes. This instruction must be preceded by a call
 * to the projectionDef instruction.
 *
 * @param nodeIndex Index of the projection node.
 * @param selectorIndex Index of the slot selector.
 *  - 0 when the selector is `*` (or unspecified as this is the default value),
 *  - 1 based index of the selector from the {@link projectionDef}
 * @param attrs Static attributes set on the `ng-content` node.
 * @param fallbackTemplateFn Template function with fallback content.
 *   Will be rendered if the slot is empty at runtime.
 * @param fallbackDecls Number of declarations in the fallback template.
 * @param fallbackVars Number of variables in the fallback template.
 *
 * @codeGenApi
 */
export function ɵɵprojection(nodeIndex, selectorIndex = 0, attrs, fallbackTemplateFn, fallbackDecls, fallbackVars) {
    const lView = getLView();
    const tView = getTView();
    const fallbackIndex = fallbackTemplateFn ? nodeIndex + 1 : null;
    // Fallback content needs to be declared no matter whether the slot is empty since different
    // instances of the component may or may not insert it. Also it needs to be declare *before*
    // the projection node in order to work correctly with hydration.
    if (fallbackIndex !== null) {
        declareTemplate(lView, tView, fallbackIndex, fallbackTemplateFn, fallbackDecls, fallbackVars, null, attrs);
    }
    const tProjectionNode = getOrCreateTNode(tView, HEADER_OFFSET + nodeIndex, 16 /* TNodeType.Projection */, null, attrs || null);
    // We can't use viewData[HOST_NODE] because projection nodes can be nested in embedded views.
    if (tProjectionNode.projection === null) {
        tProjectionNode.projection = selectorIndex;
    }
    // `<ng-content>` has no content. Even if there's fallback
    // content, the fallback is shown next to it.
    setCurrentTNodeAsNotParent();
    const hydrationInfo = lView[HYDRATION];
    const isNodeCreationMode = !hydrationInfo || isInSkipHydrationBlock();
    const componentHostNode = lView[DECLARATION_COMPONENT_VIEW][T_HOST];
    const isEmpty = componentHostNode.projection[tProjectionNode.projection] === null;
    if (isEmpty && fallbackIndex !== null) {
        insertFallbackContent(lView, tView, fallbackIndex);
    }
    else if (isNodeCreationMode &&
        (tProjectionNode.flags & 32 /* TNodeFlags.isDetached */) !== 32 /* TNodeFlags.isDetached */) {
        // re-distribution of projectable nodes is stored on a component's view level
        applyProjection(tView, lView, tProjectionNode);
    }
}
/** Inserts the fallback content of a projection slot. Assumes there's no projected content. */
function insertFallbackContent(lView, tView, fallbackIndex) {
    const adjustedIndex = HEADER_OFFSET + fallbackIndex;
    const fallbackTNode = tView.data[adjustedIndex];
    const fallbackLContainer = lView[adjustedIndex];
    ngDevMode && assertTNode(fallbackTNode);
    ngDevMode && assertLContainer(fallbackLContainer);
    const dehydratedView = findMatchingDehydratedView(fallbackLContainer, fallbackTNode.tView.ssrId);
    const fallbackLView = createAndRenderEmbeddedLView(lView, fallbackTNode, undefined, {
        dehydratedView,
    });
    addLViewToLContainer(fallbackLContainer, fallbackLView, 0, shouldAddViewToDom(fallbackTNode, dehydratedView));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvamVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvaW5zdHJ1Y3Rpb25zL3Byb2plY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFDLDBCQUEwQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDakUsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ2hELE9BQU8sRUFBQyxnQkFBZ0IsRUFBRSxXQUFXLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFJeEQsT0FBTyxFQUNMLDBCQUEwQixFQUMxQixhQUFhLEVBQ2IsU0FBUyxFQUVULE1BQU0sR0FFUCxNQUFNLG9CQUFvQixDQUFDO0FBQzVCLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUNyRCxPQUFPLEVBQ0wscUJBQXFCLEVBQ3JCLDBCQUEwQixFQUMxQix3QkFBd0IsR0FDekIsTUFBTSwwQkFBMEIsQ0FBQztBQUNsQyxPQUFPLEVBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxzQkFBc0IsRUFBRSwwQkFBMEIsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUNoRyxPQUFPLEVBQ0wsb0JBQW9CLEVBQ3BCLDRCQUE0QixFQUM1QixrQkFBa0IsR0FDbkIsTUFBTSxzQkFBc0IsQ0FBQztBQUU5QixPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDMUMsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUUzQzs7Ozs7OztHQU9HO0FBQ0gsTUFBTSxVQUFVLDJCQUEyQixDQUN6QyxLQUFZLEVBQ1osZUFBZ0M7SUFFaEMsSUFBSSxzQkFBc0IsR0FBRyxJQUFJLENBQUM7SUFDbEMsTUFBTSxrQkFBa0IsR0FBRyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN4RCxLQUFLLElB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QUFDO0lBQ2pELENBQUM7QUFDSCxDQUFDO0FBRUQsK0ZBQStGO0FBQy9GLFNBQVMscUJBQXFCLENBQUMsS0FBWSxFQUFFLEtBQVksRUFBRSxhQUFxQjtJQUM5RSxNQUFNLGFBQWEsR0FBRyxhQUFhLEdBQUcsYUFBYSxDQUFDO0lBQ3BELE1BQU0sYUFBYSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFVLENBQUM7SUFDekQsTUFBTSxrQkFBa0IsR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDaEQsU0FBUyxJQUFJLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN4QyxTQUFTLElBQUksZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUVsRCxNQUFNLGNBQWMsR0FBRywwQkFBMEIsQ0FBQyxrQkFBa0IsRUFBRSxhQUFhLENBQUMsS0FBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2xHLE1BQU0sYUFBYSxHQUFHLDRCQUE0QixDQUFDLEtBQUssRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUFFO1FBQ2xGLGNBQWM7S0FDZixDQUFDLENBQUM7SUFDSCxvQkFBb0IsQ0FDbEIsa0JBQWtCLEVBQ2xCLGFBQWEsRUFDYixDQUFDLEVBQ0Qsa0JBQWtCLENBQUMsYUFBYSxFQUFFLGNBQWMsQ0FBQyxDQUNsRCxDQUFDO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cbmltcG9ydCB7ZmluZE1hdGNoaW5nRGVoeWRyYXRlZFZpZXd9IGZyb20gJy4uLy4uL2h5ZHJhdGlvbi92aWV3cyc7XG5pbXBvcnQge25ld0FycmF5fSBmcm9tICcuLi8uLi91dGlsL2FycmF5X3V0aWxzJztcbmltcG9ydCB7YXNzZXJ0TENvbnRhaW5lciwgYXNzZXJ0VE5vZGV9IGZyb20gJy4uL2Fzc2VydCc7XG5pbXBvcnQge0NvbXBvbmVudFRlbXBsYXRlfSBmcm9tICcuLi9pbnRlcmZhY2VzL2RlZmluaXRpb24nO1xuaW1wb3J0IHtUQXR0cmlidXRlcywgVEVsZW1lbnROb2RlLCBUTm9kZSwgVE5vZGVGbGFncywgVE5vZGVUeXBlfSBmcm9tICcuLi9pbnRlcmZhY2VzL25vZGUnO1xuaW1wb3J0IHtQcm9qZWN0aW9uU2xvdHN9IGZyb20gJy4uL2ludGVyZmFjZXMvcHJvamVjdGlvbic7XG5pbXBvcnQge1xuICBERUNMQVJBVElPTl9DT01QT05FTlRfVklFVyxcbiAgSEVBREVSX09GRlNFVCxcbiAgSFlEUkFUSU9OLFxuICBMVmlldyxcbiAgVF9IT1NULFxuICBUVmlldyxcbn0gZnJvbSAnLi4vaW50ZXJmYWNlcy92aWV3JztcbmltcG9ydCB7YXBwbHlQcm9qZWN0aW9ufSBmcm9tICcuLi9ub2RlX21hbmlwdWxhdGlvbic7XG5pbXBvcnQge1xuICBnZXRQcm9qZWN0QXNBdHRyVmFsdWUsXG4gIGlzTm9kZU1hdGNoaW5nU2VsZWN0b3JMaXN0LFxuICBpc1NlbGVjdG9ySW5TZWxlY3Rvckxpc3QsXG59IGZyb20gJy4uL25vZGVfc2VsZWN0b3JfbWF0Y2hlcic7XG5pbXBvcnQge2dldExWaWV3LCBnZXRUVmlldywgaXNJblNraXBIeWRyYXRpb25CbG9jaywgc2V0Q3VycmVudFROb2RlQXNOb3RQYXJlbnR9IGZyb20gJy4uL3N0YXRlJztcbmltcG9ydCB7XG4gIGFkZExWaWV3VG9MQ29udGFpbmVyLFxuICBjcmVhdGVBbmRSZW5kZXJFbWJlZGRlZExWaWV3LFxuICBzaG91bGRBZGRWaWV3VG9Eb20sXG59IGZyb20gJy4uL3ZpZXdfbWFuaXB1bGF0aW9uJztcblxuaW1wb3J0IHtnZXRPckNyZWF0ZVROb2RlfSBmcm9tICcuL3NoYXJlZCc7XG5pbXBvcnQge2RlY2xhcmVUZW1wbGF0ZX0gZnJvbSAnLi90ZW1wbGF0ZSc7XG5cbi8qKlxuICogQ2hlY2tzIGEgZ2l2ZW4gbm9kZSBhZ2FpbnN0IG1hdGNoaW5nIHByb2plY3Rpb24gc2xvdHMgYW5kIHJldHVybnMgdGhlXG4gKiBkZXRlcm1pbmVkIHNsb3QgaW5kZXguIFJldHVybnMgXCJudWxsXCIgaWYgbm8gc2xvdCBtYXRjaGVkIHRoZSBnaXZlbiBub2RlLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gdGFrZXMgaW50byBhY2NvdW50IHRoZSBwYXJzZWQgbmdQcm9qZWN0QXMgc2VsZWN0b3IgZnJvbSB0aGVcbiAqIG5vZGUncyBhdHRyaWJ1dGVzLiBJZiBwcmVzZW50LCBpdCB3aWxsIGNoZWNrIHdoZXRoZXIgdGhlIG5nUHJvamVjdEFzIHNlbGVjdG9yXG4gKiBtYXRjaGVzIGFueSBvZiB0aGUgcHJvamVjdGlvbiBzbG90IHNlbGVjdG9ycy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1hdGNoaW5nUHJvamVjdGlvblNsb3RJbmRleChcbiAgdE5vZGU6IFROb2RlLFxuICBwcm9qZWN0aW9uU2xvdHM6IFByb2plY3Rpb25TbG90cyxcbik6IG51bWJlciB8IG51bGwge1xuICBsZXQgd2lsZGNhcmROZ0NvbnRlbnRJbmRleCA9IG51bGw7XG4gIGNvbnN0IG5nUHJvamVjdEFzQXR0clZhbCA9IGdldFByb2plY3RBc0F0dHJWYWx1ZSh0Tm9kZSk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcHJvamVjdGlvblNsb3RzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3Qgc2xvdFZhbHVlID0gcHJvamVjdGlvblNsb3RzW2ldO1xuICAgIC8vIFRoZSBsYXN0IHdpbGRjYXJkIHByb2plY3Rpb24gc2xvdCBzaG91bGQgbWF0Y2ggYWxsIG5vZGVzIHdoaWNoIGFyZW4ndCBtYXRjaGluZ1xuICAgIC8vIGFueSBzZWxlY3Rvci4gVGhpcyBpcyBuZWNlc3NhcnkgdG8gYmUgYmFja3dhcmRzIGNvbXBhdGlibGUgd2l0aCB2aWV3IGVuZ2luZS5cbiAgICBpZiAoc2xvdFZhbHVlID09PSAnKicpIHtcbiAgICAgIHdpbGRjYXJkTmdDb250ZW50SW5kZXggPSBpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIC8vIElmIHdlIHJhbiBpbnRvIGFuIGBuZ1Byb2plY3RBc2AgYXR0cmlidXRlLCB3ZSBzaG91bGQgbWF0Y2ggaXRzIHBhcnNlZCBzZWxlY3RvclxuICAgIC8vIHRvIHRoZSBsaXN0IG9mIHNlbGVjdG9ycywgb3RoZXJ3aXNlIHdlIGZhbGwgYmFjayB0byBtYXRjaGluZyBhZ2FpbnN0IHRoZSBub2RlLlxuICAgIGlmIChcbiAgICAgIG5nUHJvamVjdEFzQXR0clZhbCA9PT0gbnVsbFxuICAgICAgICA/IGlzTm9kZU1hdGNoaW5nU2VsZWN0b3JMaXN0KHROb2RlLCBzbG90VmFsdWUsIC8qIGlzUHJvamVjdGlvbk1vZGUgKi8gdHJ1ZSlcbiAgICAgICAgOiBpc1NlbGVjdG9ySW5TZWxlY3Rvckxpc3QobmdQcm9qZWN0QXNBdHRyVmFsLCBzbG90VmFsdWUpXG4gICAgKSB7XG4gICAgICByZXR1cm4gaTsgLy8gZmlyc3QgbWF0Y2hpbmcgc2VsZWN0b3IgXCJjYXB0dXJlc1wiIGEgZ2l2ZW4gbm9kZVxuICAgIH1cbiAgfVxuICByZXR1cm4gd2lsZGNhcmROZ0NvbnRlbnRJbmRleDtcbn1cblxuLyoqXG4gKiBJbnN0cnVjdGlvbiB0byBkaXN0cmlidXRlIHByb2plY3RhYmxlIG5vZGVzIGFtb25nIDxuZy1jb250ZW50PiBvY2N1cnJlbmNlcyBpbiBhIGdpdmVuIHRlbXBsYXRlLlxuICogSXQgdGFrZXMgYWxsIHRoZSBzZWxlY3RvcnMgZnJvbSB0aGUgZW50aXJlIGNvbXBvbmVudCdzIHRlbXBsYXRlIGFuZCBkZWNpZGVzIHdoZXJlXG4gKiBlYWNoIHByb2plY3RlZCBub2RlIGJlbG9uZ3MgKGl0IHJlLWRpc3RyaWJ1dGVzIG5vZGVzIGFtb25nIFwiYnVja2V0c1wiIHdoZXJlIGVhY2ggXCJidWNrZXRcIiBpc1xuICogYmFja2VkIGJ5IGEgc2VsZWN0b3IpLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gcmVxdWlyZXMgQ1NTIHNlbGVjdG9ycyB0byBiZSBwcm92aWRlZCBpbiAyIGZvcm1zOiBwYXJzZWQgKGJ5IGEgY29tcGlsZXIpIGFuZCB0ZXh0LFxuICogdW4tcGFyc2VkIGZvcm0uXG4gKlxuICogVGhlIHBhcnNlZCBmb3JtIGlzIG5lZWRlZCBmb3IgZWZmaWNpZW50IG1hdGNoaW5nIG9mIGEgbm9kZSBhZ2FpbnN0IGEgZ2l2ZW4gQ1NTIHNlbGVjdG9yLlxuICogVGhlIHVuLXBhcnNlZCwgdGV4dHVhbCBmb3JtIGlzIG5lZWRlZCBmb3Igc3VwcG9ydCBvZiB0aGUgbmdQcm9qZWN0QXMgYXR0cmlidXRlLlxuICpcbiAqIEhhdmluZyBhIENTUyBzZWxlY3RvciBpbiAyIGRpZmZlcmVudCBmb3JtYXRzIGlzIG5vdCBpZGVhbCwgYnV0IGFsdGVybmF0aXZlcyBoYXZlIGV2ZW4gbW9yZVxuICogZHJhd2JhY2tzOlxuICogLSBoYXZpbmcgb25seSBhIHRleHR1YWwgZm9ybSB3b3VsZCByZXF1aXJlIHJ1bnRpbWUgcGFyc2luZyBvZiBDU1Mgc2VsZWN0b3JzO1xuICogLSB3ZSBjYW4ndCBoYXZlIG9ubHkgYSBwYXJzZWQgYXMgd2UgY2FuJ3QgcmUtY29uc3RydWN0IHRleHR1YWwgZm9ybSBmcm9tIGl0IChhcyBlbnRlcmVkIGJ5IGFcbiAqIHRlbXBsYXRlIGF1dGhvcikuXG4gKlxuICogQHBhcmFtIHByb2plY3Rpb25TbG90cz8gQSBjb2xsZWN0aW9uIG9mIHByb2plY3Rpb24gc2xvdHMuIEEgcHJvamVjdGlvbiBzbG90IGNhbiBiZSBiYXNlZFxuICogICAgICAgIG9uIGEgcGFyc2VkIENTUyBzZWxlY3RvcnMgb3Igc2V0IHRvIHRoZSB3aWxkY2FyZCBzZWxlY3RvciAoXCIqXCIpIGluIG9yZGVyIHRvIG1hdGNoXG4gKiAgICAgICAgYWxsIG5vZGVzIHdoaWNoIGRvIG5vdCBtYXRjaCBhbnkgc2VsZWN0b3IuIElmIG5vdCBzcGVjaWZpZWQsIGEgc2luZ2xlIHdpbGRjYXJkXG4gKiAgICAgICAgc2VsZWN0b3IgcHJvamVjdGlvbiBzbG90IHdpbGwgYmUgZGVmaW5lZC5cbiAqXG4gKiBAY29kZUdlbkFwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gybXJtXByb2plY3Rpb25EZWYocHJvamVjdGlvblNsb3RzPzogUHJvamVjdGlvblNsb3RzKTogdm9pZCB7XG4gIGNvbnN0IGNvbXBvbmVudE5vZGUgPSBnZXRMVmlldygpW0RFQ0xBUkFUSU9OX0NPTVBPTkVOVF9WSUVXXVtUX0hPU1RdIGFzIFRFbGVtZW50Tm9kZTtcblxuICBpZiAoIWNvbXBvbmVudE5vZGUucHJvamVjdGlvbikge1xuICAgIC8vIElmIG5vIGV4cGxpY2l0IHByb2plY3Rpb24gc2xvdHMgYXJlIGRlZmluZWQsIGZhbGwgYmFjayB0byBhIHNpbmdsZVxuICAgIC8vIHByb2plY3Rpb24gc2xvdCB3aXRoIHRoZSB3aWxkY2FyZCBzZWxlY3Rvci5cbiAgICBjb25zdCBudW1Qcm9qZWN0aW9uU2xvdHMgPSBwcm9qZWN0aW9uU2xvdHMgPyBwcm9qZWN0aW9uU2xvdHMubGVuZ3RoIDogMTtcbiAgICBjb25zdCBwcm9qZWN0aW9uSGVhZHM6IChUTm9kZSB8IG51bGwpW10gPSAoY29tcG9uZW50Tm9kZS5wcm9qZWN0aW9uID0gbmV3QXJyYXkoXG4gICAgICBudW1Qcm9qZWN0aW9uU2xvdHMsXG4gICAgICBudWxsISBhcyBUTm9kZSxcbiAgICApKTtcbiAgICBjb25zdCB0YWlsczogKFROb2RlIHwgbnVsbClbXSA9IHByb2plY3Rpb25IZWFkcy5zbGljZSgpO1xuXG4gICAgbGV0IGNvbXBvbmVudENoaWxkOiBUTm9kZSB8IG51bGwgPSBjb21wb25lbnROb2RlLmNoaWxkO1xuXG4gICAgd2hpbGUgKGNvbXBvbmVudENoaWxkICE9PSBudWxsKSB7XG4gICAgICAvLyBEbyBub3QgcHJvamVjdCBsZXQgZGVjbGFyYXRpb25zIHNvIHRoZXkgZG9uJ3Qgb2NjdXB5IGEgc2xvdC5cbiAgICAgIGlmIChjb21wb25lbnRDaGlsZC50eXBlICE9PSBUTm9kZVR5cGUuTGV0RGVjbGFyYXRpb24pIHtcbiAgICAgICAgY29uc3Qgc2xvdEluZGV4ID0gcHJvamVjdGlvblNsb3RzXG4gICAgICAgICAgPyBtYXRjaGluZ1Byb2plY3Rpb25TbG90SW5kZXgoY29tcG9uZW50Q2hpbGQsIHByb2plY3Rpb25TbG90cylcbiAgICAgICAgICA6IDA7XG5cbiAgICAgICAgaWYgKHNsb3RJbmRleCAhPT0gbnVsbCkge1xuICAgICAgICAgIGlmICh0YWlsc1tzbG90SW5kZXhdKSB7XG4gICAgICAgICAgICB0YWlsc1tzbG90SW5kZXhdIS5wcm9qZWN0aW9uTmV4dCA9IGNvbXBvbmVudENoaWxkO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwcm9qZWN0aW9uSGVhZHNbc2xvdEluZGV4XSA9IGNvbXBvbmVudENoaWxkO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0YWlsc1tzbG90SW5kZXhdID0gY29tcG9uZW50Q2hpbGQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29tcG9uZW50Q2hpbGQgPSBjb21wb25lbnRDaGlsZC5uZXh0O1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEluc2VydHMgcHJldmlvdXNseSByZS1kaXN0cmlidXRlZCBwcm9qZWN0ZWQgbm9kZXMuIFRoaXMgaW5zdHJ1Y3Rpb24gbXVzdCBiZSBwcmVjZWRlZCBieSBhIGNhbGxcbiAqIHRvIHRoZSBwcm9qZWN0aW9uRGVmIGluc3RydWN0aW9uLlxuICpcbiAqIEBwYXJhbSBub2RlSW5kZXggSW5kZXggb2YgdGhlIHByb2plY3Rpb24gbm9kZS5cbiAqIEBwYXJhbSBzZWxlY3RvckluZGV4IEluZGV4IG9mIHRoZSBzbG90IHNlbGVjdG9yLlxuICogIC0gMCB3aGVuIHRoZSBzZWxlY3RvciBpcyBgKmAgKG9yIHVuc3BlY2lmaWVkIGFzIHRoaXMgaXMgdGhlIGRlZmF1bHQgdmFsdWUpLFxuICogIC0gMSBiYXNlZCBpbmRleCBvZiB0aGUgc2VsZWN0b3IgZnJvbSB0aGUge0BsaW5rIHByb2plY3Rpb25EZWZ9XG4gKiBAcGFyYW0gYXR0cnMgU3RhdGljIGF0dHJpYnV0ZXMgc2V0IG9uIHRoZSBgbmctY29udGVudGAgbm9kZS5cbiAqIEBwYXJhbSBmYWxsYmFja1RlbXBsYXRlRm4gVGVtcGxhdGUgZnVuY3Rpb24gd2l0aCBmYWxsYmFjayBjb250ZW50LlxuICogICBXaWxsIGJlIHJlbmRlcmVkIGlmIHRoZSBzbG90IGlzIGVtcHR5IGF0IHJ1bnRpbWUuXG4gKiBAcGFyYW0gZmFsbGJhY2tEZWNscyBOdW1iZXIgb2YgZGVjbGFyYXRpb25zIGluIHRoZSBmYWxsYmFjayB0ZW1wbGF0ZS5cbiAqIEBwYXJhbSBmYWxsYmFja1ZhcnMgTnVtYmVyIG9mIHZhcmlhYmxlcyBpbiB0aGUgZmFsbGJhY2sgdGVtcGxhdGUuXG4gKlxuICogQGNvZGVHZW5BcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1ybVwcm9qZWN0aW9uKFxuICBub2RlSW5kZXg6IG51bWJlcixcbiAgc2VsZWN0b3JJbmRleDogbnVtYmVyID0gMCxcbiAgYXR0cnM/OiBUQXR0cmlidXRlcyxcbiAgZmFsbGJhY2tUZW1wbGF0ZUZuPzogQ29tcG9uZW50VGVtcGxhdGU8dW5rbm93bj4sXG4gIGZhbGxiYWNrRGVjbHM/OiBudW1iZXIsXG4gIGZhbGxiYWNrVmFycz86IG51bWJlcixcbik6IHZvaWQge1xuICBjb25zdCBsVmlldyA9IGdldExWaWV3KCk7XG4gIGNvbnN0IHRWaWV3ID0gZ2V0VFZpZXcoKTtcbiAgY29uc3QgZmFsbGJhY2tJbmRleCA9IGZhbGxiYWNrVGVtcGxhdGVGbiA/IG5vZGVJbmRleCArIDEgOiBudWxsO1xuXG4gIC8vIEZhbGxiYWNrIGNvbnRlbnQgbmVlZHMgdG8gYmUgZGVjbGFyZWQgbm8gbWF0dGVyIHdoZXRoZXIgdGhlIHNsb3QgaXMgZW1wdHkgc2luY2UgZGlmZmVyZW50XG4gIC8vIGluc3RhbmNlcyBvZiB0aGUgY29tcG9uZW50IG1heSBvciBtYXkgbm90IGluc2VydCBpdC4gQWxzbyBpdCBuZWVkcyB0byBiZSBkZWNsYXJlICpiZWZvcmUqXG4gIC8vIHRoZSBwcm9qZWN0aW9uIG5vZGUgaW4gb3JkZXIgdG8gd29yayBjb3JyZWN0bHkgd2l0aCBoeWRyYXRpb24uXG4gIGlmIChmYWxsYmFja0luZGV4ICE9PSBudWxsKSB7XG4gICAgZGVjbGFyZVRlbXBsYXRlKFxuICAgICAgbFZpZXcsXG4gICAgICB0VmlldyxcbiAgICAgIGZhbGxiYWNrSW5kZXgsXG4gICAgICBmYWxsYmFja1RlbXBsYXRlRm4hLFxuICAgICAgZmFsbGJhY2tEZWNscyEsXG4gICAgICBmYWxsYmFja1ZhcnMhLFxuICAgICAgbnVsbCxcbiAgICAgIGF0dHJzLFxuICAgICk7XG4gIH1cblxuICBjb25zdCB0UHJvamVjdGlvbk5vZGUgPSBnZXRPckNyZWF0ZVROb2RlKFxuICAgIHRWaWV3LFxuICAgIEhFQURFUl9PRkZTRVQgKyBub2RlSW5kZXgsXG4gICAgVE5vZGVUeXBlLlByb2plY3Rpb24sXG4gICAgbnVsbCxcbiAgICBhdHRycyB8fCBudWxsLFxuICApO1xuXG4gIC8vIFdlIGNhbid0IHVzZSB2aWV3RGF0YVtIT1NUX05PREVdIGJlY2F1c2UgcHJvamVjdGlvbiBub2RlcyBjYW4gYmUgbmVzdGVkIGluIGVtYmVkZGVkIHZpZXdzLlxuICBpZiAodFByb2plY3Rpb25Ob2RlLnByb2plY3Rpb24gPT09IG51bGwpIHtcbiAgICB0UHJvamVjdGlvbk5vZGUucHJvamVjdGlvbiA9IHNlbGVjdG9ySW5kZXg7XG4gIH1cblxuICAvLyBgPG5nLWNvbnRlbnQ+YCBoYXMgbm8gY29udGVudC4gRXZlbiBpZiB0aGVyZSdzIGZhbGxiYWNrXG4gIC8vIGNvbnRlbnQsIHRoZSBmYWxsYmFjayBpcyBzaG93biBuZXh0IHRvIGl0LlxuICBzZXRDdXJyZW50VE5vZGVBc05vdFBhcmVudCgpO1xuXG4gIGNvbnN0IGh5ZHJhdGlvbkluZm8gPSBsVmlld1tIWURSQVRJT05dO1xuICBjb25zdCBpc05vZGVDcmVhdGlvbk1vZGUgPSAhaHlkcmF0aW9uSW5mbyB8fCBpc0luU2tpcEh5ZHJhdGlvbkJsb2NrKCk7XG4gIGNvbnN0IGNvbXBvbmVudEhvc3ROb2RlID0gbFZpZXdbREVDTEFSQVRJT05fQ09NUE9ORU5UX1ZJRVddW1RfSE9TVF0gYXMgVEVsZW1lbnROb2RlO1xuICBjb25zdCBpc0VtcHR5ID0gY29tcG9uZW50SG9zdE5vZGUucHJvamVjdGlvbiFbdFByb2plY3Rpb25Ob2RlLnByb2plY3Rpb25dID09PSBudWxsO1xuXG4gIGlmIChpc0VtcHR5ICYmIGZhbGxiYWNrSW5kZXggIT09IG51bGwpIHtcbiAgICBpbnNlcnRGYWxsYmFja0NvbnRlbnQobFZpZXcsIHRWaWV3LCBmYWxsYmFja0luZGV4KTtcbiAgfSBlbHNlIGlmIChcbiAgICBpc05vZGVDcmVhdGlvbk1vZGUgJiZcbiAgICAodFByb2plY3Rpb25Ob2RlLmZsYWdzICYgVE5vZGVGbGFncy5pc0RldGFjaGVkKSAhPT0gVE5vZGVGbGFncy5pc0RldGFjaGVkXG4gICkge1xuICAgIC8vIHJlLWRpc3RyaWJ1dGlvbiBvZiBwcm9qZWN0YWJsZSBub2RlcyBpcyBzdG9yZWQgb24gYSBjb21wb25lbnQncyB2aWV3IGxldmVsXG4gICAgYXBwbHlQcm9qZWN0aW9uKHRWaWV3LCBsVmlldywgdFByb2plY3Rpb25Ob2RlKTtcbiAgfVxufVxuXG4vKiogSW5zZXJ0cyB0aGUgZmFsbGJhY2sgY29udGVudCBvZiBhIHByb2plY3Rpb24gc2xvdC4gQXNzdW1lcyB0aGVyZSdzIG5vIHByb2plY3RlZCBjb250ZW50LiAqL1xuZnVuY3Rpb24gaW5zZXJ0RmFsbGJhY2tDb250ZW50KGxWaWV3OiBMVmlldywgdFZpZXc6IFRWaWV3LCBmYWxsYmFja0luZGV4OiBudW1iZXIpIHtcbiAgY29uc3QgYWRqdXN0ZWRJbmRleCA9IEhFQURFUl9PRkZTRVQgKyBmYWxsYmFja0luZGV4O1xuICBjb25zdCBmYWxsYmFja1ROb2RlID0gdFZpZXcuZGF0YVthZGp1c3RlZEluZGV4XSBhcyBUTm9kZTtcbiAgY29uc3QgZmFsbGJhY2tMQ29udGFpbmVyID0gbFZpZXdbYWRqdXN0ZWRJbmRleF07XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnRUTm9kZShmYWxsYmFja1ROb2RlKTtcbiAgbmdEZXZNb2RlICYmIGFzc2VydExDb250YWluZXIoZmFsbGJhY2tMQ29udGFpbmVyKTtcblxuICBjb25zdCBkZWh5ZHJhdGVkVmlldyA9IGZpbmRNYXRjaGluZ0RlaHlkcmF0ZWRWaWV3KGZhbGxiYWNrTENvbnRhaW5lciwgZmFsbGJhY2tUTm9kZS50VmlldyEuc3NySWQpO1xuICBjb25zdCBmYWxsYmFja0xWaWV3ID0gY3JlYXRlQW5kUmVuZGVyRW1iZWRkZWRMVmlldyhsVmlldywgZmFsbGJhY2tUTm9kZSwgdW5kZWZpbmVkLCB7XG4gICAgZGVoeWRyYXRlZFZpZXcsXG4gIH0pO1xuICBhZGRMVmlld1RvTENvbnRhaW5lcihcbiAgICBmYWxsYmFja0xDb250YWluZXIsXG4gICAgZmFsbGJhY2tMVmlldyxcbiAgICAwLFxuICAgIHNob3VsZEFkZFZpZXdUb0RvbShmYWxsYmFja1ROb2RlLCBkZWh5ZHJhdGVkVmlldyksXG4gICk7XG59XG4iXX0=