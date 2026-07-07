import { TestBed } from '@angular/core/testing';
import { HotkeyModule } from './hotkey.module';
import { HotkeysService } from './hotkeys.service';
import { HotkeyOptions } from './hotkey.options';

describe('HotkeyModule (deprecated but functional)', () => {
  it('forRoot should still provide HotkeysService and options', () => {
    TestBed.configureTestingModule({
      imports: [HotkeyModule.forRoot({ cheatSheetCloseEsc: true })],
    });
    const service = TestBed.inject(HotkeysService);
    const options = TestBed.inject(HotkeyOptions);
    expect(service).toBeTruthy();
    expect(options.cheatSheetCloseEsc).toBeTrue();
  });
});
