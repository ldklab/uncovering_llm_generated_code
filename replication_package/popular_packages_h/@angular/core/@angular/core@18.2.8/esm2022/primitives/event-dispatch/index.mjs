/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export { Attribute } from './src/attribute';
export { getDefaulted as getActionCache } from './src/cache';
export { EventContractContainer } from './src/event_contract_container';
export { EventDispatcher, EventPhase, registerDispatcher } from './src/event_dispatcher';
export { EventInfoWrapper } from './src/event_info';
export { isEarlyEventType, isCaptureEventType } from './src/event_type';
export { EventContract } from './src/eventcontract';
export { bootstrapAppScopedEarlyEventContract, clearAppScopedEarlyEventContract, getAppScopedQueuedEventInfos, registerAppScopedDispatcher, removeAllAppScopedEventListeners, } from './src/bootstrap_app_scoped';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3ByaW1pdGl2ZXMvZXZlbnQtZGlzcGF0Y2gvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzFDLE9BQU8sRUFBQyxZQUFZLElBQUksY0FBYyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBRTNELE9BQU8sRUFBQyxzQkFBc0IsRUFBQyxNQUFNLGdDQUFnQyxDQUFDO0FBQ3RFLE9BQU8sRUFBQyxlQUFlLEVBQUUsVUFBVSxFQUFFLGtCQUFrQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDdkYsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDbEQsT0FBTyxFQUFDLGdCQUFnQixFQUFFLGtCQUFrQixFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDdEUsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ2xELE9BQU8sRUFDTCxvQ0FBb0MsRUFDcEMsZ0NBQWdDLEVBQ2hDLDRCQUE0QixFQUM1QiwyQkFBMkIsRUFDM0IsZ0NBQWdDLEdBQ2pDLE1BQU0sNEJBQTRCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmV4cG9ydCB7QXR0cmlidXRlfSBmcm9tICcuL3NyYy9hdHRyaWJ1dGUnO1xuZXhwb3J0IHtnZXREZWZhdWx0ZWQgYXMgZ2V0QWN0aW9uQ2FjaGV9IGZyb20gJy4vc3JjL2NhY2hlJztcbmV4cG9ydCB0eXBlIHtFYXJseUpzYWN0aW9uRGF0YUNvbnRhaW5lcn0gZnJvbSAnLi9zcmMvZWFybHlldmVudGNvbnRyYWN0JztcbmV4cG9ydCB7RXZlbnRDb250cmFjdENvbnRhaW5lcn0gZnJvbSAnLi9zcmMvZXZlbnRfY29udHJhY3RfY29udGFpbmVyJztcbmV4cG9ydCB7RXZlbnREaXNwYXRjaGVyLCBFdmVudFBoYXNlLCByZWdpc3RlckRpc3BhdGNoZXJ9IGZyb20gJy4vc3JjL2V2ZW50X2Rpc3BhdGNoZXInO1xuZXhwb3J0IHtFdmVudEluZm9XcmFwcGVyfSBmcm9tICcuL3NyYy9ldmVudF9pbmZvJztcbmV4cG9ydCB7aXNFYXJseUV2ZW50VHlwZSwgaXNDYXB0dXJlRXZlbnRUeXBlfSBmcm9tICcuL3NyYy9ldmVudF90eXBlJztcbmV4cG9ydCB7RXZlbnRDb250cmFjdH0gZnJvbSAnLi9zcmMvZXZlbnRjb250cmFjdCc7XG5leHBvcnQge1xuICBib290c3RyYXBBcHBTY29wZWRFYXJseUV2ZW50Q29udHJhY3QsXG4gIGNsZWFyQXBwU2NvcGVkRWFybHlFdmVudENvbnRyYWN0LFxuICBnZXRBcHBTY29wZWRRdWV1ZWRFdmVudEluZm9zLFxuICByZWdpc3RlckFwcFNjb3BlZERpc3BhdGNoZXIsXG4gIHJlbW92ZUFsbEFwcFNjb3BlZEV2ZW50TGlzdGVuZXJzLFxufSBmcm9tICcuL3NyYy9ib290c3RyYXBfYXBwX3Njb3BlZCc7XG4iXX0=