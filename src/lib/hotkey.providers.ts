import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { HotkeyOptions, IHotkeyOptions } from './hotkey.options';
import { HotkeysService } from './hotkeys.service';

/**
 * Standalone bootstrap helper for Angular applications using `bootstrapApplication`.
 *
 * Registers {@link HotkeyOptions} then {@link HotkeysService} as a **class provider**
 * so the service can use `inject(HotkeyOptions)` in its constructor (injection context).
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
    HotkeysService,
  ]);
}
