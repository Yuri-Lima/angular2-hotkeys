# test-app

> Angular **22** integration app for [`angular2-hotkeys`](../README.md).

This project consumes the library as a real dependency (`"angular2-hotkeys": "file:../dist"`) and exercises the public API end-to-end.

<p align="center">
  <img src="../ui/proof-test-app.png" alt="test-app screenshot" width="640" />
</p>

## What it demonstrates

| Feature | Where |
| :--- | :--- |
| `provideHotkeys()` + zoneless | [`src/app/app.config.ts`](./src/app/app.config.ts) |
| **1** App-wide save / undo / help | [`src/app/app.ts`](./src/app/app.ts) — `ctrl+s` · `ctrl+z` · `?` · `Esc` |
| **2** `allowIn` while typing | [`use-cases/composer-allow-in.component.ts`](./src/app/use-cases/composer-allow-in.component.ts) — `ctrl+enter` |
| **3** Modal `pause` / Esc only | [`use-cases/modal-pause.component.ts`](./src/app/use-cases/modal-pause.component.ts) |
| **4** Feature lifecycle j/k/e | [`use-cases/feature-inbox.component.ts`](./src/app/use-cases/feature-inbox.component.ts) (mount toggle in shell) |
| **5** Command palette | [`use-cases/command-palette.component.ts`](./src/app/use-cases/command-palette.component.ts) — `ctrl+k` |
| **6** Same combo by focus | [`use-cases/multi-panel-workspace.component.ts`](./src/app/use-cases/multi-panel-workspace.component.ts) — panel `ctrl+s` |
| Shared action log | [`src/app/action-log.service.ts`](./src/app/action-log.service.ts) |
| Cheatsheet `@defer` | shell template + library overlay |

## Stack

| | |
| :--- | :--- |
| **Angular** | `^22.0.5` |
| **TypeScript** | `~6.0` |
| **Package manager** | **pnpm** (same as monorepo root) |
| **Serve URL** | [http://127.0.0.1:4300/](http://127.0.0.1:4300/) |
| **Nx project** | `test-app` ([`project.json`](./project.json)) |
| **Library input** | `file:../dist` — build the library first |

---

## Quick start (from monorepo root)

```bash
nvm use
corepack enable
pnpm install
pnpm exec nx build angular2-hotkeys
pnpm exec nx serve test-app
```

Open **http://127.0.0.1:4300/**.

Nx wires `test-app` to depend on the library `build` target so the package under `../dist` stays current.

---

## Local commands (inside `test-app/`)

```bash
# After a library build + install in this folder
pnpm install --ignore-workspace --config.dangerouslyAllowAllBuilds=true

pnpm exec ng serve --port 4300 --host 127.0.0.1 --configuration development
pnpm exec ng build --configuration production
pnpm exec ng test --no-watch --browsers=ChromeHeadless
```

> **Vite note:** `serve` excludes `angular2-hotkeys` from prebundling (`angular.json`) so the app and library share one `@angular/core` instance.

---

## Nx targets

| Target | Command (from repo root) |
| :--- | :--- |
| Serve | `pnpm exec nx serve test-app` |
| Build | `pnpm exec nx build test-app` |
| Test | `pnpm exec nx test test-app` |

Also available: `make serve-test-app` from the monorepo root.

---

## Browser proof

With the app running on port **4300**:

```bash
# from monorepo root
node scripts/prove-test-app.mjs
# or
make prove
```

Playwright validates `?`, `Esc`, and `ctrl+s`, and writes screenshots under [`../ui/`](../ui).

---

## Layout

```
test-app/
├── project.json         # Nx targets
├── angular.json         # Application + serve prebundle config
├── package.json         # Angular 22 + file:../dist
└── src/
    ├── app/
    │   ├── app.config.ts
    │   ├── app.ts
    │   ├── app.html
    │   └── app.css
    ├── main.ts
    └── index.html
```

## See also

- [Main README](../README.md) — install, API, Nx workspace
- [UI dashboard](../ui/index.html) — `make ui` from the repo root
