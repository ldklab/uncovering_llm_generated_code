import { PROVIDED_NG_ZONE } from '../change_detection/scheduling/ng_zone_scheduling';
import { ErrorHandler } from '../error_handler';
import { RuntimeError } from '../errors';
import { DEFAULT_LOCALE_ID } from '../i18n/localization';
import { LOCALE_ID } from '../i18n/tokens';
import { ImagePerformanceWarning } from '../image_performance_warning';
import { PLATFORM_DESTROY_LISTENERS } from './platform_destroy_listeners';
import { setLocaleId } from '../render3/i18n/i18n_locale_id';
import { NgZone } from '../zone/ng_zone';
import { ApplicationInitStatus } from '../application/application_init';
import { _callAndReportToErrorHandler, ApplicationRef, remove } from '../application/application_ref';
import { PROVIDED_ZONELESS } from '../change_detection/scheduling/zoneless_scheduling';
import { stringify } from '../util/stringify';
function isApplicationBootstrapConfig(config) {
    return !config.moduleRef;
}
export function bootstrap(config) {
    const envInjector = isApplicationBootstrapConfig(config)
        ? config.r3Injector
        : config.moduleRef.injector;
    const ngZone = envInjector.get(NgZone);
    return ngZone.run(() => {
        if (isApplicationBootstrapConfig(config)) {
            config.r3Injector.resolveInjectorInitializers();
        }
        else {
            config.moduleRef.resolveInjectorInitializers();
        }
        const exceptionHandler = envInjector.get(ErrorHandler, null);
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            if (exceptionHandler === null) {
                const errorMessage = isApplicationBootstrapConfig(config)
                    ? 'No `ErrorHandler` found in the Dependency Injection tree.'
                    : 'No ErrorHandler. Is platform module (BrowserModule) included';
                throw new RuntimeError(402 /* RuntimeErrorCode.MISSING_REQUIRED_INJECTABLE_IN_BOOTSTRAP */, errorMessage);
            }
            if (envInjector.get(PROVIDED_ZONELESS) && envInjector.get(PROVIDED_NG_ZONE)) {
                throw new RuntimeError(408 /* RuntimeErrorCode.PROVIDED_BOTH_ZONE_AND_ZONELESS */, 'Invalid change detection configuration: ' +
                    'provideZoneChangeDetection and provideExperimentalZonelessChangeDetection cannot be used together.');
            }
        }
        let onErrorSubscription;
        ngZone.runOutsideAngular(() => {
            onErrorSubscription = ngZone.onError.subscribe({
                next: (error) => {
                    exceptionHandler.handleError(error);
                },
            });
        });
        // If the whole platform is destroyed, invoke the `destroy` method
        // for all bootstrapped applications as well.
        if (isApplicationBootstrapConfig(config)) {
            const destroyListener = () => envInjector.destroy();
            const onPlatformDestroyListeners = config.platformInjector.get(PLATFORM_DESTROY_LISTENERS);
            onPlatformDestroyListeners.add(destroyListener);
            envInjector.onDestroy(() => {
                onErrorSubscription.unsubscribe();
                onPlatformDestroyListeners.delete(destroyListener);
            });
        }
        else {
            const destroyListener = () => config.moduleRef.destroy();
            const onPlatformDestroyListeners = config.platformInjector.get(PLATFORM_DESTROY_LISTENERS);
            onPlatformDestroyListeners.add(destroyListener);
            config.moduleRef.onDestroy(() => {
                remove(config.allPlatformModules, config.moduleRef);
                onErrorSubscription.unsubscribe();
                onPlatformDestroyListeners.delete(destroyListener);
            });
        }
        return _callAndReportToErrorHandler(exceptionHandler, ngZone, () => {
            const initStatus = envInjector.get(ApplicationInitStatus);
            initStatus.runInitializers();
            return initStatus.donePromise.then(() => {
                // If the `LOCALE_ID` provider is defined at bootstrap then we set the value for ivy
                const localeId = envInjector.get(LOCALE_ID, DEFAULT_LOCALE_ID);
                setLocaleId(localeId || DEFAULT_LOCALE_ID);
                if (typeof ngDevMode === 'undefined' || ngDevMode) {
                    const imagePerformanceService = envInjector.get(ImagePerformanceWarning);
                    imagePerformanceService.start();
                }
                if (isApplicationBootstrapConfig(config)) {
                    const appRef = envInjector.get(ApplicationRef);
                    if (config.rootComponent !== undefined) {
                        appRef.bootstrap(config.rootComponent);
                    }
                    return appRef;
                }
                else {
                    moduleDoBootstrap(config.moduleRef, config.allPlatformModules);
                    return config.moduleRef;
                }
            });
        });
    });
}
function moduleDoBootstrap(moduleRef, allPlatformModules) {
    const appRef = moduleRef.injector.get(ApplicationRef);
    if (moduleRef._bootstrapComponents.length > 0) {
        moduleRef._bootstrapComponents.forEach((f) => appRef.bootstrap(f));
    }
    else if (moduleRef.instance.ngDoBootstrap) {
        moduleRef.instance.ngDoBootstrap(appRef);
    }
    else {
        throw new RuntimeError(-403 /* RuntimeErrorCode.BOOTSTRAP_COMPONENTS_NOT_FOUND */, ngDevMode &&
            `The module ${stringify(moduleRef.instance.constructor)} was bootstrapped, ` +
                `but it does not declare "@NgModule.bootstrap" components nor a "ngDoBootstrap" method. ` +
                `Please define one of these.`);
    }
    allPlatformModules.push(moduleRef);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vdHN0cmFwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcGxhdGZvcm0vYm9vdHN0cmFwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVNBLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLG1EQUFtRCxDQUFDO0FBRW5GLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUM5QyxPQUFPLEVBQUMsWUFBWSxFQUFtQixNQUFNLFdBQVcsQ0FBQztBQUN6RCxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUN2RCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDekMsT0FBTyxFQUFDLHVCQUF1QixFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFFckUsT0FBTyxFQUFDLDBCQUEwQixFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFDeEUsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGdDQUFnQyxDQUFDO0FBQzNELE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUV2QyxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUN0RSxPQUFPLEVBQUMsNEJBQTRCLEVBQUUsY0FBYyxFQUFFLE1BQU0sRUFBQyxNQUFNLGdDQUFnQyxDQUFDO0FBQ3BHLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLG9EQUFvRCxDQUFDO0FBR3JGLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQWdCNUMsU0FBUyw0QkFBNEIsQ0FDbkMsTUFBbUU7SUFFbkUsT0FBTyxDQUFFLE1BQXlDLENBQUMsU0FBUyxDQUFDO0FBQy9ELENBQUM7QUFRRCxNQUFNLFVBQVUsU0FBUyxDQUN2QixNQUE2RDtJQUU3RCxNQUFNLFdBQVcsR0FBRyw0QkFBNEIsQ0FBQyxNQUFNLENBQUM7UUFDdEQsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVO1FBQ25CLENBQUMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztJQUM5QixNQUFNLE1BQU0sR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3ZDLE9BQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUU7UUFDckIsSUFBSSw0QkFBNEIsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1lBQ3pDLE1BQU0sQ0FBQyxVQUFVLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztRQUNsRCxDQUFDO2FBQU0sQ0FBQztZQUNOLE1BQU0sQ0FBQyxTQUFTLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztRQUNqRCxDQUFDO1FBQ0QsTUFBTSxnQkFBZ0IsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM3RCxJQUFJLE9BQU8sU0FBUyxLQUFLLFdBQVcsSUFBSSxTQUFTLEVBQUUsQ0FBQztZQUNsRCxJQUFJLGdCQUFnQixLQUFLLElBQUksRUFBRSxDQUFDO2dCQUM5QixNQUFNLFlBQVksR0FBRyw0QkFBNEIsQ0FBQyxNQUFNLENBQUM7b0JBQ3ZELENBQUMsQ0FBQywyREFBMkQ7b0JBQzdELENBQUMsQ0FBQyw4REFBOEQsQ0FBQztnQkFDbkUsTUFBTSxJQUFJLFlBQVksc0VBRXBCLFlBQVksQ0FDYixDQUFDO1lBQ0osQ0FBQztZQUNELElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDO2dCQUM1RSxNQUFNLElBQUksWUFBWSw2REFFcEIsMENBQTBDO29CQUN4QyxvR0FBb0csQ0FDdkcsQ0FBQztZQUNKLENBQUM7UUFDSCxDQUFDO1FBRUQsSUFBSSxtQkFBaUMsQ0FBQztRQUN0QyxNQUFNLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFO1lBQzVCLG1CQUFtQixHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO2dCQUM3QyxJQUFJLEVBQUUsQ0FBQyxLQUFVLEVBQUUsRUFBRTtvQkFDbkIsZ0JBQWlCLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN2QyxDQUFDO2FBQ0YsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxrRUFBa0U7UUFDbEUsNkNBQTZDO1FBQzdDLElBQUksNEJBQTRCLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztZQUN6QyxNQUFNLGVBQWUsR0FBRyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDcEQsTUFBTSwwQkFBMEIsR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLENBQUM7WUFDM0YsMEJBQTBCLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBRWhELFdBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFO2dCQUN6QixtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDbEMsMEJBQTBCLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ3JELENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQzthQUFNLENBQUM7WUFDTixNQUFNLGVBQWUsR0FBRyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3pELE1BQU0sMEJBQTBCLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1lBQzNGLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUVoRCxNQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7Z0JBQzlCLE1BQU0sQ0FBQyxNQUFNLENBQUMsa0JBQWtCLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUNwRCxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDbEMsMEJBQTBCLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ3JELENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVELE9BQU8sNEJBQTRCLENBQUMsZ0JBQWlCLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRTtZQUNsRSxNQUFNLFVBQVUsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7WUFDMUQsVUFBVSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBRTdCLE9BQU8sVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUN0QyxvRkFBb0Y7Z0JBQ3BGLE1BQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLGlCQUFpQixDQUFDLENBQUM7Z0JBQy9ELFdBQVcsQ0FBQyxRQUFRLElBQUksaUJBQWlCLENBQUMsQ0FBQztnQkFDM0MsSUFBSSxPQUFPLFNBQVMsS0FBSyxXQUFXLElBQUksU0FBUyxFQUFFLENBQUM7b0JBQ2xELE1BQU0sdUJBQXVCLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO29CQUN6RSx1QkFBdUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDbEMsQ0FBQztnQkFFRCxJQUFJLDRCQUE0QixDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7b0JBQ3pDLE1BQU0sTUFBTSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7b0JBQy9DLElBQUksTUFBTSxDQUFDLGFBQWEsS0FBSyxTQUFTLEVBQUUsQ0FBQzt3QkFDdkMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7b0JBQ3pDLENBQUM7b0JBQ0QsT0FBTyxNQUFNLENBQUM7Z0JBQ2hCLENBQUM7cUJBQU0sQ0FBQztvQkFDTixpQkFBaUIsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO29CQUMvRCxPQUFPLE1BQU0sQ0FBQyxTQUFTLENBQUM7Z0JBQzFCLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQsU0FBUyxpQkFBaUIsQ0FDeEIsU0FBbUMsRUFDbkMsa0JBQTBDO0lBRTFDLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ3RELElBQUksU0FBUyxDQUFDLG9CQUFvQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUM5QyxTQUFTLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckUsQ0FBQztTQUFNLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUM1QyxTQUFTLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMzQyxDQUFDO1NBQU0sQ0FBQztRQUNOLE1BQU0sSUFBSSxZQUFZLDZEQUVwQixTQUFTO1lBQ1AsY0FBYyxTQUFTLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMscUJBQXFCO2dCQUMxRSx5RkFBeUY7Z0JBQ3pGLDZCQUE2QixDQUNsQyxDQUFDO0lBQ0osQ0FBQztJQUNELGtCQUFrQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNyQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtTdWJzY3JpcHRpb259IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge1BST1ZJREVEX05HX1pPTkV9IGZyb20gJy4uL2NoYW5nZV9kZXRlY3Rpb24vc2NoZWR1bGluZy9uZ196b25lX3NjaGVkdWxpbmcnO1xuaW1wb3J0IHtFbnZpcm9ubWVudEluamVjdG9yLCBSM0luamVjdG9yfSBmcm9tICcuLi9kaS9yM19pbmplY3Rvcic7XG5pbXBvcnQge0Vycm9ySGFuZGxlcn0gZnJvbSAnLi4vZXJyb3JfaGFuZGxlcic7XG5pbXBvcnQge1J1bnRpbWVFcnJvciwgUnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi4vZXJyb3JzJztcbmltcG9ydCB7REVGQVVMVF9MT0NBTEVfSUR9IGZyb20gJy4uL2kxOG4vbG9jYWxpemF0aW9uJztcbmltcG9ydCB7TE9DQUxFX0lEfSBmcm9tICcuLi9pMThuL3Rva2Vucyc7XG5pbXBvcnQge0ltYWdlUGVyZm9ybWFuY2VXYXJuaW5nfSBmcm9tICcuLi9pbWFnZV9wZXJmb3JtYW5jZV93YXJuaW5nJztcbmltcG9ydCB7VHlwZX0gZnJvbSAnLi4vaW50ZXJmYWNlL3R5cGUnO1xuaW1wb3J0IHtQTEFURk9STV9ERVNUUk9ZX0xJU1RFTkVSU30gZnJvbSAnLi9wbGF0Zm9ybV9kZXN0cm95X2xpc3RlbmVycyc7XG5pbXBvcnQge3NldExvY2FsZUlkfSBmcm9tICcuLi9yZW5kZXIzL2kxOG4vaTE4bl9sb2NhbGVfaWQnO1xuaW1wb3J0IHtOZ1pvbmV9IGZyb20gJy4uL3pvbmUvbmdfem9uZSc7XG5cbmltcG9ydCB7QXBwbGljYXRpb25Jbml0U3RhdHVzfSBmcm9tICcuLi9hcHBsaWNhdGlvbi9hcHBsaWNhdGlvbl9pbml0JztcbmltcG9ydCB7X2NhbGxBbmRSZXBvcnRUb0Vycm9ySGFuZGxlciwgQXBwbGljYXRpb25SZWYsIHJlbW92ZX0gZnJvbSAnLi4vYXBwbGljYXRpb24vYXBwbGljYXRpb25fcmVmJztcbmltcG9ydCB7UFJPVklERURfWk9ORUxFU1N9IGZyb20gJy4uL2NoYW5nZV9kZXRlY3Rpb24vc2NoZWR1bGluZy96b25lbGVzc19zY2hlZHVsaW5nJztcbmltcG9ydCB7SW5qZWN0b3J9IGZyb20gJy4uL2RpJztcbmltcG9ydCB7SW50ZXJuYWxOZ01vZHVsZVJlZiwgTmdNb2R1bGVSZWZ9IGZyb20gJy4uL2xpbmtlci9uZ19tb2R1bGVfZmFjdG9yeSc7XG5pbXBvcnQge3N0cmluZ2lmeX0gZnJvbSAnLi4vdXRpbC9zdHJpbmdpZnknO1xuXG5leHBvcnQgaW50ZXJmYWNlIEJvb3RzdHJhcENvbmZpZyB7XG4gIHBsYXRmb3JtSW5qZWN0b3I6IEluamVjdG9yO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE1vZHVsZUJvb3RzdHJhcENvbmZpZzxNPiBleHRlbmRzIEJvb3RzdHJhcENvbmZpZyB7XG4gIG1vZHVsZVJlZjogSW50ZXJuYWxOZ01vZHVsZVJlZjxNPjtcbiAgYWxsUGxhdGZvcm1Nb2R1bGVzOiBOZ01vZHVsZVJlZjx1bmtub3duPltdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFwcGxpY2F0aW9uQm9vdHN0cmFwQ29uZmlnIGV4dGVuZHMgQm9vdHN0cmFwQ29uZmlnIHtcbiAgcjNJbmplY3RvcjogUjNJbmplY3RvcjtcbiAgcm9vdENvbXBvbmVudDogVHlwZTx1bmtub3duPiB8IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gaXNBcHBsaWNhdGlvbkJvb3RzdHJhcENvbmZpZyhcbiAgY29uZmlnOiBBcHBsaWNhdGlvbkJvb3RzdHJhcENvbmZpZyB8IE1vZHVsZUJvb3RzdHJhcENvbmZpZzx1bmtub3duPixcbik6IGNvbmZpZyBpcyBBcHBsaWNhdGlvbkJvb3RzdHJhcENvbmZpZyB7XG4gIHJldHVybiAhKGNvbmZpZyBhcyBNb2R1bGVCb290c3RyYXBDb25maWc8dW5rbm93bj4pLm1vZHVsZVJlZjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJvb3RzdHJhcDxNPihcbiAgbW9kdWxlQm9vdHN0cmFwQ29uZmlnOiBNb2R1bGVCb290c3RyYXBDb25maWc8TT4sXG4pOiBQcm9taXNlPE5nTW9kdWxlUmVmPE0+PjtcbmV4cG9ydCBmdW5jdGlvbiBib290c3RyYXAoXG4gIGFwcGxpY2F0aW9uQm9vdHN0cmFwQ29uZmlnOiBBcHBsaWNhdGlvbkJvb3RzdHJhcENvbmZpZyxcbik6IFByb21pc2U8QXBwbGljYXRpb25SZWY+O1xuZXhwb3J0IGZ1bmN0aW9uIGJvb3RzdHJhcDxNPihcbiAgY29uZmlnOiBNb2R1bGVCb290c3RyYXBDb25maWc8TT4gfCBBcHBsaWNhdGlvbkJvb3RzdHJhcENvbmZpZyxcbik6IFByb21pc2U8QXBwbGljYXRpb25SZWY+IHwgUHJvbWlzZTxOZ01vZHVsZVJlZjxNPj4ge1xuICBjb25zdCBlbnZJbmplY3RvciA9IGlzQXBwbGljYXRpb25Cb290c3RyYXBDb25maWcoY29uZmlnKVxuICAgID8gY29uZmlnLnIzSW5qZWN0b3JcbiAgICA6IGNvbmZpZy5tb2R1bGVSZWYuaW5qZWN0b3I7XG4gIGNvbnN0IG5nWm9uZSA9IGVudkluamVjdG9yLmdldChOZ1pvbmUpO1xuICByZXR1cm4gbmdab25lLnJ1bigoKSA9PiB7XG4gICAgaWYgKGlzQXBwbGljYXRpb25Cb290c3RyYXBDb25maWcoY29uZmlnKSkge1xuICAgICAgY29uZmlnLnIzSW5qZWN0b3IucmVzb2x2ZUluamVjdG9ySW5pdGlhbGl6ZXJzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbmZpZy5tb2R1bGVSZWYucmVzb2x2ZUluamVjdG9ySW5pdGlhbGl6ZXJzKCk7XG4gICAgfVxuICAgIGNvbnN0IGV4Y2VwdGlvbkhhbmRsZXIgPSBlbnZJbmplY3Rvci5nZXQoRXJyb3JIYW5kbGVyLCBudWxsKTtcbiAgICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgICBpZiAoZXhjZXB0aW9uSGFuZGxlciA9PT0gbnVsbCkge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBpc0FwcGxpY2F0aW9uQm9vdHN0cmFwQ29uZmlnKGNvbmZpZylcbiAgICAgICAgICA/ICdObyBgRXJyb3JIYW5kbGVyYCBmb3VuZCBpbiB0aGUgRGVwZW5kZW5jeSBJbmplY3Rpb24gdHJlZS4nXG4gICAgICAgICAgOiAnTm8gRXJyb3JIYW5kbGVyLiBJcyBwbGF0Zm9ybSBtb2R1bGUgKEJyb3dzZXJNb2R1bGUpIGluY2x1ZGVkJztcbiAgICAgICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLk1JU1NJTkdfUkVRVUlSRURfSU5KRUNUQUJMRV9JTl9CT09UU1RSQVAsXG4gICAgICAgICAgZXJyb3JNZXNzYWdlLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgaWYgKGVudkluamVjdG9yLmdldChQUk9WSURFRF9aT05FTEVTUykgJiYgZW52SW5qZWN0b3IuZ2V0KFBST1ZJREVEX05HX1pPTkUpKSB7XG4gICAgICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgICAgUnVudGltZUVycm9yQ29kZS5QUk9WSURFRF9CT1RIX1pPTkVfQU5EX1pPTkVMRVNTLFxuICAgICAgICAgICdJbnZhbGlkIGNoYW5nZSBkZXRlY3Rpb24gY29uZmlndXJhdGlvbjogJyArXG4gICAgICAgICAgICAncHJvdmlkZVpvbmVDaGFuZ2VEZXRlY3Rpb24gYW5kIHByb3ZpZGVFeHBlcmltZW50YWxab25lbGVzc0NoYW5nZURldGVjdGlvbiBjYW5ub3QgYmUgdXNlZCB0b2dldGhlci4nLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBvbkVycm9yU3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb247XG4gICAgbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIG9uRXJyb3JTdWJzY3JpcHRpb24gPSBuZ1pvbmUub25FcnJvci5zdWJzY3JpYmUoe1xuICAgICAgICBuZXh0OiAoZXJyb3I6IGFueSkgPT4ge1xuICAgICAgICAgIGV4Y2VwdGlvbkhhbmRsZXIhLmhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gSWYgdGhlIHdob2xlIHBsYXRmb3JtIGlzIGRlc3Ryb3llZCwgaW52b2tlIHRoZSBgZGVzdHJveWAgbWV0aG9kXG4gICAgLy8gZm9yIGFsbCBib290c3RyYXBwZWQgYXBwbGljYXRpb25zIGFzIHdlbGwuXG4gICAgaWYgKGlzQXBwbGljYXRpb25Cb290c3RyYXBDb25maWcoY29uZmlnKSkge1xuICAgICAgY29uc3QgZGVzdHJveUxpc3RlbmVyID0gKCkgPT4gZW52SW5qZWN0b3IuZGVzdHJveSgpO1xuICAgICAgY29uc3Qgb25QbGF0Zm9ybURlc3Ryb3lMaXN0ZW5lcnMgPSBjb25maWcucGxhdGZvcm1JbmplY3Rvci5nZXQoUExBVEZPUk1fREVTVFJPWV9MSVNURU5FUlMpO1xuICAgICAgb25QbGF0Zm9ybURlc3Ryb3lMaXN0ZW5lcnMuYWRkKGRlc3Ryb3lMaXN0ZW5lcik7XG5cbiAgICAgIGVudkluamVjdG9yLm9uRGVzdHJveSgoKSA9PiB7XG4gICAgICAgIG9uRXJyb3JTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgb25QbGF0Zm9ybURlc3Ryb3lMaXN0ZW5lcnMuZGVsZXRlKGRlc3Ryb3lMaXN0ZW5lcik7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZGVzdHJveUxpc3RlbmVyID0gKCkgPT4gY29uZmlnLm1vZHVsZVJlZi5kZXN0cm95KCk7XG4gICAgICBjb25zdCBvblBsYXRmb3JtRGVzdHJveUxpc3RlbmVycyA9IGNvbmZpZy5wbGF0Zm9ybUluamVjdG9yLmdldChQTEFURk9STV9ERVNUUk9ZX0xJU1RFTkVSUyk7XG4gICAgICBvblBsYXRmb3JtRGVzdHJveUxpc3RlbmVycy5hZGQoZGVzdHJveUxpc3RlbmVyKTtcblxuICAgICAgY29uZmlnLm1vZHVsZVJlZi5vbkRlc3Ryb3koKCkgPT4ge1xuICAgICAgICByZW1vdmUoY29uZmlnLmFsbFBsYXRmb3JtTW9kdWxlcywgY29uZmlnLm1vZHVsZVJlZik7XG4gICAgICAgIG9uRXJyb3JTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgb25QbGF0Zm9ybURlc3Ryb3lMaXN0ZW5lcnMuZGVsZXRlKGRlc3Ryb3lMaXN0ZW5lcik7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gX2NhbGxBbmRSZXBvcnRUb0Vycm9ySGFuZGxlcihleGNlcHRpb25IYW5kbGVyISwgbmdab25lLCAoKSA9PiB7XG4gICAgICBjb25zdCBpbml0U3RhdHVzID0gZW52SW5qZWN0b3IuZ2V0KEFwcGxpY2F0aW9uSW5pdFN0YXR1cyk7XG4gICAgICBpbml0U3RhdHVzLnJ1bkluaXRpYWxpemVycygpO1xuXG4gICAgICByZXR1cm4gaW5pdFN0YXR1cy5kb25lUHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgICAgLy8gSWYgdGhlIGBMT0NBTEVfSURgIHByb3ZpZGVyIGlzIGRlZmluZWQgYXQgYm9vdHN0cmFwIHRoZW4gd2Ugc2V0IHRoZSB2YWx1ZSBmb3IgaXZ5XG4gICAgICAgIGNvbnN0IGxvY2FsZUlkID0gZW52SW5qZWN0b3IuZ2V0KExPQ0FMRV9JRCwgREVGQVVMVF9MT0NBTEVfSUQpO1xuICAgICAgICBzZXRMb2NhbGVJZChsb2NhbGVJZCB8fCBERUZBVUxUX0xPQ0FMRV9JRCk7XG4gICAgICAgIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcbiAgICAgICAgICBjb25zdCBpbWFnZVBlcmZvcm1hbmNlU2VydmljZSA9IGVudkluamVjdG9yLmdldChJbWFnZVBlcmZvcm1hbmNlV2FybmluZyk7XG4gICAgICAgICAgaW1hZ2VQZXJmb3JtYW5jZVNlcnZpY2Uuc3RhcnQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc0FwcGxpY2F0aW9uQm9vdHN0cmFwQ29uZmlnKGNvbmZpZykpIHtcbiAgICAgICAgICBjb25zdCBhcHBSZWYgPSBlbnZJbmplY3Rvci5nZXQoQXBwbGljYXRpb25SZWYpO1xuICAgICAgICAgIGlmIChjb25maWcucm9vdENvbXBvbmVudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBhcHBSZWYuYm9vdHN0cmFwKGNvbmZpZy5yb290Q29tcG9uZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGFwcFJlZjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtb2R1bGVEb0Jvb3RzdHJhcChjb25maWcubW9kdWxlUmVmLCBjb25maWcuYWxsUGxhdGZvcm1Nb2R1bGVzKTtcbiAgICAgICAgICByZXR1cm4gY29uZmlnLm1vZHVsZVJlZjtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBtb2R1bGVEb0Jvb3RzdHJhcChcbiAgbW9kdWxlUmVmOiBJbnRlcm5hbE5nTW9kdWxlUmVmPGFueT4sXG4gIGFsbFBsYXRmb3JtTW9kdWxlczogTmdNb2R1bGVSZWY8dW5rbm93bj5bXSxcbik6IHZvaWQge1xuICBjb25zdCBhcHBSZWYgPSBtb2R1bGVSZWYuaW5qZWN0b3IuZ2V0KEFwcGxpY2F0aW9uUmVmKTtcbiAgaWYgKG1vZHVsZVJlZi5fYm9vdHN0cmFwQ29tcG9uZW50cy5sZW5ndGggPiAwKSB7XG4gICAgbW9kdWxlUmVmLl9ib290c3RyYXBDb21wb25lbnRzLmZvckVhY2goKGYpID0+IGFwcFJlZi5ib290c3RyYXAoZikpO1xuICB9IGVsc2UgaWYgKG1vZHVsZVJlZi5pbnN0YW5jZS5uZ0RvQm9vdHN0cmFwKSB7XG4gICAgbW9kdWxlUmVmLmluc3RhbmNlLm5nRG9Cb290c3RyYXAoYXBwUmVmKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5CT09UU1RSQVBfQ09NUE9ORU5UU19OT1RfRk9VTkQsXG4gICAgICBuZ0Rldk1vZGUgJiZcbiAgICAgICAgYFRoZSBtb2R1bGUgJHtzdHJpbmdpZnkobW9kdWxlUmVmLmluc3RhbmNlLmNvbnN0cnVjdG9yKX0gd2FzIGJvb3RzdHJhcHBlZCwgYCArXG4gICAgICAgICAgYGJ1dCBpdCBkb2VzIG5vdCBkZWNsYXJlIFwiQE5nTW9kdWxlLmJvb3RzdHJhcFwiIGNvbXBvbmVudHMgbm9yIGEgXCJuZ0RvQm9vdHN0cmFwXCIgbWV0aG9kLiBgICtcbiAgICAgICAgICBgUGxlYXNlIGRlZmluZSBvbmUgb2YgdGhlc2UuYCxcbiAgICApO1xuICB9XG4gIGFsbFBsYXRmb3JtTW9kdWxlcy5wdXNoKG1vZHVsZVJlZik7XG59XG4iXX0=