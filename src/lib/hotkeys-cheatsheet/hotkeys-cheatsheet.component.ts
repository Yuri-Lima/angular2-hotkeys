import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  resource,
} from '@angular/core';
import { Hotkey } from '../hotkey.model';
import { HotkeysService } from '../hotkeys.service';

@Component({
  selector: 'hotkeys-cheatsheet',
  standalone: true,
  templateUrl: './hotkeys-cheatsheet.component.html',
  styleUrls: ['./hotkeys-cheatsheet.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotkeysCheatsheetComponent {
  /** Overlay heading — set via `[title]` on the host element. */
  readonly title = input('Keyboard Shortcuts:');

  private readonly hotkeysService = inject(HotkeysService);

  /** Visibility driven by the service signal (replaces BehaviorSubject + async pipe). */
  readonly helpVisible = computed(() => this.hotkeysService.cheatSheetToggle());

  /**
   * Angular 22 stable `resource()`: asynchronously snapshots described hotkeys when the
   * cheatsheet is open. `params` becomes `undefined` when closed → idle status (no loader).
   * Re-fetches when `registryVersion` changes while open.
   */
  readonly sheetResource = resource({
    params: () => {
      const open = this.hotkeysService.cheatSheetToggle();
      if (!open) {
        return undefined;
      }
      return { version: this.hotkeysService.registryVersion() };
    },
    loader: async ({ params: _params }): Promise<Hotkey[]> => {
      // Yield a microtask so the Resource async path is exercised under tests/zoneless.
      await Promise.resolve();
      return this.hotkeysService.hotkeys.filter((hotkey) => !!hotkey.description);
    },
  });

  /**
   * `linkedSignal`: local writable list of rows that resets whenever the sheet opens or the
   * registry version changes, while still allowing manual overwrite via `.set()`.
   */
  readonly hotkeys = linkedSignal<
    { open: boolean; version: number; fromResource: Hotkey[] | null },
    Hotkey[]
  >({
    source: computed(() => ({
      open: this.hotkeysService.cheatSheetToggle(),
      version: this.hotkeysService.registryVersion(),
      fromResource: this.sheetResource.hasValue() ? this.sheetResource.value() : null,
    })),
    computation: (src) => {
      if (!src.open) {
        return [];
      }
      if (src.fromResource) {
        return src.fromResource;
      }
      return this.hotkeysService.hotkeys.filter((hotkey) => !!hotkey.description);
    },
  });

  public toggleCheatSheet(): void {
    this.hotkeysService.cheatSheetToggle.update((open) => !open);
  }
}
