/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export var R3TemplateDependencyKind;
(function (R3TemplateDependencyKind) {
    R3TemplateDependencyKind[R3TemplateDependencyKind["Directive"] = 0] = "Directive";
    R3TemplateDependencyKind[R3TemplateDependencyKind["Pipe"] = 1] = "Pipe";
    R3TemplateDependencyKind[R3TemplateDependencyKind["NgModule"] = 2] = "NgModule";
})(R3TemplateDependencyKind || (R3TemplateDependencyKind = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3JlbmRlcjMvdmlldy9hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBNlRILE1BQU0sQ0FBTixJQUFZLHdCQUlYO0FBSkQsV0FBWSx3QkFBd0I7SUFDbEMsaUZBQWEsQ0FBQTtJQUNiLHVFQUFRLENBQUE7SUFDUiwrRUFBWSxDQUFBO0FBQ2QsQ0FBQyxFQUpXLHdCQUF3QixLQUF4Qix3QkFBd0IsUUFJbkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksIFZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tICcuLi8uLi9jb3JlJztcbmltcG9ydCB7SW50ZXJwb2xhdGlvbkNvbmZpZ30gZnJvbSAnLi4vLi4vbWxfcGFyc2VyL2RlZmF1bHRzJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtQYXJzZVNvdXJjZVNwYW59IGZyb20gJy4uLy4uL3BhcnNlX3V0aWwnO1xuaW1wb3J0ICogYXMgdCBmcm9tICcuLi9yM19hc3QnO1xuaW1wb3J0IHtSM0RlcGVuZGVuY3lNZXRhZGF0YX0gZnJvbSAnLi4vcjNfZmFjdG9yeSc7XG5pbXBvcnQge01heWJlRm9yd2FyZFJlZkV4cHJlc3Npb24sIFIzUmVmZXJlbmNlfSBmcm9tICcuLi91dGlsJztcblxuLyoqXG4gKiBJbmZvcm1hdGlvbiBuZWVkZWQgdG8gY29tcGlsZSBhIGRpcmVjdGl2ZSBmb3IgdGhlIHJlbmRlcjMgcnVudGltZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSM0RpcmVjdGl2ZU1ldGFkYXRhIHtcbiAgLyoqXG4gICAqIE5hbWUgb2YgdGhlIGRpcmVjdGl2ZSB0eXBlLlxuICAgKi9cbiAgbmFtZTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBBbiBleHByZXNzaW9uIHJlcHJlc2VudGluZyBhIHJlZmVyZW5jZSB0byB0aGUgZGlyZWN0aXZlIGl0c2VsZi5cbiAgICovXG4gIHR5cGU6IFIzUmVmZXJlbmNlO1xuXG4gIC8qKlxuICAgKiBOdW1iZXIgb2YgZ2VuZXJpYyB0eXBlIHBhcmFtZXRlcnMgb2YgdGhlIHR5cGUgaXRzZWxmLlxuICAgKi9cbiAgdHlwZUFyZ3VtZW50Q291bnQ6IG51bWJlcjtcblxuICAvKipcbiAgICogQSBzb3VyY2Ugc3BhbiBmb3IgdGhlIGRpcmVjdGl2ZSB0eXBlLlxuICAgKi9cbiAgdHlwZVNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbjtcblxuICAvKipcbiAgICogRGVwZW5kZW5jaWVzIG9mIHRoZSBkaXJlY3RpdmUncyBjb25zdHJ1Y3Rvci5cbiAgICovXG4gIGRlcHM6IFIzRGVwZW5kZW5jeU1ldGFkYXRhW10gfCAnaW52YWxpZCcgfCBudWxsO1xuXG4gIC8qKlxuICAgKiBVbnBhcnNlZCBzZWxlY3RvciBvZiB0aGUgZGlyZWN0aXZlLCBvciBgbnVsbGAgaWYgdGhlcmUgd2FzIG5vIHNlbGVjdG9yLlxuICAgKi9cbiAgc2VsZWN0b3I6IHN0cmluZyB8IG51bGw7XG5cbiAgLyoqXG4gICAqIEluZm9ybWF0aW9uIGFib3V0IHRoZSBjb250ZW50IHF1ZXJpZXMgbWFkZSBieSB0aGUgZGlyZWN0aXZlLlxuICAgKi9cbiAgcXVlcmllczogUjNRdWVyeU1ldGFkYXRhW107XG5cbiAgLyoqXG4gICAqIEluZm9ybWF0aW9uIGFib3V0IHRoZSB2aWV3IHF1ZXJpZXMgbWFkZSBieSB0aGUgZGlyZWN0aXZlLlxuICAgKi9cbiAgdmlld1F1ZXJpZXM6IFIzUXVlcnlNZXRhZGF0YVtdO1xuXG4gIC8qKlxuICAgKiBNYXBwaW5ncyBpbmRpY2F0aW5nIGhvdyB0aGUgZGlyZWN0aXZlIGludGVyYWN0cyB3aXRoIGl0cyBob3N0IGVsZW1lbnQgKGhvc3QgYmluZGluZ3MsXG4gICAqIGxpc3RlbmVycywgZXRjKS5cbiAgICovXG4gIGhvc3Q6IFIzSG9zdE1ldGFkYXRhO1xuXG4gIC8qKlxuICAgKiBJbmZvcm1hdGlvbiBhYm91dCB1c2FnZSBvZiBzcGVjaWZpYyBsaWZlY3ljbGUgZXZlbnRzIHdoaWNoIHJlcXVpcmUgc3BlY2lhbCB0cmVhdG1lbnQgaW4gdGhlXG4gICAqIGNvZGUgZ2VuZXJhdG9yLlxuICAgKi9cbiAgbGlmZWN5Y2xlOiB7XG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgZGlyZWN0aXZlIHVzZXMgTmdPbkNoYW5nZXMuXG4gICAgICovXG4gICAgdXNlc09uQ2hhbmdlczogYm9vbGVhbjtcbiAgfTtcblxuICAvKipcbiAgICogQSBtYXBwaW5nIG9mIGlucHV0cyBmcm9tIGNsYXNzIHByb3BlcnR5IG5hbWVzIHRvIGJpbmRpbmcgcHJvcGVydHkgbmFtZXMsIG9yIHRvIGEgdHVwbGUgb2ZcbiAgICogYmluZGluZyBwcm9wZXJ0eSBuYW1lIGFuZCBjbGFzcyBwcm9wZXJ0eSBuYW1lIGlmIHRoZSBuYW1lcyBhcmUgZGlmZmVyZW50LlxuICAgKi9cbiAgaW5wdXRzOiB7W2ZpZWxkOiBzdHJpbmddOiBSM0lucHV0TWV0YWRhdGF9O1xuXG4gIC8qKlxuICAgKiBBIG1hcHBpbmcgb2Ygb3V0cHV0cyBmcm9tIGNsYXNzIHByb3BlcnR5IG5hbWVzIHRvIGJpbmRpbmcgcHJvcGVydHkgbmFtZXMsIG9yIHRvIGEgdHVwbGUgb2ZcbiAgICogYmluZGluZyBwcm9wZXJ0eSBuYW1lIGFuZCBjbGFzcyBwcm9wZXJ0eSBuYW1lIGlmIHRoZSBuYW1lcyBhcmUgZGlmZmVyZW50LlxuICAgKi9cbiAgb3V0cHV0czoge1tmaWVsZDogc3RyaW5nXTogc3RyaW5nfTtcblxuICAvKipcbiAgICogV2hldGhlciBvciBub3QgdGhlIGNvbXBvbmVudCBvciBkaXJlY3RpdmUgaW5oZXJpdHMgZnJvbSBhbm90aGVyIGNsYXNzXG4gICAqL1xuICB1c2VzSW5oZXJpdGFuY2U6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgb3Igbm90IHRoZSBjb21wb25lbnQgb3IgZGlyZWN0aXZlIGluaGVyaXRzIGl0cyBlbnRpcmUgZGVjb3JhdG9yIGZyb20gaXRzIGJhc2UgY2xhc3MuXG4gICAqL1xuICBmdWxsSW5oZXJpdGFuY2U6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFJlZmVyZW5jZSBuYW1lIHVuZGVyIHdoaWNoIHRvIGV4cG9ydCB0aGUgZGlyZWN0aXZlJ3MgdHlwZSBpbiBhIHRlbXBsYXRlLFxuICAgKiBpZiBhbnkuXG4gICAqL1xuICBleHBvcnRBczogc3RyaW5nW10gfCBudWxsO1xuXG4gIC8qKlxuICAgKiBUaGUgbGlzdCBvZiBwcm92aWRlcnMgZGVmaW5lZCBpbiB0aGUgZGlyZWN0aXZlLlxuICAgKi9cbiAgcHJvdmlkZXJzOiBvLkV4cHJlc3Npb24gfCBudWxsO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIG9yIG5vdCB0aGUgY29tcG9uZW50IG9yIGRpcmVjdGl2ZSBpcyBzdGFuZGFsb25lLlxuICAgKi9cbiAgaXNTdGFuZGFsb25lOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIG9yIG5vdCB0aGUgY29tcG9uZW50IG9yIGRpcmVjdGl2ZSBpcyBzaWduYWwtYmFzZWQuXG4gICAqL1xuICBpc1NpZ25hbDogYm9vbGVhbjtcblxuICAvKipcbiAgICogQWRkaXRpb25hbCBkaXJlY3RpdmVzIGFwcGxpZWQgdG8gdGhlIGRpcmVjdGl2ZSBob3N0LlxuICAgKi9cbiAgaG9zdERpcmVjdGl2ZXM6IFIzSG9zdERpcmVjdGl2ZU1ldGFkYXRhW10gfCBudWxsO1xufVxuXG4vKipcbiAqIERlZmluZXMgaG93IGR5bmFtaWMgaW1wb3J0cyBmb3IgZGVmZXJyZWQgZGVwZW5kZW5jaWVzIHNob3VsZCBiZSBlbWl0dGVkIGluIHRoZVxuICogZ2VuZXJhdGVkIG91dHB1dDpcbiAqICAtIGVpdGhlciBpbiBhIGZ1bmN0aW9uIG9uIHBlci1jb21wb25lbnQgYmFzaXMgKGluIGNhc2Ugb2YgbG9jYWwgY29tcGlsYXRpb24pXG4gKiAgLSBvciBpbiBhIGZ1bmN0aW9uIG9uIHBlci1ibG9jayBiYXNpcyAoaW4gZnVsbCBjb21waWxhdGlvbiBtb2RlKVxuICovXG5leHBvcnQgY29uc3QgZW51bSBEZWZlckJsb2NrRGVwc0VtaXRNb2RlIHtcbiAgLyoqXG4gICAqIER5bmFtaWMgaW1wb3J0cyBhcmUgZ3JvdXBlZCBvbiBwZXItYmxvY2sgYmFzaXMuXG4gICAqXG4gICAqIFRoaXMgaXMgdXNlZCBpbiBmdWxsIGNvbXBpbGF0aW9uIG1vZGUsIHdoZW4gY29tcGlsZXIgaGFzIG1vcmUgaW5mb3JtYXRpb25cbiAgICogYWJvdXQgcGFydGljdWxhciBkZXBlbmRlbmNpZXMgdGhhdCBiZWxvbmcgdG8gdGhpcyBibG9jay5cbiAgICovXG4gIFBlckJsb2NrLFxuXG4gIC8qKlxuICAgKiBEeW5hbWljIGltcG9ydHMgYXJlIGdyb3VwZWQgb24gcGVyLWNvbXBvbmVudCBiYXNpcy5cbiAgICpcbiAgICogSW4gbG9jYWwgY29tcGlsYXRpb24sIGNvbXBpbGVyIGRvZXNuJ3QgaGF2ZSBlbm91Z2ggaW5mb3JtYXRpb24gdG8gZGV0ZXJtaW5lXG4gICAqIHdoaWNoIGRlZmVycmVkIGRlcGVuZGVuY2llcyBiZWxvbmcgdG8gd2hpY2ggYmxvY2suIEluIHRoaXMgY2FzZSB3ZSBncm91cCBhbGxcbiAgICogZHluYW1pYyBpbXBvcnRzIGludG8gYSBzaW5nbGUgZmlsZSBvbiBwZXItY29tcG9uZW50IGJhc2lzLlxuICAgKi9cbiAgUGVyQ29tcG9uZW50LFxufVxuXG4vKipcbiAqIFNwZWNpZmllcyBob3cgYSBsaXN0IG9mIGRlY2xhcmF0aW9uIHR5cGUgcmVmZXJlbmNlcyBzaG91bGQgYmUgZW1pdHRlZCBpbnRvIHRoZSBnZW5lcmF0ZWQgY29kZS5cbiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gRGVjbGFyYXRpb25MaXN0RW1pdE1vZGUge1xuICAvKipcbiAgICogVGhlIGxpc3Qgb2YgZGVjbGFyYXRpb25zIGlzIGVtaXR0ZWQgaW50byB0aGUgZ2VuZXJhdGVkIGNvZGUgYXMgaXMuXG4gICAqXG4gICAqIGBgYFxuICAgKiBkaXJlY3RpdmVzOiBbTXlEaXJdLFxuICAgKiBgYGBcbiAgICovXG4gIERpcmVjdCxcblxuICAvKipcbiAgICogVGhlIGxpc3Qgb2YgZGVjbGFyYXRpb25zIGlzIGVtaXR0ZWQgaW50byB0aGUgZ2VuZXJhdGVkIGNvZGUgd3JhcHBlZCBpbnNpZGUgYSBjbG9zdXJlLCB3aGljaFxuICAgKiBpcyBuZWVkZWQgd2hlbiBhdCBsZWFzdCBvbmUgZGVjbGFyYXRpb24gaXMgYSBmb3J3YXJkIHJlZmVyZW5jZS5cbiAgICpcbiAgICogYGBgXG4gICAqIGRpcmVjdGl2ZXM6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIFtNeURpciwgRm9yd2FyZERpcl07IH0sXG4gICAqIGBgYFxuICAgKi9cbiAgQ2xvc3VyZSxcblxuICAvKipcbiAgICogU2ltaWxhciB0byBgQ2xvc3VyZWAsIHdpdGggdGhlIGFkZGl0aW9uIHRoYXQgdGhlIGxpc3Qgb2YgZGVjbGFyYXRpb25zIGNhbiBjb250YWluIGluZGl2aWR1YWxcbiAgICogaXRlbXMgdGhhdCBhcmUgdGhlbXNlbHZlcyBmb3J3YXJkIHJlZmVyZW5jZXMuIFRoaXMgaXMgcmVsZXZhbnQgZm9yIEpJVCBjb21waWxhdGlvbnMsIGFzXG4gICAqIHVud3JhcHBpbmcgdGhlIGZvcndhcmRSZWYgY2Fubm90IGJlIGRvbmUgc3RhdGljYWxseSBzbyBtdXN0IGJlIGRlZmVycmVkLiBUaGlzIG1vZGUgZW1pdHNcbiAgICogdGhlIGRlY2xhcmF0aW9uIGxpc3QgdXNpbmcgYSBtYXBwaW5nIHRyYW5zZm9ybSB0aHJvdWdoIGByZXNvbHZlRm9yd2FyZFJlZmAgdG8gZW5zdXJlIHRoYXRcbiAgICogYW55IGZvcndhcmQgcmVmZXJlbmNlcyB3aXRoaW4gdGhlIGxpc3QgYXJlIHJlc29sdmVkIHdoZW4gdGhlIG91dGVyIGNsb3N1cmUgaXMgaW52b2tlZC5cbiAgICpcbiAgICogQ29uc2lkZXIgdGhlIGNhc2Ugd2hlcmUgdGhlIHJ1bnRpbWUgaGFzIGNhcHR1cmVkIHR3byBkZWNsYXJhdGlvbnMgaW4gdHdvIGRpc3RpbmN0IHZhbHVlczpcbiAgICogYGBgXG4gICAqIGNvbnN0IGRpckEgPSBNeURpcjtcbiAgICogY29uc3QgZGlyQiA9IGZvcndhcmRSZWYoZnVuY3Rpb24oKSB7IHJldHVybiBGb3J3YXJkUmVmOyB9KTtcbiAgICogYGBgXG4gICAqXG4gICAqIFRoaXMgbW9kZSB3b3VsZCBlbWl0IHRoZSBkZWNsYXJhdGlvbnMgY2FwdHVyZWQgaW4gYGRpckFgIGFuZCBgZGlyQmAgYXMgZm9sbG93czpcbiAgICogYGBgXG4gICAqIGRpcmVjdGl2ZXM6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIFtkaXJBLCBkaXJCXS5tYXAobmcucmVzb2x2ZUZvcndhcmRSZWYpOyB9LFxuICAgKiBgYGBcbiAgICovXG4gIENsb3N1cmVSZXNvbHZlZCxcblxuICBSdW50aW1lUmVzb2x2ZWQsXG59XG5cbi8qKlxuICogSW5mb3JtYXRpb24gbmVlZGVkIHRvIGNvbXBpbGUgYSBjb21wb25lbnQgZm9yIHRoZSByZW5kZXIzIHJ1bnRpbWUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUjNDb21wb25lbnRNZXRhZGF0YTxEZWNsYXJhdGlvblQgZXh0ZW5kcyBSM1RlbXBsYXRlRGVwZW5kZW5jeT5cbiAgZXh0ZW5kcyBSM0RpcmVjdGl2ZU1ldGFkYXRhIHtcbiAgLyoqXG4gICAqIEluZm9ybWF0aW9uIGFib3V0IHRoZSBjb21wb25lbnQncyB0ZW1wbGF0ZS5cbiAgICovXG4gIHRlbXBsYXRlOiB7XG4gICAgLyoqXG4gICAgICogUGFyc2VkIG5vZGVzIG9mIHRoZSB0ZW1wbGF0ZS5cbiAgICAgKi9cbiAgICBub2RlczogdC5Ob2RlW107XG5cbiAgICAvKipcbiAgICAgKiBBbnkgbmctY29udGVudCBzZWxlY3RvcnMgZXh0cmFjdGVkIGZyb20gdGhlIHRlbXBsYXRlLiBDb250YWlucyBgKmAgd2hlbiBhbiBuZy1jb250ZW50XG4gICAgICogZWxlbWVudCB3aXRob3V0IHNlbGVjdG9yIGlzIHByZXNlbnQuXG4gICAgICovXG4gICAgbmdDb250ZW50U2VsZWN0b3JzOiBzdHJpbmdbXTtcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIHRlbXBsYXRlIHByZXNlcnZlcyB3aGl0ZXNwYWNlcyBmcm9tIHRoZSB1c2VyJ3MgY29kZS5cbiAgICAgKi9cbiAgICBwcmVzZXJ2ZVdoaXRlc3BhY2VzPzogYm9vbGVhbjtcbiAgfTtcblxuICBkZWNsYXJhdGlvbnM6IERlY2xhcmF0aW9uVFtdO1xuXG4gIC8qKiBNZXRhZGF0YSByZWxhdGVkIHRvIHRoZSBkZWZlcnJlZCBibG9ja3MgaW4gdGhlIGNvbXBvbmVudCdzIHRlbXBsYXRlLiAqL1xuICBkZWZlcjogUjNDb21wb25lbnREZWZlck1ldGFkYXRhO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZpZXMgaG93IHRoZSAnZGlyZWN0aXZlcycgYW5kL29yIGBwaXBlc2AgYXJyYXksIGlmIGdlbmVyYXRlZCwgbmVlZCB0byBiZSBlbWl0dGVkLlxuICAgKi9cbiAgZGVjbGFyYXRpb25MaXN0RW1pdE1vZGU6IERlY2xhcmF0aW9uTGlzdEVtaXRNb2RlO1xuXG4gIC8qKlxuICAgKiBBIGNvbGxlY3Rpb24gb2Ygc3R5bGluZyBkYXRhIHRoYXQgd2lsbCBiZSBhcHBsaWVkIGFuZCBzY29wZWQgdG8gdGhlIGNvbXBvbmVudC5cbiAgICovXG4gIHN0eWxlczogc3RyaW5nW107XG5cbiAgLyoqXG4gICAqIEFuIGVuY2Fwc3VsYXRpb24gcG9saWN5IGZvciB0aGUgY29tcG9uZW50J3Mgc3R5bGluZy5cbiAgICogUG9zc2libGUgdmFsdWVzOlxuICAgKiAtIGBWaWV3RW5jYXBzdWxhdGlvbi5FbXVsYXRlZGA6IEFwcGx5IG1vZGlmaWVkIGNvbXBvbmVudCBzdHlsZXMgaW4gb3JkZXIgdG8gZW11bGF0ZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGEgbmF0aXZlIFNoYWRvdyBET00gQ1NTIGVuY2Fwc3VsYXRpb24gYmVoYXZpb3IuXG4gICAqIC0gYFZpZXdFbmNhcHN1bGF0aW9uLk5vbmVgOiBBcHBseSBjb21wb25lbnQgc3R5bGVzIGdsb2JhbGx5IHdpdGhvdXQgYW55IHNvcnQgb2YgZW5jYXBzdWxhdGlvbi5cbiAgICogLSBgVmlld0VuY2Fwc3VsYXRpb24uU2hhZG93RG9tYDogVXNlIHRoZSBicm93c2VyJ3MgbmF0aXZlIFNoYWRvdyBET00gQVBJIHRvIGVuY2Fwc3VsYXRlIHN0eWxlcy5cbiAgICovXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uO1xuXG4gIC8qKlxuICAgKiBBIGNvbGxlY3Rpb24gb2YgYW5pbWF0aW9uIHRyaWdnZXJzIHRoYXQgd2lsbCBiZSB1c2VkIGluIHRoZSBjb21wb25lbnQgdGVtcGxhdGUuXG4gICAqL1xuICBhbmltYXRpb25zOiBvLkV4cHJlc3Npb24gfCBudWxsO1xuXG4gIC8qKlxuICAgKiBUaGUgbGlzdCBvZiB2aWV3IHByb3ZpZGVycyBkZWZpbmVkIGluIHRoZSBjb21wb25lbnQuXG4gICAqL1xuICB2aWV3UHJvdmlkZXJzOiBvLkV4cHJlc3Npb24gfCBudWxsO1xuXG4gIC8qKlxuICAgKiBQYXRoIHRvIHRoZSAudHMgZmlsZSBpbiB3aGljaCB0aGlzIHRlbXBsYXRlJ3MgZ2VuZXJhdGVkIGNvZGUgd2lsbCBiZSBpbmNsdWRlZCwgcmVsYXRpdmUgdG9cbiAgICogdGhlIGNvbXBpbGF0aW9uIHJvb3QuIFRoaXMgd2lsbCBiZSB1c2VkIHRvIGdlbmVyYXRlIGlkZW50aWZpZXJzIHRoYXQgbmVlZCB0byBiZSBnbG9iYWxseVxuICAgKiB1bmlxdWUgaW4gY2VydGFpbiBjb250ZXh0cyAoc3VjaCBhcyBnMykuXG4gICAqL1xuICByZWxhdGl2ZUNvbnRleHRGaWxlUGF0aDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRyYW5zbGF0aW9uIHZhcmlhYmxlIG5hbWUgc2hvdWxkIGNvbnRhaW4gZXh0ZXJuYWwgbWVzc2FnZSBpZFxuICAgKiAodXNlZCBieSBDbG9zdXJlIENvbXBpbGVyJ3Mgb3V0cHV0IG9mIGBnb29nLmdldE1zZ2AgZm9yIHRyYW5zaXRpb24gcGVyaW9kKS5cbiAgICovXG4gIGkxOG5Vc2VFeHRlcm5hbElkczogYm9vbGVhbjtcblxuICAvKipcbiAgICogT3ZlcnJpZGVzIHRoZSBkZWZhdWx0IGludGVycG9sYXRpb24gc3RhcnQgYW5kIGVuZCBkZWxpbWl0ZXJzICh7eyBhbmQgfX0pLlxuICAgKi9cbiAgaW50ZXJwb2xhdGlvbjogSW50ZXJwb2xhdGlvbkNvbmZpZztcblxuICAvKipcbiAgICogU3RyYXRlZ3kgdXNlZCBmb3IgZGV0ZWN0aW5nIGNoYW5nZXMgaW4gdGhlIGNvbXBvbmVudC5cbiAgICpcbiAgICogSW4gZ2xvYmFsIGNvbXBpbGF0aW9uIG1vZGUgdGhlIHZhbHVlIGlzIENoYW5nZURldGVjdGlvblN0cmF0ZWd5IGlmIGF2YWlsYWJsZSBhcyBpdCBpc1xuICAgKiBzdGF0aWNhbGx5IHJlc29sdmVkIGR1cmluZyBhbmFseXNpcyBwaGFzZS4gV2hlcmVhcyBpbiBsb2NhbCBjb21waWxhdGlvbiBtb2RlIHRoZSB2YWx1ZSBpcyB0aGVcbiAgICogZXhwcmVzc2lvbiBhcyBhcHBlYXJzIGluIHRoZSBkZWNvcmF0b3IuXG4gICAqL1xuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5IHwgby5FeHByZXNzaW9uIHwgbnVsbDtcblxuICAvKipcbiAgICogVGhlIGltcG9ydHMgZXhwcmVzc2lvbiBhcyBhcHBlYXJzIG9uIHRoZSBjb21wb25lbnQgZGVjb3JhdGUgZm9yIHN0YW5kYWxvbmUgY29tcG9uZW50LiBUaGlzXG4gICAqIGZpZWxkIGlzIGN1cnJlbnRseSBuZWVkZWQgb25seSBmb3IgbG9jYWwgY29tcGlsYXRpb24sIGFuZCBzbyBpbiBvdGhlciBjb21waWxhdGlvbiBtb2RlcyBpdCBtYXlcbiAgICogbm90IGJlIHNldC4gSWYgY29tcG9uZW50IGhhcyBlbXB0eSBhcnJheSBpbXBvcnRzIHRoZW4gdGhpcyBmaWVsZCBpcyBub3Qgc2V0LlxuICAgKi9cbiAgcmF3SW1wb3J0cz86IG8uRXhwcmVzc2lvbjtcbn1cblxuLyoqXG4gKiBJbmZvcm1hdGlvbiBhYm91dCB0aGUgZGVmZXJyZWQgYmxvY2tzIGluIGEgY29tcG9uZW50J3MgdGVtcGxhdGUuXG4gKi9cbmV4cG9ydCB0eXBlIFIzQ29tcG9uZW50RGVmZXJNZXRhZGF0YSA9XG4gIHwge1xuICAgICAgbW9kZTogRGVmZXJCbG9ja0RlcHNFbWl0TW9kZS5QZXJCbG9jaztcbiAgICAgIGJsb2NrczogTWFwPHQuRGVmZXJyZWRCbG9jaywgby5FeHByZXNzaW9uIHwgbnVsbD47XG4gICAgfVxuICB8IHtcbiAgICAgIG1vZGU6IERlZmVyQmxvY2tEZXBzRW1pdE1vZGUuUGVyQ29tcG9uZW50O1xuICAgICAgZGVwZW5kZW5jaWVzRm46IG8uRXhwcmVzc2lvbiB8IG51bGw7XG4gICAgfTtcblxuLyoqXG4gKiBNZXRhZGF0YSBmb3IgYW4gaW5kaXZpZHVhbCBpbnB1dCBvbiBhIGRpcmVjdGl2ZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSM0lucHV0TWV0YWRhdGEge1xuICBjbGFzc1Byb3BlcnR5TmFtZTogc3RyaW5nO1xuICBiaW5kaW5nUHJvcGVydHlOYW1lOiBzdHJpbmc7XG4gIHJlcXVpcmVkOiBib29sZWFuO1xuICBpc1NpZ25hbDogYm9vbGVhbjtcbiAgLyoqXG4gICAqIFRyYW5zZm9ybSBmdW5jdGlvbiBmb3IgdGhlIGlucHV0LlxuICAgKlxuICAgKiBOdWxsIGlmIHRoZXJlIGlzIG5vIHRyYW5zZm9ybSwgb3IgaWYgdGhpcyBpcyBhIHNpZ25hbCBpbnB1dC5cbiAgICogU2lnbmFsIGlucHV0cyBjYXB0dXJlIHRoZWlyIHRyYW5zZm9ybSBhcyBwYXJ0IG9mIHRoZSBgSW5wdXRTaWduYWxgLlxuICAgKi9cbiAgdHJhbnNmb3JtRnVuY3Rpb246IG8uRXhwcmVzc2lvbiB8IG51bGw7XG59XG5cbmV4cG9ydCBlbnVtIFIzVGVtcGxhdGVEZXBlbmRlbmN5S2luZCB7XG4gIERpcmVjdGl2ZSA9IDAsXG4gIFBpcGUgPSAxLFxuICBOZ01vZHVsZSA9IDIsXG59XG5cbi8qKlxuICogQSBkZXBlbmRlbmN5IHRoYXQncyB1c2VkIHdpdGhpbiBhIGNvbXBvbmVudCB0ZW1wbGF0ZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSM1RlbXBsYXRlRGVwZW5kZW5jeSB7XG4gIGtpbmQ6IFIzVGVtcGxhdGVEZXBlbmRlbmN5S2luZDtcblxuICAvKipcbiAgICogVGhlIHR5cGUgb2YgdGhlIGRlcGVuZGVuY3kgYXMgYW4gZXhwcmVzc2lvbi5cbiAgICovXG4gIHR5cGU6IG8uRXhwcmVzc2lvbjtcbn1cblxuLyoqXG4gKiBBIGRlcGVuZGVuY3kgdGhhdCdzIHVzZWQgd2l0aGluIGEgY29tcG9uZW50IHRlbXBsYXRlXG4gKi9cbmV4cG9ydCB0eXBlIFIzVGVtcGxhdGVEZXBlbmRlbmN5TWV0YWRhdGEgPVxuICB8IFIzRGlyZWN0aXZlRGVwZW5kZW5jeU1ldGFkYXRhXG4gIHwgUjNQaXBlRGVwZW5kZW5jeU1ldGFkYXRhXG4gIHwgUjNOZ01vZHVsZURlcGVuZGVuY3lNZXRhZGF0YTtcblxuLyoqXG4gKiBJbmZvcm1hdGlvbiBhYm91dCBhIGRpcmVjdGl2ZSB0aGF0IGlzIHVzZWQgaW4gYSBjb21wb25lbnQgdGVtcGxhdGUuIE9ubHkgdGhlIHN0YWJsZSwgcHVibGljXG4gKiBmYWNpbmcgaW5mb3JtYXRpb24gb2YgdGhlIGRpcmVjdGl2ZSBpcyBzdG9yZWQgaGVyZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSM0RpcmVjdGl2ZURlcGVuZGVuY3lNZXRhZGF0YSBleHRlbmRzIFIzVGVtcGxhdGVEZXBlbmRlbmN5IHtcbiAga2luZDogUjNUZW1wbGF0ZURlcGVuZGVuY3lLaW5kLkRpcmVjdGl2ZTtcblxuICAvKipcbiAgICogVGhlIHNlbGVjdG9yIG9mIHRoZSBkaXJlY3RpdmUuXG4gICAqL1xuICBzZWxlY3Rvcjogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgYmluZGluZyBwcm9wZXJ0eSBuYW1lcyBvZiB0aGUgaW5wdXRzIG9mIHRoZSBkaXJlY3RpdmUuXG4gICAqL1xuICBpbnB1dHM6IHN0cmluZ1tdO1xuXG4gIC8qKlxuICAgKiBUaGUgYmluZGluZyBwcm9wZXJ0eSBuYW1lcyBvZiB0aGUgb3V0cHV0cyBvZiB0aGUgZGlyZWN0aXZlLlxuICAgKi9cbiAgb3V0cHV0czogc3RyaW5nW107XG5cbiAgLyoqXG4gICAqIE5hbWUgdW5kZXIgd2hpY2ggdGhlIGRpcmVjdGl2ZSBpcyBleHBvcnRlZCwgaWYgYW55IChleHBvcnRBcyBpbiBBbmd1bGFyKS4gTnVsbCBvdGhlcndpc2UuXG4gICAqL1xuICBleHBvcnRBczogc3RyaW5nW10gfCBudWxsO1xuXG4gIC8qKlxuICAgKiBJZiB0cnVlIHRoZW4gdGhpcyBkaXJlY3RpdmUgaXMgYWN0dWFsbHkgYSBjb21wb25lbnQ7IG90aGVyd2lzZSBpdCBpcyBub3QuXG4gICAqL1xuICBpc0NvbXBvbmVudDogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSM1BpcGVEZXBlbmRlbmN5TWV0YWRhdGEgZXh0ZW5kcyBSM1RlbXBsYXRlRGVwZW5kZW5jeSB7XG4gIGtpbmQ6IFIzVGVtcGxhdGVEZXBlbmRlbmN5S2luZC5QaXBlO1xuXG4gIG5hbWU6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSM05nTW9kdWxlRGVwZW5kZW5jeU1ldGFkYXRhIGV4dGVuZHMgUjNUZW1wbGF0ZURlcGVuZGVuY3kge1xuICBraW5kOiBSM1RlbXBsYXRlRGVwZW5kZW5jeUtpbmQuTmdNb2R1bGU7XG59XG5cbi8qKlxuICogSW5mb3JtYXRpb24gbmVlZGVkIHRvIGNvbXBpbGUgYSBxdWVyeSAodmlldyBvciBjb250ZW50KS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSM1F1ZXJ5TWV0YWRhdGEge1xuICAvKipcbiAgICogTmFtZSBvZiB0aGUgcHJvcGVydHkgb24gdGhlIGNsYXNzIHRvIHVwZGF0ZSB3aXRoIHF1ZXJ5IHJlc3VsdHMuXG4gICAqL1xuICBwcm9wZXJ0eU5hbWU6IHN0cmluZztcblxuICAvKipcbiAgICogV2hldGhlciB0byByZWFkIG9ubHkgdGhlIGZpcnN0IG1hdGNoaW5nIHJlc3VsdCwgb3IgYW4gYXJyYXkgb2YgcmVzdWx0cy5cbiAgICovXG4gIGZpcnN0OiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBFaXRoZXIgYW4gZXhwcmVzc2lvbiByZXByZXNlbnRpbmcgYSB0eXBlIG9yIGBJbmplY3Rpb25Ub2tlbmAgZm9yIHRoZSBxdWVyeVxuICAgKiBwcmVkaWNhdGUsIG9yIGEgc2V0IG9mIHN0cmluZyBzZWxlY3RvcnMuXG4gICAqXG4gICAqIE5vdGU6IEF0IGNvbXBpbGUgdGltZSB3ZSBzcGxpdCBzZWxlY3RvcnMgYXMgYW4gb3B0aW1pemF0aW9uIHRoYXQgYXZvaWRzIHRoaXNcbiAgICogZXh0cmEgd29yayBhdCBydW50aW1lIGNyZWF0aW9uIHBoYXNlLlxuICAgKlxuICAgKiBOb3RhYmx5LCBpZiB0aGUgc2VsZWN0b3IgaXMgbm90IHN0YXRpY2FsbHkgYW5hbHl6YWJsZSBkdWUgdG8gYW4gZXhwcmVzc2lvbixcbiAgICogdGhlIHNlbGVjdG9ycyBtYXkgbmVlZCB0byBiZSBzcGxpdCB1cCBhdCBydW50aW1lLlxuICAgKi9cbiAgcHJlZGljYXRlOiBNYXliZUZvcndhcmRSZWZFeHByZXNzaW9uIHwgc3RyaW5nW107XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gaW5jbHVkZSBvbmx5IGRpcmVjdCBjaGlsZHJlbiBvciBhbGwgZGVzY2VuZGFudHMuXG4gICAqL1xuICBkZXNjZW5kYW50czogYm9vbGVhbjtcblxuICAvKipcbiAgICogSWYgdGhlIGBRdWVyeUxpc3RgIHNob3VsZCBmaXJlIGNoYW5nZSBldmVudCBvbmx5IGlmIGFjdHVhbCBjaGFuZ2UgdG8gcXVlcnkgd2FzIGNvbXB1dGVkICh2cyBvbGRcbiAgICogYmVoYXZpb3Igd2hlcmUgdGhlIGNoYW5nZSB3YXMgZmlyZWQgd2hlbmV2ZXIgdGhlIHF1ZXJ5IHdhcyByZWNvbXB1dGVkLCBldmVuIGlmIHRoZSByZWNvbXB1dGVkXG4gICAqIHF1ZXJ5IHJlc3VsdGVkIGluIHRoZSBzYW1lIGxpc3QuKVxuICAgKi9cbiAgZW1pdERpc3RpbmN0Q2hhbmdlc09ubHk6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIEFuIGV4cHJlc3Npb24gcmVwcmVzZW50aW5nIGEgdHlwZSB0byByZWFkIGZyb20gZWFjaCBtYXRjaGVkIG5vZGUsIG9yIG51bGwgaWYgdGhlIGRlZmF1bHQgdmFsdWVcbiAgICogZm9yIGEgZ2l2ZW4gbm9kZSBpcyB0byBiZSByZXR1cm5lZC5cbiAgICovXG4gIHJlYWQ6IG8uRXhwcmVzc2lvbiB8IG51bGw7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgb3Igbm90IHRoaXMgcXVlcnkgc2hvdWxkIGNvbGxlY3Qgb25seSBzdGF0aWMgcmVzdWx0cy5cbiAgICpcbiAgICogSWYgc3RhdGljIGlzIHRydWUsIHRoZSBxdWVyeSdzIHJlc3VsdHMgd2lsbCBiZSBzZXQgb24gdGhlIGNvbXBvbmVudCBhZnRlciBub2RlcyBhcmUgY3JlYXRlZCxcbiAgICogYnV0IGJlZm9yZSBjaGFuZ2UgZGV0ZWN0aW9uIHJ1bnMuIFRoaXMgbWVhbnMgdGhhdCBhbnkgcmVzdWx0cyB0aGF0IHJlbGllZCB1cG9uIGNoYW5nZSBkZXRlY3Rpb25cbiAgICogdG8gcnVuIChlLmcuIHJlc3VsdHMgaW5zaWRlICpuZ0lmIG9yICpuZ0ZvciB2aWV3cykgd2lsbCBub3QgYmUgY29sbGVjdGVkLiBRdWVyeSByZXN1bHRzIGFyZVxuICAgKiBhdmFpbGFibGUgaW4gdGhlIG5nT25Jbml0IGhvb2suXG4gICAqXG4gICAqIElmIHN0YXRpYyBpcyBmYWxzZSwgdGhlIHF1ZXJ5J3MgcmVzdWx0cyB3aWxsIGJlIHNldCBvbiB0aGUgY29tcG9uZW50IGFmdGVyIGNoYW5nZSBkZXRlY3Rpb25cbiAgICogcnVucy4gVGhpcyBtZWFucyB0aGF0IHRoZSBxdWVyeSByZXN1bHRzIGNhbiBjb250YWluIG5vZGVzIGluc2lkZSAqbmdJZiBvciAqbmdGb3Igdmlld3MsIGJ1dFxuICAgKiB0aGUgcmVzdWx0cyB3aWxsIG5vdCBiZSBhdmFpbGFibGUgaW4gdGhlIG5nT25Jbml0IGhvb2sgKG9ubHkgaW4gdGhlIG5nQWZ0ZXJDb250ZW50SW5pdCBmb3JcbiAgICogY29udGVudCBob29rcyBhbmQgbmdBZnRlclZpZXdJbml0IGZvciB2aWV3IGhvb2tzKS5cbiAgICpcbiAgICogTm90ZTogRm9yIHNpZ25hbC1iYXNlZCBxdWVyaWVzLCB0aGlzIG9wdGlvbiBkb2VzIG5vdCBoYXZlIGFueSBlZmZlY3QuXG4gICAqL1xuICBzdGF0aWM6IGJvb2xlYW47XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHF1ZXJ5IGlzIHNpZ25hbC1iYXNlZC4gKi9cbiAgaXNTaWduYWw6IGJvb2xlYW47XG59XG5cbi8qKlxuICogTWFwcGluZ3MgaW5kaWNhdGluZyBob3cgdGhlIGNsYXNzIGludGVyYWN0cyB3aXRoIGl0c1xuICogaG9zdCBlbGVtZW50IChob3N0IGJpbmRpbmdzLCBsaXN0ZW5lcnMsIGV0YykuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUjNIb3N0TWV0YWRhdGEge1xuICAvKipcbiAgICogQSBtYXBwaW5nIG9mIGF0dHJpYnV0ZSBiaW5kaW5nIGtleXMgdG8gYG8uRXhwcmVzc2lvbmBzLlxuICAgKi9cbiAgYXR0cmlidXRlczoge1trZXk6IHN0cmluZ106IG8uRXhwcmVzc2lvbn07XG5cbiAgLyoqXG4gICAqIEEgbWFwcGluZyBvZiBldmVudCBiaW5kaW5nIGtleXMgdG8gdW5wYXJzZWQgZXhwcmVzc2lvbnMuXG4gICAqL1xuICBsaXN0ZW5lcnM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuXG4gIC8qKlxuICAgKiBBIG1hcHBpbmcgb2YgcHJvcGVydHkgYmluZGluZyBrZXlzIHRvIHVucGFyc2VkIGV4cHJlc3Npb25zLlxuICAgKi9cbiAgcHJvcGVydGllczoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG5cbiAgc3BlY2lhbEF0dHJpYnV0ZXM6IHtzdHlsZUF0dHI/OiBzdHJpbmc7IGNsYXNzQXR0cj86IHN0cmluZ307XG59XG5cbi8qKlxuICogSW5mb3JtYXRpb24gbmVlZGVkIHRvIGNvbXBpbGUgYSBob3N0IGRpcmVjdGl2ZSBmb3IgdGhlIHJlbmRlcjMgcnVudGltZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSM0hvc3REaXJlY3RpdmVNZXRhZGF0YSB7XG4gIC8qKiBBbiBleHByZXNzaW9uIHJlcHJlc2VudGluZyB0aGUgaG9zdCBkaXJlY3RpdmUgY2xhc3MgaXRzZWxmLiAqL1xuICBkaXJlY3RpdmU6IFIzUmVmZXJlbmNlO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBleHByZXNzaW9uIHJlZmVycmluZyB0byB0aGUgaG9zdCBkaXJlY3RpdmUgaXMgYSBmb3J3YXJkIHJlZmVyZW5jZS4gKi9cbiAgaXNGb3J3YXJkUmVmZXJlbmNlOiBib29sZWFuO1xuXG4gIC8qKiBJbnB1dHMgZnJvbSB0aGUgaG9zdCBkaXJlY3RpdmUgdGhhdCB3aWxsIGJlIGV4cG9zZWQgb24gdGhlIGhvc3QuICovXG4gIGlucHV0czoge1twdWJsaWNOYW1lOiBzdHJpbmddOiBzdHJpbmd9IHwgbnVsbDtcblxuICAvKiogT3V0cHV0cyBmcm9tIHRoZSBob3N0IGRpcmVjdGl2ZSB0aGF0IHdpbGwgYmUgZXhwb3NlZCBvbiB0aGUgaG9zdC4gKi9cbiAgb3V0cHV0czoge1twdWJsaWNOYW1lOiBzdHJpbmddOiBzdHJpbmd9IHwgbnVsbDtcbn1cblxuLyoqXG4gKiBJbmZvcm1hdGlvbiBuZWVkZWQgdG8gY29tcGlsZSB0aGUgZGVmZXIgYmxvY2sgcmVzb2x2ZXIgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCB0eXBlIFIzRGVmZXJSZXNvbHZlckZ1bmN0aW9uTWV0YWRhdGEgPVxuICB8IHtcbiAgICAgIG1vZGU6IERlZmVyQmxvY2tEZXBzRW1pdE1vZGUuUGVyQmxvY2s7XG4gICAgICBkZXBlbmRlbmNpZXM6IFIzRGVmZXJQZXJCbG9ja0RlcGVuZGVuY3lbXTtcbiAgICB9XG4gIHwge1xuICAgICAgbW9kZTogRGVmZXJCbG9ja0RlcHNFbWl0TW9kZS5QZXJDb21wb25lbnQ7XG4gICAgICBkZXBlbmRlbmNpZXM6IFIzRGVmZXJQZXJDb21wb25lbnREZXBlbmRlbmN5W107XG4gICAgfTtcblxuLyoqXG4gKiBJbmZvcm1hdGlvbiBhYm91dCBhIHNpbmdsZSBkZXBlbmRlbmN5IG9mIGEgZGVmZXIgYmxvY2sgaW4gYFBlckJsb2NrYCBtb2RlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFIzRGVmZXJQZXJCbG9ja0RlcGVuZGVuY3kge1xuICAvKipcbiAgICogUmVmZXJlbmNlIHRvIGEgZGVwZW5kZW5jeS5cbiAgICovXG4gIHR5cGVSZWZlcmVuY2U6IG8uRXhwcmVzc2lvbjtcblxuICAvKipcbiAgICogRGVwZW5kZW5jeSBjbGFzcyBuYW1lLlxuICAgKi9cbiAgc3ltYm9sTmFtZTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoaXMgZGVwZW5kZW5jeSBjYW4gYmUgZGVmZXItbG9hZGVkLlxuICAgKi9cbiAgaXNEZWZlcnJhYmxlOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBJbXBvcnQgcGF0aCB3aGVyZSB0aGlzIGRlcGVuZGVuY3kgaXMgbG9jYXRlZC5cbiAgICovXG4gIGltcG9ydFBhdGg6IHN0cmluZyB8IG51bGw7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIHN5bWJvbCBpcyB0aGUgZGVmYXVsdCBleHBvcnQuXG4gICAqL1xuICBpc0RlZmF1bHRJbXBvcnQ6IGJvb2xlYW47XG59XG5cbi8qKlxuICogSW5mb3JtYXRpb24gYWJvdXQgYSBzaW5nbGUgZGVwZW5kZW5jeSBvZiBhIGRlZmVyIGJsb2NrIGluIGBQZXJDb21wb25lbnRgIG1vZGUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUjNEZWZlclBlckNvbXBvbmVudERlcGVuZGVuY3kge1xuICAvKipcbiAgICogRGVwZW5kZW5jeSBjbGFzcyBuYW1lLlxuICAgKi9cbiAgc3ltYm9sTmFtZTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBJbXBvcnQgcGF0aCB3aGVyZSB0aGlzIGRlcGVuZGVuY3kgaXMgbG9jYXRlZC5cbiAgICovXG4gIGltcG9ydFBhdGg6IHN0cmluZztcblxuICAvKipcbiAgICogV2hldGhlciB0aGUgc3ltYm9sIGlzIHRoZSBkZWZhdWx0IGV4cG9ydC5cbiAgICovXG4gIGlzRGVmYXVsdEltcG9ydDogYm9vbGVhbjtcbn1cbiJdfQ==