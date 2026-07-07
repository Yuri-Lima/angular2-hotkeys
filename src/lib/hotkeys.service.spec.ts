import { TestBed } from '@angular/core/testing';
import { HotkeysService } from './hotkeys.service';
import { Hotkey } from './hotkey.model';
import { HotkeyOptions } from './hotkey.options';

describe('HotkeysService', () => {
  let service: HotkeysService;

  beforeEach(() => {
    const options = {
      cheatSheetCloseEsc: true,
      cheatSheetDescription: 'Show / hide this help menu',
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: HotkeyOptions, useValue: options },
        { provide: HotkeysService, useFactory: () => HotkeysService.create(options) },
      ],
    });

    service = TestBed.inject(HotkeysService);
  });

  afterEach(() => {
    service.reset();
  });

  it('should be created and register the default cheatsheet hotkey', () => {
    expect(service).toBeTruthy();
    expect(service.hotkeys.length).toBeGreaterThan(0);
    const help = service.get('?') as Hotkey;
    expect(help).toBeTruthy();
    expect(help.description).toContain('help');
  });

  it('should add a hotkey', () => {
    const hk = new Hotkey('ctrl+s', () => false, [], 'Save');
    service.add(hk);
    expect(service.get('ctrl+s')).toBe(hk);
  });

  it('should add an array of hotkeys', () => {
    const a = new Hotkey('ctrl+a', () => false, [], 'Select all');
    const b = new Hotkey('ctrl+b', () => false, [], 'Bold');
    service.add([a, b]);
    expect(service.get('ctrl+a')).toBe(a);
    expect(service.get('ctrl+b')).toBe(b);
  });

  it('should remove a hotkey', () => {
    const hk = new Hotkey('ctrl+x', () => false, [], 'Cut');
    service.add(hk);
    service.remove(hk);
    expect(service.get('ctrl+x')).toBeNull();
  });

  it('should remove all hotkeys when called without args then re-init cheatsheet on reset', () => {
    service.add(new Hotkey('ctrl+q', () => false, [], 'Quit'));
    service.remove();
    // remove() without args unbinds everything including cheatsheet bindings
    expect(service.hotkeys.length).toBe(0);
  });

  it('should get all hotkeys when called without combo', () => {
    const all = service.get() as Hotkey[];
    expect(Array.isArray(all)).toBeTrue();
    expect(all.length).toBeGreaterThan(0);
  });

  it('should get multiple hotkeys by combo array', () => {
    service.add(new Hotkey('ctrl+1', () => false, [], 'One'));
    service.add(new Hotkey('ctrl+2', () => false, [], 'Two'));
    const result = service.get(['ctrl+1', 'ctrl+2']) as Hotkey[];
    expect(result.length).toBe(2);
  });

  it('should pause and unpause a hotkey', () => {
    const hk = new Hotkey('ctrl+p', () => false, [], 'Print');
    service.add(hk);
    service.pause(hk);
    expect(service.get('ctrl+p')).toBeNull();
    expect(service.pausedHotkeys).toContain(hk);
    service.unpause(hk);
    expect(service.get('ctrl+p')).toBe(hk);
    expect(service.pausedHotkeys).not.toContain(hk);
  });

  it('should pause and unpause all hotkeys', () => {
    const before = (service.get() as Hotkey[]).length;
    service.pause();
    expect(service.hotkeys.length).toBe(0);
    expect(service.pausedHotkeys.length).toBe(before);
    service.unpause();
    expect(service.hotkeys.length).toBe(before);
    expect(service.pausedHotkeys.length).toBe(0);
  });

  it('should reset hotkeys and re-register cheatsheet', () => {
    service.add(new Hotkey('ctrl+z', () => false, [], 'Undo'));
    service.reset();
    expect(service.get('ctrl+z')).toBeNull();
    expect(service.get('?')).toBeTruthy();
    expect(service.cheatSheetToggle()).toBeFalse();
  });

  it('should toggle cheatSheetToggle signal via registered ? hotkey callback', () => {
    expect(service.cheatSheetToggle()).toBeFalse();
    const help = service.get('?') as Hotkey;
    help.callback({} as KeyboardEvent, '?');
    expect(service.cheatSheetToggle()).toBeTrue();
    help.callback({} as KeyboardEvent, '?');
    expect(service.cheatSheetToggle()).toBeFalse();
  });

  it('should close cheatsheet on esc callback when cheatSheetCloseEsc is enabled', () => {
    service.cheatSheetToggle.set(true);
    const esc = service.get('esc') as Hotkey;
    expect(esc).toBeTruthy();
    esc.callback({} as KeyboardEvent, 'esc');
    expect(service.cheatSheetToggle()).toBeFalse();
  });

  it('should not execute callback for events from INPUT unless allowIn includes it', () => {
    let fired = false;
    const boundFns: Array<(e: KeyboardEvent, c: string) => any> = [];
    const mt = service.mousetrap;
    const origBind = mt.bind.bind(mt);
    spyOn(mt, 'bind').and.callFake((combo: any, fn: any, action?: any) => {
      boundFns.push(fn);
      return origBind(combo, fn, action);
    });

    const hk = new Hotkey(
      'ctrl+i',
      () => {
        fired = true;
        return false;
      },
      [],
      'Input blocked',
    );
    service.add(hk);

    const input = document.createElement('input');
    document.body.appendChild(input);
    const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'target', { value: input });

    const wrapper = boundFns[boundFns.length - 1];
    expect(wrapper).toBeTruthy();
    wrapper(event, 'ctrl+i');
    expect(fired).toBeFalse();
    document.body.removeChild(input);
  });

  it('should execute callback for events from INPUT when allowIn includes INPUT', () => {
    let fired = false;
    const boundFns: Array<(e: KeyboardEvent, c: string) => any> = [];
    const mt = service.mousetrap;
    const origBind = mt.bind.bind(mt);
    spyOn(mt, 'bind').and.callFake((combo: any, fn: any, action?: any) => {
      boundFns.push(fn);
      return origBind(combo, fn, action);
    });

    const hk = new Hotkey(
      'ctrl+u',
      () => {
        fired = true;
        return false;
      },
      ['INPUT'],
      'Input allowed',
    );
    service.add(hk);

    const input = document.createElement('input');
    document.body.appendChild(input);
    const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'target', { value: input });

    const wrapper = boundFns[boundFns.length - 1];
    wrapper(event, 'ctrl+u');
    expect(fired).toBeTrue();
    document.body.removeChild(input);
  });

  it('should execute callback when target has mousetrap class even inside INPUT', () => {
    let fired = false;
    const boundFns: Array<(e: KeyboardEvent, c: string) => any> = [];
    const mt = service.mousetrap;
    const origBind = mt.bind.bind(mt);
    spyOn(mt, 'bind').and.callFake((combo: any, fn: any, action?: any) => {
      boundFns.push(fn);
      return origBind(combo, fn, action);
    });

    service.add(
      new Hotkey(
        'ctrl+m',
        () => {
          fired = true;
          return false;
        },
        [],
        'Mousetrap class',
      ),
    );

    const input = document.createElement('input');
    input.className = 'mousetrap';
    document.body.appendChild(input);
    const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'target', { value: input });
    boundFns[boundFns.length - 1](event, 'ctrl+m');
    expect(fired).toBeTrue();
    document.body.removeChild(input);
  });

  it('should execute callback when event is missing (direct invoke)', () => {
    let fired = false;
    const boundFns: Array<(e: KeyboardEvent, c: string) => any> = [];
    const mt = service.mousetrap;
    const origBind = mt.bind.bind(mt);
    spyOn(mt, 'bind').and.callFake((combo: any, fn: any, action?: any) => {
      boundFns.push(fn);
      return origBind(combo, fn, action);
    });
    service.add(
      new Hotkey(
        'ctrl+d',
        () => {
          fired = true;
          return false;
        },
        [],
        'Direct',
      ),
    );
    boundFns[boundFns.length - 1](undefined as any, 'ctrl+d');
    expect(fired).toBeTrue();
  });

  it('Hotkey.symbolize should map mod and known keys', () => {
    const result = Hotkey.symbolize('shift+return');
    expect(result).toContain('\u21E7');
    expect(result).toContain('\u23CE');
  });

  it('Hotkey.formatted should symbolize combo sequences', () => {
    const hk = new Hotkey('ctrl+s', () => false, [], 'Save');
    expect(hk.formatted.length).toBe(1);
    expect(hk.formatted[0].toLowerCase()).toContain('s');
  });

  it('should remove an array of hotkeys', () => {
    const a = new Hotkey('alt+1', () => false, [], 'A');
    const b = new Hotkey('alt+2', () => false, [], 'B');
    service.add([a, b]);
    service.remove([a, b]);
    expect(service.get('alt+1')).toBeNull();
    expect(service.get('alt+2')).toBeNull();
  });

  it('unpause of unknown hotkey returns null', () => {
    const orphan = new Hotkey('alt+9', () => false, [], 'Orphan');
    expect(service.unpause(orphan)).toBeNull();
  });

  it('remove of unknown hotkey returns null', () => {
    const orphan = new Hotkey('alt+8', () => false, [], 'Missing');
    expect(service.remove(orphan)).toBeNull();
  });
});

