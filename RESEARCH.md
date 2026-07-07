# Angular 22 Deep Modernization — Research Inventory

**Library:** `angular2-hotkeys`  
**Date:** 2026-07-07  
**Sources consulted (mandatory research; not training data alone):**

| Source | URL / path |
| :--- | :--- |
| Angular v22 announcement | https://blog.angular.dev/announcing-angular-v22-c52bb83a4664 |
| Angular v21 announcement | https://blog.angular.dev/announcing-angular-v21-57946c34f14b |
| Angular CHANGELOG (v21–v22) | https://github.com/angular/angular/blob/main/CHANGELOG.md |
| Resource API guide | https://angular.dev/guide/signals/resource |
| linkedSignal guide | https://angular.dev/guide/signals/linked-signal |
| Deferrable views guide | https://angular.dev/guide/templates/defer |
| Update / releases | https://angular.dev/events/v22 · https://angular.dev/reference/releases |
| Web search | “angular 22 new features”, “zoneless”, “input function”, “resource api stable”, “linkedSignal”, “injectAsync”, “@Service” |

**Baseline codebase note:** `master` already targets Angular **22.0.x** (version bump + standalone + some signals from G13). Legacy patterns remain: `@Input()`, constructor DI, `zone.js` in tests/test-app, no `linkedSignal`/`resource`/`@defer`/zoneless.

**Peer compatibility decision:** Prefer `@angular/core` / `@angular/common` **`>=20.0.0`** so Angular 20+ consumers still work. APIs marked **v22-only** are either used only in docs/demo or avoided in published runtime surface when they would break `>=20`.

---

## Inventory (15 distinct API changes)

### 1. `input()` / `input.required()`

| | |
| :--- | :--- |
| **Import** | `import { input } from '@angular/core'` |
| **What it does** | Signal-based component/directive inputs. Replaces `@Input()`. Values are read as `this.foo()`. |
| **Applies?** | **YES** |
| **Reasoning** | `HotkeysDirective` still uses `@Input() hotkeys`. Cheatsheet already uses `title = input(...)`. |
| **Files** | `src/lib/hotkeys.directive.ts`, `src/lib/hotkeys.directive.spec.ts` |
| **Change** | Replace `@Input() hotkeys` with `hotkeys = input<...>([])`; read via `this.hotkeys()` in an `effect` / rebind path. |

### 2. `output()`

| | |
| :--- | :--- |
| **Import** | `import { output } from '@angular/core'` |
| **What it does** | Signal-era replacement for `@Output() + EventEmitter`. |
| **Applies?** | **NO (no current emitters)** |
| **Reasoning** | Library has no `@Output()` today. Adding optional events would expand public API without a requirement. Document for consumers. |
| **Files** | — |
| **Change** | Skip runtime; document in README if apps want cheatsheet open events (they can read `cheatSheetToggle` signal). |

### 3. `model()`

| | |
| :--- | :--- |
| **Import** | `import { model } from '@angular/core'` |
| **What it does** | Two-way bindable signal input (`[(x)]`). |
| **Applies?** | **NO** |
| **Reasoning** | Cheatsheet `title` is one-way. Visibility is owned by `HotkeysService.cheatSheetToggle`, not parent two-way binding. |
| **Files** | — |
| **Change** | Skip. |

### 4. `viewChild()` / `viewChildren()` / `contentChild()` / `contentChildren()`

| | |
| :--- | :--- |
| **Import** | `import { viewChild, contentChild, ... } from '@angular/core'` |
| **What it does** | Signal-based view/content queries. |
| **Applies?** | **NO** |
| **Reasoning** | No `@ViewChild` / `@ContentChild` in library. Directive uses host `ElementRef` only. |
| **Files** | — |
| **Change** | Skip. |

### 5. `resource()` (stable in Angular 22)

| | |
| :--- | :--- |
| **Import** | `import { resource } from '@angular/core'` |
| **What it does** | Async data as signals (`value`, `status`, `error`, `isLoading`, `reload`). Re-runs `loader` when reactive `params` change. Stable in v22. |
| **Applies?** | **YES (targeted)** |
| **Reasoning** | Hotkey binding is mostly synchronous Mousetrap. Full service rewrite around `resource` would not match the domain. **Does** fit cheatsheet: when the sheet opens, asynchronously snapshot described hotkeys into a `Resource` (status-aware, reloadable), which is the only “load on demand” UI path. **Not** used for core Mousetrap init (sync, must be immediate for first keypress). |
| **Files** | `src/lib/hotkeys-cheatsheet/hotkeys-cheatsheet.component.ts`, template if needed, specs |
| **Change** | `sheetEntries = resource({ params: () => open ? version : undefined, loader: async () => filter described hotkeys })`. Keep CSS class names. |

