import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HotkeysCheatsheetComponent } from './hotkeys-cheatsheet.component';
import { HotkeysService } from '../hotkeys.service';
import { HotkeyOptions } from '../hotkey.options';
import { Hotkey } from '../hotkey.model';
import { provideHotkeys } from '../hotkey.providers';

describe('HotkeysCheatsheetComponent', () => {
  let component: HotkeysCheatsheetComponent;
  let fixture: ComponentFixture<HotkeysCheatsheetComponent>;
  let service: HotkeysService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotkeysCheatsheetComponent],
      providers: [
        provideHotkeys({
          cheatSheetCloseEsc: true,
          cheatSheetDescription: 'Show / hide this help menu',
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HotkeysCheatsheetComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(HotkeysService);
    service.add(new Hotkey('ctrl+s', () => false, [], 'Save document'));
    service.add(new Hotkey('ctrl+z', () => false, [], 'Undo'));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start hidden (placeholder container without .in)', () => {
    expect(component.helpVisible()).toBeFalse();
    const el: HTMLElement = fixture.nativeElement.querySelector('.cfp-hotkeys-container');
    expect(el).toBeTruthy();
    expect(el.classList.contains('in')).toBeFalse();
  });

  it('should show when service cheatSheetToggle becomes true and list described hotkeys', fakeAsync(() => {
    service.cheatSheetToggle.set(true);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(component.helpVisible()).toBeTrue();
    expect(component.hotkeys().length).toBeGreaterThanOrEqual(2);
    const el: HTMLElement = fixture.nativeElement.querySelector('.cfp-hotkeys-container');
    expect(el.classList.contains('in')).toBeTrue();
    const rows = fixture.nativeElement.querySelectorAll('tr');
    expect(rows.length).toBeGreaterThanOrEqual(2);
  }));

  it('should hide when toggleCheatSheet is called while open', fakeAsync(() => {
    service.cheatSheetToggle.set(true);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    component.toggleCheatSheet();
    fixture.detectChanges();
    expect(component.helpVisible()).toBeFalse();
  }));

  it('should render the title signal input via setInput', fakeAsync(() => {
    service.cheatSheetToggle.set(true);
    fixture.detectChanges();
    tick();
    fixture.componentRef.setInput('title', 'My Shortcuts');
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('.cfp-hotkeys-title');
    expect(title.textContent).toContain('My Shortcuts');
  }));

  it('should close via the close button click', fakeAsync(() => {
    service.cheatSheetToggle.set(true);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    const closeBtn: HTMLElement = fixture.nativeElement.querySelector('.cfp-hotkeys-close');
    expect(closeBtn).toBeTruthy();
    closeBtn.click();
    fixture.detectChanges();
    expect(component.helpVisible()).toBeFalse();
  }));

  it('should keep cfp-hotkeys CSS class names unchanged', fakeAsync(() => {
    service.cheatSheetToggle.set(true);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement.querySelector('.cfp-hotkeys-container');
    expect(root).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.cfp-hotkeys')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.cfp-hotkeys-title')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.cfp-hotkeys-close')).toBeTruthy();
  }));

  it('should expose linkedSignal hotkeys list that resets when registry changes while open', fakeAsync(() => {
    service.cheatSheetToggle.set(true);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    const before = component.hotkeys().length;
    service.add(new Hotkey('ctrl+y', () => false, [], 'Redo'));
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(component.hotkeys().length).toBeGreaterThanOrEqual(before);
    expect(component.hotkeys().some((h) => h.description === 'Redo')).toBeTrue();
  }));

  it('should load described hotkeys via resource() when open', fakeAsync(() => {
    expect(component.sheetResource.status()).toBe('idle');
    service.cheatSheetToggle.set(true);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(component.sheetResource.hasValue()).toBeTrue();
    expect(component.sheetResource.value()!.length).toBeGreaterThanOrEqual(2);
  }));
});

describe('provideHotkeys', () => {
  it('should provide HotkeysService and options', () => {
    TestBed.configureTestingModule({
      providers: [provideHotkeys({ disableCheatSheet: true })],
    });
    const service = TestBed.inject(HotkeysService);
    const options = TestBed.inject(HotkeyOptions);
    expect(service).toBeTruthy();
    expect(options.disableCheatSheet).toBeTrue();
    expect(service.get('?')).toBeNull();
  });
});
