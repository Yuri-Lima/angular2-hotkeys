import { Component, inject, signal } from '@angular/core';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { ActionLogService } from '../action-log.service';

/**
 * Use case 3 — modal mode: pause() all globals, bind only Esc to close, then unpause().
 */
@Component({
  selector: 'app-modal-pause',
  standalone: true,
  template: `
    <section class="uc" data-usecase="modal-pause">
      <header class="uc-head">
        <h3>3 · Modal pause / Esc only</h3>
        <p>
          Opening the dialog calls <code>pause()</code> on every global hotkey, then registers
          <kbd>Esc</kbd> to close. Closing removes that binding and <code>unpause()</code>s the rest.
        </p>
      </header>
      <button type="button" id="open-modal" class="btn" (click)="open()">Open dialog</button>
      <p class="uc-status">State: <strong id="modal-state">{{ openState() ? 'open' : 'closed' }}</strong></p>

      @if (openState()) {
        <div class="modal-backdrop" role="presentation" (click)="close()">
          <div
            class="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            (click)="$event.stopPropagation()"
          >
            <h4 id="modal-title">Paused shortcut mode</h4>
            <p>
              App-wide <kbd>Ctrl</kbd>+<kbd>S</kbd> / <kbd>?</kbd> are paused. Press
              <kbd>Esc</kbd> (or the button) to close and restore them.
            </p>
            <button type="button" id="close-modal" class="btn secondary" (click)="close()">
              Close
            </button>
          </div>
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
        background: #38bdf8;
        color: #082f49;
        font-weight: 600;
        cursor: pointer;
      }
      .btn.secondary {
        background: #334155;
        color: #e2e8f0;
      }
      .uc-status {
        margin: 0.65rem 0 0;
        font-size: 0.9rem;
      }
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(2, 6, 23, 0.72);
        display: grid;
        place-items: center;
        z-index: 80;
        padding: 1rem;
      }
      .modal {
        max-width: 420px;
        width: 100%;
        background: #111827;
        border: 1px solid #334155;
        border-radius: 12px;
        padding: 1.25rem 1.4rem;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
      }
      .modal h4 {
        margin: 0 0 0.5rem;
      }
      .modal p {
        margin: 0 0 1rem;
        color: #cbd5e1;
        line-height: 1.45;
        font-size: 0.92rem;
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
export class ModalPauseComponent {
  private readonly hotkeys = inject(HotkeysService);
  private readonly log = inject(ActionLogService);
  private modalKeys: Hotkey[] = [];

  readonly openState = signal(false);

  open(): void {
    if (this.openState()) {
      return;
    }
    this.hotkeys.pause();
    this.modalKeys = this.hotkeys.add(
      new Hotkey(
        'esc',
        () => {
          this.close();
          return false;
        },
        undefined,
        'Close demo dialog',
      ),
    ) as Hotkey[];
    this.openState.set(true);
    this.log.log('modal → pause() + Esc close only');
  }

  close(): void {
    if (!this.openState()) {
      return;
    }
    if (this.modalKeys.length) {
      this.hotkeys.remove(this.modalKeys);
      this.modalKeys = [];
    }
    this.hotkeys.unpause();
    this.openState.set(false);
    this.log.log('modal → unpause() (globals restored)');
  }
}
