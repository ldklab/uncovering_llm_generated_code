/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Injectable } from '../di/injectable';
import { InjectionToken } from '../di/injection_token';
import { ComponentFactory as ComponentFactoryR3 } from '../render3/component_ref';
import { getComponentDef, getNgModuleDef } from '../render3/definition';
import { NgModuleFactory as NgModuleFactoryR3 } from '../render3/ng_module_ref';
import { maybeUnwrapFn } from '../render3/util/misc_utils';
import * as i0 from "../r3_symbols";
/**
 * Combination of NgModuleFactory and ComponentFactories.
 *
 * @publicApi
 *
 * @deprecated
 * Ivy JIT mode doesn't require accessing this symbol.
 */
export class ModuleWithComponentFactories {
    constructor(ngModuleFactory, componentFactories) {
        this.ngModuleFactory = ngModuleFactory;
        this.componentFactories = componentFactories;
    }
}
/**
 * Low-level service for running the angular compiler during runtime
 * to create {@link ComponentFactory}s, which
 * can later be used to create and render a Component instance.
 *
 * Each `@NgModule` provides an own `Compiler` to its injector,
 * that will use the directives/pipes of the ng module for compilation
 * of components.
 *
 * @publicApi
 *
 * @deprecated
 * Ivy JIT mode doesn't require accessing this symbol.
 */
