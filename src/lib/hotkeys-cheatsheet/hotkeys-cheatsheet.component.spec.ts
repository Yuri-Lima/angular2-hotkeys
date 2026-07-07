import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HotkeysCheatsheetComponent } from './hotkeys-cheatsheet.component';
import { HotkeysService } from '../hotkeys.service';
import { HotkeyOptions } from '../hotkey.options';
import { Hotkey } from '../hotkey.model';
import { provideHotkeys } from '../hotkey.providers';

describe('HotkeysCheatsheetComponent', () => {
  let component: HotkeysCheatsheetComponent;
  let fixture: ComponentFixture<HotkeysCheatsheetComponent>;
  let service: HotkeysService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HotkeysCheatsheetComponent],
      providers: [
        provideHotkeys({
          cheatSheetCloseEsc: true,
          cheatSheetDescription: 'Show / hide this help menu',
        }),
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
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

  it('should start hidden', () => {
    expect(component.helpVisible()).toBeFalse();
    const el: HTMLElement = fixture.nativeElement.querySelector('.cfp-hotkeys-container');
    expect(el.classList.contains('in')).toBeFalse();
  });

  it('should show when service cheatSheetToggle becomes true and list described hotkeys', () => {
    service.cheatSheetToggle.set(true);
    fixture.detectChanges();
    expect(component.helpVisible()).toBeTrue();
    expect(component.hotkeys().length).toBeGreaterThanOrEqual(2);
    const el: HTMLElement = fixture.nativeElement.querySelector('.cfp-hotkeys-container');
    expect(el.classList.contains('in')).toBeTrue();
    const rows = fixture.nativeElement.querySelectorAll('tr');
    expect(rows.length).toBeGreaterThanOrEqual(2);
  });

  it('should hide when toggleCheatSheet is called while open', () => {
    service.cheatSheetToggle.set(true);
    fixture.detectChanges();
    component.toggleCheatSheet();
    fixture.detectChanges();
    expect(component.helpVisible()).toBeFalse();
  });

  it('should render the title input', () => {
    component.title = 'My Shortcuts';
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('.cfp-hotkeys-title');
    expect(title.textContent).toContain('My Shortcuts');
  });

  it('should close via the close button click', () => {
    service.cheatSheetToggle.set(true);
    fixture.detectChanges();
    const closeBtn: HTMLElement = fixture.nativeElement.querySelector('.cfp-hotkeys-close');
    closeBtn.click();
    fixture.detectChanges();
    expect(component.helpVisible()).toBeFalse();
  });

  it('should keep cfp-hotkeys CSS class names unchanged', () => {
    const root: HTMLElement = fixture.nativeElement.querySelector('.cfp-hotkeys-container');
    expect(root).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.cfp-hotkeys')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.cfp-hotkeys-title')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.cfp-hotkeys-close')).toBeTruthy();
  });
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
    // no default ? binding when disableCheatSheet is true
    expect(service.get('?')).toBeNull();
  });
});
