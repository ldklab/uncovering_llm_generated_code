/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { EventInfoWrapper } from './event_info';
import { EventType } from './event_type';
import { Restriction } from './restriction';
import * as eventLib from './event';
/**
 * Receives a DOM event, determines the jsaction associated with the source
 * element of the DOM event, and invokes the handler associated with the
 * jsaction.
 */
export class Dispatcher {
    /**
     * Options are:
     *   - `eventReplayer`: When the event contract dispatches replay events
     *      to the Dispatcher, the Dispatcher collects them and in the next tick
     *      dispatches them to the `eventReplayer`. Defaults to dispatching to `dispatchDelegate`.
     * @param dispatchDelegate A function that should handle dispatching an `EventInfoWrapper` to handlers.
     */
    constructor(dispatchDelegate, { actionResolver, eventReplayer, } = {}) {
        this.dispatchDelegate = dispatchDelegate;
        /** Whether the event replay is scheduled. */
        this.eventReplayScheduled = false;
        /** The queue of events. */
        this.replayEventInfoWrappers = [];
        this.actionResolver = actionResolver;
        this.eventReplayer = eventReplayer;
    }
    /**
     * Receives an event or the event queue from the EventContract. The event
     * queue is copied and it attempts to replay.
     * If event info is passed in it looks for an action handler that can handle
     * the given event.  If there is no handler registered queues the event and
     * checks if a loader is registered for the given namespace. If so, calls it.
     *
     * Alternatively, if in global dispatch mode, calls all registered global
     * handlers for the appropriate event type.
     *
     * The three functionalities of this call are deliberately not split into
     * three methods (and then declared as an abstract interface), because the
     * interface is used by EventContract, which lives in a different jsbinary.
     * Therefore the interface between the three is defined entirely in terms that
     * are invariant under jscompiler processing (Function and Array, as opposed
     * to a custom type with method names).
     *
     * @param eventInfo The info for the event that triggered this call or the
     *     queue of events from EventContract.
     */
    dispatch(eventInfo) {
        const eventInfoWrapper = new EventInfoWrapper(eventInfo);
        this.actionResolver?.resolveEventType(eventInfo);
        this.actionResolver?.resolveAction(eventInfo);
        const action = eventInfoWrapper.getAction();
        if (action && shouldPreventDefaultBeforeDispatching(action.element, eventInfoWrapper)) {
            eventLib.preventDefault(eventInfoWrapper.getEvent());
        }
        if (this.eventReplayer && eventInfoWrapper.getIsReplay()) {
            this.scheduleEventInfoWrapperReplay(eventInfoWrapper);
            return;
        }
        this.dispatchDelegate(eventInfoWrapper);
    }
    /**
     * Schedules an `EventInfoWrapper` for replay. The replaying will happen in its own
     * stack once the current flow cedes control. This is done to mimic
     * browser event handling.
     */
    scheduleEventInfoWrapperReplay(eventInfoWrapper) {
        this.replayEventInfoWrappers.push(eventInfoWrapper);
        if (this.eventReplayScheduled) {
            return;
        }
        this.eventReplayScheduled = true;
        Promise.resolve().then(() => {
            this.eventReplayScheduled = false;
            this.eventReplayer(this.replayEventInfoWrappers);
        });
    }
}
/**
 * Creates an `EventReplayer` that calls the `replay` function for every `eventInfoWrapper` in
 * the queue.
 */
export function createEventReplayer(replay) {
    return (eventInfoWrappers) => {
        for (const eventInfoWrapper of eventInfoWrappers) {
            replay(eventInfoWrapper);
        }
    };
}
/**
 * Returns true if the default action of this event should be prevented before
 * this event is dispatched.
 */
function shouldPreventDefaultBeforeDispatching(actionElement, eventInfoWrapper) {
    // Prevent browser from following <a> node links if a jsaction is present
    // and we are dispatching the action now. Note that the targetElement may be
    // a child of an anchor that has a jsaction attached. For that reason, we
    // need to check the actionElement rather than the targetElement.
    return (actionElement.tagName === 'A' &&
        (eventInfoWrapper.getEventType() === EventType.CLICK ||
            eventInfoWrapper.getEventType() === EventType.CLICKMOD));
}
/**
 * Registers deferred functionality for an EventContract and a Jsaction
 * Dispatcher.
 */
