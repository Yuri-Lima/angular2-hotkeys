# angular2-hotkeys

<p align="center">
  <strong>Declarative keyboard shortcuts for Angular</strong><br />
  Angular 22 APIs · Zoneless · Signals · Mousetrap · Nx
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/angular2-hotkeys"><img alt="npm version" src="https://img.shields.io/badge/npm-v22.0.0-CB3837?style=flat-square&logo=npm" /></a>
  <a href="https://pnpm.io/"><img alt="pnpm" src="https://img.shields.io/badge/package%20manager-pnpm-F69220?style=flat-square&logo=pnpm&logoColor=white" /></a>
  <a href="https://angular.dev/"><img alt="Angular" src="https://img.shields.io/badge/Angular-%3E%3D20%20%3C23-DD0031?style=flat-square&logo=angular&logoColor=white" /></a>
  <a href="https://angular.dev/guide/zoneless"><img alt="Zoneless" src="https://img.shields.io/badge/zoneless-supported-22c55e?style=flat-square" /></a>
  <a href="https://nx.dev/"><img alt="Nx" src="https://img.shields.io/badge/Nx-23.1-143055?style=flat-square&logo=nx&logoColor=white" /></a>
  <a href="https://www.typescriptlang.org/"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white" /></a>
  <a href="./LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" /></a>
  <a href="https://nodejs.org/"><img alt="Node" src="https://img.shields.io/badge/node-%3E%3D22.22.3-339933?style=flat-square&logo=node.js&logoColor=white" /></a>
</p>

---

