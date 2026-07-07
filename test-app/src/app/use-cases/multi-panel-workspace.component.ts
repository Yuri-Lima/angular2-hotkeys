import { Component, computed, inject, signal } from '@angular/core';
import { HotkeyBindingMap, HotkeysDirective } from 'angular2-hotkeys';
import { ActionLogService } from '../action-log.service';

/**
 * Use case 6 — same combo, different action by focused panel via [hotkeys].
 *
 * Bindings are applied only while a panel is focused so:
 * - focus list  → Ctrl+S exports
 * - focus editor → Ctrl+S saves
 * - focus elsewhere → app-wide Ctrl+S (from App) is active again
 *
 * The directive stashes/restores the global combo while an element binding is live.
 */
@Component({
  selector: 'app-multi-panel-workspace',
  standalone: true,
  imports: [HotkeysDirective],
  template: `
    <section class="uc" data-usecase="multi-panel">
      <header class="uc-head">
        <h3>6 · Same shortcut, focus decides</h3>
        <p>
          Click a panel to focus it. <kbd>Ctrl</kbd>+<kbd>S</kbd> means
          <strong>export selection</strong> on the list and <strong>save document</strong> on the
          editor. Blur both panels to restore the app-wide Save handler.
        </p>
      </header>

      <div class="workspace">
        <section
          class="panel"
          id="file-list-panel"
          tabindex="0"
          [class.focused]="focused() === 'list'"
          [hotkeys]="listHotkeys()"
          (focusin)="focused.set('list')"
        >
          <h4>File list</h4>
          <ul>
            @for (f of files(); track f) {
              <li>{{ f }}</li>
            }
          </ul>
          <p class="panel-hint">Focus here → Ctrl+S exports</p>
        </section>

        <section
          class="panel"
          id="editor-panel"
          tabindex="0"
          [class.focused]="focused() === 'editor'"
          [hotkeys]="editorHotkeys()"
          (focusin)="focused.set('editor')"
        >
          <h4>Editor</h4>
          <textarea
            id="editor-doc"
            rows="5"
            [value]="doc()"
            (input)="doc.set($any($event.target).value)"
            (focus)="focused.set('editor')"
          ></textarea>
          <p class="panel-hint">Focus here → Ctrl+S saves</p>
        </section>
      </div>

      <p class="uc-status">
        Focused panel: <strong id="panel-focus">{{ focused() }}</strong>
        · Last panel action: <strong id="panel-action">{{ panelAction() }}</strong>
      </p>
    </section>
  `,
  styles: [
    `
      .uc-head h3 {
        margin: 0 0 0.35rem;
        font-size: 1.05rem;
      }
      .uc-head p {
        margin: 0 0 0.85rem;
        color: #9fb0c7;
        line-height: 1.45;
        font-size: 0.92rem;
      }
      .workspace {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
      }
      @media (max-width: 720px) {
        .workspace {
          grid-template-columns: 1fr;
        }
      }
      .panel {
        border: 1px solid #2a3b55;
        border-radius: 12px;
        padding: 0.85rem 1rem;
        background: #0f1724;
        outline: none;
        min-height: 12rem;
      }
      .panel.focused {
        border-color: #22c55e;
        box-shadow: 0 0 0 1px #22c55e66;
      }
      .panel h4 {
        margin: 0 0 0.5rem;
        font-size: 0.95rem;
      }
      .panel ul {
        margin: 0;
        padding-left: 1.1rem;
        line-height: 1.7;
        color: #cbd5e1;
        font-size: 0.9rem;
      }
      .panel textarea {
        width: 100%;
        box-sizing: border-box;
        border-radius: 8px;
        border: 1px solid #2a3b55;
        background: #020617;
        color: #e8eef7;
        padding: 0.5rem 0.65rem;
        font: inherit;
        resize: vertical;
      }
      .panel-hint {
        margin: 0.55rem 0 0;
        font-size: 0.8rem;
        color: #86efac;
      }
      .uc-status {
        margin: 0.75rem 0 0;
        font-size: 0.9rem;
      }
      kbd {
        display: inline-block;
        padding: 0.05rem 0.35rem;
        border-radius: 4px;
        border: 1px solid #4a5d7a;
        background: #152033;
        font-family: ui-monospace, Menlo, monospace;
        font-size: 0.8em;
      }
      code {
        color: #7dd3fc;
      }
    `,
  ],
})
export class MultiPanelWorkspaceComponent {
  private readonly log = inject(ActionLogService);

  readonly focused = signal<'list' | 'editor' | 'none'>('none');
  readonly panelAction = signal('(click a panel, then Ctrl+S)');
  readonly files = signal(['README.md', 'hotkeys.service.ts', 'app.config.ts']);
  readonly doc = signal('Edit me — focus this panel and press Ctrl+S to save.');

  /** Only bind while focused so the app-wide Ctrl+S returns when panels blur. */
  readonly listHotkeys = computed((): HotkeyBindingMap[] => {
    if (this.focused() !== 'list') {
      return [];
    }
    const save: HotkeyBindingMap = {
      'ctrl+s': () => {
        this.panelAction.set('list → export selection');
        this.log.log('ctrl+s (list panel) → export selection');
        return false;
      },
    };
    const del: HotkeyBindingMap = {
      del: () => {
        this.panelAction.set('list → delete selection');
        this.log.log('del (list panel) → delete selection');
        return false;
      },
    };
    return [save, del];
  });

  readonly editorHotkeys = computed((): HotkeyBindingMap[] => {
    if (this.focused() !== 'editor') {
      return [];
    }
    const save: HotkeyBindingMap = {
      'ctrl+s': () => {
        this.panelAction.set('editor → save document');
        this.log.log('ctrl+s (editor panel) → save document');
        return false;
      },
    };
    const escape: HotkeyBindingMap = {
      esc: () => {
        (document.activeElement as HTMLElement | null)?.blur?.();
        this.focused.set('none');
        this.panelAction.set('editor → blur');
        this.log.log('esc (editor panel) → blur');
        return false;
      },
    };
    return [save, escape];
  });
}
