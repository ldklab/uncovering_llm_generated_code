import { HTMLVisualElement } from "../../../render/dom/HTMLVisualElement";
import { ResolvedValues } from "../../../render/VisualElement/types";
import { AxisBox2D, Point2D } from "../../../types/geometry";
import { Transition } from "../../../types";
export interface Snapshot {
    isDragging?: boolean;
    cursorProgress?: Point2D;
    latestMotionValues: ResolvedValues;
    boundingBox?: AxisBox2D;
}
export declare type LeadAndFollow = [
    HTMLVisualElement | undefined,
    HTMLVisualElement | undefined
];
/**
 * For each layout animation, we want to identify two components
 * within a stack that will serve as the "lead" and "follow" components.
 *
 * In the switch animation, the lead component performs the entire animation.
 * It uses the follow bounding box to animate out from and back to. The follow
 * component is hidden.
 *
 * In the crossfade animation, both the lead and follow components perform
 * the entire animation, animating from the follow origin bounding box to the lead
 * target bounding box.
 *
 * Generalising a stack as First In Last Out, *searching from the end* we can
 * generally consider the lead component to be:
 *  - If the last child is present, the last child
 *  - If the last child is exiting, the last *encountered* exiting component
 */
export declare function findLeadAndFollow(stack: HTMLVisualElement[], [prevLead, prevFollow]: LeadAndFollow): LeadAndFollow;
export declare class LayoutStack {
    order: HTMLVisualElement[];
    lead?: HTMLVisualElement | undefined;
    follow?: HTMLVisualElement | undefined;
    prevLead?: HTMLVisualElement | undefined;
    prevFollow?: HTMLVisualElement | undefined;
    snapshot?: Snapshot;
    hasChildren: boolean;
    add(child: HTMLVisualElement): void;
    remove(child: HTMLVisualElement): void;
    updateLeadAndFollow(): void;
    updateSnapshot(): void;
    isLeadPresent(): boolean | undefined;
    getFollowOrigin(): AxisBox2D | undefined;
    getFollowTarget(): AxisBox2D | undefined;
    getLeadOrigin(): AxisBox2D | undefined;
    getLeadTarget(): AxisBox2D | undefined;
    getLeadTransition(): Transition | undefined;
}