**angular2-hotkeys** binds global and element-scoped keyboard shortcuts in Angular apps, with an optional on-screen cheat sheet. It is powered by [Mousetrap](https://craig.is/killing/mice) and is a modern **standalone, signal-first, zoneless-ready** library managed with **[Nx](https://nx.dev)**.

Compiling on Angular 22 is not enough — this line **uses** Angular 22 APIs: `input()`, `inject()`, `linkedSignal()`, `resource()`, `@defer`, `afterNextRender()`, and `provideZonelessChangeDetection()` in the integration app. The research inventory and applicability decisions live in [`RESEARCH.md`](./RESEARCH.md).

| | |
| :--- | :--- |
| **Package** | [`angular2-hotkeys@22.0.0`](https://www.npmjs.com/package/angular2-hotkeys) |
| **Peers** | `@angular/core` · `@angular/common` **`>=20.0.0 <23.0.0`** · `rxjs` `^7` |
| **Runtime** | Node `^22.22.3 \|\| ^24.15.0 \|\| >=26` · see [`.nvmrc`](.nvmrc) |
| **Package manager** | **pnpm** only (`packageManager` in `package.json` · [`pnpm-lock.yaml`](./pnpm-lock.yaml) · [`pnpm-workspace.yaml`](./pnpm-workspace.yaml)) |
| **zone.js** | **Not required** — library UI is signal-driven |
| **Demo** | [`test-app/`](./test-app) · **6 live use cases** · zoneless · `pnpm start` → `http://127.0.0.1:4300/` |
| **Dashboard** | [`ui/`](./ui) · `make ui` → `http://localhost:8765/` |
| **Research** | [`RESEARCH.md`](./RESEARCH.md) — 17 Angular 21/22 APIs evaluated |

<p align="center">
  <img src="./ui/proof-test-app.png" alt="Demo test-app with use-case panels and shortcut feedback" width="720" />
  <br />
  <sub>Zoneless demo — app-wide shortcuts, allowIn, modal pause, feature lifecycle, command palette, focus-scoped panels (no <code>zone.js</code>)</sub>
</p>

---

## Table of contents

1. [Why this library](#why-this-library)
2. [Angular 22 modernization](#angular-22-modernization)
3. [Requirements](#requirements)
4. [Installation](#installation)
5. [Quick start](#quick-start)
6. [Use case scenarios](#use-case-scenarios)
7. [Same shortcut, different actions by focus](#same-shortcut-different-actions-by-focus)
8. [Zoneless support](#zoneless-support)
9. [Cheat sheet](#cheat-sheet)
10. [Element-scoped hotkeys](#element-scoped-hotkeys)
11. [Configuration](#configuration)
12. [API reference](#api-reference)
13. [Compatibility & migration](#compatibility--migration)
14. [Legacy NgModule support](#legacy-ngmodule-support-deprecated)
15. [Development (Nx workspace)](#development-nx-workspace)
16. [Scripts & Makefile](#scripts--makefile)
17. [License & credits](#license--credits)

---

## Why this library

| Feature | Detail |
| :--- | :--- |
| **Angular 22 APIs** | `input()`, `inject()`, `linkedSignal()`, `resource()`, `@defer`, `afterNextRender()`, OnPush |
| **Zoneless-ready** | Works with `provideZonelessChangeDetection()` — no `zone.js` required |
| **Global + local bindings** | App-wide `HotkeysService` and element-scoped `HotkeysDirective` |
| **Built-in help UI** | `<hotkeys-cheatsheet>` overlay; toggle with `?`; overlay body deferred until first open |
| **Mousetrap combos** | Familiar syntax: `ctrl+s`, `meta+shift+g`, sequences, mod keys |
| **Tree-shakeable package** | `sideEffects: false`, Ivy partial compilation via ng-packagr |
| **Nx monorepo** | Library + real consumer app (6 use-case components) + static dashboard |
| **Tested** | 45 library unit tests (incl. **zoneless** suite) + test-app shell specs; coverage **gate ≥ 85%** (see [Quality bar](#quality-bar)) |

---

## Angular 22 modernization

This release goes beyond a version bump. Legacy patterns were replaced with the current Angular model:

| Before (legacy) | After (v22 line) | Where |
| :--- | :--- | :--- |
| `@Input()` decorator | `input()` signal input | `HotkeysDirective`, cheatsheet `title` |
| Constructor / `@Inject` DI | `inject()` in **all three** classes | `HotkeysService` (`HotkeyOptions`), directive, cheatsheet; app uses `inject(HotkeysService)` |
| Eager cheatsheet DOM | `@defer (when helpVisible())` | Cheatsheet template |
| `effect` + plain `signal` list | `linkedSignal()` + `resource()` | Cheatsheet rows when open |
| `ngOnInit` Mousetrap bind | `afterNextRender()` + rebind `effect` | Directive |
| Zone-based demo / tests only | Zoneless test-app + zoneless suite | `test-app/`, `*.zoneless.spec.ts` |
| Peers `^22` only | Peers **`>=20 <23`** | `package.json` |

**Not adopted (documented in research):** `output()` / `model()` (no two-way outputs in the public surface), `httpResource()` (no HTTP), `@Service` / `injectAsync` (Angular 22-only — would break `>=20` peers), Signal Forms / Aria / router APIs (out of domain).

Full inventory: [`RESEARCH.md`](./RESEARCH.md). Interactive summary: [`ui/`](./ui) (`make ui`).

---

## Requirements

| Tool | Version |
| :--- | :--- |
| **Angular** | `>=20.0.0 <23.0.0` (developed & tested on **22**) |
| **RxJS** | `^7.0.0` as a **peer only** (see below) |
| **Node.js** | `^22.22.3` or `^24.15.0` or `>=26` |
| **TypeScript** (apps) | `~6.0` recommended |
| **zone.js** | **Optional** — not required for this library |

#### Why is `rxjs` in `package.json`?

The library **does not import or use RxJS** in its runtime source (no `Observable`, `Subject`, `async` pipe, or `@angular/core/rxjs-interop`). Cheatsheet visibility and UI updates use **signals** (`cheatSheetToggle`, `linkedSignal`, `resource`) instead of the older `BehaviorSubject` pattern.

`rxjs` is still listed under **`peerDependencies`** (`^7.0.0`) because:

1. **Angular ecosystem convention** — most Angular apps already depend on RxJS; declaring the same peer avoids duplicate installs and matches the usual Angular peer set.
2. **Host compatibility** — consumers and package managers expect the standard `@angular/*` + `rxjs` peer graph; omitting it can produce surprising resolution warnings even when this package never calls RxJS.
3. **Tooling** — CLI / test / build stacks commonly pull RxJS transitively; the peer documents the supported major for hosts that share one copy.

You do **not** need to write RxJS code to use this library. If your app is fully signal-based, you still typically have `rxjs` installed for Angular itself.

> Older library lines target older Angular majors — see [Compatibility & migration](#compatibility--migration).

---

## Installation

```bash
pnpm add angular2-hotkeys
```

Ensure peers are present (most Angular apps already have them):

```bash
pnpm add @angular/core@^22 @angular/common@^22 rxjs@^7
```

`rxjs` is a **peer dependency only** — this package does not use Observables internally (see [Why is `rxjs` in `package.json`?](#why-is-rxjs-in-packagejson)). You do **not** need `zone.js` if your app uses zoneless change detection.

---

## Quick start

### 1. Register providers (zoneless recommended)

```ts
// app.config.ts
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideHotkeys } from 'angular2-hotkeys';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideHotkeys({
      cheatSheetCloseEsc: true,
      cheatSheetDescription: 'Show / hide this help menu',
    }),
  ],
};
```

Zone-based apps still work — use `provideZoneChangeDetection()` (or your existing setup) instead of the zoneless provider. The library does not require Zone.

### 2. Bind shortcuts & show the cheat sheet

```ts
// app.component.ts
import { Component, OnInit, inject } from '@angular/core';
import {
  Hotkey,
  HotkeysCheatsheetComponent,
  HotkeysService,
  type ExtendedKeyboardEvent,
} from 'angular2-hotkeys';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HotkeysCheatsheetComponent],
  template: `
    <main>
      <h1>My app</h1>
      <!-- title is a signal input(); optional consumer-side @defer -->
      @defer (on idle) {
        <hotkeys-cheatsheet title="Keyboard Shortcuts:" />
      }
    </main>
  `,
})
export class AppComponent implements OnInit {
  private readonly hotkeys = inject(HotkeysService);

  ngOnInit(): void {
    this.hotkeys.add(
      new Hotkey(
        'meta+shift+g',
        () => {
          console.log('Typed hotkey');
          return false; // prevent default / stop bubbling for Mousetrap
        },
        undefined, // allowIn: e.g. ['INPUT', 'TEXTAREA']
        'Send a secret message to the console.',
      ),
    );

    // One handler, multiple combos
    this.hotkeys.add(
      new Hotkey(
        ['meta+shift+g', 'alt+shift+s'],
        (event: KeyboardEvent, combo: string) => {
          console.log('Combo:', combo);
          const e = event as ExtendedKeyboardEvent;
          e.returnValue = false;
          return e;
        },
      ),
    );
  }
}
```

### Callback contract

| Return value | Meaning |
| :--- | :--- |
| `false` | Prevent default behavior / stop propagation (Mousetrap convention) |
| `true` | Allow the event to continue |
| `ExtendedKeyboardEvent` | Mutate and return the event (e.g. set `returnValue`) |

Supported key strings follow Mousetrap: [craig.is/killing/mice](https://craig.is/killing/mice).

**Zoneless tip:** update **signals** (or other framework-tracked state) inside callbacks so the UI refreshes without Zone. The integration test-app does this for toasts and “last action”.

---

## Use case scenarios

Every scenario below is implemented as a **real component** in the zoneless integration app ([`test-app/src/app/use-cases/`](./test-app/src/app/use-cases/)). Run and click through them with:

```bash
pnpm start                    # or: pnpm exec nx serve test-app
# → http://127.0.0.1:4300/  (watch “Last action” + toast for feedback)
# optional dashboard: make ui → http://localhost:8765/
```

| # | Scenario | Live component |
| :--- | :--- | :--- |
| 1 | App-wide save / undo / help | [`test-app/src/app/app.ts`](./test-app/src/app/app.ts) |
| 2 | `allowIn` while typing | [`use-cases/composer-allow-in.component.ts`](./test-app/src/app/use-cases/composer-allow-in.component.ts) |
| 3 | Modal `pause` / Esc only | [`use-cases/modal-pause.component.ts`](./test-app/src/app/use-cases/modal-pause.component.ts) |
| 4 | Feature lifecycle (add/remove) | [`use-cases/feature-inbox.component.ts`](./test-app/src/app/use-cases/feature-inbox.component.ts) |
| 5 | Command palette | [`use-cases/command-palette.component.ts`](./test-app/src/app/use-cases/command-palette.component.ts) |
| 6 | Same combo by focus | [`use-cases/multi-panel-workspace.component.ts`](./test-app/src/app/use-cases/multi-panel-workspace.component.ts) |

Shared toast / last-action log: [`action-log.service.ts`](./test-app/src/app/action-log.service.ts).

### 1. App-wide save / undo / open help

**Source:** `test-app/src/app/app.ts` — registers on the root `HotkeysService` once.

```ts
// test-app/src/app/app.ts (excerpt)
this.hotkeys.add(
  new Hotkey(
    'ctrl+s',
    () => {
      this.log.log('ctrl+s → Save (app-wide)');
      return false; // prevent browser “Save page”
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
// '?' comes from provideHotkeys() unless disableCheatSheet: true
```

Prefer `mod+` instead of `ctrl+` / `command+` when you want the platform primary modifier; the demo uses `ctrl+` so Playwright proofs stay OS-stable.

### 2. Allow a shortcut while typing in an input

**Source:** `ComposerAllowInComponent` — `Ctrl+Enter` sends while the caret is in the textarea.

By default, global combos are **suppressed** in `INPUT`, `SELECT`, and `TEXTAREA`. Opt a combo back in with `allowIn`:

```ts
// test-app/src/app/use-cases/composer-allow-in.component.ts (excerpt)
this.binding = this.hotkeys.add(
  new Hotkey(
    'ctrl+enter',
    () => {
      this.lastSend.set(this.draft().trim() || '(empty)');
      this.log.log(`ctrl+enter → send …`);
      return false;
    },
    ['TEXTAREA', 'INPUT'], // fire even while focused in form fields
    'Send composer message (works in inputs)',
  ),
) as Hotkey;
```

Also works for custom tags via `nodeName` (e.g. cheatsheet uses `HOTKEYS-CHEATSHEET` for Esc close).

### 3. Modal / drawer: close with `Esc`, pause the rest

**Source:** `ModalPauseComponent` — Open dialog button on the demo page.

```ts
// test-app/src/app/use-cases/modal-pause.component.ts (excerpt)
open(): void {
  this.hotkeys.pause(); // stash all current global bindings
  this.modalKeys = this.hotkeys.add(
    new Hotkey('esc', () => {
      this.close();
      return false;
    }, undefined, 'Close demo dialog'),
  ) as Hotkey[];
  this.openState.set(true);
}

close(): void {
  this.hotkeys.remove(this.modalKeys);
  this.hotkeys.unpause(); // restore what was active before the modal
  this.openState.set(false);
}
```

### 4. Route- or feature-specific shortcuts

**Source:** `FeatureInboxComponent` — mounted with `@if (showInbox())` from the shell; **Unmount inbox feature** removes `j` / `k` / `e`.

```ts
// test-app/src/app/use-cases/feature-inbox.component.ts (excerpt)
ngOnInit(): void {
  this.bindings = this.hotkeys.add([
    new Hotkey('j', () => { this.next(); return false; }, undefined, 'Inbox: next thread'),
    new Hotkey('k', () => { this.prev(); return false; }, undefined, 'Inbox: previous thread'),
    new Hotkey('e', () => { this.archive(); return false; }, undefined, 'Inbox: archive thread'),
  ]) as Hotkey[];
}

ngOnDestroy(): void {
  this.hotkeys.remove(this.bindings); // no ghost handlers after unmount
}
```

### 5. Command palette / “go to”

**Source:** `CommandPaletteComponent` — `Ctrl+K` opens; while open, globals are `pause()`d and `Esc` closes.

```ts
// test-app/src/app/use-cases/command-palette.component.ts (excerpt)
this.openBinding = this.hotkeys.add(
  new Hotkey('ctrl+k', () => {
    this.openState() ? this.close() : this.open();
    return false;
  }, undefined, 'Toggle command palette'),
) as Hotkey;
```

UI state is a **signal** (`openState`) so zoneless hosts re-render without Zone.

### 6. Multi-panel UI (list + editor) — same combo, focus decides

**Source:** `MultiPanelWorkspaceComponent` — click a panel, then `Ctrl+S`.

| Focus | `Ctrl+S` | Other |
| :--- | :--- | :--- |
| File list panel | Export selection | `Del` → delete selection |
| Editor panel | Save document | `Esc` → blur panel |
| Neither (app shell) | App-wide Save from `app.ts` | — |

Bindings are applied **only while the panel is focused** (`computed` → `[hotkeys]`), so the app-wide handler returns when both panels blur. Full pattern notes: [Same shortcut, different actions by focus](#same-shortcut-different-actions-by-focus).

### 7. Try the full matrix

| Combo | Where | Expected last-action log |
| :--- | :--- | :--- |
| `?` / `Esc` | Anywhere (cheatsheet not paused) | Toggle / close cheatsheet |
| `Ctrl+S` | App shell (no panel focused) | `Save (app-wide)` |
| `Ctrl+Z` | App shell (not in an input) | `Undo (app-wide)` |
| `Ctrl+Enter` | Focus composer textarea | `send “…” (allowIn TEXTAREA)` |
| `Ctrl+K` | App shell | Command palette open |
| `J` / `K` / `E` | Inbox mounted | Next / previous / archive |
| `Ctrl+S` | Focus file list | `export selection` |
| `Ctrl+S` | Focus editor | `save document` |

Browser smoke proof (cheatsheet + app-wide save): `make prove` with the app on port **4300**.

---

## Same shortcut, different actions by focus

Apps often need **one combo** (e.g. `mod+s`, `Esc`, `Delete`) to mean different things depending on **which component owns focus**. This library supports that in three complementary ways.

### Mental model

| Layer | Scope | When it runs |
| :--- | :--- | :--- |
| **Global** `HotkeysService.add(...)` | Whole document (Mousetrap on `document`) | Always, unless suppressed in form fields or `pause()`d |
| **Element-scoped** `[hotkeys]` | Host element + descendants (Mousetrap on that node) | When focus is inside the host |
| **Callback branching** | Single global binding | You inspect focus / app state inside the handler |

```text
┌─────────────────────────────────────────────┐
│  App shell — global Ctrl+S = “Save (app)”   │
│  ┌──────────────────┐  ┌─────────────────┐  │
│  │ [hotkeys] list   │  │ [hotkeys] editor│  │
│  │ Ctrl+S → export  │  │ Ctrl+S → save   │  │
│  │ Del → remove     │  │ Esc → blur      │  │
│  └──────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────┘
```

### Pattern A — Element-scoped override (recommended)

**Live demo:** [`multi-panel-workspace.component.ts`](./test-app/src/app/use-cases/multi-panel-workspace.component.ts).

`HotkeysDirective` binds Mousetrap **to the host element**. While a local combo is bound it also **temporarily removes** any **global** binding for the same combo (app-wide `HotkeysService`) and restores it when the local list is cleared or the host is destroyed.

The demo applies bindings **only while focused** (`computed` empty array when blurred) so app-wide `Ctrl+S` returns when no panel owns focus:

```ts
// test-app/src/app/use-cases/multi-panel-workspace.component.ts (excerpt)
readonly listHotkeys = computed<HotkeyBindingMap[]>(() =>
  this.focused() === 'list'
    ? [{ 'ctrl+s': () => { this.exportSelection(); return false; } }, /* del … */]
    : [],
);

readonly editorHotkeys = computed<HotkeyBindingMap[]>(() =>
  this.focused() === 'editor'
    ? [{ 'ctrl+s': () => { this.saveDocument(); return false; } }, /* esc … */]
    : [],
);
```

```html
<section tabindex="0" [hotkeys]="listHotkeys()" (focusin)="focused.set('list')">…</section>
<section tabindex="0" [hotkeys]="editorHotkeys()" (focusin)="focused.set('editor')">…</section>
```

**Tips for multi-panel UIs**

- Give each panel a visible focus style so users know which set of shortcuts is active.
- Prefer **click-to-focus** on the panel container (`tabindex="0"`) so mouse users enter the right scope.
- Prefer **focus-gated** `[hotkeys]` (empty when blurred) if you still want an app-wide fallback for the same combo.
- Keep descriptions only on the global “default” combos if you do not want duplicate cheatsheet rows for every panel override.

### Pattern B — One global handler, branch on focus / state

Use when the same combo should stay registered globally and logic is simple:

```ts
this.hotkeys.add(
  new Hotkey(
    'mod+s',
    () => {
      const active = document.activeElement as HTMLElement | null;

      if (active?.closest('app-editor-panel')) {
        this.saveEditor();
        return false;
      }
      if (active?.closest('app-file-list')) {
        this.exportList();
        return false;
      }

      // Fallback: app-wide default
      this.saveAllDirty();
      return false;
    },
    undefined,
    'Save (context-aware)',
  ),
);
```

Or drive branching from an Angular focus service / signal set by `(focusin)` on panels — better for tests and zoneless purity than reading the DOM ad hoc.

```ts
// focus-context.service.ts (sketch)
@Injectable({ providedIn: 'root' })
export class FocusContext {
  readonly region = signal<'shell' | 'list' | 'editor'>('shell');
}

// in the global hotkey:
new Hotkey('mod+s', () => {
  switch (this.focus.region()) {
    case 'editor': this.saveEditor(); break;
    case 'list': this.exportList(); break;
    default: this.saveAllDirty();
  }
  return false;
}, undefined, 'Save (context-aware)');
```

### Pattern C — Swap globals when a feature becomes active

Useful for full-screen modes (image cropper, code diff) where the whole page is one “focus mode” even if DOM focus moves among children:

```ts
enterCropMode(): void {
  this.hotkeys.pause();
  this.modeKeys = this.hotkeys.add([
    new Hotkey('enter', () => (this.applyCrop(), false), undefined, 'Apply crop'),
    new Hotkey('esc', () => (this.cancelCrop(), false), undefined, 'Cancel crop'),
  ]) as Hotkey[];
}

leaveCropMode(): void {
  this.hotkeys.remove(this.modeKeys);
  this.hotkeys.unpause();
}
```

### Choosing a pattern

| Situation | Prefer |
| :--- | :--- |
| Two+ panels visible; shortcut follows keyboard focus | **A — `[hotkeys]` per panel** |
| Mostly one meaning; rare special cases | **B — branch in one global callback** |
| Full-screen mode replaces the whole shortcut map | **C — `pause` / add / `unpause`** |
| Must work while caret is in an `<input>` | Global + **`allowIn`** (see use case 2) |
| Must not steal keys from form fields | Default global behavior (no `allowIn`) |

### Pitfalls

1. **Missing `tabindex`** — a non-focusable `div` never receives focus; element-scoped combos will not run. Use `tabindex="0"` (or a real control inside the host).
2. **Forgetting restore** — if you `remove` globals yourself, always re-`add` them in `ngOnDestroy` / `DestroyRef`. The directive does this for you for stashed combos.
3. **Returning `true` vs `false`** — return `false` when you handled the shortcut and want to stop the browser default (especially `mod+s`, `mod+p`).
4. **Cheatsheet noise** — panel overrides often omit `description` so only app-wide defaults appear in `?` help.
5. **Zoneless** — mutate **signals** (or call `ChangeDetectorRef.markForCheck()`) inside handlers so the focused panel’s UI updates.

---

## Zoneless support

**This library supports zoneless Angular applications.**

| Feature | Zoneless status | Mechanism |
| :--- | :--- | :--- |
| Global hotkey callbacks | ✅ | App updates signals from callbacks |
| Cheatsheet open / close (`?`, `Esc`) | ✅ | `HotkeysService.cheatSheetToggle` signal |
| Cheatsheet row list | ✅ | `linkedSignal` + `resource` + `registryVersion` |
| Element-scoped directive | ✅ | `input()` + `afterNextRender` bind |
| Pause / unpause | ✅ | Registry mutations bump `registryVersion` |

How we verify it:

- Unit suite: `src/lib/hotkeys.zoneless.spec.ts` with `provideZonelessChangeDetection()`
- Integration app: [`test-app/`](./test-app) — **no** `zone.js` polyfill, zoneless providers
- Browser proof: `make prove` exercises `?`, `Esc`, and `ctrl+s` on port **4300**

```ts
// Minimal zoneless host
bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideHotkeys({ cheatSheetCloseEsc: true }),
  ],
});
```

Remove `zone.js` from `angular.json` `polyfills` (and from dependencies) when you fully migrate the app.

---

## Cheat sheet

Add the standalone component once near the root of your UI:

```html
<hotkeys-cheatsheet />
<!-- or with a custom title (signal input) -->
<hotkeys-cheatsheet title="Hotkeys Rock!" />
```

| Behavior | Default |
| :--- | :--- |
| Toggle combo | `?` (configurable) |
| Close with `Esc` | off — set `cheatSheetCloseEsc: true` |
| Default title | `Keyboard Shortcuts:` (signal `input()`) |
| Rows shown | Only hotkeys that have a **description** |
| First paint | Overlay body is **`@defer`red** until first open (`when helpVisible()`) |
| CSS classes | Unchanged: `cfp-hotkeys-container`, `cfp-hotkeys`, `cfp-hotkeys-title`, `cfp-hotkeys-key`, … |

**Tips**

- Pass a `string` or `() => string` as the 4th `Hotkey` argument for the help text.
- Pass `allowIn` as the 3rd argument (`['INPUT', 'SELECT', 'TEXTAREA']`) if the combo should fire while typing in form fields.
- Visibility is driven by `HotkeysService.cheatSheetToggle` (`WritableSignal<boolean>`).
- Internally, described rows use **`resource()`** (async snapshot when open) and **`linkedSignal()`** (writable list reset when open/registry changes).

<p align="center">
  <img src="./ui/proof-cheatsheet.png" alt="Cheat sheet overlay listing described hotkeys" width="560" />
</p>

---

## Element-scoped hotkeys

Bind shortcuts to a host element (and its children) with the standalone `HotkeysDirective`. The `[hotkeys]` binding is a **signal input** and rebinds when the value changes. This is the primary tool for [focus-dependent combos](#same-shortcut-different-actions-by-focus).

```html
<div
  tabindex="0"
  [hotkeys]="[
    { 'ctrl+k': onCommandPalette },
    { 'esc': onEscape }
  ]"
>
  Focusable region with local shortcuts
</div>
```

```ts
import { HotkeysDirective } from 'angular2-hotkeys';

@Component({
  imports: [HotkeysDirective],
  // ...
})
export class EditorComponent {
  onCommandPalette = () => {
    /* ... */
    return false;
  };
  onEscape = () => {
    /* ... */
    return false;
  };
}
```

**How it works**

1. Mousetrap is created on the **host element** in **`afterNextRender()`** (SSR/hydration-friendly).
2. For each local combo, any **global** binding on the **app-wide** `HotkeysService` (from `provideHotkeys`) with the same combo is **removed and stashed**.
3. An `effect` rebinds when the `hotkeys` signal input changes after the view is ready.
4. On destroy (or when the input becomes `[]`), local keys unbind and stashed **globals are restored**.

Import `HotkeysDirective` on the standalone component that owns the host. The host app must provide `HotkeysService` via `provideHotkeys()` / `HotkeyModule.forRoot()` — the directive does **not** create a private service instance.

---

## Configuration

Pass an `IHotkeyOptions` object to `provideHotkeys(options)`:

```ts
provideHotkeys({
  disableCheatSheet: false,
  cheatSheetHotkey: '?',
  cheatSheetCloseEsc: true,
  cheatSheetCloseEscDescription: 'Hide this help menu',
  cheatSheetDescription: 'Show / hide this help menu',
});
```

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `disableCheatSheet` | `boolean` | `false` | Skip registering the help overlay toggle |
| `cheatSheetHotkey` | `string` | `'?'` | Combo that toggles the cheat sheet |
| `cheatSheetCloseEsc` | `boolean` | `false` | Also bind `Esc` to close the sheet |
| `cheatSheetCloseEscDescription` | `string` | `'Hide this help menu'` | Help text for the Esc row |
| `cheatSheetDescription` | `string` | `'Show / hide this help menu'` | Help text for the toggle combo |

---

## API reference

All public symbols are re-exported from `angular2-hotkeys`:

| Export | Kind | Purpose |
| :--- | :--- | :--- |
| `provideHotkeys()` | function | Environment providers for standalone bootstrap |
| `HotkeysService` | service | DI-only (`inject(HotkeyOptions)` on construct). `add` / `remove` / `get` / `pause` / `unpause` / `reset`; `cheatSheetToggle` + `registryVersion` signals. **Do not** `new HotkeysService()` |
| `Hotkey` | class | Combo + callback + `allowIn` + description model (**public API unchanged**) |
| `ExtendedKeyboardEvent` | interface | Keyboard event with `returnValue` |
| `HotkeysCheatsheetComponent` | component | Standalone help overlay (`title` signal `input()`, OnPush, `@defer`) |
| `HotkeysDirective` | directive | Element-scoped bindings (`hotkeys` signal `input()`) |
| `HotkeyBindingMap` | type | Map shape for the directive input |
| `IHotkeyOptions` | interface | Configuration shape |
| `HotkeyOptions` | token | DI token for options |
| `HotkeyModule` | NgModule | **Deprecated** — prefer `provideHotkeys()` |

### `HotkeysService` signals

| Member | Type | Role |
| :--- | :--- | :--- |
| `cheatSheetToggle` | `WritableSignal<boolean>` | Open/closed state for the cheatsheet |
| `registryVersion` | `Signal<number>` | Bumps on add/remove/pause/reset — drives cheatsheet `linkedSignal` / `resource` |

### `Hotkey` constructor

```ts
new Hotkey(
  combo: string | string[],
  callback: (event: KeyboardEvent, combo: string) => ExtendedKeyboardEvent | boolean,
  allowIn?: string[],
  description?: string | (() => string),
  action?: string,
  persistent?: boolean,
)
```

---

## Compatibility & migration

| Library version | Angular | Notes |
| :--- | :--- | :--- |
| **v22.x** | **`>=20 <23`** | **Current** — signal component model, zoneless, `resource` / `linkedSignal`, `@defer` |
| v20.x | Angular 20 | Standalone + Signals baseline |
| v16.x | Angular 16 | Ivy-era module API |
| v15.x | Angular 15 | |
| v13.x | Angular 13 | (often works on 12) |
| v2.4.0 | Angular 11 | Legacy line |

### Migrating from the Angular 20 line

1. Bump `angular2-hotkeys` to `^22` (this branch / release).
2. Prefer `inject(HotkeysService)` over constructor injection.
3. Prefer `provideZonelessChangeDetection()` and remove `zone.js` polyfills when the rest of the app is ready.
4. Cheatsheet `title` is a **signal input** — use `[title]="..."` / `setInput('title', ...)` in tests.
5. Element-scoped `[hotkeys]` is a **signal input** (`input()`); it rebinds when the bound value changes.
6. Optional: wrap `<hotkeys-cheatsheet>` in `@defer (on idle)`, or rely on the component’s internal `@defer (when helpVisible())`.
7. No change required to `Hotkey` construction or `cfp-hotkeys-*` CSS class names.

See [`RESEARCH.md`](./RESEARCH.md) for the full Angular 22 API inventory and applicability decisions.

---

## Legacy NgModule support (deprecated)

`HotkeyModule.forRoot()` remains for older module-based apps. **New apps should use `provideHotkeys()`.**

```ts
import { HotkeyModule } from 'angular2-hotkeys';

@NgModule({
  imports: [
    HotkeyModule.forRoot({ cheatSheetCloseEsc: true }),
  ],
})
export class AppModule {}
```

Feature modules that only need the directive/cheatsheet should import `HotkeyModule` **without** `.forRoot()`.

---

## Development (Nx workspace)

This repository is an [Nx](https://nx.dev) monorepo.

```
.
├── src/                 # publishable library (angular2-hotkeys)
├── test-app/            # Angular 22 zoneless consumer
├── ui/                  # static modernization dashboard
├── RESEARCH.md          # Angular 21/22 API research (committed before code changes)
├── project.json         # library targets
├── test-app/project.json
├── nx.json
└── package.json
```

| Project | Type | Targets |
| :--- | :--- | :--- |
| `angular2-hotkeys` | library | `build` · `test` · `lint` |
| `test-app` | application | `build` · `serve` · `test` (depends on library `build`) |

### Setup

```bash
git clone https://github.com/Yuri-Lima/angular2-hotkeys.git
cd angular2-hotkeys
nvm use                          # Node version from .nvmrc (≥ 22.22.3)
corepack enable                  # activates pnpm from packageManager field
pnpm install                     # reads pnpm-lock.yaml (never use npm install here)
```

> **pnpm only.** This workspace is configured with `packageManager`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml`. Do **not** commit `package-lock.json` or `yarn.lock`. Prefer `pnpm exec …` over bare `npx` so the local toolchain is used.

### Common commands

```bash
# Library (also: make build | make test | make lint)
pnpm exec nx build angular2-hotkeys --configuration=production
pnpm exec nx test angular2-hotkeys     # Karma + Jasmine, ChromeHeadless, coverage gate ≥ 85%
pnpm exec nx lint angular2-hotkeys

# Or the root package.json scripts
pnpm run build
pnpm test
pnpm run lint
pnpm run build:release             # production library build (publish path)

# Zoneless demo app (depends on library build; reinstalls test-app via pnpm)
pnpm exec nx serve test-app        # http://127.0.0.1:4300/
# equivalent: pnpm start  |  make serve-test-app

# Modernization dashboard (stdlib static server)
make ui                            # http://localhost:8765/

# Browser integration proof — requires test-app already serving on :4300
make prove                         # or: pnpm run prove

# Project graph (opens the Nx UI)
pnpm exec nx graph                 # or: make graph | pnpm run graph
```

### Quality bar

| Check | Expectation |
| :--- | :--- |
| Unit tests | **45** specs (service, directive, cheatsheet, providers, **zoneless suite**) |
| Coverage **gate** (enforced) | `karma.conf.js` → statements / lines / functions **≥ 85%**, branches **≥ 65%** (build fails if lower) |
| Coverage **measured** (last local run) | Karma `text-summary` after `pnpm exec nx test angular2-hotkeys` (45 SUCCESS): **statements 96.63%** (201/208), **lines 96.46%** (191/198), **functions 97.56%** (40/41), **branches 75.75%** (50/66) |
| Production build | `pnpm exec nx build angular2-hotkeys --configuration=production` clean |
| Integration | Live use cases on **:4300**; `make prove` / `pnpm run prove` — Playwright `?` / `Esc` / `ctrl+s` |
| Dashboard | `make ui` — research inventory, before/after diffs, live key demo on **:8765** |

> **Gate vs measured:** “≥ 85%” is the **threshold in config**. The **96.63% / 96.46%** figures are the **actual** Karma report from a successful run — re-run `pnpm exec nx test angular2-hotkeys` and read the “Coverage summary” block for the current numbers. Do not treat a rounded “~95%” as the gate.

---

## Scripts & Makefile

### pnpm scripts (root)

| Script | Description | Verified |
| :--- | :--- | :--- |
| `pnpm start` | Serve the zoneless demo (`nx serve test-app` → `:4300`) | ✅ |
| `pnpm run build` | Build the library (default configuration) | ✅ |
| `pnpm run build:release` | Production library build for publish | ✅ |
| `pnpm test` | Library unit tests (includes zoneless suite) | ✅ |
| `pnpm run lint` | ESLint via Nx | ✅ |
| `pnpm run graph` | Open the Nx project graph UI | (opens browser) |
| `pnpm run prove` | Browser integration proof against `:4300` (app must be serving) | ✅ |

### Makefile

| Target | Action | Equivalent |
| :--- | :--- | :--- |
| `make build` | Production library build | `pnpm exec nx build angular2-hotkeys --configuration=production` |
| `make test` | Library tests + coverage | `pnpm exec nx test angular2-hotkeys` |
| `make lint` | Lint the library | `pnpm exec nx lint angular2-hotkeys` |
| `make serve-test-app` | Zoneless demo on port **4300** | `pnpm exec nx serve test-app` / `pnpm start` |
| `make prove` | Playwright proof (`?` / `Esc` / `ctrl+s`) | `pnpm run prove` |
| `make graph` | Nx graph | `pnpm exec nx graph` |
| `make ui` | Modernization dashboard on port **8765** | `bash scripts/open-ui.sh` |

---

## License & credits

**MIT** © [Nick Richardson](mailto:nick.richardson@mediapixeldesign.com)

Inspired by / based on [angular-hotkeys](https://github.com/chieffancypants/angular-hotkeys) and [Mousetrap](https://craig.is/killing/mice).

Issues and pull requests are welcome:  
[github.com/Yuri-Lima/angular2-hotkeys/issues](https://github.com/Yuri-Lima/angular2-hotkeys/issues)
