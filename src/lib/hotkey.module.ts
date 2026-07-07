import { ModuleWithProviders, NgModule } from '@angular/core';
import { HotkeysDirective } from './hotkeys.directive';
import { HotkeysCheatsheetComponent } from './hotkeys-cheatsheet/hotkeys-cheatsheet.component';
import { HotkeyOptions, IHotkeyOptions } from './hotkey.options';
import { HotkeysService } from './hotkeys.service';

/**
 * @deprecated Use `provideHotkeys()` with standalone bootstrap, and import
 * `HotkeysDirective` / `HotkeysCheatsheetComponent` directly into components or routes.
 * This module remains for backward compatibility and will be removed in a future major version.
 */
@NgModule({
  imports: [HotkeysDirective, HotkeysCheatsheetComponent],
  exports: [HotkeysDirective, HotkeysCheatsheetComponent],
})
export class HotkeyModule {
  // noinspection JSUnusedGlobalSymbols
  /**
   * @deprecated Prefer `provideHotkeys(options)` in `ApplicationConfig.providers`.
   */
  static forRoot(options: IHotkeyOptions = {}): ModuleWithProviders<HotkeyModule> {
    return {
      ngModule: HotkeyModule,
      providers: [
        { provide: HotkeyOptions, useValue: options },
        HotkeysService,
      ],
    };
  }
}
