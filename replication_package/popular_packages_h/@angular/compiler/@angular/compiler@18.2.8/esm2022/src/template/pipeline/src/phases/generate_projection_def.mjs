/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { parseSelectorToR3Selector } from '../../../../core';
import * as ir from '../../ir';
import { literalOrArrayLiteral } from '../conversion';
/**
 * Locate projection slots, populate the each component's `ngContentSelectors` literal field,
 * populate `project` arguments, and generate the required `projectionDef` instruction for the job's
 * root view.
 */
export function generateProjectionDefs(job) {
    // TODO: Why does TemplateDefinitionBuilder force a shared constant?
    const share = job.compatibility === ir.CompatibilityMode.TemplateDefinitionBuilder;
    // Collect all selectors from this component, and its nested views. Also, assign each projection a
    // unique ascending projection slot index.
    const selectors = [];
    let projectionSlotIndex = 0;
    for (const unit of job.units) {
        for (const op of unit.create) {
            if (op.kind === ir.OpKind.Projection) {
                selectors.push(op.selector);
                op.projectionSlotIndex = projectionSlotIndex++;
            }
        }
    }
    if (selectors.length > 0) {
        // Create the projectionDef array. If we only found a single wildcard selector, then we use the
        // default behavior with no arguments instead.
        let defExpr = null;
        if (selectors.length > 1 || selectors[0] !== '*') {
            const def = selectors.map((s) => (s === '*' ? s : parseSelectorToR3Selector(s)));
            defExpr = job.pool.getConstLiteral(literalOrArrayLiteral(def), share);
        }
        // Create the ngContentSelectors constant.
        job.contentSelectors = job.pool.getConstLiteral(literalOrArrayLiteral(selectors), share);
        // The projection def instruction goes at the beginning of the root view, before any
        // `projection` instructions.
        job.root.create.prepend([ir.createProjectionDefOp(defExpr)]);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVfcHJvamVjdGlvbl9kZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvc3JjL3BoYXNlcy9nZW5lcmF0ZV9wcm9qZWN0aW9uX2RlZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUUzRCxPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUUvQixPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFcEQ7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxzQkFBc0IsQ0FBQyxHQUE0QjtJQUNqRSxvRUFBb0U7SUFDcEUsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLGFBQWEsS0FBSyxFQUFFLENBQUMsaUJBQWlCLENBQUMseUJBQXlCLENBQUM7SUFFbkYsa0dBQWtHO0lBQ2xHLDBDQUEwQztJQUMxQyxNQUFNLFNBQVMsR0FBRyxFQUFFLENBQUM7SUFDckIsSUFBSSxtQkFBbUIsR0FBRyxDQUFDLENBQUM7SUFDNUIsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDN0IsSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQ3JDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUM1QixFQUFFLENBQUMsbUJBQW1CLEdBQUcsbUJBQW1CLEVBQUUsQ0FBQztZQUNqRCxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFFRCxJQUFJLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDekIsK0ZBQStGO1FBQy9GLDhDQUE4QztRQUM5QyxJQUFJLE9BQU8sR0FBd0IsSUFBSSxDQUFDO1FBQ3hDLElBQUksU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO1lBQ2pELE1BQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakYsT0FBTyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3hFLENBQUM7UUFFRCwwQ0FBMEM7UUFDMUMsR0FBRyxDQUFDLGdCQUFnQixHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXpGLG9GQUFvRjtRQUNwRiw2QkFBNkI7UUFDN0IsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvRCxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtwYXJzZVNlbGVjdG9yVG9SM1NlbGVjdG9yfSBmcm9tICcuLi8uLi8uLi8uLi9jb3JlJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vLi4vLi4vLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuaW1wb3J0IHR5cGUge0NvbXBvbmVudENvbXBpbGF0aW9uSm9ifSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5pbXBvcnQge2xpdGVyYWxPckFycmF5TGl0ZXJhbH0gZnJvbSAnLi4vY29udmVyc2lvbic7XG5cbi8qKlxuICogTG9jYXRlIHByb2plY3Rpb24gc2xvdHMsIHBvcHVsYXRlIHRoZSBlYWNoIGNvbXBvbmVudCdzIGBuZ0NvbnRlbnRTZWxlY3RvcnNgIGxpdGVyYWwgZmllbGQsXG4gKiBwb3B1bGF0ZSBgcHJvamVjdGAgYXJndW1lbnRzLCBhbmQgZ2VuZXJhdGUgdGhlIHJlcXVpcmVkIGBwcm9qZWN0aW9uRGVmYCBpbnN0cnVjdGlvbiBmb3IgdGhlIGpvYidzXG4gKiByb290IHZpZXcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZVByb2plY3Rpb25EZWZzKGpvYjogQ29tcG9uZW50Q29tcGlsYXRpb25Kb2IpOiB2b2lkIHtcbiAgLy8gVE9ETzogV2h5IGRvZXMgVGVtcGxhdGVEZWZpbml0aW9uQnVpbGRlciBmb3JjZSBhIHNoYXJlZCBjb25zdGFudD9cbiAgY29uc3Qgc2hhcmUgPSBqb2IuY29tcGF0aWJpbGl0eSA9PT0gaXIuQ29tcGF0aWJpbGl0eU1vZGUuVGVtcGxhdGVEZWZpbml0aW9uQnVpbGRlcjtcblxuICAvLyBDb2xsZWN0IGFsbCBzZWxlY3RvcnMgZnJvbSB0aGlzIGNvbXBvbmVudCwgYW5kIGl0cyBuZXN0ZWQgdmlld3MuIEFsc28sIGFzc2lnbiBlYWNoIHByb2plY3Rpb24gYVxuICAvLyB1bmlxdWUgYXNjZW5kaW5nIHByb2plY3Rpb24gc2xvdCBpbmRleC5cbiAgY29uc3Qgc2VsZWN0b3JzID0gW107XG4gIGxldCBwcm9qZWN0aW9uU2xvdEluZGV4ID0gMDtcbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICAgIGlmIChvcC5raW5kID09PSBpci5PcEtpbmQuUHJvamVjdGlvbikge1xuICAgICAgICBzZWxlY3RvcnMucHVzaChvcC5zZWxlY3Rvcik7XG4gICAgICAgIG9wLnByb2plY3Rpb25TbG90SW5kZXggPSBwcm9qZWN0aW9uU2xvdEluZGV4Kys7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKHNlbGVjdG9ycy5sZW5ndGggPiAwKSB7XG4gICAgLy8gQ3JlYXRlIHRoZSBwcm9qZWN0aW9uRGVmIGFycmF5LiBJZiB3ZSBvbmx5IGZvdW5kIGEgc2luZ2xlIHdpbGRjYXJkIHNlbGVjdG9yLCB0aGVuIHdlIHVzZSB0aGVcbiAgICAvLyBkZWZhdWx0IGJlaGF2aW9yIHdpdGggbm8gYXJndW1lbnRzIGluc3RlYWQuXG4gICAgbGV0IGRlZkV4cHI6IG8uRXhwcmVzc2lvbiB8IG51bGwgPSBudWxsO1xuICAgIGlmIChzZWxlY3RvcnMubGVuZ3RoID4gMSB8fCBzZWxlY3RvcnNbMF0gIT09ICcqJykge1xuICAgICAgY29uc3QgZGVmID0gc2VsZWN0b3JzLm1hcCgocykgPT4gKHMgPT09ICcqJyA/IHMgOiBwYXJzZVNlbGVjdG9yVG9SM1NlbGVjdG9yKHMpKSk7XG4gICAgICBkZWZFeHByID0gam9iLnBvb2wuZ2V0Q29uc3RMaXRlcmFsKGxpdGVyYWxPckFycmF5TGl0ZXJhbChkZWYpLCBzaGFyZSk7XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIHRoZSBuZ0NvbnRlbnRTZWxlY3RvcnMgY29uc3RhbnQuXG4gICAgam9iLmNvbnRlbnRTZWxlY3RvcnMgPSBqb2IucG9vbC5nZXRDb25zdExpdGVyYWwobGl0ZXJhbE9yQXJyYXlMaXRlcmFsKHNlbGVjdG9ycyksIHNoYXJlKTtcblxuICAgIC8vIFRoZSBwcm9qZWN0aW9uIGRlZiBpbnN0cnVjdGlvbiBnb2VzIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIHJvb3QgdmlldywgYmVmb3JlIGFueVxuICAgIC8vIGBwcm9qZWN0aW9uYCBpbnN0cnVjdGlvbnMuXG4gICAgam9iLnJvb3QuY3JlYXRlLnByZXBlbmQoW2lyLmNyZWF0ZVByb2plY3Rpb25EZWZPcChkZWZFeHByKV0pO1xuICB9XG59XG4iXX0=