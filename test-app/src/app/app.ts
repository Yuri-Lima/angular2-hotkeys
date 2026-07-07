import { Component, OnInit, signal } from '@angular/core';
import { Hotkey, HotkeysCheatsheetComponent, HotkeysService } from 'angular2-hotkeys';

@Component({
  selector: 'app-root',
  imports: [HotkeysCheatsheetComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('angular2-hotkeys test-app');
  protected readonly lastAction = signal<string>('(none yet — press a shortcut)');
  protected readonly toast = signal<string | null>(null);

  constructor(private hotkeys: HotkeysService) {}

  ngOnInit(): void {
    this.hotkeys.add(
      new Hotkey(
        'ctrl+s',
        () => {
          this.flash('ctrl+s → Save');
          return false;
        },
        ['INPUT', 'TEXTAREA'],
        'Save document',
      ),
    );

    this.hotkeys.add(
      new Hotkey(
        'ctrl+z',
        () => {
          this.flash('ctrl+z → Undo');
          return false;
        },
        [],
        'Undo last change',
      ),
    );

    // '?' is registered by the service for the cheatsheet; surface it in the log too
    const help = this.hotkeys.get('?') as Hotkey | null;
    if (help) {
      const original = help.callback;
      help.callback = (event: KeyboardEvent, combo: string) => {
        this.flash('? → Toggle cheatsheet');
        return original.call(this.hotkeys, event, combo);
      };
    }
  }

  private flash(message: string): void {
    this.lastAction.set(message);
    this.toast.set(message);
    console.log('[hotkeys]', message);
    window.setTimeout(() => this.toast.set(null), 1800);
  }
}
