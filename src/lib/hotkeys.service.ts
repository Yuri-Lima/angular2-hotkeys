import { Injectable, inject, signal, WritableSignal } from '@angular/core';
import { Hotkey } from './hotkey.model';
import { HotkeyOptions, IHotkeyOptions } from './hotkey.options';
import Mousetrap, { MousetrapInstance } from 'mousetrap';

/**
 * Provided by {@link provideHotkeys} or {@link HotkeyModule.forRoot}.
 *
 * Constructed only via Angular DI (class provider) so {@link inject} can resolve
 * {@link HotkeyOptions}. Do **not** call `new HotkeysService()` — that is outside
 * an injection context and would break `inject()`.
 *
 * Consumers obtain the service with `inject(HotkeysService)` or `TestBed.inject`.
 */
@Injectable()
export class HotkeysService {
  /** Public array of active hotkeys (mutable API preserved for consumers). */
  hotkeys: Hotkey[] = [];
  pausedHotkeys: Hotkey[] = [];
  mousetrap!: MousetrapInstance;
  /** Writable signal that drives the cheatsheet open/closed state (replaces RxJS Subject). */
  cheatSheetToggle: WritableSignal<boolean> = signal(false);

  /**
   * Increments whenever the hotkey registry changes (add/remove/pause/reset).
   * Used by cheatsheet `linkedSignal` / `resource` to refresh derived state under zoneless CD.
   */
  readonly registryVersion = signal(0);

  private preventIn = ['INPUT', 'SELECT', 'TEXTAREA'];
  private options: IHotkeyOptions = {};

  /**
   * DI entry: `inject(HotkeyOptions)` (optional) then configure.
   * Requires an Angular injection context — provided by class providers in
   * {@link provideHotkeys}, {@link HotkeyModule.forRoot}, and the directive.
   */
  constructor() {
    const injected = inject(HotkeyOptions, { optional: true });
    this.configure(injected ?? {});
  }

  configure(options: IHotkeyOptions = {}): void {
    this.options = options ?? {};
    // noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
    Mousetrap.prototype.stopCallback = (
      _event: KeyboardEvent,
      element: HTMLElement,
      _combo: string,
    ) => {
      if ((' ' + element.className + ' ').indexOf(' mousetrap ') > -1) {
        return false;
      }
      return element.contentEditable === 'true';
    };
    this.mousetrap = new Mousetrap();
    this.hotkeys = [];
    this.pausedHotkeys = [];
    this.cheatSheetToggle.set(false);
    this.bumpRegistry();
    this.initCheatSheet();
  }

  private bumpRegistry(): void {
    this.registryVersion.update((v) => v + 1);
  }

  private initCheatSheet(): void {
    if (!this.options.disableCheatSheet) {
      this.add(
        new Hotkey(
          this.options.cheatSheetHotkey || '?',
          (_: KeyboardEvent) => {
            this.cheatSheetToggle.update((open) => !open);
            return false;
          },
          [],
          this.options.cheatSheetDescription || 'Show / hide this help menu',
        ),
      );
    }

    if (this.options.cheatSheetCloseEsc) {
      this.add(
        new Hotkey(
          'esc',
          (_: KeyboardEvent) => {
            this.cheatSheetToggle.set(false);
            return false;
          },
          ['HOTKEYS-CHEATSHEET'],
          this.options.cheatSheetCloseEscDescription || 'Hide this help menu',
        ),
      );
    }
  }

  add(hotkey: Hotkey | Hotkey[], specificEvent?: string): Hotkey | Hotkey[] {
    if (Array.isArray(hotkey)) {
      const temp: Hotkey[] = [];
      for (const key of hotkey) {
        temp.push(this.add(key, specificEvent) as Hotkey);
      }
      return temp;
    }
    this.remove(hotkey);
    this.hotkeys.push(hotkey as Hotkey);
    this.mousetrap.bind(
      (hotkey as Hotkey).combo,
      (event: KeyboardEvent, combo: string) => {
        let shouldExecute = true;

        if (event) {
          const target: HTMLElement = (event.target ||
            (event as KeyboardEvent & { srcElement?: EventTarget }).srcElement) as HTMLElement;
          const nodeName: string = target.nodeName.toUpperCase();

          if ((' ' + target.className + ' ').indexOf(' mousetrap ') > -1) {
            shouldExecute = true;
          } else if (
            this.preventIn.indexOf(nodeName) > -1 &&
            ((hotkey as Hotkey).allowIn ?? []).map((allow) => allow.toUpperCase()).indexOf(nodeName) ===
              -1
          ) {
            shouldExecute = false;
          }
        }

        if (shouldExecute) {
          return (hotkey as Hotkey).callback.apply(this, [event, combo]);
        }
        return true;
      },
      specificEvent,
    );
    this.bumpRegistry();
    return hotkey;
  }

  remove(hotkey?: Hotkey | Hotkey[], specificEvent?: string): Hotkey | Hotkey[] | null {
    const temp: Hotkey[] = [];
    if (!hotkey) {
      for (const key of this.hotkeys.slice()) {
        temp.push(this.remove(key, specificEvent) as Hotkey);
      }
      return temp;
    }
    if (Array.isArray(hotkey)) {
      for (const key of hotkey) {
        temp.push(this.remove(key) as Hotkey);
      }
      return temp;
    }
    const index = this.findHotkey(hotkey as Hotkey);
    if (index > -1) {
      this.hotkeys.splice(index, 1);
      this.mousetrap.unbind((hotkey as Hotkey).combo, specificEvent);
      this.bumpRegistry();
      return hotkey;
    }
    return null;
  }

  get(combo?: string | string[]): Hotkey | Hotkey[] | null {
    if (!combo) {
      return this.hotkeys;
    }
    if (Array.isArray(combo)) {
      const temp: Hotkey[] = [];
      for (const key of combo) {
        temp.push(this.get(key) as Hotkey);
      }
      return temp;
    }
    for (const hotkey of this.hotkeys) {
      if (hotkey.combo.indexOf(combo as string) > -1) {
        return hotkey;
      }
    }
    return null;
  }

  pause(hotkey?: Hotkey | Hotkey[]): Hotkey | Hotkey[] {
    if (!hotkey) {
      return this.pause(this.hotkeys);
    }
    if (Array.isArray(hotkey)) {
      const temp: Hotkey[] = [];
      for (const key of hotkey.slice()) {
        temp.push(this.pause(key) as Hotkey);
      }
      return temp;
    }
    this.remove(hotkey);
    this.pausedHotkeys.push(hotkey as Hotkey);
    this.bumpRegistry();
    return hotkey;
  }

  unpause(hotkey?: Hotkey | Hotkey[]): Hotkey | Hotkey[] | null {
    if (!hotkey) {
      return this.unpause(this.pausedHotkeys);
    }
    if (Array.isArray(hotkey)) {
      const temp: Hotkey[] = [];
      for (const key of hotkey.slice()) {
        temp.push(this.unpause(key) as Hotkey);
      }
      return temp;
    }
    const index: number = this.pausedHotkeys.indexOf(hotkey as Hotkey);
    if (index > -1) {
      this.add(hotkey);
      return this.pausedHotkeys.splice(index, 1);
    }
    return null;
  }

  reset(): void {
    this.mousetrap.reset();
    this.hotkeys = [];
    this.pausedHotkeys = [];
    this.cheatSheetToggle.set(false);
    this.bumpRegistry();
    this.initCheatSheet();
  }

  private findHotkey(hotkey: Hotkey): number {
    return this.hotkeys.indexOf(hotkey);
  }
}
