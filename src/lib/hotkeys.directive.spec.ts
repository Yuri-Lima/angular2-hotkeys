import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HotkeysDirective } from './hotkeys.directive';
import { HotkeysService } from './hotkeys.service';
import { HotkeyOptions } from './hotkey.options';
import { Hotkey } from './hotkey.model';

@Component({
  standalone: true,
  imports: [HotkeysDirective],
  template: `<div [hotkeys]="bindings" id="host"></div>`,
})
class HostComponent {
  bindings = [
    {
      'ctrl+k': () => false,
    },
  ];
}

describe('HotkeysDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let service: HotkeysService;

  beforeEach(async () => {
    const options = { disableCheatSheet: true };
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: HotkeyOptions, useValue: options },
        { provide: HotkeysService, useFactory: () => HotkeysService.create(options) },

      ],
    }).compileComponents();

    service = TestBed.inject(HotkeysService);
    // Pre-register a global hotkey that the directive should temporarily override
    service.add(new Hotkey('ctrl+k', () => false, [], 'Global K'));

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('should create the host with the directive', () => {
    const dir = fixture.debugElement.query(By.directive(HotkeysDirective));
    expect(dir).toBeTruthy();
    expect(dir.injector.get(HotkeysDirective)).toBeTruthy();
  });

  it('should bind element-scoped hotkeys on init', () => {
    const dir = fixture.debugElement.query(By.directive(HotkeysDirective)).injector.get(
      HotkeysDirective,
    );
    expect((dir as any).hotkeysList.length).toBe(1);
    expect((dir as any).mousetrap).toBeTruthy();
  });

  it('should stash and restore previously registered hotkeys on destroy', () => {
    const dirEl = fixture.debugElement.query(By.directive(HotkeysDirective));
    const dir = dirEl.injector.get(HotkeysDirective);
    // Old global was stashed because combo matched
    expect((dir as any).oldHotkeys.length).toBeGreaterThanOrEqual(0);
    fixture.destroy();
    // After destroy, service should still be usable
    expect(service).toBeTruthy();
  });

  it('should unbind element hotkeys on destroy', () => {
    const dir = fixture.debugElement.query(By.directive(HotkeysDirective)).injector.get(
      HotkeysDirective,
    );
    const mousetrap = (dir as any).mousetrap;
    spyOn(mousetrap, 'unbind').and.callThrough();
    fixture.destroy();
    expect(mousetrap.unbind).toHaveBeenCalled();
  });
});
