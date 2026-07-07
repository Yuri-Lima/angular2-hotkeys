import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { ActionLogService } from '../action-log.service';

/**
 * Use case 5 — command palette toggled with Ctrl+K (signal-driven UI for zoneless CD).
 * While open, globals are pause()d and only Esc closes the palette (then unpause()).
 */
@Component({
  selector: 'app-command-palette',
  standalone: true,
  template: `
    <section class="uc" data-usecase="command-palette">
      <header class="uc-head">
        <h3>5 · Command palette</h3>
        <p>
          <kbd>Ctrl</kbd>+<kbd>K</kbd> opens a signal-driven palette. While open, other globals are
          <code>pause()</code>d and <kbd>Esc</kbd> closes it (then <code>unpause()</code>).
        </p>
      </header>
      <button type="button" id="open-palette" class="btn" (click)="open()">Open palette</button>
      <p class="uc-status">
        Palette: <strong id="palette-state">{{ openState() ? 'open' : 'closed' }}</strong>
      </p>

      @if (openState()) {
        <div class="palette" role="dialog" aria-label="Command palette" id="command-palette">
          <p class="hint">Demo commands — Esc or “Close palette” restores globals</p>
          <button type="button" class="item" (click)="run('Go to cheatsheet help')">
            Go to cheatsheet help
          </button>
          <button type="button" class="item" (click)="run('Focus composer')">Focus composer</button>
          <button type="button" class="item" id="close-palette" (click)="close()">
            Close palette
          </button>
        </div>
      }
    </section>
  `,
  styles: [
    `
      .uc-head h3 {
        margin: 0 0 0.35rem;
        font-size: 1.05rem;
      }
      .uc-head p {
        margin: 0 0 0.75rem;
        color: #9fb0c7;
        line-height: 1.45;
        font-size: 0.92rem;
      }
      .btn {
        border: 0;
        border-radius: 8px;
        padding: 0.5rem 0.9rem;
        background: #a78bfa;
        color: #1e1b4b;
        font-weight: 600;
        cursor: pointer;
      }
      .uc-status {
        margin: 0.65rem 0 0;
        font-size: 0.9rem;
      }
      .palette {
        margin-top: 0.85rem;
        border: 1px solid #4c1d95;
        border-radius: 12px;
        background: #1e1b4bcc;
        padding: 0.75rem;
        display: grid;
        gap: 0.4rem;
      }
      .hint {
        margin: 0 0 0.25rem;
        font-size: 0.8rem;
        color: #ddd6fe;
      }
      .item {
        text-align: left;
        border: 1px solid #5b21b6;
        border-radius: 8px;
        background: #2e1065;
        color: #ede9fe;
        padding: 0.55rem 0.7rem;
        cursor: pointer;
      }
      .item:hover {
        background: #4c1d95;
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
export class CommandPaletteComponent implements OnInit, OnDestroy {
  private readonly hotkeys = inject(HotkeysService);
  private readonly log = inject(ActionLogService);
  private openBinding: Hotkey | null = null;
  private escBinding: Hotkey | null = null;

  readonly openState = signal(false);

  ngOnInit(): void {
    this.openBinding = this.hotkeys.add(
      new Hotkey(
        'ctrl+k',
        () => {
          if (this.openState()) {
            this.close();
          } else {
            this.open();
          }
          return false;
        },
        undefined,
        'Toggle command palette',
      ),
    ) as Hotkey;
  }

  ngOnDestroy(): void {
    if (this.openState()) {
      this.close();
    }
    if (this.openBinding) {
      this.hotkeys.remove(this.openBinding);
    }
  }

  open(): void {
    if (this.openState()) {
      return;
    }
    // Keep ctrl+k available? pause removes everything including openBinding.
    // Re-add esc only; user can click Close or Esc. Re-open via button after close.
    this.hotkeys.pause();
    this.escBinding = this.hotkeys.add(
      new Hotkey(
        'esc',
        () => {
          this.close();
          return false;
        },
        undefined,
        'Close command palette',
      ),
    ) as Hotkey;
    this.openState.set(true);
    this.log.log('ctrl+k → command palette open (globals paused)');
  }

  close(): void {
    if (!this.openState()) {
      return;
    }
    if (this.escBinding) {
      this.hotkeys.remove(this.escBinding);
      this.escBinding = null;
    }
    this.hotkeys.unpause();
    this.openState.set(false);
    this.log.log('palette → closed (globals unpaused)');
  }

  run(label: string): void {
    this.log.log(`palette → ${label}`);
    if (label === 'Focus composer') {
      this.close();
      queueMicrotask(() => document.getElementById('composer-input')?.focus());
    }
  }
}
