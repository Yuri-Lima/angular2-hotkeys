import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ExtendedKeyboardEvent, Hotkey } from './hotkey.model';
import { HotkeysService } from './hotkeys.service';
import Mousetrap, { MousetrapInstance } from 'mousetrap';

@Directive({
  selector: '[hotkeys]',
  standalone: true,
  providers: [{ provide: HotkeysService, useFactory: () => HotkeysService.create({}) }],
})

export class HotkeysDirective implements OnInit, OnDestroy {
  @Input() hotkeys: { [combo: string]: (event: KeyboardEvent, combo: string) => ExtendedKeyboardEvent }[] =
    [];

  private mousetrap: MousetrapInstance;
  private hotkeysList: Hotkey[] = [];
  private oldHotkeys: Hotkey[] = [];

  constructor(
    private hotkeysService: HotkeysService,
    private elementRef: ElementRef<HTMLElement>,
  ) {
    // Bind hotkeys to the current element (and any children)
    this.mousetrap = new Mousetrap(this.elementRef.nativeElement);
  }

  ngOnInit(): void {
    for (const hotkey of this.hotkeys) {
      const combo = Object.keys(hotkey)[0];
      const hotkeyObj: Hotkey = new Hotkey(combo, hotkey[combo]);
      const oldHotkey: Hotkey | null = this.hotkeysService.get(combo) as Hotkey | null;
      if (oldHotkey !== null) {
        // We let the user overwrite callbacks temporarily if you specify it in HTML
        this.oldHotkeys.push(oldHotkey);
        this.hotkeysService.remove(oldHotkey);
      }
      this.hotkeysList.push(hotkeyObj);
      this.mousetrap.bind(hotkeyObj.combo, hotkeyObj.callback);
    }
  }

  ngOnDestroy(): void {
    for (const hotkey of this.hotkeysList) {
      this.mousetrap.unbind(hotkey.combo);
    }
    this.hotkeysService.add(this.oldHotkeys);
  }
}