### 6. `linkedSignal()`

| | |
| :--- | :--- |
| **Import** | `import { linkedSignal } from '@angular/core'` |
| **What it does** | Writable signal reset from a linked source computation; can be manually overwritten until source changes. |
| **Applies?** | **YES** |
| **Reasoning** | Cheatsheet needs a **local** list of rows that (a) refreshes when the sheet opens / hotkey registry version changes, (b) can be manually updated (e.g. after toggle). Classic `linkedSignal` use case (derived default + local write). Prefer over only `effect`+`signal`. |
| **Files** | `src/lib/hotkeys-cheatsheet/hotkeys-cheatsheet.component.ts` |
| **Change** | `hotkeys = linkedSignal({ source: open+version, computation: (...) => described list })`; keep `toggleCheatSheet()` writing service signal. |

### 7. `httpResource()`

| | |
| :--- | :--- |
| **Import** | `import { httpResource } from '@angular/common/http'` |
| **What it does** | HTTP-specialized resource over `HttpClient`. |
| **Applies?** | **NO** |
| **Reasoning** | Library has no HTTP surface; adding `@angular/common/http` peer would be a new production coupling (forbidden “no new production dependencies” spirit for consumers). |
| **Files** | — |
| **Change** | Skip. Document as consumer pattern for remote shortcut configs. |

### 8. `provideZonelessChangeDetection()`

| | |
| :--- | :--- |
| **Import** | `import { provideZonelessChangeDetection } from '@angular/core'` |
| **What it does** | Runs app without `zone.js`; CD driven by signals, inputs, framework events, `markForCheck` / explicit notification. Default for new apps since v21; solid in v22 with OnPush default. |
| **Applies?** | **YES** |
| **Reasoning** | Keyboard library must work in zoneless hosts. Mousetrap uses native listeners; **signal writes** (`cheatSheetToggle`) schedule CD. UI that only mutates non-signals would stall — migrate state to signals and add zoneless tests. |
| **Files** | `src/test-zoneless.ts` (or suite), `src/lib/**/*.zoneless.spec.ts`, `test-app` config, README, remove zone polyfills from test-app |
| **Change** | Zoneless TestBed suite; test-app uses `provideZonelessChangeDetection()` and no `zone.js` polyfill. |

### 9. `inject()`

| | |
| :--- | :--- |
| **Import** | `import { inject } from '@angular/core'` |
| **What it does** | Functional DI; preferred over constructor parameter injection. |
| **Applies?** | **YES — all three library classes** |
| **Reasoning** | Prompt required `inject()` in **HotkeysService**, **HotkeysDirective**, and **HotkeysCheatsheetComponent**. |
| **Constraint conflict (resolved)** | An earlier attempt used `inject()` in the service while keeping `static create()` → `new HotkeysService()`. That **fails**: `inject()` requires an Angular injection context; bare `new` has none. **Resolution:** remove `static create()` / `useFactory: () => HotkeysService.create(...)`. Register `HotkeysService` as a **class provider** (with `HotkeyOptions` useValue first) so Angular constructs the service and `inject(HotkeyOptions, { optional: true })` in the service constructor works. Tests use `TestBed` + `provideHotkeys` / class providers — never `new HotkeysService()`. |
| **Files** | `hotkeys.service.ts`, `hotkey.providers.ts`, `hotkey.module.ts`, `hotkeys.directive.ts`, `hotkeys-cheatsheet.component.ts`, specs, `test-app` |
| **Change** | Service: `inject(HotkeyOptions)` in constructor. Directive/cheatsheet/app: `inject(HotkeysService)` (and other tokens) as fields. |

### 10. `afterRender()` / `afterNextRender()`

