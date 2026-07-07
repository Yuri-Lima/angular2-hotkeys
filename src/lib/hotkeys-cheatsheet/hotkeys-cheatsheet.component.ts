import { Component, computed, effect, input, signal, untracked } from '@angular/core';
import { Hotkey } from '../hotkey.model';
import { HotkeysService } from '../hotkeys.service';

@Component({
  selector: 'hotkeys-cheatsheet',
  standalone: true,
  templateUrl: './hotkeys-cheatsheet.component.html',
  styleUrls: ['./hotkeys-cheatsheet.component.css'],
})
export class HotkeysCheatsheetComponent {
  /** Overlay heading — set via `[title]` on the host element. */
  readonly title = input('Keyboard Shortcuts:');


  /** Local list of hotkeys shown in the overlay (updated when the sheet opens). */
  readonly hotkeys = signal<Hotkey[]>([]);

  /** Visibility driven by the service signal (replaces BehaviorSubject + async pipe). */
  readonly helpVisible = computed(() => this.hotkeysService.cheatSheetToggle());

  constructor(private hotkeysService: HotkeysService) {
    // When the cheatsheet opens, refresh the listed hotkeys that have descriptions.
    effect(() => {
      const open = this.hotkeysService.cheatSheetToggle();
      if (open) {
        untracked(() => {
          this.hotkeys.set(this.hotkeysService.hotkeys.filter((hotkey) => !!hotkey.description));
        });
      }
    });
  }

  public toggleCheatSheet(): void {
    this.hotkeysService.cheatSheetToggle.update((open) => !open);
  }
}
