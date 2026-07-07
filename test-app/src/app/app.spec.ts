import { provideHotkeys, HotkeysService, Hotkey, HotkeyOptions } from 'angular2-hotkeys';

/**
 * Unit-level checks for the public integration surface.
 * Full DI + browser behavior is verified by the Playwright proof script
 * (`scripts/prove-test-app.mjs`) against `ng serve --port 4300` — Karma's
 * bundler still dual-packages partial-Ivy FESMs in some Angular 20 setups.
 */
describe('angular2-hotkeys package integration surface', () => {
  it('exports provideHotkeys, HotkeysService, Hotkey, HotkeyOptions', () => {
    expect(typeof provideHotkeys).toBe('function');
    expect(HotkeysService).toBeTruthy();
    expect(Hotkey).toBeTruthy();
    expect(HotkeyOptions).toBeTruthy();
  });

  it('HotkeysService.create registers default cheatsheet binding', () => {
    const service = HotkeysService.create({
      cheatSheetCloseEsc: true,
      cheatSheetDescription: 'Show / hide this help menu',
    });
    expect(service.get('?')).toBeTruthy();
    expect(service.get('esc')).toBeTruthy();
    service.add(new Hotkey('ctrl+s', () => false, [], 'Save'));
    service.add(new Hotkey('ctrl+z', () => false, [], 'Undo'));
    expect(service.get('ctrl+s')).toBeTruthy();
    expect(service.get('ctrl+z')).toBeTruthy();
    service.cheatSheetToggle.set(true);
    expect(service.cheatSheetToggle()).toBeTrue();
    service.reset();
  });

  it('provideHotkeys returns EnvironmentProviders', () => {
    const providers = provideHotkeys({ cheatSheetCloseEsc: true });
    expect(providers).toBeTruthy();
    // EnvironmentProviders is an opaque branded object
    expect(typeof providers).toBe('object');
  });
});
