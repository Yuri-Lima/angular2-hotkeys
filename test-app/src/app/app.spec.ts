import { TestBed } from '@angular/core/testing';
import { provideHotkeys, HotkeysService, Hotkey, HotkeyOptions } from 'angular2-hotkeys';

/**
 * Unit-level checks for the public integration surface.
 * HotkeysService is DI-only (`inject(HotkeyOptions)` in constructor) — use
 * TestBed / provideHotkeys, never `new HotkeysService()`.
 * Full browser behavior: `scripts/prove-test-app.mjs` against port 4300.
 */
describe('angular2-hotkeys package integration surface', () => {
  it('exports provideHotkeys, HotkeysService, Hotkey, HotkeyOptions', () => {
    expect(typeof provideHotkeys).toBe('function');
    expect(HotkeysService).toBeTruthy();
    expect(Hotkey).toBeTruthy();
    expect(HotkeyOptions).toBeTruthy();
  });

  it('HotkeysService via provideHotkeys registers default cheatsheet binding', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHotkeys({
          cheatSheetCloseEsc: true,
          cheatSheetDescription: 'Show / hide this help menu',
        }),
      ],
    });
    const service = TestBed.inject(HotkeysService);
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