| | |
| :--- | :--- |
| **Import** | `import { afterNextRender, afterRender } from '@angular/core'` |
| **What it does** | Run logic after render/paint; preferred for DOM measurement / third-party DOM libs vs some `ngAfterViewInit` patterns. |
| **Applies?** | **YES (light)** |
| **Reasoning** | Directive binds Mousetrap to host element. Host `ElementRef` exists at construction, but deferring first `Mousetrap` bind to `afterNextRender` is safer for SSR/hydration and matches Angular 22 guidance for third-party DOM libs. |
| **Files** | `src/lib/hotkeys.directive.ts` |
| **Change** | Create/bind Mousetrap in `afterNextRender` (or keep immediate bind if tests require; document choice). Prefer `afterNextRender` + rebind `effect` on `hotkeys()` input. |

### 11. `@defer` (deferrable views)

| | |
| :--- | :--- |
| **Syntax** | `@defer (when expr) { ... } @placeholder { ... }` |
| **What it does** | Lazy-loads template dependencies / heavy UI until trigger (`idle`, `interaction`, `when`, etc.). `when` is one-shot (does not unload). |
| **Applies?** | **YES** |
| **Reasoning** | Cheatsheet overlay is hidden until `?`. Perfect `when helpVisible()` candidate: first open loads overlay chunk; subsequent toggles use class/`helpVisible()` without re-fetch. Also apply in **test-app** wrapping `<hotkeys-cheatsheet>`. Prefer `when` over `on interaction` because open is driven by global key, not click on a placeholder. |
| **Files** | `hotkeys-cheatsheet.component.html`, `test-app/src/app/app.html` |
| **Change** | Defer overlay body; keep `cfp-hotkeys-*` class names on real overlay nodes. |

### 12. `toSignal()` / `toObservable()` / `outputFromObservable()` / `takeUntilDestroyed()`

| | |
| :--- | :--- |
| **Import** | `@angular/core/rxjs-interop` |
| **What it does** | Bridge RxJS ↔ signals; auto-unsubscribe on destroy. |
| **Applies?** | **PARTIAL — `takeUntilDestroyed` only if RxJS remains; others NO for core** |
| **Reasoning** | G13 already moved cheatsheet off `BehaviorSubject`. No remaining Subject streams in library core. `toSignal`/`outputFromObservable` unnecessary. `takeUntilDestroyed` only if we reintroduce observables (we will not). |
| **Files** | — |
| **Change** | Skip in runtime; mention in RESEARCH for consumers still on RxJS interop. |

### 13. `ChangeDetectionStrategy.OnPush` default (v22) / `Eager` rename

| | |
| :--- | :--- |
| **Import** | `import { ChangeDetectionStrategy } from '@angular/core'` |
| **What it does** | v22 new components default to OnPush; old Default renamed Eager. |
| **Applies?** | **YES** |
| **Reasoning** | Library components/directives should explicitly set `changeDetection: ChangeDetectionStrategy.OnPush` for predictable behavior on Angular 20–22 and zoneless. |
| **Files** | `hotkeys-cheatsheet.component.ts`, directive (OnPush-compatible inputs/signals) |
| **Change** | Set OnPush on cheatsheet; ensure all template state is signal/input based. |

### 14. `@Service()` + `injectAsync()` (v22)

| | |
| :--- | :--- |
| **Import** | `import { Service, injectAsync } from '@angular/core'` (v22) |
| **What it does** | `@Service()` simplifies root singletons; `injectAsync` lazy-loads services with code-splitting / prefetch. |
| **Applies?** | **NO for published library runtime (compat)** |
| **Reasoning** | `@Service` / `injectAsync` are **Angular 22+**. Using them in the published package would force peer `^22` and break `>=20` consumers. `HotkeysService` must remain `@Injectable()` + `provideHotkeys()` factory. Document as optional consumer pattern for lazy features. |
| **Files** | README only |
| **Change** | Document; do not ship `@Service` on `HotkeysService`. |

### 15. Signal Forms / Angular Aria / Router Navigation API / debounced signals / template spread & arrow fns

| | |
| :--- | :--- |
| **What they do** | Broader v21–v22 platform features (forms, a11y primitives, router, `debounced()`, template ergonomics). |
| **Applies?** | **NO (forms/router/aria/debounced); OPTIONAL template ergonomics** |
| **Reasoning** | No forms, no router, no design-system primitives in this keyboard library. `debounced()` is for continuous input (search), not discrete key combos. Template arrow/spread not required for cheatsheet table. |
| **Files** | — |
| **Change** | Skip. |

### 16. Modern testing: zoneless TestBed, signal inputs, `DeferBlockBehavior`

