# test-app (ahk-test-app)

Angular **22** integration / consumer app for [`angular2-hotkeys`](../README.md).

It proves the library works when installed as a real dependency (`"angular2-hotkeys": "file:../dist"`) with:

- `provideHotkeys()` in `src/app/app.config.ts`
- standalone `HotkeysCheatsheetComponent`
- shortcuts: `?` (cheatsheet), `Esc` (close when enabled), `ctrl+s` / `ctrl+z`

This app is an **Nx project** named `test-app` in the monorepo root (see [`../nx.json`](../nx.json) and [`project.json`](./project.json)). Prefer running it through Nx from the repository root so the library is built first.

| | |
| --- | --- |
| **Angular** | `^22.0.5` |
| **TypeScript** | `~6.0` |
| **zone.js** | `~0.16` |
| **Default serve URL** | `http://127.0.0.1:4300/` |
| **Library dependency** | `file:../dist` (run a library build first) |

## Prerequisites

From the **repository root**:

```bash
nvm use                          # Node 22.22+ (see ../.nvmrc)
npm install --legacy-peer-deps   # workspace (library) deps
npx nx build angular2-hotkeys    # produces ../dist for this app
```

Then install this app’s own dependencies (still required for the local Angular CLI/Vite toolchain):

```bash
cd test-app
npm install --legacy-peer-deps
```

## Development server (recommended: Nx)

From the repository root:

```bash
npx nx serve test-app
# or: make serve-test-app
```

Nx builds `angular2-hotkeys` when needed, then serves this app on **port 4300**.

### Local CLI (optional)

If you already built the library and installed `test-app` deps:

```bash
cd test-app
npx ng serve --port 4300 --host 127.0.0.1 --configuration development
```

Open `http://127.0.0.1:4300/`. The app reloads on source changes.

> **Note:** Vite prebundling excludes `angular2-hotkeys` (see `angular.json` `serve.options.prebundle.exclude`) so the app and library share a single `@angular/core` instance.

## Building

From the repository root:

```bash
npx nx build test-app
```

Or locally after a library build:

```bash
cd test-app
npx ng build --configuration production
```

Output: `test-app/dist/ahk-test-app/`.

## Unit tests

From the repository root:

```bash
npx nx test test-app
```

Or:

```bash
cd test-app
npx ng test --no-watch --browsers=ChromeHeadless
```

## Browser proof (integration)

With the app served on `:4300`, from the repository root:

```bash
node scripts/prove-test-app.mjs
# or: make prove
```

Playwright exercises `?`, `Esc`, and `ctrl+s` and writes screenshots under `ui/`.

## Project layout

```
test-app/
  project.json          # Nx targets (build / serve / test)
  angular.json          # Angular application config
  package.json          # Angular 22 consumer deps + file:../dist
  src/
    app/
      app.config.ts     # provideHotkeys(...)
      app.ts            # registers demo hotkeys
      app.html
    main.ts
```

## Related docs

- Library README: [../README.md](../README.md)
- Migration dashboard: [../ui/index.html](../ui/index.html) (`make ui` from the repo root)
