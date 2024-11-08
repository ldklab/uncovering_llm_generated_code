/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { formatI18nPlaceholderName } from './util';
class IcuSerializerVisitor {
    visitText(text) {
        return text.value;
    }
    visitContainer(container) {
        return container.children.map((child) => child.visit(this)).join('');
    }
    visitIcu(icu) {
        const strCases = Object.keys(icu.cases).map((k) => `${k} {${icu.cases[k].visit(this)}}`);
        const result = `{${icu.expressionPlaceholder}, ${icu.type}, ${strCases.join(' ')}}`;
        return result;
    }
    visitTagPlaceholder(ph) {
        return ph.isVoid
            ? this.formatPh(ph.startName)
            : `${this.formatPh(ph.startName)}${ph.children.map((child) => child.visit(this)).join('')}${this.formatPh(ph.closeName)}`;
    }
    visitPlaceholder(ph) {
        return this.formatPh(ph.name);
    }
    visitBlockPlaceholder(ph) {
        return `${this.formatPh(ph.startName)}${ph.children.map((child) => child.visit(this)).join('')}${this.formatPh(ph.closeName)}`;
    }
    visitIcuPlaceholder(ph, context) {
        return this.formatPh(ph.name);
    }
    formatPh(value) {
        return `{${formatI18nPlaceholderName(value, /* useCamelCase */ false)}}`;
    }
}
const serializer = new IcuSerializerVisitor();
export function serializeIcuNode(icu) {
    return icu.visit(serializer);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWN1X3NlcmlhbGl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvcmVuZGVyMy92aWV3L2kxOG4vaWN1X3NlcmlhbGl6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBSUgsT0FBTyxFQUFDLHlCQUF5QixFQUFDLE1BQU0sUUFBUSxDQUFDO0FBRWpELE1BQU0sb0JBQW9CO0lBQ3hCLFNBQVMsQ0FBQyxJQUFlO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztJQUNwQixDQUFDO0lBRUQsY0FBYyxDQUFDLFNBQXlCO1FBQ3RDLE9BQU8sU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDdkUsQ0FBQztJQUVELFFBQVEsQ0FBQyxHQUFhO1FBQ3BCLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FDekMsQ0FBQyxDQUFTLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQ3BELENBQUM7UUFDRixNQUFNLE1BQU0sR0FBRyxJQUFJLEdBQUcsQ0FBQyxxQkFBcUIsS0FBSyxHQUFHLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQztRQUNwRixPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBRUQsbUJBQW1CLENBQUMsRUFBdUI7UUFDekMsT0FBTyxFQUFFLENBQUMsTUFBTTtZQUNkLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUM7WUFDN0IsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FDckcsRUFBRSxDQUFDLFNBQVMsQ0FDYixFQUFFLENBQUM7SUFDVixDQUFDO0lBRUQsZ0JBQWdCLENBQUMsRUFBb0I7UUFDbkMsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRUQscUJBQXFCLENBQUMsRUFBeUI7UUFDN0MsT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQzVHLEVBQUUsQ0FBQyxTQUFTLENBQ2IsRUFBRSxDQUFDO0lBQ04sQ0FBQztJQUVELG1CQUFtQixDQUFDLEVBQXVCLEVBQUUsT0FBYTtRQUN4RCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFTyxRQUFRLENBQUMsS0FBYTtRQUM1QixPQUFPLElBQUkseUJBQXlCLENBQUMsS0FBSyxFQUFFLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7SUFDM0UsQ0FBQztDQUNGO0FBRUQsTUFBTSxVQUFVLEdBQUcsSUFBSSxvQkFBb0IsRUFBRSxDQUFDO0FBQzlDLE1BQU0sVUFBVSxnQkFBZ0IsQ0FBQyxHQUFhO0lBQzVDLE9BQU8sR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUMvQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBpMThuIGZyb20gJy4uLy4uLy4uL2kxOG4vaTE4bl9hc3QnO1xuXG5pbXBvcnQge2Zvcm1hdEkxOG5QbGFjZWhvbGRlck5hbWV9IGZyb20gJy4vdXRpbCc7XG5cbmNsYXNzIEljdVNlcmlhbGl6ZXJWaXNpdG9yIGltcGxlbWVudHMgaTE4bi5WaXNpdG9yIHtcbiAgdmlzaXRUZXh0KHRleHQ6IGkxOG4uVGV4dCk6IGFueSB7XG4gICAgcmV0dXJuIHRleHQudmFsdWU7XG4gIH1cblxuICB2aXNpdENvbnRhaW5lcihjb250YWluZXI6IGkxOG4uQ29udGFpbmVyKTogYW55IHtcbiAgICByZXR1cm4gY29udGFpbmVyLmNoaWxkcmVuLm1hcCgoY2hpbGQpID0+IGNoaWxkLnZpc2l0KHRoaXMpKS5qb2luKCcnKTtcbiAgfVxuXG4gIHZpc2l0SWN1KGljdTogaTE4bi5JY3UpOiBhbnkge1xuICAgIGNvbnN0IHN0ckNhc2VzID0gT2JqZWN0LmtleXMoaWN1LmNhc2VzKS5tYXAoXG4gICAgICAoazogc3RyaW5nKSA9PiBgJHtrfSB7JHtpY3UuY2FzZXNba10udmlzaXQodGhpcyl9fWAsXG4gICAgKTtcbiAgICBjb25zdCByZXN1bHQgPSBgeyR7aWN1LmV4cHJlc3Npb25QbGFjZWhvbGRlcn0sICR7aWN1LnR5cGV9LCAke3N0ckNhc2VzLmpvaW4oJyAnKX19YDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgdmlzaXRUYWdQbGFjZWhvbGRlcihwaDogaTE4bi5UYWdQbGFjZWhvbGRlcik6IGFueSB7XG4gICAgcmV0dXJuIHBoLmlzVm9pZFxuICAgICAgPyB0aGlzLmZvcm1hdFBoKHBoLnN0YXJ0TmFtZSlcbiAgICAgIDogYCR7dGhpcy5mb3JtYXRQaChwaC5zdGFydE5hbWUpfSR7cGguY2hpbGRyZW4ubWFwKChjaGlsZCkgPT4gY2hpbGQudmlzaXQodGhpcykpLmpvaW4oJycpfSR7dGhpcy5mb3JtYXRQaChcbiAgICAgICAgICBwaC5jbG9zZU5hbWUsXG4gICAgICAgICl9YDtcbiAgfVxuXG4gIHZpc2l0UGxhY2Vob2xkZXIocGg6IGkxOG4uUGxhY2Vob2xkZXIpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLmZvcm1hdFBoKHBoLm5hbWUpO1xuICB9XG5cbiAgdmlzaXRCbG9ja1BsYWNlaG9sZGVyKHBoOiBpMThuLkJsb2NrUGxhY2Vob2xkZXIpOiBhbnkge1xuICAgIHJldHVybiBgJHt0aGlzLmZvcm1hdFBoKHBoLnN0YXJ0TmFtZSl9JHtwaC5jaGlsZHJlbi5tYXAoKGNoaWxkKSA9PiBjaGlsZC52aXNpdCh0aGlzKSkuam9pbignJyl9JHt0aGlzLmZvcm1hdFBoKFxuICAgICAgcGguY2xvc2VOYW1lLFxuICAgICl9YDtcbiAgfVxuXG4gIHZpc2l0SWN1UGxhY2Vob2xkZXIocGg6IGkxOG4uSWN1UGxhY2Vob2xkZXIsIGNvbnRleHQ/OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLmZvcm1hdFBoKHBoLm5hbWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBmb3JtYXRQaCh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYHske2Zvcm1hdEkxOG5QbGFjZWhvbGRlck5hbWUodmFsdWUsIC8qIHVzZUNhbWVsQ2FzZSAqLyBmYWxzZSl9fWA7XG4gIH1cbn1cblxuY29uc3Qgc2VyaWFsaXplciA9IG5ldyBJY3VTZXJpYWxpemVyVmlzaXRvcigpO1xuZXhwb3J0IGZ1bmN0aW9uIHNlcmlhbGl6ZUljdU5vZGUoaWN1OiBpMThuLkljdSk6IHN0cmluZyB7XG4gIHJldHVybiBpY3UudmlzaXQoc2VyaWFsaXplcik7XG59XG4iXX0=