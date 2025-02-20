/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { createContentQuery, createViewQuery } from '../query';
import { bindQueryToSignal } from '../query_reactive';
import { getCurrentQueryIndex, setCurrentQueryIndex } from '../state';
/**
 * Creates a new content query and binds it to a signal created by an authoring function.
 *
 * @param directiveIndex Current directive index
 * @param target The target signal to which the query should be bound
 * @param predicate The type for which the query will search
 * @param flags Flags associated with the query
 * @param read What to save in the query
 *
 * @codeGenApi
 */
export function ɵɵcontentQuerySignal(directiveIndex, target, predicate, flags, read) {
    bindQueryToSignal(target, createContentQuery(directiveIndex, predicate, flags, read));
}
/**
 * Creates a new view query by initializing internal data structures and binding a new query to the
 * target signal.
 *
 * @param target The target signal to assign the query results to.
 * @param predicate The type or label that should match a given query
 * @param flags Flags associated with the query
 * @param read What to save in the query
 *
 * @codeGenApi
 */
export function ɵɵviewQuerySignal(target, predicate, flags, read) {
    bindQueryToSignal(target, createViewQuery(predicate, flags, read));
}
/**
 * Advances the current query index by a specified offset.
 *
 * Adjusting the current query index is necessary in cases where a given directive has a mix of
 * zone-based and signal-based queries. The signal-based queries don't require tracking of the
 * current index (those are refreshed on demand and not during change detection) so this instruction
 * is only necessary for backward-compatibility.
 *
 * @param index offset to apply to the current query index (defaults to 1)
 *
 * @codeGenApi
 */
