# angular2-hotkeys

Angular keyboard shortcuts library built on [Mousetrap](https://craig.is/killing/mice), with **standalone APIs**, **Signals**, and an **[Nx](https://nx.dev) workspace**.

| | |
| --- | --- |
| **Library version** | `22.0.0` |
| **Angular peer** | `^22.0.0` |
| **Nx** | `23.1` (`nx` / `@nx/angular` — latest line that supports Angular 22) |
| **TypeScript** | `~6.0` |
| **zone.js** | `~0.16` |
| **Node** | `^22.22.3 \|\| ^24.15.0 \|\| >=26` (see [`.nvmrc`](.nvmrc)) |

## Versions compatibility

| Library | Angular |
| --- | --- |
| v2.4.0 | Angular 11 (most likely lower Angular versions) |
| v13.\*.\* | Angular 13 (most likely Angular 12) |
| v15.\*.\* | Angular 15 |
| v16.\*.\* | Angular 16 |
| v20.\*.\* | Angular 20 (standalone + signals) |
| **v22.\*.\*** | **Angular 22 + Nx workspace (current)** |

## Installation

```bash
npm install angular2-hotkeys --save
```

Peer dependencies (install if your app does not already have them):

```bash
npm install @angular/core@^22 @angular/common@^22 rxjs@^7
```

## Quick start (recommended — Angular 22 standalone)

Register providers in `app.config.ts`, then inject `HotkeysService` and import the cheatsheet component where needed.

```typescript
// app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHotkeys } from 'angular2-hotkeys';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHotkeys({
      cheatSheetCloseEsc: true,
      cheatSheetDescription: 'Show / hide this help menu',
    }),
  ],
};
```

```typescript
// app.component.ts
import { Component, OnInit } from '@angular/core';
import { Hotkey, HotkeysCheatsheetComponent, HotkeysService } from 'angular2-hotkeys';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HotkeysCheatsheetComponent],
  template: `
    <h1>My app</h1>
    <hotkeys-cheatsheet title="Keyboard Shortcuts:" />
  `,
})
export class AppComponent implements OnInit {
  constructor(private hotkeys: HotkeysService) {}

  ngOnInit(): void {
    this.hotkeys.add(
      new Hotkey(
        'meta+shift+g',
        (event: KeyboardEvent): boolean => {
          console.log('Typed hotkey');
          return false; // Prevent bubbling
        },
        undefined,
        'Send a secret message to the console.',
      ),
    );

    // Multiple combos for one callback
    this.hotkeys.add(
      new Hotkey(
        ['meta+shift+g', 'alt+shift+s'],
        (event: KeyboardEvent, combo: string) => {
          console.log('Combo: ' + combo);
          const e = event as import('angular2-hotkeys').ExtendedKeyboardEvent;
          e.returnValue = false;
          return e;
        },
      ),
    );
  }
}
```

Your callback must return either a `boolean` or an `ExtendedKeyboardEvent`.

For the full list of supported key combinations, see <https://craig.is/killing/mice>.

## Cheat sheet

Add the standalone cheatsheet component to a top-level template:

```html
<hotkeys-cheatsheet></hotkeys-cheatsheet>
<!-- Optional custom title (signal input) -->
<hotkeys-cheatsheet title="Hotkeys Rock!"></hotkeys-cheatsheet>
<!-- Default title: 'Keyboard Shortcuts:' -->
```

The `HotkeysService` registers the `?` key combo to toggle the sheet (unless disabled via options).

**Note:** Only hotkeys with a **description** appear on the cheat sheet. Pass a `string` or `() => string` as the fourth constructor argument for dynamic descriptions.

The third parameter (`allowIn`) can list tag names (`'INPUT'`, `'SELECT'`, `'TEXTAREA'`) where the combo is allowed to fire.

### Options (`IHotkeyOptions`)

Pass options to `provideHotkeys(options)` (or the deprecated `HotkeyModule.forRoot(options)`):

```typescript
export interface IHotkeyOptions {
  /** Disable the cheat sheet popover dialog? Default: false */
  disableCheatSheet?: boolean;
  /** Key combination to trigger the cheat sheet. Default: '?' */
  cheatSheetHotkey?: string;
  /** Also use ESC to close the cheat sheet. Default: false */
  cheatSheetCloseEsc?: boolean;
  /** Description for the ESC key on the sheet. Default: 'Hide this help menu' */
  cheatSheetCloseEscDescription?: string;
  /** Description for the cheat-sheet toggle key. Default: 'Show / hide this help menu' */
  cheatSheetDescription?: string;
}
```

## Legacy NgModule usage (deprecated)

`HotkeyModule` / `HotkeyModule.forRoot()` remain available for older module-based apps but are **deprecated**. Prefer `provideHotkeys()` for Angular 22.

```typescript
import { HotkeyModule } from 'angular2-hotkeys';

@NgModule({
  imports: [CommonModule, HotkeyModule.forRoot({ cheatSheetCloseEsc: true })],
})
export class AppModule {}
```

Feature modules that need the directive/cheatsheet should import `HotkeyModule` **without** `.forRoot()`.

## Workspace (Nx)

This repository is an [Nx](https://nx.dev) workspace. The publishable library and the demo consumer app are separate projects in the graph.

| Project | Type | Main targets |
| --- | --- | --- |
| `angular2-hotkeys` | library | `build`, `test`, `lint` |
| `test-app` | application | `build`, `serve`, `test` (depends on library `build`) |

```bash
# Node 22.22+ required for Angular 22
nvm use   # reads .nvmrc

npm install --legacy-peer-deps

# Library
npx nx build angular2-hotkeys
npx nx test angular2-hotkeys
npx nx lint angular2-hotkeys

# Demo consumer (builds the library first when needed)
npx nx serve test-app
# → http://127.0.0.1:4300/

# Task graph
npx nx graph
```

### Makefile shortcuts

| Command | Action |
| --- | --- |
| `make build` | Production library build via Nx |
| `make test` | Library unit tests (ChromeHeadless + coverage) |
| `make lint` | ESLint via Nx |
| `make serve-test-app` | Serve the Angular 22 demo app |
| `make prove` | Playwright browser proof (`?` / Esc / ctrl+s) |
| `make graph` | Open the Nx project graph |
| `make ui` | Serve the local migration dashboard (`ui/`) |

### Package scripts

| Script | Description |
| --- | --- |
| `npm run build` | `nx build angular2-hotkeys` |
| `npm run build:release` | Production build for publish |
| `npm test` | `nx test angular2-hotkeys` |
| `npm run lint` | `nx lint angular2-hotkeys` |
| `npm start` | `nx serve test-app` |
| `npm run graph` | `nx graph` |
| `npm run prove` | Browser integration proof script |

## Development & testing

Library unit tests use Karma + Jasmine (34 specs, coverage thresholds in `karma.conf.js`). The `test-app/` project is an Angular **22** consumer that depends on the built package at `dist/` (`file:../dist`).

```bash
npx nx test angular2-hotkeys          # library
npx nx test test-app                  # consumer app tests
node scripts/prove-test-app.mjs       # requires test-app served on :4300
```

## Public API

Exported from `angular2-hotkeys`:

- `provideHotkeys()` — standalone environment providers
- `HotkeysService` — bind / unbind / query hotkeys; `cheatSheetToggle` signal
- `Hotkey` / `ExtendedKeyboardEvent` — model types
- `HotkeysDirective` — element-scoped bindings
- `HotkeysCheatsheetComponent` — standalone overlay (`title` signal input)
- `IHotkeyOptions` / `HotkeyOptions` — options token
- `HotkeyModule` — **deprecated** NgModule bridge

## License

MIT © [Nick Richardson](mailto:nick.richardson@mediapixeldesign.com)

Based on the [angular-hotkeys](https://github.com/chieffancypants/angular-hotkeys) library. Issues and pull requests are welcome.
