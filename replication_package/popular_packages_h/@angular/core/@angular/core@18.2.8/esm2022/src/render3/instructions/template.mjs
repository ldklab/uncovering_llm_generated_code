/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { validateMatchingNode, validateNodeExists } from '../../hydration/error_handling';
import { TEMPLATES } from '../../hydration/interfaces';
import { locateNextRNode, siblingAfter } from '../../hydration/node_lookup_utils';
import { calcSerializedContainerSize, isDisconnectedNode, markRNodeAsClaimedByHydration, setSegmentHead, } from '../../hydration/utils';
import { isDetachedByI18n } from '../../i18n/utils';
import { populateDehydratedViewsInLContainer } from '../../linker/view_container_ref';
import { assertEqual } from '../../util/assert';
import { assertFirstCreatePass } from '../assert';
import { attachPatchData } from '../context_discovery';
import { registerPostOrderHooks } from '../hooks';
import { isDirectiveHost } from '../interfaces/type_checks';
import { HEADER_OFFSET, HYDRATION, RENDERER } from '../interfaces/view';
import { appendChild } from '../node_manipulation';
import { getLView, getTView, isInSkipHydrationBlock, lastNodeWasCreated, setCurrentTNode, wasLastNodeCreated, } from '../state';
import { getConstant } from '../util/view_utils';
import { addToViewTree, createDirectivesInstances, createLContainer, createTView, getOrCreateTNode, resolveDirectives, saveResolvedLocalsInData, } from './shared';
function templateFirstCreatePass(index, tView, lView, templateFn, decls, vars, tagName, attrs, localRefsIndex) {
    ngDevMode && assertFirstCreatePass(tView);
    ngDevMode && ngDevMode.firstCreatePass++;
    const tViewConsts = tView.consts;
    // TODO(pk): refactor getOrCreateTNode to have the "create" only version
    const tNode = getOrCreateTNode(tView, index, 4 /* TNodeType.Container */, tagName || null, attrs || null);
    resolveDirectives(tView, lView, tNode, getConstant(tViewConsts, localRefsIndex));
    registerPostOrderHooks(tView, tNode);
    const embeddedTView = (tNode.tView = createTView(2 /* TViewType.Embedded */, tNode, templateFn, decls, vars, tView.directiveRegistry, tView.pipeRegistry, null, tView.schemas, tViewConsts, null /* ssrId */));
    if (tView.queries !== null) {
        tView.queries.template(tView, tNode);
        embeddedTView.queries = tView.queries.embeddedTView(tNode);
    }
    return tNode;
}
/**
 * Creates an LContainer for an embedded view.
 *
 * @param declarationLView LView in which the template was declared.
 * @param declarationTView TView in which the template wa declared.
 * @param index The index of the container in the data array
 * @param templateFn Inline template
 * @param decls The number of nodes, local refs, and pipes for this template
 * @param vars The number of bindings for this template
 * @param tagName The name of the container element, if applicable
 * @param attrsIndex Index of template attributes in the `consts` array.
 * @param localRefs Index of the local references in the `consts` array.
 * @param localRefExtractor A function which extracts local-refs values from the template.
 *        Defaults to the current element associated with the local-ref.
 */
export function declareTemplate(declarationLView, declarationTView, index, templateFn, decls, vars, tagName, attrs, localRefsIndex, localRefExtractor) {
    const adjustedIndex = index + HEADER_OFFSET;
    const tNode = declarationTView.firstCreatePass
        ? templateFirstCreatePass(adjustedIndex, declarationTView, declarationLView, templateFn, decls, vars, tagName, attrs, localRefsIndex)
        : declarationTView.data[adjustedIndex];
    setCurrentTNode(tNode, false);
    const comment = _locateOrCreateContainerAnchor(declarationTView, declarationLView, tNode, index);
    if (wasLastNodeCreated()) {
        appendChild(declarationTView, declarationLView, comment, tNode);
    }
    attachPatchData(comment, declarationLView);
    const lContainer = createLContainer(comment, declarationLView, comment, tNode);
    declarationLView[adjustedIndex] = lContainer;
    addToViewTree(declarationLView, lContainer);
    // If hydration is enabled, looks up dehydrated views in the DOM
    // using hydration annotation info and stores those views on LContainer.
    // In client-only mode, this function is a noop.
    populateDehydratedViewsInLContainer(lContainer, tNode, declarationLView);
    if (isDirectiveHost(tNode)) {
        createDirectivesInstances(declarationTView, declarationLView, tNode);
    }
    if (localRefsIndex != null) {
        saveResolvedLocalsInData(declarationLView, tNode, localRefExtractor);
    }
    return tNode;
}
/**
 * Creates an LContainer for an ng-template (dynamically-inserted view), e.g.
 *
 * <ng-template #foo>
 *    <div></div>
 * </ng-template>
 *
 * @param index The index of the container in the data array
 * @param templateFn Inline template
 * @param decls The number of nodes, local refs, and pipes for this template
 * @param vars The number of bindings for this template
 * @param tagName The name of the container element, if applicable
 * @param attrsIndex Index of template attributes in the `consts` array.
 * @param localRefs Index of the local references in the `consts` array.
 * @param localRefExtractor A function which extracts local-refs values from the template.
 *        Defaults to the current element associated with the local-ref.
 *
 * @codeGenApi
 */