| | |
| :--- | :--- |
| **Import** | `@angular/core/testing`, `provideZonelessChangeDetection`, `DeferBlockBehavior` |
| **What it does** | Test without zone; `setInput` for signal inputs; manual defer block control. |
| **Applies?** | **YES** |
| **Reasoning** | Required to prove zoneless + signal inputs + optional `@defer` behavior; raise coverage to ≥85%. |
| **Files** | `src/test.ts`, new zoneless specs, existing specs, `karma.conf.js` thresholds |
| **Change** | Dual or zoneless-first suite; coverage check 85/85/85 (branches may stay slightly lower if justified — target global statements/lines/functions ≥85). |

### 17. Packaging: ng-packagr 22, `exports`, secondary entry points

| | |
| :--- | :--- |
| **What it does** | Ivy partial compilation, package exports map, optional secondary entry points. |
| **Applies?** | **YES (exports / peers); secondary entry OPTIONAL** |
| **Reasoning** | Update `peerDependencies` to `>=20.0.0 <23` (or `>=20.0.0`) for core/common; ensure `package.json` `exports` points at `dist`. Cheatsheet as secondary entry would help tree-shaking for headless users but is a packaging break for deep imports — **keep single entry** + document tree-shaking via sideEffects false. No new production deps. |
| **Files** | `package.json`, `ng-package.json`, README |
| **Change** | Peers, exports, docs; leave single `public-api` entry. |

---

## Applicability summary

| # | API | Apply? | Primary files |
| ---: | :--- | :---: | :--- |
| 1 | `input()` | YES | `hotkeys.directive.ts` |
| 2 | `output()` | NO | — |
| 3 | `model()` | NO | — |
| 4 | `viewChild` / `contentChild` | NO | — |
| 5 | `resource()` | YES | cheatsheet component |
| 6 | `linkedSignal()` | YES | cheatsheet component |
| 7 | `httpResource()` | NO | — |
| 8 | `provideZonelessChangeDetection()` | YES | tests, test-app, README |
| 9 | `inject()` | YES | directive, cheatsheet, app, service options |
| 10 | `afterNextRender()` | YES | directive |
| 11 | `@defer` | YES | cheatsheet HTML, test-app |
| 12 | RxJS interop suite | NO (core) | — (rxjs remains a **peer only**; see README “Why is rxjs in package.json?”) |
| 13 | OnPush explicit | YES | cheatsheet (+ signal-driven CD) |
| 14 | `@Service` / `injectAsync` | NO (compat) | README only |
| 15 | Signal Forms / Aria / debounced / router | NO | — |
| 16 | Modern testing utilities | YES | specs, karma |
| 17 | Packaging / exports / peers | YES | package.json, ng-package, README |

**Distinct API changes documented with YES/NO evaluation: 17 (≥12 required).**  
**Includes mandatory `resource()` and `linkedSignal()` evaluations.**

---

## Zoneless risk analysis (pre-implementation)

| Feature | Zone-based today | Zoneless risk | Mitigation |
| :--- | :--- | :--- | :--- |
| Hotkey callback → app signal | Zone patches timers/events | Low if app updates **signals** | Document signal updates in callbacks |
| Cheatsheet toggle | Service `signal` | Low — signal write notifies CD | Keep `cheatSheetToggle` as signal |
| Directive rebind | `ngOnInit` only | Medium if input changes | `input()` + `effect` |
| Mousetrap native listeners | Zone coaxes CD | Medium for non-signal UI | Ensure library UI is signal-driven; optional `ApplicationRef.tick` only if proven needed |
| `setTimeout` toasts in test-app | Zone patches timer | High without zone | Use signals + explicit CD or `afterNextRender`; prefer signal + test flush |

---

## Implementation order (phases)

1. **This file committed alone** (Phase 1) — no migration code yet.  
2. Baseline `ng build` / `ng test`.  
3. Signal component model + `inject` + `linkedSignal` + `resource`.  
4. Zoneless support + tests.  
5. `@defer` + `afterNextRender`.  
6. Test suite / coverage ≥85%.  
7. Packaging + README.  
8. test-app zoneless + proof + `ui/` dashboard + PR.

---

## Explicit non-goals

- Changing `Hotkey` model public constructor/fields.  
- Renaming `cfp-hotkeys-*` CSS classes.  
- Adding production npm dependencies beyond existing `mousetrap` / `tslib`.  
- Pushing commits to remote (local only; PR via `gh pr create` at end).
