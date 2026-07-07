import {
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  afterNextRender,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';
import { ExtendedKeyboardEvent, Hotkey } from './hotkey.model';
import { HotkeysService } from './hotkeys.service';
import Mousetrap, { MousetrapInstance } from 'mousetrap';

/** Map of Mousetrap combo → callback, as accepted by the `[hotkeys]` input. */
export type HotkeyBindingMap = {
  [combo: string]: (event: KeyboardEvent, combo: string) => ExtendedKeyboardEvent | boolean;
};

@Directive({
  selector: '[hotkeys]',
  standalone: true,
  providers: [{ provide: HotkeysService, useFactory: () => HotkeysService.create({}) }],
})
export class HotkeysDirective {
  /** Element-scoped hotkey bindings (signal input — replaces `@Input()`). */
  readonly hotkeys = input<HotkeyBindingMap[]>([]);

  private readonly hotkeysService = inject(HotkeysService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  private mousetrap: MousetrapInstance | null = null;
  private hotkeysList: Hotkey[] = [];
  private oldHotkeys: Hotkey[] = [];
  private viewReady = false;

  constructor() {
    // Bind Mousetrap after the host element is in the DOM (SSR/hydration-safe).
    afterNextRender(
      () => {
        this.mousetrap = new Mousetrap(this.elementRef.nativeElement);
        this.viewReady = true;
        this.bindAll(this.hotkeys());
      },
      { injector: this.injector },
    );

    // Re-bind when the signal input changes after the view is ready.
    effect(() => {
      const bindings = this.hotkeys();
      untracked(() => {
        if (this.viewReady && this.mousetrap) {
          this.bindAll(bindings);
        }
      });
    });

    this.destroyRef.onDestroy(() => this.teardown());
  }

  private bindAll(bindings: HotkeyBindingMap[]): void {
    if (!this.mousetrap) {
      return;
    }
    // Clear previous element bindings and restore any stashed globals first.
    this.unbindLocal();

    for (const hotkey of bindings) {
      const combo = Object.keys(hotkey)[0];
      const hotkeyObj: Hotkey = new Hotkey(combo, hotkey[combo]);
      const oldHotkey: Hotkey | null = this.hotkeysService.get(combo) as Hotkey | null;
      if (oldHotkey !== null) {
        // Temporarily overwrite global callbacks for this combo while the element is alive.
        this.oldHotkeys.push(oldHotkey);
        this.hotkeysService.remove(oldHotkey);
      }
      this.hotkeysList.push(hotkeyObj);
      this.mousetrap.bind(hotkeyObj.combo, hotkeyObj.callback);
    }
  }

  private unbindLocal(): void {
    if (this.mousetrap) {
      for (const hotkey of this.hotkeysList) {
        this.mousetrap.unbind(hotkey.combo);
      }
    }
    this.hotkeysList = [];
    if (this.oldHotkeys.length) {
      this.hotkeysService.add(this.oldHotkeys);
      this.oldHotkeys = [];
    }
  }

  private teardown(): void {
    this.unbindLocal();
    this.mousetrap = null;
    this.viewReady = false;
  }
}
