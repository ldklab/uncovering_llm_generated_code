/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as ir from '../../ir';
const REPLACEMENTS = new Map([
    [ir.OpKind.ElementEnd, [ir.OpKind.ElementStart, ir.OpKind.Element]],
    [ir.OpKind.ContainerEnd, [ir.OpKind.ContainerStart, ir.OpKind.Container]],
    [ir.OpKind.I18nEnd, [ir.OpKind.I18nStart, ir.OpKind.I18n]],
]);
/**
 * Op kinds that should not prevent merging of start/end ops.
 */
const IGNORED_OP_KINDS = new Set([ir.OpKind.Pipe]);
/**
 * Replace sequences of mergable instructions (e.g. `ElementStart` and `ElementEnd`) with a
 * consolidated instruction (e.g. `Element`).
 */
export function collapseEmptyInstructions(job) {
    for (const unit of job.units) {
        for (const op of unit.create) {
            // Find end ops that may be able to be merged.
            const opReplacements = REPLACEMENTS.get(op.kind);
            if (opReplacements === undefined) {
                continue;
            }
            const [startKind, mergedKind] = opReplacements;
            // Locate the previous (non-ignored) op.
            let prevOp = op.prev;
            while (prevOp !== null && IGNORED_OP_KINDS.has(prevOp.kind)) {
                prevOp = prevOp.prev;
            }
            // If the previous op is the corresponding start op, we can megre.
            if (prevOp !== null && prevOp.kind === startKind) {
                // Transmute the start instruction to the merged version. This is safe as they're designed
                // to be identical apart from the `kind`.
                prevOp.kind = mergedKind;
                // Remove the end instruction.
                ir.OpList.remove(op);
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1wdHlfZWxlbWVudHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvc3JjL3BoYXNlcy9lbXB0eV9lbGVtZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUcvQixNQUFNLFlBQVksR0FBRyxJQUFJLEdBQUcsQ0FBb0M7SUFDOUQsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbkUsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDekUsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDM0QsQ0FBQyxDQUFDO0FBRUg7O0dBRUc7QUFDSCxNQUFNLGdCQUFnQixHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBRW5EOzs7R0FHRztBQUNILE1BQU0sVUFBVSx5QkFBeUIsQ0FBQyxHQUFtQjtJQUMzRCxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM3Qiw4Q0FBOEM7WUFDOUMsTUFBTSxjQUFjLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDakQsSUFBSSxjQUFjLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQ2pDLFNBQVM7WUFDWCxDQUFDO1lBQ0QsTUFBTSxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsR0FBRyxjQUFjLENBQUM7WUFFL0Msd0NBQXdDO1lBQ3hDLElBQUksTUFBTSxHQUF1QixFQUFFLENBQUMsSUFBSSxDQUFDO1lBQ3pDLE9BQU8sTUFBTSxLQUFLLElBQUksSUFBSSxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQzVELE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ3ZCLENBQUM7WUFFRCxrRUFBa0U7WUFDbEUsSUFBSSxNQUFNLEtBQUssSUFBSSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQ2pELDBGQUEwRjtnQkFDMUYseUNBQXlDO2dCQUN4QyxNQUE2QixDQUFDLElBQUksR0FBRyxVQUFVLENBQUM7Z0JBRWpELDhCQUE4QjtnQkFDOUIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQWMsRUFBRSxDQUFDLENBQUM7WUFDcEMsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuaW1wb3J0IHR5cGUge0NvbXBpbGF0aW9uSm9ifSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5cbmNvbnN0IFJFUExBQ0VNRU5UUyA9IG5ldyBNYXA8aXIuT3BLaW5kLCBbaXIuT3BLaW5kLCBpci5PcEtpbmRdPihbXG4gIFtpci5PcEtpbmQuRWxlbWVudEVuZCwgW2lyLk9wS2luZC5FbGVtZW50U3RhcnQsIGlyLk9wS2luZC5FbGVtZW50XV0sXG4gIFtpci5PcEtpbmQuQ29udGFpbmVyRW5kLCBbaXIuT3BLaW5kLkNvbnRhaW5lclN0YXJ0LCBpci5PcEtpbmQuQ29udGFpbmVyXV0sXG4gIFtpci5PcEtpbmQuSTE4bkVuZCwgW2lyLk9wS2luZC5JMThuU3RhcnQsIGlyLk9wS2luZC5JMThuXV0sXG5dKTtcblxuLyoqXG4gKiBPcCBraW5kcyB0aGF0IHNob3VsZCBub3QgcHJldmVudCBtZXJnaW5nIG9mIHN0YXJ0L2VuZCBvcHMuXG4gKi9cbmNvbnN0IElHTk9SRURfT1BfS0lORFMgPSBuZXcgU2V0KFtpci5PcEtpbmQuUGlwZV0pO1xuXG4vKipcbiAqIFJlcGxhY2Ugc2VxdWVuY2VzIG9mIG1lcmdhYmxlIGluc3RydWN0aW9ucyAoZS5nLiBgRWxlbWVudFN0YXJ0YCBhbmQgYEVsZW1lbnRFbmRgKSB3aXRoIGFcbiAqIGNvbnNvbGlkYXRlZCBpbnN0cnVjdGlvbiAoZS5nLiBgRWxlbWVudGApLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29sbGFwc2VFbXB0eUluc3RydWN0aW9ucyhqb2I6IENvbXBpbGF0aW9uSm9iKTogdm9pZCB7XG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQuY3JlYXRlKSB7XG4gICAgICAvLyBGaW5kIGVuZCBvcHMgdGhhdCBtYXkgYmUgYWJsZSB0byBiZSBtZXJnZWQuXG4gICAgICBjb25zdCBvcFJlcGxhY2VtZW50cyA9IFJFUExBQ0VNRU5UUy5nZXQob3Aua2luZCk7XG4gICAgICBpZiAob3BSZXBsYWNlbWVudHMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IFtzdGFydEtpbmQsIG1lcmdlZEtpbmRdID0gb3BSZXBsYWNlbWVudHM7XG5cbiAgICAgIC8vIExvY2F0ZSB0aGUgcHJldmlvdXMgKG5vbi1pZ25vcmVkKSBvcC5cbiAgICAgIGxldCBwcmV2T3A6IGlyLkNyZWF0ZU9wIHwgbnVsbCA9IG9wLnByZXY7XG4gICAgICB3aGlsZSAocHJldk9wICE9PSBudWxsICYmIElHTk9SRURfT1BfS0lORFMuaGFzKHByZXZPcC5raW5kKSkge1xuICAgICAgICBwcmV2T3AgPSBwcmV2T3AucHJldjtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgdGhlIHByZXZpb3VzIG9wIGlzIHRoZSBjb3JyZXNwb25kaW5nIHN0YXJ0IG9wLCB3ZSBjYW4gbWVncmUuXG4gICAgICBpZiAocHJldk9wICE9PSBudWxsICYmIHByZXZPcC5raW5kID09PSBzdGFydEtpbmQpIHtcbiAgICAgICAgLy8gVHJhbnNtdXRlIHRoZSBzdGFydCBpbnN0cnVjdGlvbiB0byB0aGUgbWVyZ2VkIHZlcnNpb24uIFRoaXMgaXMgc2FmZSBhcyB0aGV5J3JlIGRlc2lnbmVkXG4gICAgICAgIC8vIHRvIGJlIGlkZW50aWNhbCBhcGFydCBmcm9tIHRoZSBga2luZGAuXG4gICAgICAgIChwcmV2T3AgYXMgaXIuT3A8aXIuQ3JlYXRlT3A+KS5raW5kID0gbWVyZ2VkS2luZDtcblxuICAgICAgICAvLyBSZW1vdmUgdGhlIGVuZCBpbnN0cnVjdGlvbi5cbiAgICAgICAgaXIuT3BMaXN0LnJlbW92ZTxpci5DcmVhdGVPcD4ob3ApO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19