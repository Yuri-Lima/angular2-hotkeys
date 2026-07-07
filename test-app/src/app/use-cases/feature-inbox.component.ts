import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { ActionLogService } from '../action-log.service';

/**
 * Use case 4 — feature / “route” scoped shortcuts: add on init, remove on destroy.
 * Combos: j next · k previous · e archive (only while this panel is mounted).
 */
@Component({
  selector: 'app-feature-inbox',
  standalone: true,
  template: `
    <section class="uc inbox" data-usecase="feature-inbox">
      <header class="uc-head">
        <h3>4 · Feature-scoped (lifecycle)</h3>
        <p>
          While this panel is mounted: <kbd>J</kbd> next, <kbd>K</kbd> previous,
          <kbd>E</kbd> archive. Destroying the panel removes those bindings so they do not leak.
        </p>
      </header>
      <ul class="threads" id="inbox-threads">
        @for (t of threads(); track t.id; let i = $index) {
          <li [class.active]="i === index()">
            <span>{{ t.title }}</span>
            @if (t.archived) {
              <em>archived</em>
            }
          </li>
        }
      </ul>
      <p class="uc-status">
        Selected: <strong id="inbox-selected">{{ threads()[index()]?.title }}</strong>
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
        margin: 0 0 0.75rem;
        color: #9fb0c7;
        line-height: 1.45;
        font-size: 0.92rem;
      }
      .threads {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 0.35rem;
      }
      .threads li {
        display: flex;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.45rem 0.65rem;
        border-radius: 8px;
        border: 1px solid #243247;
        background: #0f1724;
      }
      .threads li.active {
        border-color: #38bdf8;
        background: #0c4a6e33;
      }
      .threads em {
        color: #94a3b8;
        font-size: 0.8rem;
      }
      .uc-status {
        margin: 0.65rem 0 0;
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
    `,
  ],
})
export class FeatureInboxComponent implements OnInit, OnDestroy {
  private readonly hotkeys = inject(HotkeysService);
  private readonly log = inject(ActionLogService);
  private bindings: Hotkey[] = [];

  readonly threads = signal([
    { id: 1, title: 'Welcome to angular2-hotkeys', archived: false },
    { id: 2, title: 'Zoneless cheatsheet feedback', archived: false },
    { id: 3, title: 'Focus-scoped mod+s design', archived: false },
  ]);
  readonly index = signal(0);

  ngOnInit(): void {
    this.bindings = this.hotkeys.add([
      new Hotkey(
        'j',
        () => {
          this.next();
          return false;
        },
        undefined,
        'Inbox: next thread',
      ),
      new Hotkey(
        'k',
        () => {
          this.prev();
          return false;
        },
        undefined,
        'Inbox: previous thread',
      ),
      new Hotkey(
        'e',
        () => {
          this.archive();
          return false;
        },
        undefined,
        'Inbox: archive thread',
      ),
    ]) as Hotkey[];
    this.log.log('inbox feature → j/k/e registered');
  }

  ngOnDestroy(): void {
    this.hotkeys.remove(this.bindings);
    this.bindings = [];
    this.log.log('inbox feature → j/k/e removed (destroy)');
  }

  private next(): void {
    const max = this.threads().length - 1;
    this.index.update((i) => Math.min(max, i + 1));
    this.log.log(`j → next thread “${this.threads()[this.index()].title}”`);
  }

  private prev(): void {
    this.index.update((i) => Math.max(0, i - 1));
    this.log.log(`k → previous thread “${this.threads()[this.index()].title}”`);
  }

  private archive(): void {
    const i = this.index();
    this.threads.update((list) =>
      list.map((t, idx) => (idx === i ? { ...t, archived: true } : t)),
    );
    this.log.log(`e → archive “${this.threads()[i].title}”`);
  }
}