export function ɵɵtemplate(index, templateFn, decls, vars, tagName, attrsIndex, localRefsIndex, localRefExtractor) {
    const lView = getLView();
    const tView = getTView();
    const attrs = getConstant(tView.consts, attrsIndex);
    declareTemplate(lView, tView, index, templateFn, decls, vars, tagName, attrs, localRefsIndex, localRefExtractor);
    return ɵɵtemplate;
}
let _locateOrCreateContainerAnchor = createContainerAnchorImpl;
/**
 * Regular creation mode for LContainers and their anchor (comment) nodes.
 */
function createContainerAnchorImpl(tView, lView, tNode, index) {
    lastNodeWasCreated(true);
    return lView[RENDERER].createComment(ngDevMode ? 'container' : '');
}
/**
 * Enables hydration code path (to lookup existing elements in DOM)
 * in addition to the regular creation mode for LContainers and their
 * anchor (comment) nodes.
 */
function locateOrCreateContainerAnchorImpl(tView, lView, tNode, index) {
    const hydrationInfo = lView[HYDRATION];
    const isNodeCreationMode = !hydrationInfo ||
        isInSkipHydrationBlock() ||
        isDetachedByI18n(tNode) ||
        isDisconnectedNode(hydrationInfo, index);
    lastNodeWasCreated(isNodeCreationMode);
    // Regular creation mode.
    if (isNodeCreationMode) {
        return createContainerAnchorImpl(tView, lView, tNode, index);
    }
    const ssrId = hydrationInfo.data[TEMPLATES]?.[index] ?? null;
    // Apply `ssrId` value to the underlying TView if it was not previously set.
    //
    // There might be situations when the same component is present in a template
    // multiple times and some instances are opted-out of using hydration via
    // `ngSkipHydration` attribute. In this scenario, at the time a TView is created,
    // the `ssrId` might be `null` (if the first component is opted-out of hydration).
    // The code below makes sure that the `ssrId` is applied to the TView if it's still
    // `null` and verifies we never try to override it with a different value.
    if (ssrId !== null && tNode.tView !== null) {
        if (tNode.tView.ssrId === null) {
            tNode.tView.ssrId = ssrId;
        }
        else {
            ngDevMode &&
                assertEqual(tNode.tView.ssrId, ssrId, 'Unexpected value of the `ssrId` for this TView');
        }
    }
    // Hydration mode, looking up existing elements in DOM.
    const currentRNode = locateNextRNode(hydrationInfo, tView, lView, tNode);
    ngDevMode && validateNodeExists(currentRNode, lView, tNode);
    setSegmentHead(hydrationInfo, index, currentRNode);
    const viewContainerSize = calcSerializedContainerSize(hydrationInfo, index);
    const comment = siblingAfter(viewContainerSize, currentRNode);
    if (ngDevMode) {
        validateMatchingNode(comment, Node.COMMENT_NODE, null, lView, tNode);
        markRNodeAsClaimedByHydration(comment);
    }
    return comment;
}
export function enableLocateOrCreateContainerAnchorImpl() {
    _locateOrCreateContainerAnchor = locateOrCreateContainerAnchorImpl;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2luc3RydWN0aW9ucy90ZW1wbGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQUMsb0JBQW9CLEVBQUUsa0JBQWtCLEVBQUMsTUFBTSxnQ0FBZ0MsQ0FBQztBQUN4RixPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFDckQsT0FBTyxFQUFDLGVBQWUsRUFBRSxZQUFZLEVBQUMsTUFBTSxtQ0FBbUMsQ0FBQztBQUNoRixPQUFPLEVBQ0wsMkJBQTJCLEVBQzNCLGtCQUFrQixFQUNsQiw2QkFBNkIsRUFDN0IsY0FBYyxHQUNmLE1BQU0sdUJBQXVCLENBQUM7QUFDL0IsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDbEQsT0FBTyxFQUFDLG1DQUFtQyxFQUFDLE1BQU0saUNBQWlDLENBQUM7QUFDcEYsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQzlDLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUNoRCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDckQsT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0sVUFBVSxDQUFDO0FBSWhELE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUMxRCxPQUFPLEVBQUMsYUFBYSxFQUFFLFNBQVMsRUFBUyxRQUFRLEVBQW1CLE1BQU0sb0JBQW9CLENBQUM7QUFDL0YsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ2pELE9BQU8sRUFDTCxRQUFRLEVBQ1IsUUFBUSxFQUNSLHNCQUFzQixFQUN0QixrQkFBa0IsRUFDbEIsZUFBZSxFQUNmLGtCQUFr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QUssSUFBSSxFQUFFLENBQUM7UUFDM0MsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUMvQixLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDNUIsQ0FBQzthQUFNLENBQUM7WUFDTixTQUFTO2dCQUNQLFdBQVcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsZ0RBQWdELENBQUMsQ0FBQztRQUM1RixDQUFDO0lBQ0gsQ0FBQztJQUVELHVEQUF1RDtJQUN2RCxNQUFNLFlBQVksR0FBRyxlQUFlLENBQUMsYUFBYSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFFLENBQUM7SUFDMUUsU0FBUyxJQUFJLGtCQUFrQixDQUFDLFlBQVksRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFFNUQsY0FBYyxDQUFDLGFBQWEsRUFBRSxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDbkQsTUFBTSxpQkFBaUIsR0FBRywyQkFBMkIsQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDNUUsTUFBTSxPQUFPLEdBQUcsWUFBWSxDQUFXLGlCQUFpQixFQUFFLFlBQVksQ0FBRSxDQUFDO0lBRXpFLElBQUksU0FBUyxFQUFFLENBQUM7UUFDZCxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3JFLDZCQUE2QixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFRCxPQUFPLE9BQU8sQ0FBQztBQUNqQixDQUFDO0FBRUQsTUFBTSxVQUFVLHVDQUF1QztJQUNyRCw4QkFBOEIsR0FBRyxpQ0FBaUMsQ0FBQztBQUNyRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHt2YWxpZGF0ZU1hdGNoaW5nTm9kZSwgdmFsaWRhdGVOb2RlRXhpc3RzfSBmcm9tICcuLi8uLi9oeWRyYXRpb24vZXJyb3JfaGFuZGxpbmcnO1xuaW1wb3J0IHtURU1QTEFURVN9IGZyb20gJy4uLy4uL2h5ZHJhdGlvbi9pbnRlcmZhY2VzJztcbmltcG9ydCB7bG9jYXRlTmV4dFJOb2RlLCBzaWJsaW5nQWZ0ZXJ9IGZyb20gJy4uLy4uL2h5ZHJhdGlvbi9ub2RlX2xvb2t1cF91dGlscyc7XG5pbXBvcnQge1xuICBjYWxjU2VyaWFsaXplZENvbnRhaW5lclNpemUsXG4gIGlzRGlzY29ubmVjdGVkTm9kZSxcbiAgbWFya1JOb2RlQXNDbGFpbWVkQnlIeWRyYXRpb24sXG4gIHNldFNlZ21lbnRIZWFkLFxufSBmcm9tICcuLi8uLi9oeWRyYXRpb24vdXRpbHMnO1xuaW1wb3J0IHtpc0RldGFjaGVkQnlJMThufSBmcm9tICcuLi8uLi9pMThuL3V0aWxzJztcbmltcG9ydCB7cG9wdWxhdGVEZWh5ZHJhdGVkVmlld3NJbkxDb250YWluZXJ9IGZyb20gJy4uLy4uL2xpbmtlci92aWV3X2NvbnRhaW5lcl9yZWYnO1xuaW1wb3J0IHthc3NlcnRFcXVhbH0gZnJvbSAnLi4vLi4vdXRpbC9hc3NlcnQnO1xuaW1wb3J0IHthc3NlcnRGaXJzdENyZWF0ZVBhc3N9IGZyb20gJy4uL2Fzc2VydCc7XG5pbXBvcnQge2F0dGFjaFBhdGNoRGF0YX0gZnJvbSAnLi4vY29udGV4dF9kaXNjb3ZlcnknO1xuaW1wb3J0IHtyZWdpc3RlclBvc3RPcmRlckhvb2tzfSBmcm9tICcuLi9ob29rcyc7XG5pbXBvcnQge0NvbXBvbmVudFRlbXBsYXRlfSBmcm9tICcuLi9pbnRlcmZhY2VzL2RlZmluaXRpb24nO1xuaW1wb3J0IHtMb2NhbFJlZkV4dHJhY3RvciwgVEF0dHJpYnV0ZXMsIFRDb250YWluZXJOb2RlLCBUTm9kZSwgVE5vZGVUeXBlfSBmcm9tICcuLi9pbnRlcmZhY2VzL25vZGUnO1xuaW1wb3J0IHtSQ29tbWVudH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9yZW5kZXJlcl9kb20nO1xuaW1wb3J0IHtpc0RpcmVjdGl2ZUhvc3R9IGZyb20gJy4uL2ludGVyZmFjZXMvdHlwZV9jaGVja3MnO1xuaW1wb3J0IHtIRUFERVJfT0ZGU0VULCBIWURSQVRJT04sIExWaWV3LCBSRU5ERVJFUiwgVFZpZXcsIFRWaWV3VHlwZX0gZnJvbSAnLi4vaW50ZXJmYWNlcy92aWV3JztcbmltcG9ydCB7YXBwZW5kQ2hpbGR9IGZyb20gJy4uL25vZGVfbWFuaXB1bGF0aW9uJztcbmltcG9ydCB7XG4gIGdldExWaWV3LFxuICBnZXRUVmlldyxcbiAgaXNJblNraXBIeWRyYXRpb25CbG9jayxcbiAgbGFzdE5vZGVXYXNDcmVhdGVkLFxuICBzZXRDdXJyZW50VE5vZGUsXG4gIHdhc0xhc3ROb2RlQ3JlYXRlZCxcbn0gZnJvbSAnLi4vc3RhdGUnO1xuaW1wb3J0IHtnZXRDb25zdGFudH0gZnJvbSAnLi4vdXRpbC92aWV3X3V0aWxzJztcblxuaW1wb3J0IHtcbiAgYWRkVG9WaWV3VHJlZSxcbiAgY3JlYXRlRGlyZWN0aXZlc0luc3RhbmNlcyxcbiAgY3JlYXRlTENvbnRhaW5lcixcbiAgY3JlYXRlVFZpZXcsXG4gIGdldE9yQ3JlYXRlVE5vZGUsXG4gIHJlc29sdmVEaXJlY3RpdmVzLFxuICBzYXZlUmVzb2x2ZWRMb2NhbHNJbkRhdGEsXG59IGZyb20gJy4vc2hhcmVkJztcblxuZnVuY3Rpb24gdGVtcGxhdGVGaXJzdENyZWF0ZVBhc3MoXG4gIGluZGV4OiBudW1iZXIsXG4gIHRWaWV3OiBUVmlldyxcbiAgbFZpZXc6IExWaWV3LFxuICB0ZW1wbGF0ZUZuOiBDb21wb25lbnRUZW1wbGF0ZTxhbnk+IHwgbnVsbCxcbiAgZGVjbHM6IG51bWJlcixcbiAgdmFyczogbnVtYmVyLFxuICB0YWdOYW1lPzogc3RyaW5nIHwgbnVsbCxcbiAgYXR0cnM/OiBUQXR0cmlidXRlcyB8IG51bGwsXG4gIGxvY2FsUmVmc0luZGV4PzogbnVtYmVyIHwgbnVsbCxcbik6IFRDb250YWluZXJOb2RlIHtcbiAgbmdEZXZNb2RlICYmIGFzc2VydEZpcnN0Q3JlYXRlUGFzcyh0Vmlldyk7XG4gIG5nRGV2TW9kZSAmJiBuZ0Rldk1vZGUuZmlyc3RDcmVhdGVQYXNzKys7XG4gIGNvbnN0IHRWaWV3Q29uc3RzID0gdFZpZXcuY29uc3RzO1xuXG4gIC8vIFRPRE8ocGspOiByZWZhY3RvciBnZXRPckNyZWF0ZVROb2RlIHRvIGhhdmUgdGhlIFwiY3JlYXRlXCIgb25seSB2ZXJzaW9uXG4gIGNvbnN0IHROb2RlID0gZ2V0T3JDcmVhdGVUTm9kZSh0VmlldywgaW5kZXgsIFROb2RlVHlwZS5Db250YWluZXIsIHRhZ05hbWUgfHwgbnVsbCwgYXR0cnMgfHwgbnVsbCk7XG5cbiAgcmVzb2x2ZURpcmVjdGl2ZXModFZpZXcsIGxWaWV3LCB0Tm9kZSwgZ2V0Q29uc3RhbnQ8c3RyaW5nW10+KHRWaWV3Q29uc3RzLCBsb2NhbFJlZnNJbmRleCkpO1xuICByZWdpc3RlclBvc3RPcmRlckhvb2tzKHRWaWV3LCB0Tm9kZSk7XG5cbiAgY29uc3QgZW1iZWRkZWRUVmlldyA9ICh0Tm9kZS50VmlldyA9IGNyZWF0ZVRWaWV3KFxuICAgIFRWaWV3VHlwZS5FbWJlZGRlZCxcbiAgICB0Tm9kZSxcbiAgICB0ZW1wbGF0ZUZuLFxuICAgIGRlY2xzLFxuICAgIHZhcnMsXG4gICAgdFZpZXcuZGlyZWN0aXZlUmVnaXN0cnksXG4gICAgdFZpZXcucGlwZVJlZ2lzdHJ5LFxuICAgIG51bGwsXG4gICAgdFZpZXcuc2NoZW1hcyxcbiAgICB0Vmlld0NvbnN0cyxcbiAgICBudWxsIC8qIHNzcklkICovLFxuICApKTtcblxuICBpZiAodFZpZXcucXVlcmllcyAhPT0gbnVsbCkge1xuICAgIHRWaWV3LnF1ZXJpZXMudGVtcGxhdGUodFZpZXcsIHROb2RlKTtcbiAgICBlbWJlZGRlZFRWaWV3LnF1ZXJpZXMgPSB0Vmlldy5xdWVyaWVzLmVtYmVkZGVkVFZpZXcodE5vZGUpO1xuICB9XG5cbiAgcmV0dXJuIHROb2RlO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYW4gTENvbnRhaW5lciBmb3IgYW4gZW1iZWRkZWQgdmlldy5cbiAqXG4gKiBAcGFyYW0gZGVjbGFyYXRpb25MVmlldyBMVmlldyBpbiB3aGljaCB0aGUgdGVtcGxhdGUgd2FzIGRlY2xhcmVkLlxuICogQHBhcmFtIGRlY2xhcmF0aW9uVFZpZXcgVFZpZXcgaW4gd2hpY2ggdGhlIHRlbXBsYXRlIHdhIGRlY2xhcmVkLlxuICogQHBhcmFtIGluZGV4IFRoZSBpbmRleCBvZiB0aGUgY29udGFpbmVyIGluIHRoZSBkYXRhIGFycmF5XG4gKiBAcGFyYW0gdGVtcGxhdGVGbiBJbmxpbmUgdGVtcGxhdGVcbiAqIEBwYXJhbSBkZWNscyBUaGUgbnVtYmVyIG9mIG5vZGVzLCBsb2NhbCByZWZzLCBhbmQgcGlwZXMgZm9yIHRoaXMgdGVtcGxhdGVcbiAqIEBwYXJhbSB2YXJzIFRoZSBudW1iZXIgb2YgYmluZGluZ3MgZm9yIHRoaXMgdGVtcGxhdGVcbiAqIEBwYXJhbSB0YWdOYW1lIFRoZSBuYW1lIG9mIHRoZSBjb250YWluZXIgZWxlbWVudCwgaWYgYXBwbGljYWJsZVxuICogQHBhcmFtIGF0dHJzSW5kZXggSW5kZXggb2YgdGVtcGxhdGUgYXR0cmlidXRlcyBpbiB0aGUgYGNvbnN0c2AgYXJyYXkuXG4gKiBAcGFyYW0gbG9jYWxSZWZzIEluZGV4IG9mIHRoZSBsb2NhbCByZWZlcmVuY2VzIGluIHRoZSBgY29uc3RzYCBhcnJheS5cbiAqIEBwYXJhbSBsb2NhbFJlZkV4dHJhY3RvciBBIGZ1bmN0aW9uIHdoaWNoIGV4dHJhY3RzIGxvY2FsLXJlZnMgdmFsdWVzIGZyb20gdGhlIHRlbXBsYXRlLlxuICogICAgICAgIERlZmF1bHRzIHRvIHRoZSBjdXJyZW50IGVsZW1lbnQgYXNzb2NpYXRlZCB3aXRoIHRoZSBsb2NhbC1yZWYuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWNsYXJlVGVtcGxhdGUoXG4gIGRlY2xhcmF0aW9uTFZpZXc6IExWaWV3LFxuICBkZWNsYXJhdGlvblRWaWV3OiBUVmlldyxcbiAgaW5kZXg6IG51bWJlcixcbiAgdGVtcGxhdGVGbjogQ29tcG9uZW50VGVtcGxhdGU8YW55PiB8IG51bGwsXG4gIGRlY2xzOiBudW1iZXIsXG4gIHZhcnM6IG51bWJlcixcbiAgdGFnTmFtZT86IHN0cmluZyB8IG51bGwsXG4gIGF0dHJzPzogVEF0dHJpYnV0ZXMgfCBudWxsLFxuICBsb2NhbFJlZnNJbmRleD86IG51bWJlciB8IG51bGwsXG4gIGxvY2FsUmVmRXh0cmFjdG9yPzogTG9jYWxSZWZFeHRyYWN0b3IsXG4pOiBUTm9kZSB7XG4gIGNvbnN0IGFkanVzdGVkSW5kZXggPSBpbmRleCArIEhFQURFUl9PRkZTRVQ7XG4gIGNvbnN0IHROb2RlID0gZGVjbGFyYXRpb25UVmlldy5maXJzdENyZWF0ZVBhc3NcbiAgICA/IHRlbXBsYXRlRmlyc3RDcmVhdGVQYXNzKFxuICAgICAgICBhZGp1c3RlZEluZGV4LFxuICAgICAgICBkZWNsYXJhdGlvblRWaWV3LFxuICAgICAgICBkZWNsYXJhdGlvbkxWaWV3LFxuICAgICAgICB0ZW1wbGF0ZUZuLFxuICAgICAgICBkZWNscyxcbiAgICAgICAgdmFycyxcbiAgICAgICAgdGFnTmFtZSxcbiAgICAgICAgYXR0cnMsXG4gICAgICAgIGxvY2FsUmVmc0luZGV4LFxuICAgICAgKVxuICAgIDogKGRlY2xhcmF0aW9uVFZpZXcuZGF0YVthZGp1c3RlZEluZGV4XSBhcyBUQ29udGFpbmVyTm9kZSk7XG4gIHNldEN1cnJlbnRUTm9kZSh0Tm9kZSwgZmFsc2UpO1xuXG4gIGNvbnN0IGNvbW1lbnQgPSBfbG9jYXRlT3JDcmVhdGVDb250YWluZXJBbmNob3IoXG4gICAgZGVjbGFyYXRpb25UVmlldyxcbiAgICBkZWNsYXJhdGlvbkxWaWV3LFxuICAgIHROb2RlLFxuICAgIGluZGV4LFxuICApIGFzIFJDb21tZW50O1xuXG4gIGlmICh3YXNMYXN0Tm9kZUNyZWF0ZWQoKSkge1xuICAgIGFwcGVuZENoaWxkKGRlY2xhcmF0aW9uVFZpZXcsIGRlY2xhcmF0aW9uTFZpZXcsIGNvbW1lbnQsIHROb2RlKTtcbiAgfVxuICBhdHRhY2hQYXRjaERhdGEoY29tbWVudCwgZGVjbGFyYXRpb25MVmlldyk7XG5cbiAgY29uc3QgbENvbnRhaW5lciA9IGNyZWF0ZUxDb250YWluZXIoY29tbWVudCwgZGVjbGFyYXRpb25MVmlldywgY29tbWVudCwgdE5vZGUpO1xuICBkZWNsYXJhdGlvbkxWaWV3W2FkanVzdGVkSW5kZXhdID0gbENvbnRhaW5lcjtcbiAgYWRkVG9WaWV3VHJlZShkZWNsYXJhdGlvbkxWaWV3LCBsQ29udGFpbmVyKTtcblxuICAvLyBJZiBoeWRyYXRpb24gaXMgZW5hYmxlZCwgbG9va3MgdXAgZGVoeWRyYXRlZCB2aWV3cyBpbiB0aGUgRE9NXG4gIC8vIHVzaW5nIGh5ZHJhdGlvbiBhbm5vdGF0aW9uIGluZm8gYW5kIHN0b3JlcyB0aG9zZSB2aWV3cyBvbiBMQ29udGFpbmVyLlxuICAvLyBJbiBjbGllbnQtb25seSBtb2RlLCB0aGlzIGZ1bmN0aW9uIGlzIGEgbm9vcC5cbiAgcG9wdWxhdGVEZWh5ZHJhdGVkVmlld3NJbkxDb250YWluZXIobENvbnRhaW5lciwgdE5vZGUsIGRlY2xhcmF0aW9uTFZpZXcpO1xuXG4gIGlmIChpc0RpcmVjdGl2ZUhvc3QodE5vZGUpKSB7XG4gICAgY3JlYXRlRGlyZWN0aXZlc0luc3RhbmNlcyhkZWNsYXJhdGlvblRWaWV3LCBkZWNsYXJhdGlvbkxWaWV3LCB0Tm9kZSk7XG4gIH1cblxuICBpZiAobG9jYWxSZWZzSW5kZXggIT0gbnVsbCkge1xuICAgIHNhdmVSZXNvbHZlZExvY2Fsc0luRGF0YShkZWNsYXJhdGlvbkxWaWV3LCB0Tm9kZSwgbG9jYWxSZWZFeHRyYWN0b3IpO1xuICB9XG5cbiAgcmV0dXJuIHROb2RlO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYW4gTENvbnRhaW5lciBmb3IgYW4gbmctdGVtcGxhdGUgKGR5bmFtaWNhbGx5LWluc2VydGVkIHZpZXcpLCBlLmcuXG4gKlxuICogPG5nLXRlbXBsYXRlICNmb28+XG4gKiAgICA8ZGl2PjwvZGl2PlxuICogPC9uZy10ZW1wbGF0ZT5cbiAqXG4gKiBAcGFyYW0gaW5kZXggVGhlIGluZGV4IG9mIHRoZSBjb250YWluZXIgaW4gdGhlIGRhdGEgYXJyYXlcbiAqIEBwYXJhbSB0ZW1wbGF0ZUZuIElubGluZSB0ZW1wbGF0ZVxuICogQHBhcmFtIGRlY2xzIFRoZSBudW1iZXIgb2Ygbm9kZXMsIGxvY2FsIHJlZnMsIGFuZCBwaXBlcyBmb3IgdGhpcyB0ZW1wbGF0ZVxuICogQHBhcmFtIHZhcnMgVGhlIG51bWJlciBvZiBiaW5kaW5ncyBmb3IgdGhpcyB0ZW1wbGF0ZVxuICogQHBhcmFtIHRhZ05hbWUgVGhlIG5hbWUgb2YgdGhlIGNvbnRhaW5lciBlbGVtZW50LCBpZiBhcHBsaWNhYmxlXG4gKiBAcGFyYW0gYXR0cnNJbmRleCBJbmRleCBvZiB0ZW1wbGF0ZSBhdHRyaWJ1dGVzIGluIHRoZSBgY29uc3RzYCBhcnJheS5cbiAqIEBwYXJhbSBsb2NhbFJlZnMgSW5kZXggb2YgdGhlIGxvY2FsIHJlZmVyZW5jZXMgaW4gdGhlIGBjb25zdHNgIGFycmF5LlxuICogQHBhcmFtIGxvY2FsUmVmRXh0cmFjdG9yIEEgZnVuY3Rpb24gd2hpY2ggZXh0cmFjdHMgbG9jYWwtcmVmcyB2YWx1ZXMgZnJvbSB0aGUgdGVtcGxhdGUuXG4gKiAgICAgICAgRGVmYXVsdHMgdG8gdGhlIGN1cnJlbnQgZWxlbWVudCBhc3NvY2lhdGVkIHdpdGggdGhlIGxvY2FsLXJlZi5cbiAqXG4gKiBAY29kZUdlbkFwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gybXJtXRlbXBsYXRlKFxuICBpbmRleDogbnVtYmVyLFxuICB0ZW1wbGF0ZUZuOiBDb21wb25lbnRUZW1wbGF0ZTxhbnk+IHwgbnVsbCxcbiAgZGVjbHM6IG51bWJlcixcbiAgdmFyczogbnVtYmVyLFxuICB0YWdOYW1lPzogc3RyaW5nIHwgbnVsbCxcbiAgYXR0cnNJbmRleD86IG51bWJlciB8IG51bGwsXG4gIGxvY2FsUmVmc0luZGV4PzogbnVtYmVyIHwgbnVsbCxcbiAgbG9jYWxSZWZFeHRyYWN0b3I/OiBMb2NhbFJlZkV4dHJhY3Rvcixcbik6IHR5cGVvZiDJtcm1dGVtcGxhdGUge1xuICBjb25zdCBsVmlldyA9IGdldExWaWV3KCk7XG4gIGNvbnN0IHRWaWV3ID0gZ2V0VFZpZXcoKTtcbiAgY29uc3QgYXR0cnMgPSBnZXRDb25zdGFudDxUQXR0cmlidXRlcz4odFZpZXcuY29uc3RzLCBhdHRyc0luZGV4KTtcbiAgZGVjbGFyZVRlbXBsYXRlKFxuICAgIGxWaWV3LFxuICAgIHRWaWV3LFxuICAgIGluZGV4LFxuICAgIHRlbXBsYXRlRm4sXG4gICAgZGVjbHMsXG4gICAgdmFycyxcbiAgICB0YWdOYW1lLFxuICAgIGF0dHJzLFxuICAgIGxvY2FsUmVmc0luZGV4LFxuICAgIGxvY2FsUmVmRXh0cmFjdG9yLFxuICApO1xuICByZXR1cm4gybXJtXRlbXBsYXRlO1xufVxuXG5sZXQgX2xvY2F0ZU9yQ3JlYXRlQ29udGFpbmVyQW5jaG9yID0gY3JlYXRlQ29udGFpbmVyQW5jaG9ySW1wbDtcblxuLyoqXG4gKiBSZWd1bGFyIGNyZWF0aW9uIG1vZGUgZm9yIExDb250YWluZXJzIGFuZCB0aGVpciBhbmNob3IgKGNvbW1lbnQpIG5vZGVzLlxuICovXG5mdW5jdGlvbiBjcmVhdGVDb250YWluZXJBbmNob3JJbXBsKFxuICB0VmlldzogVFZpZXcsXG4gIGxWaWV3OiBMVmlldyxcbiAgdE5vZGU6IFROb2RlLFxuICBpbmRleDogbnVtYmVyLFxuKTogUkNvbW1lbnQge1xuICBsYXN0Tm9kZVdhc0NyZWF0ZWQodHJ1ZSk7XG4gIHJldHVybiBsVmlld1tSRU5ERVJFUl0uY3JlYXRlQ29tbWVudChuZ0Rldk1vZGUgPyAnY29udGFpbmVyJyA6ICcnKTtcbn1cblxuLyoqXG4gKiBFbmFibGVzIGh5ZHJhdGlvbiBjb2RlIHBhdGggKHRvIGxvb2t1cCBleGlzdGluZyBlbGVtZW50cyBpbiBET00pXG4gKiBpbiBhZGRpdGlvbiB0byB0aGUgcmVndWxhciBjcmVhdGlvbiBtb2RlIGZvciBMQ29udGFpbmVycyBhbmQgdGhlaXJcbiAqIGFuY2hvciAoY29tbWVudCkgbm9kZXMuXG4gKi9cbmZ1bmN0aW9uIGxvY2F0ZU9yQ3JlYXRlQ29udGFpbmVyQW5jaG9ySW1wbChcbiAgdFZpZXc6IFRWaWV3LFxuICBsVmlldzogTFZpZXcsXG4gIHROb2RlOiBUTm9kZSxcbiAgaW5kZXg6IG51bWJlcixcbik6IFJDb21tZW50IHtcbiAgY29uc3QgaHlkcmF0aW9uSW5mbyA9IGxWaWV3W0hZRFJBVElPTl07XG4gIGNvbnN0IGlzTm9kZUNyZWF0aW9uTW9kZSA9XG4gICAgIWh5ZHJhdGlvbkluZm8gfHxcbiAgICBpc0luU2tpcEh5ZHJhdGlvbkJsb2NrKCkgfHxcbiAgICBpc0RldGFjaGVkQnlJMThuKHROb2RlKSB8fFxuICAgIGlzRGlzY29ubmVjdGVkTm9kZShoeWRyYXRpb25JbmZvLCBpbmRleCk7XG4gIGxhc3ROb2RlV2FzQ3JlYXRlZChpc05vZGVDcmVhdGlvbk1vZGUpO1xuXG4gIC8vIFJlZ3VsYXIgY3JlYXRpb24gbW9kZS5cbiAgaWYgKGlzTm9kZUNyZWF0aW9uTW9kZSkge1xuICAgIHJldHVybiBjcmVhdGVDb250YWluZXJBbmNob3JJbXBsKHRWaWV3LCBsVmlldywgdE5vZGUsIGluZGV4KTtcbiAgfVxuXG4gIGNvbnN0IHNzcklkID0gaHlkcmF0aW9uSW5mby5kYXRhW1RFTVBMQVRFU10/LltpbmRleF0gPz8gbnVsbDtcblxuICAvLyBBcHBseSBgc3NySWRgIHZhbHVlIHRvIHRoZSB1bmRlcmx5aW5nIFRWaWV3IGlmIGl0IHdhcyBub3QgcHJldmlvdXNseSBzZXQuXG4gIC8vXG4gIC8vIFRoZXJlIG1pZ2h0IGJlIHNpdHVhdGlvbnMgd2hlbiB0aGUgc2FtZSBjb21wb25lbnQgaXMgcHJlc2VudCBpbiBhIHRlbXBsYXRlXG4gIC8vIG11bHRpcGxlIHRpbWVzIGFuZCBzb21lIGluc3RhbmNlcyBhcmUgb3B0ZWQtb3V0IG9mIHVzaW5nIGh5ZHJhdGlvbiB2aWFcbiAgLy8gYG5nU2tpcEh5ZHJhdGlvbmAgYXR0cmlidXRlLiBJbiB0aGlzIHNjZW5hcmlvLCBhdCB0aGUgdGltZSBhIFRWaWV3IGlzIGNyZWF0ZWQsXG4gIC8vIHRoZSBgc3NySWRgIG1pZ2h0IGJlIGBudWxsYCAoaWYgdGhlIGZpcnN0IGNvbXBvbmVudCBpcyBvcHRlZC1vdXQgb2YgaHlkcmF0aW9uKS5cbiAgLy8gVGhlIGNvZGUgYmVsb3cgbWFrZXMgc3VyZSB0aGF0IHRoZSBgc3NySWRgIGlzIGFwcGxpZWQgdG8gdGhlIFRWaWV3IGlmIGl0J3Mgc3RpbGxcbiAgLy8gYG51bGxgIGFuZCB2ZXJpZmllcyB3ZSBuZXZlciB0cnkgdG8gb3ZlcnJpZGUgaXQgd2l0aCBhIGRpZmZlcmVudCB2YWx1ZS5cbiAgaWYgKHNzcklkICE9PSBudWxsICYmIHROb2RlLnRWaWV3ICE9PSBudWxsKSB7XG4gICAgaWYgKHROb2RlLnRWaWV3LnNzcklkID09PSBudWxsKSB7XG4gICAgICB0Tm9kZS50Vmlldy5zc3JJZCA9IHNzcklkO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZ0Rldk1vZGUgJiZcbiAgICAgICAgYXNzZXJ0RXF1YWwodE5vZGUudFZpZXcuc3NySWQsIHNzcklkLCAnVW5leHBlY3RlZCB2YWx1ZSBvZiB0aGUgYHNzcklkYCBmb3IgdGhpcyBUVmlldycpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEh5ZHJhdGlvbiBtb2RlLCBsb29raW5nIHVwIGV4aXN0aW5nIGVsZW1lbnRzIGluIERPTS5cbiAgY29uc3QgY3VycmVudFJOb2RlID0gbG9jYXRlTmV4dFJOb2RlKGh5ZHJhdGlvbkluZm8sIHRWaWV3LCBsVmlldywgdE5vZGUpITtcbiAgbmdEZXZNb2RlICYmIHZhbGlkYXRlTm9kZUV4aXN0cyhjdXJyZW50Uk5vZGUsIGxWaWV3LCB0Tm9kZSk7XG5cbiAgc2V0U2VnbWVudEhlYWQoaHlkcmF0aW9uSW5mbywgaW5kZXgsIGN1cnJlbnRSTm9kZSk7XG4gIGNvbnN0IHZpZXdDb250YWluZXJTaXplID0gY2FsY1NlcmlhbGl6ZWRDb250YWluZXJTaXplKGh5ZHJhdGlvbkluZm8sIGluZGV4KTtcbiAgY29uc3QgY29tbWVudCA9IHNpYmxpbmdBZnRlcjxSQ29tbWVudD4odmlld0NvbnRhaW5lclNpemUsIGN1cnJlbnRSTm9kZSkhO1xuXG4gIGlmIChuZ0Rldk1vZGUpIHtcbiAgICB2YWxpZGF0ZU1hdGNoaW5nTm9kZShjb21tZW50LCBOb2RlLkNPTU1FTlRfTk9ERSwgbnVsbCwgbFZpZXcsIHROb2RlKTtcbiAgICBtYXJrUk5vZGVBc0NsYWltZWRCeUh5ZHJhdGlvbihjb21tZW50KTtcbiAgfVxuXG4gIHJldHVybiBjb21tZW50O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZW5hYmxlTG9jYXRlT3JDcmVhdGVDb250YWluZXJBbmNob3JJbXBsKCkge1xuICBfbG9jYXRlT3JDcmVhdGVDb250YWluZXJBbmNob3IgPSBsb2NhdGVPckNyZWF0ZUNvbnRhaW5lckFuY2hvckltcGw7XG59XG4iXX0=