export function ɵɵqueryAdvance(indexOffset = 1) {
    setCurrentQueryIndex(getCurrentQueryIndex() + indexOffset);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcmllc19zaWduYWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9pbnN0cnVjdGlvbnMvcXVlcmllc19zaWduYWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUlILE9BQU8sRUFBQyxrQkFBa0IsRUFBRSxlQUFlLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDN0QsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFFcEQsT0FBTyxFQUFDLG9CQUFvQixFQUFFLG9CQUFvQixFQUFDLE1BQU0sVUFBVSxDQUFDO0FBRXBFOzs7Ozs7Ozs7O0dBVUc7QUFDSCxNQUFNLFVBQVUsb0JBQW9CLENBQ2xDLGNBQXNCLEVBQ3RCLE1BQWlCLEVBQ2pCLFNBQTRDLEVBQzVDLEtBQWlCLEVBQ2pCLElBQVU7SUFFVixpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsa0JBQWtCLENBQUMsY0FBYyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN4RixDQUFDO0FBRUQ7Ozs7Ozs7Ozs7R0FVRztBQUNILE1BQU0sVUFBVSxpQkFBaUIsQ0FDL0IsTUFBdUIsRUFDdkIsU0FBNEMsRUFDNUMsS0FBaUIsRUFDakIsSUFBNkI7SUFFN0IsaUJBQWlCLENBQUMsTUFBTSxFQUFFLGVBQWUsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDckUsQ0FBQztBQUVEOzs7Ozs7Ozs7OztHQVdHO0FBQ0gsTUFBTSxVQUFVLGNBQWMsQ0FBQyxjQUFzQixDQUFDO0lBQ3BELG9CQUFvQixDQUFDLG9CQUFvQixFQUFFLEdBQUcsV0FBVyxDQUFDLENBQUM7QUFDN0QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtQcm92aWRlclRva2VufSBmcm9tICcuLi8uLi9kaS9wcm92aWRlcl90b2tlbic7XG5pbXBvcnQge1F1ZXJ5RmxhZ3N9IGZyb20gJy4uL2ludGVyZmFjZXMvcXVlcnknO1xuaW1wb3J0IHtjcmVhdGVDb250ZW50UXVlcnksIGNyZWF0ZVZpZXdRdWVyeX0gZnJvbSAnLi4vcXVlcnknO1xuaW1wb3J0IHtiaW5kUXVlcnlUb1NpZ25hbH0gZnJvbSAnLi4vcXVlcnlfcmVhY3RpdmUnO1xuaW1wb3J0IHtTaWduYWx9IGZyb20gJy4uL3JlYWN0aXZpdHkvYXBpJztcbmltcG9ydCB7Z2V0Q3VycmVudFF1ZXJ5SW5kZXgsIHNldEN1cnJlbnRRdWVyeUluZGV4fSBmcm9tICcuLi9zdGF0ZSc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBjb250ZW50IHF1ZXJ5IGFuZCBiaW5kcyBpdCB0byBhIHNpZ25hbCBjcmVhdGVkIGJ5IGFuIGF1dGhvcmluZyBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0gZGlyZWN0aXZlSW5kZXggQ3VycmVudCBkaXJlY3RpdmUgaW5kZXhcbiAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCBzaWduYWwgdG8gd2hpY2ggdGhlIHF1ZXJ5IHNob3VsZCBiZSBib3VuZFxuICogQHBhcmFtIHByZWRpY2F0ZSBUaGUgdHlwZSBmb3Igd2hpY2ggdGhlIHF1ZXJ5IHdpbGwgc2VhcmNoXG4gKiBAcGFyYW0gZmxhZ3MgRmxhZ3MgYXNzb2NpYXRlZCB3aXRoIHRoZSBxdWVyeVxuICogQHBhcmFtIHJlYWQgV2hhdCB0byBzYXZlIGluIHRoZSBxdWVyeVxuICpcbiAqIEBjb2RlR2VuQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiDJtcm1Y29udGVudFF1ZXJ5U2lnbmFsPFQ+KFxuICBkaXJlY3RpdmVJbmRleDogbnVtYmVyLFxuICB0YXJnZXQ6IFNpZ25hbDxUPixcbiAgcHJlZGljYXRlOiBQcm92aWRlclRva2VuPHVua25vd24+IHwgc3RyaW5nW10sXG4gIGZsYWdzOiBRdWVyeUZsYWdzLFxuICByZWFkPzogYW55LFxuKTogdm9pZCB7XG4gIGJpbmRRdWVyeVRvU2lnbmFsKHRhcmdldCwgY3JlYXRlQ29udGVudFF1ZXJ5KGRpcmVjdGl2ZUluZGV4LCBwcmVkaWNhdGUsIGZsYWdzLCByZWFkKSk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB2aWV3IHF1ZXJ5IGJ5IGluaXRpYWxpemluZyBpbnRlcm5hbCBkYXRhIHN0cnVjdHVyZXMgYW5kIGJpbmRpbmcgYSBuZXcgcXVlcnkgdG8gdGhlXG4gKiB0YXJnZXQgc2lnbmFsLlxuICpcbiAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCBzaWduYWwgdG8gYXNzaWduIHRoZSBxdWVyeSByZXN1bHRzIHRvLlxuICogQHBhcmFtIHByZWRpY2F0ZSBUaGUgdHlwZSBvciBsYWJlbCB0aGF0IHNob3VsZCBtYXRjaCBhIGdpdmVuIHF1ZXJ5XG4gKiBAcGFyYW0gZmxhZ3MgRmxhZ3MgYXNzb2NpYXRlZCB3aXRoIHRoZSBxdWVyeVxuICogQHBhcmFtIHJlYWQgV2hhdCB0byBzYXZlIGluIHRoZSBxdWVyeVxuICpcbiAqIEBjb2RlR2VuQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiDJtcm1dmlld1F1ZXJ5U2lnbmFsKFxuICB0YXJnZXQ6IFNpZ25hbDx1bmtub3duPixcbiAgcHJlZGljYXRlOiBQcm92aWRlclRva2VuPHVua25vd24+IHwgc3RyaW5nW10sXG4gIGZsYWdzOiBRdWVyeUZsYWdzLFxuICByZWFkPzogUHJvdmlkZXJUb2tlbjx1bmtub3duPixcbik6IHZvaWQge1xuICBiaW5kUXVlcnlUb1NpZ25hbCh0YXJnZXQsIGNyZWF0ZVZpZXdRdWVyeShwcmVkaWNhdGUsIGZsYWdzLCByZWFkKSk7XG59XG5cbi8qKlxuICogQWR2YW5jZXMgdGhlIGN1cnJlbnQgcXVlcnkgaW5kZXggYnkgYSBzcGVjaWZpZWQgb2Zmc2V0LlxuICpcbiAqIEFkanVzdGluZyB0aGUgY3VycmVudCBxdWVyeSBpbmRleCBpcyBuZWNlc3NhcnkgaW4gY2FzZXMgd2hlcmUgYSBnaXZlbiBkaXJlY3RpdmUgaGFzIGEgbWl4IG9mXG4gKiB6b25lLWJhc2VkIGFuZCBzaWduYWwtYmFzZWQgcXVlcmllcy4gVGhlIHNpZ25hbC1iYXNlZCBxdWVyaWVzIGRvbid0IHJlcXVpcmUgdHJhY2tpbmcgb2YgdGhlXG4gKiBjdXJyZW50IGluZGV4ICh0aG9zZSBhcmUgcmVmcmVzaGVkIG9uIGRlbWFuZCBhbmQgbm90IGR1cmluZyBjaGFuZ2UgZGV0ZWN0aW9uKSBzbyB0aGlzIGluc3RydWN0aW9uXG4gKiBpcyBvbmx5IG5lY2Vzc2FyeSBmb3IgYmFja3dhcmQtY29tcGF0aWJpbGl0eS5cbiAqXG4gKiBAcGFyYW0gaW5kZXggb2Zmc2V0IHRvIGFwcGx5IHRvIHRoZSBjdXJyZW50IHF1ZXJ5IGluZGV4IChkZWZhdWx0cyB0byAxKVxuICpcbiAqIEBjb2RlR2VuQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiDJtcm1cXVlcnlBZHZhbmNlKGluZGV4T2Zmc2V0OiBudW1iZXIgPSAxKTogdm9pZCB7XG4gIHNldEN1cnJlbnRRdWVyeUluZGV4KGdldEN1cnJlbnRRdWVyeUluZGV4KCkgKyBpbmRleE9mZnNldCk7XG59XG4iXX0=