export class Compiler {
    /**
     * Compiles the given NgModule and all of its components. All templates of the components
     * have to be inlined.
     */
    compileModuleSync(moduleType) {
        return new NgModuleFactoryR3(moduleType);
    }
    /**
     * Compiles the given NgModule and all of its components
     */
    compileModuleAsync(moduleType) {
        return Promise.resolve(this.compileModuleSync(moduleType));
    }
    /**
     * Same as {@link Compiler#compileModuleSync compileModuleSync} but also creates ComponentFactories for all components.
     */
    compileModuleAndAllComponentsSync(moduleType) {
        const ngModuleFactory = this.compileModuleSync(moduleType);
        const moduleDef = getNgModuleDef(moduleType);
        const componentFactories = maybeUnwrapFn(moduleDef.declarations).reduce((factories, declaration) => {
            const componentDef = getComponentDef(declaration);
            componentDef && factories.push(new ComponentFactoryR3(componentDef));
            return factories;
        }, []);
        return new ModuleWithComponentFactories(ngModuleFactory, componentFactories);
    }
    /**
     * Same as {@link Compiler#compileModuleAsync compileModuleAsync} but also creates ComponentFactories for all components.
     */
    compileModuleAndAllComponentsAsync(moduleType) {
        return Promise.resolve(this.compileModuleAndAllComponentsSync(moduleType));
    }
    /**
     * Clears all caches.
     */
    clearCache() { }
    /**
     * Clears the cache for the given component/ngModule.
     */
    clearCacheFor(type) { }
    /**
     * Returns the id for a given NgModule, if one is defined and known to the compiler.
     */
    getModuleId(moduleType) {
        return undefined;
    }
    static { this.ɵfac = function Compiler_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || Compiler)(); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: Compiler, factory: Compiler.ɵfac, providedIn: 'root' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.setClassMetadata(Compiler, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
/**
 * Token to provide CompilerOptions in the platform injector.
 *
 * @publicApi
 */
export const COMPILER_OPTIONS = new InjectionToken(ngDevMode ? 'compilerOptions' : '');
/**
 * A factory for creating a Compiler
 *
 * @publicApi
 *
 * @deprecated
 * Ivy JIT mode doesn't require accessing this symbol.
 */
export class CompilerFactory {
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9saW5rZXIvY29tcGlsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQzVDLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUtyRCxPQUFPLEVBQUMsZ0JBQWdCLElBQUksa0JBQWtCLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUNoRixPQUFPLEVBQUMsZUFBZSxFQUFFLGNBQWMsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ3RFLE9BQU8sRUFBQyxlQUFlLElBQUksaUJBQWlCLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUM5RSxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sNEJBQTRCLENBQUM7O0FBS3pEOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLE9BQU8sNEJBQTRCO0lBQ3ZDLFlBQ1MsZUFBbUMsRUFDbkMsa0JBQTJDO1FBRDNDLG9CQUFlLEdBQWYsZUFBZSxDQUFvQjtRQUNuQyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXlCO0lBQ2pELENBQUM7Q0FDTDtBQUVEOzs7Ozs7Ozs7Ozs7O0dBYUc7QUFFSCxNQUFNLE9BQU8sUUFBUTtJQUNuQjs7O09BR0c7SUFDSCxpQkFBaUIsQ0FBSSxVQUFtQjtRQUN0QyxPQUFPLElBQUksaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVEOztPQUVHO0lBQ0gsa0JBQWtCLENBQUksVUFBbUI7UUFDdkMsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFRDs7T0FFRztJQUNILGlDQUFpQyxDQUFJLFVBQW1CO1FBQ3RELE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMzRCxNQUFNLFNBQVMsR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFFLENBQUM7UUFDOUMsTUFBTSxrQkFBa0IsR0FBRyxhQUFhLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLE1BQU0sQ0FDckUsQ0FBQyxTQUFrQyxFQUFFLFdBQXNCLEVBQUUsRUFBRTtZQUM3RCxNQUFNLFlBQVksR0FBRyxlQUFlLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDbEQsWUFBWSxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ3JFLE9BQU8sU0FBUyxDQUFDO1FBQ25CLENBQUMsRUFDRCxFQUE2QixDQUM5QixDQUFDO1FBQ0YsT0FBTyxJQUFJLDRCQUE0QixDQUFDLGVBQWUsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0lBQy9FLENBQUM7SUFFRDs7T0FFRztJQUNILGtDQUFrQyxDQUNoQyxVQUFtQjtRQUVuQixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFDN0UsQ0FBQztJQUVEOztPQUVHO0lBQ0gsVUFBVSxLQUFVLENBQUM7SUFFckI7O09BRUc7SUFDSCxhQUFhLENBQUMsSUFBZSxJQUFHLENBQUM7SUFFakM7O09BRUc7SUFDSCxXQUFXLENBQUMsVUFBcUI7UUFDL0IsT0FBTyxTQUFTLENBQUM7SUFDbkIsQ0FBQzt5R0F6RFUsUUFBUTt1RUFBUixRQUFRLFdBQVIsUUFBUSxtQkFESSxNQUFNOztnRkFDbEIsUUFBUTtjQURwQixVQUFVO2VBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDOztBQXdFaEM7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHLElBQUksY0FBYyxDQUNoRCxTQUFTLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQ25DLENBQUM7QUFFRjs7Ozs7OztHQU9HO0FBQ0gsTUFBTSxPQUFnQixlQUFlO0NBRXBDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJy4uL2RpL2luamVjdGFibGUnO1xuaW1wb3J0IHtJbmplY3Rpb25Ub2tlbn0gZnJvbSAnLi4vZGkvaW5qZWN0aW9uX3Rva2VuJztcbmltcG9ydCB7U3RhdGljUHJvdmlkZXJ9IGZyb20gJy4uL2RpL2ludGVyZmFjZS9wcm92aWRlcic7XG5pbXBvcnQge01pc3NpbmdUcmFuc2xhdGlvblN0cmF0ZWd5fSBmcm9tICcuLi9pMThuL3Rva2Vucyc7XG5pbXBvcnQge1R5cGV9IGZyb20gJy4uL2ludGVyZmFjZS90eXBlJztcbmltcG9ydCB7Vmlld0VuY2Fwc3VsYXRpb259IGZyb20gJy4uL21ldGFkYXRhL3ZpZXcnO1xuaW1wb3J0IHtDb21wb25lbnRGYWN0b3J5IGFzIENvbXBvbmVudEZhY3RvcnlSM30gZnJvbSAnLi4vcmVuZGVyMy9jb21wb25lbnRfcmVmJztcbmltcG9ydCB7Z2V0Q29tcG9uZW50RGVmLCBnZXROZ01vZHVsZURlZn0gZnJvbSAnLi4vcmVuZGVyMy9kZWZpbml0aW9uJztcbmltcG9ydCB7TmdNb2R1bGVGYWN0b3J5IGFzIE5nTW9kdWxlRmFjdG9yeVIzfSBmcm9tICcuLi9yZW5kZXIzL25nX21vZHVsZV9yZWYnO1xuaW1wb3J0IHttYXliZVVud3JhcEZufSBmcm9tICcuLi9yZW5kZXIzL3V0aWwvbWlzY191dGlscyc7XG5cbmltcG9ydCB7Q29tcG9uZW50RmFjdG9yeX0gZnJvbSAnLi9jb21wb25lbnRfZmFjdG9yeSc7XG5pbXBvcnQge05nTW9kdWxlRmFjdG9yeX0gZnJvbSAnLi9uZ19tb2R1bGVfZmFjdG9yeSc7XG5cbi8qKlxuICogQ29tYmluYXRpb24gb2YgTmdNb2R1bGVGYWN0b3J5IGFuZCBDb21wb25lbnRGYWN0b3JpZXMuXG4gKlxuICogQHB1YmxpY0FwaVxuICpcbiAqIEBkZXByZWNhdGVkXG4gKiBJdnkgSklUIG1vZGUgZG9lc24ndCByZXF1aXJlIGFjY2Vzc2luZyB0aGlzIHN5bWJvbC5cbiAqL1xuZXhwb3J0IGNsYXNzIE1vZHVsZVdpdGhDb21wb25lbnRGYWN0b3JpZXM8VD4ge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgbmdNb2R1bGVGYWN0b3J5OiBOZ01vZHVsZUZhY3Rvcnk8VD4sXG4gICAgcHVibGljIGNvbXBvbmVudEZhY3RvcmllczogQ29tcG9uZW50RmFjdG9yeTxhbnk+W10sXG4gICkge31cbn1cblxuLyoqXG4gKiBMb3ctbGV2ZWwgc2VydmljZSBmb3IgcnVubmluZyB0aGUgYW5ndWxhciBjb21waWxlciBkdXJpbmcgcnVudGltZVxuICogdG8gY3JlYXRlIHtAbGluayBDb21wb25lbnRGYWN0b3J5fXMsIHdoaWNoXG4gKiBjYW4gbGF0ZXIgYmUgdXNlZCB0byBjcmVhdGUgYW5kIHJlbmRlciBhIENvbXBvbmVudCBpbnN0YW5jZS5cbiAqXG4gKiBFYWNoIGBATmdNb2R1bGVgIHByb3ZpZGVzIGFuIG93biBgQ29tcGlsZXJgIHRvIGl0cyBpbmplY3RvcixcbiAqIHRoYXQgd2lsbCB1c2UgdGhlIGRpcmVjdGl2ZXMvcGlwZXMgb2YgdGhlIG5nIG1vZHVsZSBmb3IgY29tcGlsYXRpb25cbiAqIG9mIGNvbXBvbmVudHMuXG4gKlxuICogQHB1YmxpY0FwaVxuICpcbiAqIEBkZXByZWNhdGVkXG4gKiBJdnkgSklUIG1vZGUgZG9lc24ndCByZXF1aXJlIGFjY2Vzc2luZyB0aGlzIHN5bWJvbC5cbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgQ29tcGlsZXIge1xuICAvKipcbiAgICogQ29tcGlsZXMgdGhlIGdpdmVuIE5nTW9kdWxlIGFuZCBhbGwgb2YgaXRzIGNvbXBvbmVudHMuIEFsbCB0ZW1wbGF0ZXMgb2YgdGhlIGNvbXBvbmVudHNcbiAgICogaGF2ZSB0byBiZSBpbmxpbmVkLlxuICAgKi9cbiAgY29tcGlsZU1vZHVsZVN5bmM8VD4obW9kdWxlVHlwZTogVHlwZTxUPik6IE5nTW9kdWxlRmFjdG9yeTxUPiB7XG4gICAgcmV0dXJuIG5ldyBOZ01vZHVsZUZhY3RvcnlSMyhtb2R1bGVUeXBlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21waWxlcyB0aGUgZ2l2ZW4gTmdNb2R1bGUgYW5kIGFsbCBvZiBpdHMgY29tcG9uZW50c1xuICAgKi9cbiAgY29tcGlsZU1vZHVsZUFzeW5jPFQ+KG1vZHVsZVR5cGU6IFR5cGU8VD4pOiBQcm9taXNlPE5nTW9kdWxlRmFjdG9yeTxUPj4ge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5jb21waWxlTW9kdWxlU3luYyhtb2R1bGVUeXBlKSk7XG4gIH1cblxuICAvKipcbiAgICogU2FtZSBhcyB7QGxpbmsgQ29tcGlsZXIjY29tcGlsZU1vZHVsZVN5bmMgY29tcGlsZU1vZHVsZVN5bmN9IGJ1dCBhbHNvIGNyZWF0ZXMgQ29tcG9uZW50RmFjdG9yaWVzIGZvciBhbGwgY29tcG9uZW50cy5cbiAgICovXG4gIGNvbXBpbGVNb2R1bGVBbmRBbGxDb21wb25lbnRzU3luYzxUPihtb2R1bGVUeXBlOiBUeXBlPFQ+KTogTW9kdWxlV2l0aENvbXBvbmVudEZhY3RvcmllczxUPiB7XG4gICAgY29uc3QgbmdNb2R1bGVGYWN0b3J5ID0gdGhpcy5jb21waWxlTW9kdWxlU3luYyhtb2R1bGVUeXBlKTtcbiAgICBjb25zdCBtb2R1bGVEZWYgPSBnZXROZ01vZHVsZURlZihtb2R1bGVUeXBlKSE7XG4gICAgY29uc3QgY29tcG9uZW50RmFjdG9yaWVzID0gbWF5YmVVbndyYXBGbihtb2R1bGVEZWYuZGVjbGFyYXRpb25zKS5yZWR1Y2UoXG4gICAgICAoZmFjdG9yaWVzOiBDb21wb25lbnRGYWN0b3J5PGFueT5bXSwgZGVjbGFyYXRpb246IFR5cGU8YW55PikgPT4ge1xuICAgICAgICBjb25zdCBjb21wb25lbnREZWYgPSBnZXRDb21wb25lbnREZWYoZGVjbGFyYXRpb24pO1xuICAgICAgICBjb21wb25lbnREZWYgJiYgZmFjdG9yaWVzLnB1c2gobmV3IENvbXBvbmVudEZhY3RvcnlSMyhjb21wb25lbnREZWYpKTtcbiAgICAgICAgcmV0dXJuIGZhY3RvcmllcztcbiAgICAgIH0sXG4gICAgICBbXSBhcyBDb21wb25lbnRGYWN0b3J5PGFueT5bXSxcbiAgICApO1xuICAgIHJldHVybiBuZXcgTW9kdWxlV2l0aENvbXBvbmVudEZhY3RvcmllcyhuZ01vZHVsZUZhY3RvcnksIGNvbXBvbmVudEZhY3Rvcmllcyk7XG4gIH1cblxuICAvKipcbiAgICogU2FtZSBhcyB7QGxpbmsgQ29tcGlsZXIjY29tcGlsZU1vZHVsZUFzeW5jIGNvbXBpbGVNb2R1bGVBc3luY30gYnV0IGFsc28gY3JlYXRlcyBDb21wb25lbnRGYWN0b3JpZXMgZm9yIGFsbCBjb21wb25lbnRzLlxuICAgKi9cbiAgY29tcGlsZU1vZHVsZUFuZEFsbENvbXBvbmVudHNBc3luYzxUPihcbiAgICBtb2R1bGVUeXBlOiBUeXBlPFQ+LFxuICApOiBQcm9taXNlPE1vZHVsZVdpdGhDb21wb25lbnRGYWN0b3JpZXM8VD4+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuY29tcGlsZU1vZHVsZUFuZEFsbENvbXBvbmVudHNTeW5jKG1vZHVsZVR5cGUpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhcnMgYWxsIGNhY2hlcy5cbiAgICovXG4gIGNsZWFyQ2FjaGUoKTogdm9pZCB7fVxuXG4gIC8qKlxuICAgKiBDbGVhcnMgdGhlIGNhY2hlIGZvciB0aGUgZ2l2ZW4gY29tcG9uZW50L25nTW9kdWxlLlxuICAgKi9cbiAgY2xlYXJDYWNoZUZvcih0eXBlOiBUeXBlPGFueT4pIHt9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGlkIGZvciBhIGdpdmVuIE5nTW9kdWxlLCBpZiBvbmUgaXMgZGVmaW5lZCBhbmQga25vd24gdG8gdGhlIGNvbXBpbGVyLlxuICAgKi9cbiAgZ2V0TW9kdWxlSWQobW9kdWxlVHlwZTogVHlwZTxhbnk+KTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgY3JlYXRpbmcgYSBjb21waWxlci5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCB0eXBlIENvbXBpbGVyT3B0aW9ucyA9IHtcbiAgZGVmYXVsdEVuY2Fwc3VsYXRpb24/OiBWaWV3RW5jYXBzdWxhdGlvbjtcbiAgcHJvdmlkZXJzPzogU3RhdGljUHJvdmlkZXJbXTtcbiAgcHJlc2VydmVXaGl0ZXNwYWNlcz86IGJvb2xlYW47XG59O1xuXG4vKipcbiAqIFRva2VuIHRvIHByb3ZpZGUgQ29tcGlsZXJPcHRpb25zIGluIHRoZSBwbGF0Zm9ybSBpbmplY3Rvci5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjb25zdCBDT01QSUxFUl9PUFRJT05TID0gbmV3IEluamVjdGlvblRva2VuPENvbXBpbGVyT3B0aW9uc1tdPihcbiAgbmdEZXZNb2RlID8gJ2NvbXBpbGVyT3B0aW9ucycgOiAnJyxcbik7XG5cbi8qKlxuICogQSBmYWN0b3J5IGZvciBjcmVhdGluZyBhIENvbXBpbGVyXG4gKlxuICogQHB1YmxpY0FwaVxuICpcbiAqIEBkZXByZWNhdGVkXG4gKiBJdnkgSklUIG1vZGUgZG9lc24ndCByZXF1aXJlIGFjY2Vzc2luZyB0aGlzIHN5bWJvbC5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENvbXBpbGVyRmFjdG9yeSB7XG4gIGFic3RyYWN0IGNyZWF0ZUNvbXBpbGVyKG9wdGlvbnM/OiBDb21waWxlck9wdGlvbnNbXSk6IENvbXBpbGVyO1xufVxuIl19