import { Component, inject, OnInit, signal } from '@angular/core';
import { Hotkey, HotkeysCheatsheetComponent, HotkeysService } from 'angular2-hotkeys';
import { ActionLogService } from './action-log.service';
import { CommandPaletteComponent } from './use-cases/command-palette.component';
import { ComposerAllowInComponent } from './use-cases/composer-allow-in.component';
import { FeatureInboxComponent } from './use-cases/feature-inbox.component';
import { ModalPauseComponent } from './use-cases/modal-pause.component';
import { MultiPanelWorkspaceComponent } from './use-cases/multi-panel-workspace.component';

/**
 * Zoneless integration shell that hosts real components for every README use case:
 * 1. App-wide save / undo / help (this component)
 * 2. allowIn composer — ComposerAllowInComponent
 * 3. Modal pause — ModalPauseComponent
 * 4. Feature lifecycle — FeatureInboxComponent (toggle mount)
 * 5. Command palette — CommandPaletteComponent
 * 6. Focus-scoped same combo — MultiPanelWorkspaceComponent
 */
@Component({
  selector: 'app-root',
  imports: [
    HotkeysCheatsheetComponent,
    ComposerAllowInComponent,
    ModalPauseComponent,
    FeatureInboxComponent,
    CommandPaletteComponent,
    MultiPanelWorkspaceComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly hotkeys = inject(HotkeysService);
  protected readonly log = inject(ActionLogService);

  protected readonly title = signal('angular2-hotkeys test-app (zoneless)');
  protected readonly zoneless = signal(true);
  /** Use case 4: mount/unmount feature to prove add/remove on destroy */
  protected readonly showInbox = signal(true);

  ngOnInit(): void {
    // --- Use case 1: app-wide save / undo / help ---
    this.hotkeys.add(
      new Hotkey(
        'ctrl+s',
        () => {
          this.log.log('ctrl+s → Save (app-wide)');
          return false;
        },
        ['INPUT', 'TEXTAREA'],
        'Save document (app-wide)',
      ),
    );

    this.hotkeys.add(
      new Hotkey(
        'ctrl+z',
        () => {
          this.log.log('ctrl+z → Undo (app-wide)');
          return false;
        },
        [],
        'Undo last change (app-wide)',
      ),
    );

    // Surface cheatsheet toggle in the shared log
    const help = this.hotkeys.get('?') as Hotkey | null;
    if (help) {
      const original = help.callback;
      help.callback = (event: KeyboardEvent, combo: string) => {
        this.log.log('? → Toggle cheatsheet');
        return original.call(this.hotkeys, event, combo);
      };
    }
  }

  toggleInbox(): void {
    this.showInbox.update((v) => !v);
    this.log.log(
      this.showInbox()
        ? 'shell → mount inbox feature (j/k/e active)'
        : 'shell → unmount inbox feature (j/k/e gone)',
    );
  }
}
