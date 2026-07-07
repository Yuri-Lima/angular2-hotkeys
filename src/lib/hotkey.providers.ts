import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { HotkeyOptions, IHotkeyOptions } from './hotkey.options';
import { HotkeysService } from './hotkeys.service';

/**
 * Standalone bootstrap helper for Angular applications using `bootstrapApplication`.
 *
 * @example
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [provideHotkeys({ cheatSheetCloseEsc: true })]
 * });
 * ```
 */
export function provideHotkeys(options: IHotkeyOptions = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: HotkeyOptions, useValue: options },
    { provide: HotkeysService, useFactory: () => HotkeysService.create(options) },
  ]);
}
