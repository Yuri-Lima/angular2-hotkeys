# angular2-hotkeys

Angular keyboard shortcuts library (Mousetrap) with standalone APIs, Signals, and Nx workspace management.

**Current target: Angular 22** (Node `^22.22.3 || ^24.15.0 || >=26`).

## Versions compatibility

| Library | Angular |
| --- | --- |
| v2.4.0 | Angular 11 (most likely lower Angular versions) |
| v13.\*.\* | Angular 13 (most likely Angular 12) |
| v15.\*.\* | Angular 15 |
| v16.\*.\* | Angular 16 |
| v20.\*.\* | Angular 20 (standalone + signals) |
| **v22.\*.\*** | **Angular 22 + Nx workspace** |

## Workspace (Nx)

This repo is an [Nx](https://nx.dev) workspace (`nx@23.1` — latest line that supports Angular 22).

```bash
# Node 22.22+ required for Angular 22
nvm use   # uses .nvmrc

npm install --legacy-peer-deps

# Library
npx nx build angular2-hotkeys
npx nx test angular2-hotkeys
npx nx lint angular2-hotkeys

# Demo consumer app (depends on library build)
npx nx serve test-app

# Task graph
npx nx graph
```

Makefile shortcuts: `make build`, `make test`, `make lint`, `make serve-test-app`, `make ui`.

## Installation

To install this library, run:

```bash
$ npm install angular2-hotkeys --save
```

## Examples
First, import the HotkeyModule into your root AppModule

```typescript
import {HotkeyModule} from 'angular2-hotkeys';
```

Then, add HotkeyModule.forRoot() to your AppModule's import array

```typescript
@NgModule({
    imports : [CommonModule, HotkeyModule.forRoot(), ...],
})
export class AppModule {}
```

If you have any sub/feature modules that also use hotkeys, import the HotkeyModule (but NOT .forRoot())
```typescript
@NgModule({
    imports : [CommonModule, HotkeyModule, ...],
})
export class SharedModule {}
```

Then inject the service into your constructor and add a new hotkey

```typescript
constructor(private _hotkeysService: HotkeysService) {
    this._hotkeysService.add(new Hotkey('meta+shift+g', (event: KeyboardEvent): boolean => {
        console.log('Typed hotkey');
        return false; // Prevent bubbling
    }));
}
```
It also handles passing an array of hotkey combinations for a single callback
```typescript
this._hotkeysService.add(new Hotkey(['meta+shift+g', 'alt+shift+s'], (event: KeyboardEvent, combo: string): ExtendedKeyboardEvent => {
    console.log('Combo: ' + combo); // 'Combo: meta+shift+g' or 'Combo: alt+shift+s'
    let e: ExtendedKeyboardEvent = event;
    e.returnValue = false; // Prevent bubbling
    return e;
}));
```

Your callback must return either a boolean or an "ExtendedKeyboardEvent".

For more information on what hotkeys can be used, check out <https://craig.is/killing/mice>

This library is a work in progress and any issues/pull-requests are welcomed!
Based off of the [angular-hotkeys library](https://github.com/chieffancypants/angular-hotkeys)

## Cheat Sheet

To enable the cheat sheet, simply add `<hotkeys-cheatsheet></hotkeys-cheatsheet>` to your top level component template.
The `HotkeysService` will automatically register the `?` key combo to toggle the cheat sheet.

**NB!** Only hotkeys that have a description will apear on the cheat sheet. The Hotkey constructor takes a description as
an optional fourth parameter as a string or optionally as a function for dynamic descriptions.

```typescript
this._hotkeysService.add(new Hotkey('meta+shift+g', (event: KeyboardEvent): boolean => {
    console.log('Secret message');
    return false;
}, undefined, 'Send a secret message to the console.'));
```

The third parameter, given as `undefined`, can be used to allow the Hotkey to fire in INPUT, SELECT or TEXTAREA tags.

### Cheat Sheet Customization

1. You can now pass in custom options in `HotkeyModule.forRoot(options: IHotkeyOptions)`.

```typescript
export interface IHotkeyOptions {
  /**
   * Disable the cheat sheet popover dialog? Default: false
   */
  disableCheatSheet?: boolean;
  /**
   * Key combination to trigger the cheat sheet. Default: '?'
   */
  cheatSheetHotkey?: string;
  /**
   * Use also ESC for closing the cheat sheet. Default: false
   */
  cheatSheetCloseEsc?: boolean;
  /**
   * Description for the ESC key for closing the cheat sheet (if enabed). Default: 'Hide this help menu'
   */
  cheatSheetCloseEscDescription?: string;
  /**
   * Description for the cheat sheet hot key in the cheat sheet. Default: 'Show / hide this help menu'
   */
  cheatSheetDescription?: string;
};
```

2. You can also customize the title of the cheat sheet component.

```html
<hotkeys-cheatsheet title="Hotkeys Rock!"></hotkeys-cheatsheet>
<!-- Default: 'Keyboard Shortcuts:' -->
```

## TODO
1. Create unit and E2E tests

## Development

To generate all `*
}.js`, `*.js.map` and `*.d.ts` files:

```bash
$ npm run tsc
```

## License

MIT © [Nick Richardson](nick.richardson@mediapixeldesign.com)
