/**
 * Zoneless change-detection suite.
 * Proves the library works without zone.js: cheatsheet open/close, hotkey callbacks,
 * pause/unpause, and directive binding all update signal-driven UI.
 */
import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HotkeysCheatsheetComponent } from './hotkeys-cheatsheet/hotkeys-cheatsheet.component';
import { HotkeysDirective } from './hotkeys.directive';
import { HotkeysService } from './hotkeys.service';
import { Hotkey } from './hotkey.model';
import { provideHotkeys } from './hotkey.providers';

@Component({
  standalone: true,
  imports: [HotkeysCheatsheetComponent, HotkeysDirective],
  template: `
    <div id="status">{{ last() }}</div>
    <div id="scoped" [hotkeys]="bindings"></div>
    <hotkeys-cheatsheet title="Zoneless Shortcuts" />
  `,
})
class ZonelessHostComponent {
  readonly last = signal('(none)');
  bindings = [
    {
      'ctrl+k': () => {
        this.last.set('ctrl+k scoped');
        return false;
      },
    },
  ];
}

describe('angular2-hotkeys zoneless mode', () => {
  let fixture: ComponentFixture<ZonelessHostComponent>;
  let service: HotkeysService;
  let host: ZonelessHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZonelessHostComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHotkeys({
          cheatSheetCloseEsc: true,
          cheatSheetDescription: 'Show / hide this help menu',
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ZonelessHostComponent);
    host = fixture.componentInstance;
    service = TestBed.inject(HotkeysService);

    service.add(
      new Hotkey(
        'ctrl+s',
        () => {
          host.last.set('ctrl+s fired');
          return false;
        },
        ['INPUT', 'TEXTAREA'],
        'Save document',
      ),
    );

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('boots without zone.js providers (zoneless CD active)', () => {
    expect(service).toBeTruthy();
    expect(host.last()).toBe('(none)');
  });

  it('fires global hotkey callbacks and updates signals without zone', () => {
    const save = service.get('ctrl+s') as Hotkey;
    expect(save).toBeTruthy();
    save.callback({} as KeyboardEvent, 'ctrl+s');
    fixture.detectChanges();
    expect(host.last()).toBe('ctrl+s fired');
    expect(fixture.nativeElement.querySelector('#status').textContent).toContain('ctrl+s fired');
  });

  it('toggles cheatsheet open via signal and renders overlay (zoneless)', async () => {
    expect(service.cheatSheetToggle()).toBeFalse();
    const help = service.get('?') as Hotkey;
    help.callback({} as KeyboardEvent, '?');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(service.cheatSheetToggle()).toBeTrue();
    const sheet = fixture.debugElement.query(By.directive(HotkeysCheatsheetComponent))
      .componentInstance as HotkeysCheatsheetComponent;
    expect(sheet.helpVisible()).toBeTrue();

    const container: HTMLElement = fixture.nativeElement.querySelector('.cfp-hotkeys-container.in');
    expect(container).toBeTruthy();
  });

  it('closes cheatsheet on Esc callback without zone', async () => {
    service.cheatSheetToggle.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const esc = service.get('esc') as Hotkey;
    esc.callback({} as KeyboardEvent, 'esc');
    fixture.detectChanges();
    expect(service.cheatSheetToggle()).toBeFalse();
  });

  it('pause and unpause update registry under zoneless CD', () => {
    const hk = service.get('ctrl+s') as Hotkey;
    const versionBefore = service.registryVersion();
    service.pause(hk);
    expect(service.get('ctrl+s')).toBeNull();
    expect(service.registryVersion()).toBeGreaterThan(versionBefore);
    service.unpause(hk);
    expect(service.get('ctrl+s')).toBe(hk);
  });

  it('directive binds element-scoped hotkeys under zoneless CD', async () => {
    await fixture.whenStable();
    const dir = fixture.debugElement.query(By.directive(HotkeysDirective)).injector.get(
      HotkeysDirective,
    );
    expect((dir as any).mousetrap).toBeTruthy();
    expect((dir as any).hotkeysList.length).toBe(1);
  });

  it('cheatsheet resource resolves described hotkeys when open (zoneless)', async () => {
    service.cheatSheetToggle.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const sheet = fixture.debugElement.query(By.directive(HotkeysCheatsheetComponent))
      .componentInstance as HotkeysCheatsheetComponent;
    expect(sheet.sheetResource.hasValue()).toBeTrue();
    expect(sheet.hotkeys().length).toBeGreaterThan(0);
  });
});
