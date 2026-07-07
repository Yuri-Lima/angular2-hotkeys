import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHotkeys, HotkeysService, Hotkey, HotkeyOptions } from 'angular2-hotkeys';
import { App } from './app';
import { ActionLogService } from './action-log.service';

/**
 * Unit-level checks for the public integration surface + demo shell.
 * HotkeysService is DI-only — use TestBed / provideHotkeys, never `new HotkeysService()`.
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
    expect(typeof providers).toBe('object');
  });
});

describe('App use-case shell', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideZonelessChangeDetection(),
        provideHotkeys({ cheatSheetCloseEsc: true }),
        ActionLogService,
      ],
    }).compileComponents();
  });

  it('creates and registers app-wide ctrl+s / ctrl+z', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const service = TestBed.inject(HotkeysService);
    expect(service.get('ctrl+s')).toBeTruthy();
    expect(service.get('ctrl+z')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('test-app');
  });

  it('mounts all use-case host elements', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('[data-usecase="allow-in"]')).toBeTruthy();
    expect(el.querySelector('[data-usecase="modal-pause"]')).toBeTruthy();
    expect(el.querySelector('[data-usecase="feature-inbox"]')).toBeTruthy();
    expect(el.querySelector('[data-usecase="command-palette"]')).toBeTruthy();
    expect(el.querySelector('[data-usecase="multi-panel"]')).toBeTruthy();
  });

  it('unmounts feature inbox and removes lifecycle bindings', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const service = TestBed.inject(HotkeysService);
    expect(service.get('j')).toBeTruthy();
    fixture.componentInstance.toggleInbox();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#inbox-unmounted')).toBeTruthy();
    expect(service.get('j')).toBeNull();
  });
});
