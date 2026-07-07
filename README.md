# angular2-hotkeys

<p align="center">
  <strong>Declarative keyboard shortcuts for Angular</strong><br />
  Angular 22 APIs · Zoneless · Signals · Mousetrap · Nx
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/angular2-hotkeys"><img alt="npm version" src="https://img.shields.io/badge/npm-v22.0.0-CB3837?style=flat-square&logo=npm" /></a>
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
| **zone.js** | **Not required** — library UI is signal-driven |
| **Demo** | [`test-app/`](./test-app) · zoneless · `npx nx serve test-app` → `http://127.0.0.1:4300/` |
| **Dashboard** | [`ui/`](./ui) · `make ui` → `http://localhost:8765/` |
| **Research** | [`RESEARCH.md`](./RESEARCH.md) — 17 Angular 21/22 APIs evaluated |

<p align="center">
  <img src="./ui/proof-test-app.png" alt="Demo test-app with cheatsheet and shortcut feedback" width="720" />
  <br />
  <sub>Zoneless integration demo — <code>?</code> / <code>Esc</code> / <code>ctrl+s</code> without <code>zone.js</code></sub>
</p>

---

## Table of contents

1. [Why this library](#why-this-library)
2. [Angular 22 modernization](#angular-22-modernization)
3. [Requirements](#requirements)
4. [Installation](#installation)
5. [Quick start](#quick-start)
6. [Zoneless support](#zoneless-support)
7. [Cheat sheet](#cheat-sheet)
8. [Element-scoped hotkeys](#element-scoped-hotkeys)
9. [Configuration](#configuration)
10. [API reference](#api-reference)
11. [Compatibility & migration](#compatibility--migration)
12. [Legacy NgModule support](#legacy-ngmodule-support-deprecated)
13. [Development (Nx workspace)](#development-nx-workspace)
14. [Scripts & Makefile](#scripts--makefile)
15. [License & credits](#license--credits)

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
| **Nx monorepo** | Library + real consumer app + static dashboard in one graph |
| **Tested** | 45 unit tests (incl. dedicated **zoneless** suite); coverage **gate ≥ 85%** (see [Quality bar](#quality-bar)) |

---

## Angular 22 modernization

This release goes beyond a version bump. Legacy patterns were replaced with the current Angular model:

| Before (legacy) | After (v22 line) | Where |
| :--- | :--- | :--- |
| `@Input()` decorator | `input()` signal input | `HotkeysDirective`, cheatsheet `title` |
| Constructor DI | `inject()` field injection | Directive, cheatsheet, test-app |
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
npm install angular2-hotkeys
```

Ensure peers are present (most Angular apps already have them):

```bash
npm install @angular/core@^22 @angular/common@^22 rxjs@^7
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

Bind shortcuts to a host element (and its children) with the standalone directive. The `[hotkeys]` binding is a **signal input** and rebinds when the value changes.

```html
<div
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

Mousetrap is attached in **`afterNextRender()`** so the host element is in the DOM (SSR/hydration-friendly). On destroy, local bindings unbind and any temporarily overridden global combos are restored.

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
| `HotkeysService` | service | `add` / `remove` / `get` / `pause` / `unpause` / `reset`; `cheatSheetToggle` signal; `registryVersion` signal |
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
npm install --legacy-peer-deps
```

### Common commands

```bash
# Library
npx nx build angular2-hotkeys --configuration=production
npx nx test angular2-hotkeys     # Karma + Jasmine, ChromeHeadless, coverage ≥ 85%
npx nx lint angular2-hotkeys

# Zoneless demo app (builds the library when needed)
npx nx serve test-app            # http://127.0.0.1:4300/

# Modernization dashboard
make ui                          # http://localhost:8765/

# Browser integration proof (?, Esc, ctrl+s)
make prove

# Project graph
npx nx graph
```

### Quality bar

| Check | Expectation |
| :--- | :--- |
| Unit tests | **45** specs (service, directive, cheatsheet, providers, **zoneless suite**) |
| Coverage **gate** (enforced) | `karma.conf.js` → statements / lines / functions **≥ 85%**, branches **≥ 65%** (build fails if lower) |
| Coverage **measured** (last local run) | Karma `text-summary` after `nx test angular2-hotkeys` (45 SUCCESS): **statements 94.81%** (201/212), **lines 94.55%** (191/202), **functions 97.77%** (44/45), **branches 72.3%** (47/65) |
| Production build | `nx build angular2-hotkeys --configuration=production` clean |
| Integration | `make prove` — Playwright `?` / `Esc` / `ctrl+s` against zoneless test-app |
| Dashboard | `make ui` — research inventory, before/after diffs, live key demo |

> **Gate vs measured:** “≥ 85%” is the **threshold in config**. The **94.81% / 94.55%** figures are the **actual** Karma report from a successful run — re-run `npx nx test angular2-hotkeys` and read the “Coverage summary” block for the current numbers. Do not treat a rounded “~95%” as the gate.

---

## Scripts & Makefile

### npm scripts (root)

| Script | Description |
| :--- | :--- |
| `npm start` | Serve the zoneless demo app (`nx serve test-app`) |
| `npm run build` | Build the library |
| `npm run build:release` | Production build for publish |
| `npm test` | Library unit tests (includes zoneless suite) |
| `npm run lint` | ESLint via Nx |
| `npm run graph` | Open the Nx graph |
| `npm run prove` | Browser integration proof against `:4300` |

### Makefile

| Target | Action |
| :--- | :--- |
| `make build` | Production library build |
| `make test` | Library tests + coverage |
| `make lint` | Lint the library |
| `make serve-test-app` | Zoneless demo on port **4300** |
| `make prove` | Playwright proof |
| `make graph` | Nx graph |
| `make ui` | Modernization dashboard on port **8765** |

---

## License & credits

**MIT** © [Nick Richardson](mailto:nick.richardson@mediapixeldesign.com)

Inspired by / based on [angular-hotkeys](https://github.com/chieffancypants/angular-hotkeys) and [Mousetrap](https://craig.is/killing/mice).

Issues and pull requests are welcome:  
[github.com/Yuri-Lima/angular2-hotkeys/issues](https://github.com/Yuri-Lima/angular2-hotkeys/issues)