export function registerDispatcher(eventContract, dispatcher) {
    eventContract.ecrd((eventInfo) => {
        dispatcher.dispatch(eventInfo);
    }, Restriction.I_AM_THE_JSACTION_FRAMEWORK);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzcGF0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvcHJpbWl0aXZlcy9ldmVudC1kaXNwYXRjaC9zcmMvZGlzcGF0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQVksZ0JBQWdCLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDekQsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUN2QyxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRTFDLE9BQU8sS0FBSyxRQUFRLE1BQU0sU0FBUyxDQUFDO0FBU3BDOzs7O0dBSUc7QUFDSCxNQUFNLE9BQU8sVUFBVTtJQWFyQjs7Ozs7O09BTUc7SUFDSCxZQUNtQixnQkFBOEQsRUFDL0UsRUFDRSxjQUFjLEVBQ2QsYUFBYSxNQUNrRCxFQUFFO1FBSmxELHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBOEM7UUFkakYsNkNBQTZDO1FBQ3JDLHlCQUFvQixHQUFHLEtBQUssQ0FBQztRQUVyQywyQkFBMkI7UUFDViw0QkFBdUIsR0FBdUIsRUFBRSxDQUFDO1FBZ0JoRSxJQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztRQUNyQyxJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztJQUNyQyxDQUFDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FtQkc7SUFDSCxRQUFRLENBQUMsU0FBb0I7UUFDM0IsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxjQUFjLEVBQUUsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLGNBQWMsRUFBRSxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDOUMsTUFBTSxNQUFNLEdBQUcsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDNUMsSUFBSSxNQUFNLElBQUkscUNBQXFDLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxnQkFBZ0IsQ0FBQyxFQUFFLENBQUM7WUFDdEYsUUFBUSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZELENBQUM7UUFDRCxJQUFJLElBQUksQ0FBQyxhQUFhLElBQUksZ0JBQWdCLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQztZQUN6RCxJQUFJLENBQUMsOEJBQThCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUN0RCxPQUFPO1FBQ1QsQ0FBQztRQUNELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssOEJBQThCLENBQUMsZ0JBQWtDO1FBQ3ZFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUNwRCxJQUFJLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1lBQzlCLE9BQU87UUFDVCxDQUFDO1FBQ0QsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQztRQUNqQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUMxQixJQUFJLENBQUMsb0JBQW9CLEdBQUcsS0FBSyxDQUFDO1lBQ2xDLElBQUksQ0FBQyxhQUFjLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFDcEQsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsbUJBQW1CLENBQUMsTUFBb0Q7SUFDdEYsT0FBTyxDQUFDLGlCQUFxQyxFQUFFLEVBQUU7UUFDL0MsS0FBSyxNQUFNLGdCQUFnQixJQUFJLGlCQUFpQixFQUFFLENBQUM7WUFDakQsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDM0IsQ0FBQztJQUNILENBQUMsQ0FBQztBQUNKLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLHFDQUFxQyxDQUM1QyxhQUFzQixFQUN0QixnQkFBa0M7SUFFbEMseUVBQXlFO0lBQ3pFLDRFQUE0RTtJQUM1RSx5RUFBeUU7SUFDekUsaUVBQWlFO0lBQ2pFLE9BQU8sQ0FDTCxhQUFhLENBQUMsT0FBTyxLQUFLLEdBQUc7UUFDN0IsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsS0FBSyxTQUFTLENBQUMsS0FBSztZQUNsRCxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsS0FBSyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQzFELENBQUM7QUFDSixDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsTUFBTSxVQUFVLGtCQUFrQixDQUFDLGFBQXFDLEVBQUUsVUFBc0I7SUFDOUYsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQW9CLEVBQUUsRUFBRTtRQUMxQyxVQUFVLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2pDLENBQUMsRUFBRSxXQUFXLENBQUMsMkJBQTJCLENBQUMsQ0FBQztBQUM5QyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0V2ZW50SW5mbywgRXZlbnRJbmZvV3JhcHBlcn0gZnJvbSAnLi9ldmVudF9pbmZvJztcbmltcG9ydCB7RXZlbnRUeXBlfSBmcm9tICcuL2V2ZW50X3R5cGUnO1xuaW1wb3J0IHtSZXN0cmljdGlvbn0gZnJvbSAnLi9yZXN0cmljdGlvbic7XG5pbXBvcnQge1VucmVuYW1lZEV2ZW50Q29udHJhY3R9IGZyb20gJy4vZXZlbnRjb250cmFjdCc7XG5pbXBvcnQgKiBhcyBldmVudExpYiBmcm9tICcuL2V2ZW50JztcbmltcG9ydCB7QWN0aW9uUmVzb2x2ZXJ9IGZyb20gJy4vYWN0aW9uX3Jlc29sdmVyJztcblxuLyoqXG4gKiBBIHJlcGxheWVyIGlzIGEgZnVuY3Rpb24gdGhhdCBpcyBjYWxsZWQgd2hlbiB0aGVyZSBhcmUgcXVldWVkIGV2ZW50cyxcbiAqIGVpdGhlciBmcm9tIHRoZSBgRXZlbnRDb250cmFjdGAgb3Igd2hlbiB0aGVyZSBhcmUgbm8gZGV0ZWN0ZWQgaGFuZGxlcnMuXG4gKi9cbmV4cG9ydCB0eXBlIFJlcGxheWVyID0gKGV2ZW50SW5mb1dyYXBwZXJzOiBFdmVudEluZm9XcmFwcGVyW10pID0+IHZvaWQ7XG5cbi8qKlxuICogUmVjZWl2ZXMgYSBET00gZXZlbnQsIGRldGVybWluZXMgdGhlIGpzYWN0aW9uIGFzc29jaWF0ZWQgd2l0aCB0aGUgc291cmNlXG4gKiBlbGVtZW50IG9mIHRoZSBET00gZXZlbnQsIGFuZCBpbnZva2VzIHRoZSBoYW5kbGVyIGFzc29jaWF0ZWQgd2l0aCB0aGVcbiAqIGpzYWN0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgRGlzcGF0Y2hlciB7XG4gIC8vIFRoZSBBY3Rpb25SZXNvbHZlciB0byB1c2UgdG8gcmVzb2x2ZSBhY3Rpb25zLlxuICBwcml2YXRlIGFjdGlvblJlc29sdmVyPzogQWN0aW9uUmVzb2x2ZXI7XG5cbiAgLyoqIFRoZSByZXBsYXllciBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiB0aGVyZSBhcmUgcXVldWVkIGV2ZW50cy4gKi9cbiAgcHJpdmF0ZSBldmVudFJlcGxheWVyPzogUmVwbGF5ZXI7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGV2ZW50IHJlcGxheSBpcyBzY2hlZHVsZWQuICovXG4gIHByaXZhdGUgZXZlbnRSZXBsYXlTY2hlZHVsZWQgPSBmYWxzZTtcblxuICAvKiogVGhlIHF1ZXVlIG9mIGV2ZW50cy4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSByZXBsYXlFdmVudEluZm9XcmFwcGVyczogRXZlbnRJbmZvV3JhcHBlcltdID0gW107XG5cbiAgLyoqXG4gICAqIE9wdGlvbnMgYXJlOlxuICAgKiAgIC0gYGV2ZW50UmVwbGF5ZXJgOiBXaGVuIHRoZSBldmVudCBjb250cmFjdCBkaXNwYXRjaGVzIHJlcGxheSBldmVudHNcbiAgICogICAgICB0byB0aGUgRGlzcGF0Y2hlciwgdGhlIERpc3BhdGNoZXIgY29sbGVjdHMgdGhlbSBhbmQgaW4gdGhlIG5leHQgdGlja1xuICAgKiAgICAgIGRpc3BhdGNoZXMgdGhlbSB0byB0aGUgYGV2ZW50UmVwbGF5ZXJgLiBEZWZhdWx0cyB0byBkaXNwYXRjaGluZyB0byBgZGlzcGF0Y2hEZWxlZ2F0ZWAuXG4gICAqIEBwYXJhbSBkaXNwYXRjaERlbGVnYXRlIEEgZnVuY3Rpb24gdGhhdCBzaG91bGQgaGFuZGxlIGRpc3BhdGNoaW5nIGFuIGBFdmVudEluZm9XcmFwcGVyYCB0byBoYW5kbGVycy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgZGlzcGF0Y2hEZWxlZ2F0ZTogKGV2ZW50SW5mb1dyYXBwZXI6IEV2ZW50SW5mb1dyYXBwZXIpID0+IHZvaWQsXG4gICAge1xuICAgICAgYWN0aW9uUmVzb2x2ZXIsXG4gICAgICBldmVudFJlcGxheWVyLFxuICAgIH06IHthY3Rpb25SZXNvbHZlcj86IEFjdGlvblJlc29sdmVyOyBldmVudFJlcGxheWVyPzogUmVwbGF5ZXJ9ID0ge30sXG4gICkge1xuICAgIHRoaXMuYWN0aW9uUmVzb2x2ZXIgPSBhY3Rpb25SZXNvbHZlcjtcbiAgICB0aGlzLmV2ZW50UmVwbGF5ZXIgPSBldmVudFJlcGxheWVyO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlY2VpdmVzIGFuIGV2ZW50IG9yIHRoZSBldmVudCBxdWV1ZSBmcm9tIHRoZSBFdmVudENvbnRyYWN0LiBUaGUgZXZlbnRcbiAgICogcXVldWUgaXMgY29waWVkIGFuZCBpdCBhdHRlbXB0cyB0byByZXBsYXkuXG4gICAqIElmIGV2ZW50IGluZm8gaXMgcGFzc2VkIGluIGl0IGxvb2tzIGZvciBhbiBhY3Rpb24gaGFuZGxlciB0aGF0IGNhbiBoYW5kbGVcbiAgICogdGhlIGdpdmVuIGV2ZW50LiAgSWYgdGhlcmUgaXMgbm8gaGFuZGxlciByZWdpc3RlcmVkIHF1ZXVlcyB0aGUgZXZlbnQgYW5kXG4gICAqIGNoZWNrcyBpZiBhIGxvYWRlciBpcyByZWdpc3RlcmVkIGZvciB0aGUgZ2l2ZW4gbmFtZXNwYWNlLiBJZiBzbywgY2FsbHMgaXQuXG4gICAqXG4gICAqIEFsdGVybmF0aXZlbHksIGlmIGluIGdsb2JhbCBkaXNwYXRjaCBtb2RlLCBjYWxscyBhbGwgcmVnaXN0ZXJlZCBnbG9iYWxcbiAgICogaGFuZGxlcnMgZm9yIHRoZSBhcHByb3ByaWF0ZSBldmVudCB0eXBlLlxuICAgKlxuICAgKiBUaGUgdGhyZWUgZnVuY3Rpb25hbGl0aWVzIG9mIHRoaXMgY2FsbCBhcmUgZGVsaWJlcmF0ZWx5IG5vdCBzcGxpdCBpbnRvXG4gICAqIHRocmVlIG1ldGhvZHMgKGFuZCB0aGVuIGRlY2xhcmVkIGFzIGFuIGFic3RyYWN0IGludGVyZmFjZSksIGJlY2F1c2UgdGhlXG4gICAqIGludGVyZmFjZSBpcyB1c2VkIGJ5IEV2ZW50Q29udHJhY3QsIHdoaWNoIGxpdmVzIGluIGEgZGlmZmVyZW50IGpzYmluYXJ5LlxuICAgKiBUaGVyZWZvcmUgdGhlIGludGVyZmFjZSBiZXR3ZWVuIHRoZSB0aHJlZSBpcyBkZWZpbmVkIGVudGlyZWx5IGluIHRlcm1zIHRoYXRcbiAgICogYXJlIGludmFyaWFudCB1bmRlciBqc2NvbXBpbGVyIHByb2Nlc3NpbmcgKEZ1bmN0aW9uIGFuZCBBcnJheSwgYXMgb3Bwb3NlZFxuICAgKiB0byBhIGN1c3RvbSB0eXBlIHdpdGggbWV0aG9kIG5hbWVzKS5cbiAgICpcbiAgICogQHBhcmFtIGV2ZW50SW5mbyBUaGUgaW5mbyBmb3IgdGhlIGV2ZW50IHRoYXQgdHJpZ2dlcmVkIHRoaXMgY2FsbCBvciB0aGVcbiAgICogICAgIHF1ZXVlIG9mIGV2ZW50cyBmcm9tIEV2ZW50Q29udHJhY3QuXG4gICAqL1xuICBkaXNwYXRjaChldmVudEluZm86IEV2ZW50SW5mbyk6IHZvaWQge1xuICAgIGNvbnN0IGV2ZW50SW5mb1dyYXBwZXIgPSBuZXcgRXZlbnRJbmZvV3JhcHBlcihldmVudEluZm8pO1xuICAgIHRoaXMuYWN0aW9uUmVzb2x2ZXI/LnJlc29sdmVFdmVudFR5cGUoZXZlbnRJbmZvKTtcbiAgICB0aGlzLmFjdGlvblJlc29sdmVyPy5yZXNvbHZlQWN0aW9uKGV2ZW50SW5mbyk7XG4gICAgY29uc3QgYWN0aW9uID0gZXZlbnRJbmZvV3JhcHBlci5nZXRBY3Rpb24oKTtcbiAgICBpZiAoYWN0aW9uICYmIHNob3VsZFByZXZlbnREZWZhdWx0QmVmb3JlRGlzcGF0Y2hpbmcoYWN0aW9uLmVsZW1lbnQsIGV2ZW50SW5mb1dyYXBwZXIpKSB7XG4gICAgICBldmVudExpYi5wcmV2ZW50RGVmYXVsdChldmVudEluZm9XcmFwcGVyLmdldEV2ZW50KCkpO1xuICAgIH1cbiAgICBpZiAodGhpcy5ldmVudFJlcGxheWVyICYmIGV2ZW50SW5mb1dyYXBwZXIuZ2V0SXNSZXBsYXkoKSkge1xuICAgICAgdGhpcy5zY2hlZHVsZUV2ZW50SW5mb1dyYXBwZXJSZXBsYXkoZXZlbnRJbmZvV3JhcHBlcik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuZGlzcGF0Y2hEZWxlZ2F0ZShldmVudEluZm9XcmFwcGVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTY2hlZHVsZXMgYW4gYEV2ZW50SW5mb1dyYXBwZXJgIGZvciByZXBsYXkuIFRoZSByZXBsYXlpbmcgd2lsbCBoYXBwZW4gaW4gaXRzIG93blxuICAgKiBzdGFjayBvbmNlIHRoZSBjdXJyZW50IGZsb3cgY2VkZXMgY29udHJvbC4gVGhpcyBpcyBkb25lIHRvIG1pbWljXG4gICAqIGJyb3dzZXIgZXZlbnQgaGFuZGxpbmcuXG4gICAqL1xuICBwcml2YXRlIHNjaGVkdWxlRXZlbnRJbmZvV3JhcHBlclJlcGxheShldmVudEluZm9XcmFwcGVyOiBFdmVudEluZm9XcmFwcGVyKSB7XG4gICAgdGhpcy5yZXBsYXlFdmVudEluZm9XcmFwcGVycy5wdXNoKGV2ZW50SW5mb1dyYXBwZXIpO1xuICAgIGlmICh0aGlzLmV2ZW50UmVwbGF5U2NoZWR1bGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuZXZlbnRSZXBsYXlTY2hlZHVsZWQgPSB0cnVlO1xuICAgIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgdGhpcy5ldmVudFJlcGxheVNjaGVkdWxlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5ldmVudFJlcGxheWVyISh0aGlzLnJlcGxheUV2ZW50SW5mb1dyYXBwZXJzKTtcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYW4gYEV2ZW50UmVwbGF5ZXJgIHRoYXQgY2FsbHMgdGhlIGByZXBsYXlgIGZ1bmN0aW9uIGZvciBldmVyeSBgZXZlbnRJbmZvV3JhcHBlcmAgaW5cbiAqIHRoZSBxdWV1ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUV2ZW50UmVwbGF5ZXIocmVwbGF5OiAoZXZlbnRJbmZvV3JhcHBlcjogRXZlbnRJbmZvV3JhcHBlcikgPT4gdm9pZCkge1xuICByZXR1cm4gKGV2ZW50SW5mb1dyYXBwZXJzOiBFdmVudEluZm9XcmFwcGVyW10pID0+IHtcbiAgICBmb3IgKGNvbnN0IGV2ZW50SW5mb1dyYXBwZXIgb2YgZXZlbnRJbmZvV3JhcHBlcnMpIHtcbiAgICAgIHJlcGxheShldmVudEluZm9XcmFwcGVyKTtcbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBkZWZhdWx0IGFjdGlvbiBvZiB0aGlzIGV2ZW50IHNob3VsZCBiZSBwcmV2ZW50ZWQgYmVmb3JlXG4gKiB0aGlzIGV2ZW50IGlzIGRpc3BhdGNoZWQuXG4gKi9cbmZ1bmN0aW9uIHNob3VsZFByZXZlbnREZWZhdWx0QmVmb3JlRGlzcGF0Y2hpbmcoXG4gIGFjdGlvbkVsZW1lbnQ6IEVsZW1lbnQsXG4gIGV2ZW50SW5mb1dyYXBwZXI6IEV2ZW50SW5mb1dyYXBwZXIsXG4pOiBib29sZWFuIHtcbiAgLy8gUHJldmVudCBicm93c2VyIGZyb20gZm9sbG93aW5nIDxhPiBub2RlIGxpbmtzIGlmIGEganNhY3Rpb24gaXMgcHJlc2VudFxuICAvLyBhbmQgd2UgYXJlIGRpc3BhdGNoaW5nIHRoZSBhY3Rpb24gbm93LiBOb3RlIHRoYXQgdGhlIHRhcmdldEVsZW1lbnQgbWF5IGJlXG4gIC8vIGEgY2hpbGQgb2YgYW4gYW5jaG9yIHRoYXQgaGFzIGEganNhY3Rpb24gYXR0YWNoZWQuIEZvciB0aGF0IHJlYXNvbiwgd2VcbiAgLy8gbmVlZCB0byBjaGVjayB0aGUgYWN0aW9uRWxlbWVudCByYXRoZXIgdGhhbiB0aGUgdGFyZ2V0RWxlbWVudC5cbiAgcmV0dXJuIChcbiAgICBhY3Rpb25FbGVtZW50LnRhZ05hbWUgPT09ICdBJyAmJlxuICAgIChldmVudEluZm9XcmFwcGVyLmdldEV2ZW50VHlwZSgpID09PSBFdmVudFR5cGUuQ0xJQ0sgfHxcbiAgICAgIGV2ZW50SW5mb1dyYXBwZXIuZ2V0RXZlbnRUeXBlKCkgPT09IEV2ZW50VHlwZS5DTElDS01PRClcbiAgKTtcbn1cblxuLyoqXG4gKiBSZWdpc3RlcnMgZGVmZXJyZWQgZnVuY3Rpb25hbGl0eSBmb3IgYW4gRXZlbnRDb250cmFjdCBhbmQgYSBKc2FjdGlvblxuICogRGlzcGF0Y2hlci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyRGlzcGF0Y2hlcihldmVudENvbnRyYWN0OiBVbnJlbmFtZWRFdmVudENvbnRyYWN0LCBkaXNwYXRjaGVyOiBEaXNwYXRjaGVyKSB7XG4gIGV2ZW50Q29udHJhY3QuZWNyZCgoZXZlbnRJbmZvOiBFdmVudEluZm8pID0+IHtcbiAgICBkaXNwYXRjaGVyLmRpc3BhdGNoKGV2ZW50SW5mbyk7XG4gIH0sIFJlc3RyaWN0aW9uLklfQU1fVEhFX0pTQUNUSU9OX0ZSQU1FV09SSyk7XG59XG4iXX0=