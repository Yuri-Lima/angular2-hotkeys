import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { ActionLogService } from '../action-log.service';

/**
 * Use case 2 — fire a shortcut while the caret is in an INPUT/TEXTAREA via allowIn.
 * Combo: Ctrl+Enter → send message (works while focused in the composer).
 */
@Component({
  selector: 'app-composer-allow-in',
  standalone: true,
  template: `
    <section class="uc" data-usecase="allow-in">
      <header class="uc-head">
        <h3>2 · allowIn while typing</h3>
        <p>
          <kbd>Ctrl</kbd>+<kbd>Enter</kbd> sends even when focus is in the textarea
          (<code>allowIn: ['TEXTAREA']</code>). Plain <kbd>Ctrl</kbd>+<kbd>Z</kbd> does
          <em>not</em> run while typing (default suppress in form fields).
        </p>
      </header>
      <label class="field">
        <span>Composer</span>
        <textarea
          id="composer-input"
          rows="3"
          [value]="draft()"
          (input)="draft.set($any($event.target).value)"
          placeholder="Type here, then press Ctrl+Enter…"
        ></textarea>
      </label>
      <p class="uc-status">
        Last send: <strong id="composer-last">{{ lastSend() }}</strong>
      </p>
    </section>
  `,
  styles: [
    `
      .uc {
        display: grid;
        gap: 0.75rem;
      }
      .uc-head h3 {
        margin: 0 0 0.35rem;
        font-size: 1.05rem;
      }
      .uc-head p {
        margin: 0;
        color: #9fb0c7;
        line-height: 1.45;
        font-size: 0.92rem;
      }
      .field {
        display: grid;
        gap: 0.35rem;
        font-size: 0.85rem;
        color: #c5d4e8;
      }
      textarea {
        width: 100%;
        box-sizing: border-box;
        border-radius: 8px;
        border: 1px solid #2a3b55;
        background: #0f1724;
        color: #e8eef7;
        padding: 0.65rem 0.75rem;
        font: inherit;
        resize: vertical;
      }
      .uc-status {
        margin: 0;
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
export class ComposerAllowInComponent implements OnInit, OnDestroy {
  private readonly hotkeys = inject(HotkeysService);
  private readonly log = inject(ActionLogService);
  private binding: Hotkey | null = null;

  readonly draft = signal('Hello from the composer');
  readonly lastSend = signal<string>('(not sent yet)');

  ngOnInit(): void {
    this.binding = this.hotkeys.add(
      new Hotkey(
        'ctrl+enter',
        () => {
          const text = this.draft().trim() || '(empty)';
          this.lastSend.set(text);
          this.log.log(`ctrl+enter → send “${text.slice(0, 40)}” (allowIn TEXTAREA)`);
          return false;
        },
        ['TEXTAREA', 'INPUT'],
        'Send composer message (works in inputs)',
      ),
    ) as Hotkey;
  }

  ngOnDestroy(): void {
    if (this.binding) {
      this.hotkeys.remove(this.binding);
    }
  }
}
