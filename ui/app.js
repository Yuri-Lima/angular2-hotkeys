/* angular2-hotkeys modernization dashboard */
(function () {
  'use strict';

  const research = [
    { api: 'input() / input.required()', applicable: 'YES', status: 'implemented', files: 'hotkeys.directive.ts', notes: 'Replaces @Input() hotkeys' },
    { api: 'output()', applicable: 'NO', status: 'skipped', files: '—', notes: 'No outputs in library' },
    { api: 'model()', applicable: 'NO', status: 'skipped', files: '—', notes: 'No two-way bindings' },
    { api: 'viewChild / contentChild', applicable: 'NO', status: 'skipped', files: '—', notes: 'No queries' },
    { api: 'resource()', applicable: 'YES', status: 'implemented', files: 'hotkeys-cheatsheet.component.ts', notes: 'Async described hotkeys when open' },
    { api: 'linkedSignal()', applicable: 'YES', status: 'implemented', files: 'hotkeys-cheatsheet.component.ts', notes: 'Writable list linked to open+version' },
    { api: 'httpResource()', applicable: 'NO', status: 'skipped', files: '—', notes: 'No HTTP surface' },
    { api: 'provideZonelessChangeDetection()', applicable: 'YES', status: 'implemented', files: 'test-app, *.zoneless.spec.ts', notes: 'Signal-driven CD' },
    { api: 'inject()', applicable: 'YES', status: 'implemented', files: 'directive, cheatsheet, test-app', notes: 'Field injectors' },
    { api: 'afterNextRender()', applicable: 'YES', status: 'implemented', files: 'hotkeys.directive.ts', notes: 'Mousetrap after DOM ready' },
    { api: '@defer', applicable: 'YES', status: 'implemented', files: 'cheatsheet.html, test-app', notes: 'when helpVisible() / on idle' },
    { api: 'toSignal / outputFromObservable', applicable: 'NO', status: 'skipped', files: '—', notes: 'No RxJS streams in core' },
    { api: 'OnPush (v22 default)', applicable: 'YES', status: 'implemented', files: 'cheatsheet component', notes: 'Explicit ChangeDetectionStrategy' },
    { api: '@Service / injectAsync', applicable: 'NO', status: 'skipped', files: 'README only', notes: 'v22-only; peers ≥20' },
    { api: 'Signal Forms / Aria / debounced', applicable: 'NO', status: 'skipped', files: '—', notes: 'Out of domain' },
    { api: 'Modern testing utilities', applicable: 'YES', status: 'implemented', files: 'specs, karma.conf.js', notes: 'setInput, zoneless suite, 85% gate' },
    { api: 'Packaging / peers / exports', applicable: 'YES', status: 'implemented', files: 'package.json, ng-package', notes: 'peers ≥20 <23' },
  ];

  const tbody = document.querySelector('#research-table tbody');
  if (tbody) {
    research.forEach((row) => {
      const tr = document.createElement('tr');
      const appClass = row.applicable === 'YES' ? 'ok' : 'muted';
      const statusClass = row.status === 'implemented' ? 'ok' : 'muted';
      tr.innerHTML =
        '<td><code>' +
        escapeHtml(row.api) +
        '</code></td>' +
        '<td class="' +
        appClass +
        '">' +
        escapeHtml(row.applicable) +
        '</td>' +
        '<td class="' +
        statusClass +
        '">' +
        escapeHtml(row.status) +
        '</td>' +
        '<td><code>' +
        escapeHtml(row.files) +
        '</code></td>' +
        '<td>' +
        escapeHtml(row.notes) +
        '</td>';
      tbody.appendChild(tr);
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Diff tabs (keyboard accessible)
  const tabs = Array.from(document.querySelectorAll('[role="tab"][data-diff]'));
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(tab);
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        tabs[(i + 1) % tabs.length].focus();
        selectTab(tabs[(i + 1) % tabs.length]);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        tabs[(i - 1 + tabs.length) % tabs.length].focus();
        selectTab(tabs[(i - 1 + tabs.length) % tabs.length]);
      }
    });
  });

  function selectTab(tab) {
    const id = tab.getAttribute('data-diff');
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });
    document.querySelectorAll('.diff-panel').forEach((panel) => {
      const match = panel.id === 'panel-' + id;
      panel.hidden = !match;
      panel.classList.toggle('hidden', !match);
    });
  }

  // Live keyboard demo (signal-like state, no zone)
  const state = {
    open: false,
    last: '(none yet)',
    rows: [
      { keys: '?', text: 'Show / hide this help menu' },
      { keys: 'Esc', text: 'Hide this help menu' },
      { keys: 'Ctrl + S', text: 'Save document' },
      { keys: 'Ctrl + Z', text: 'Undo last change' },
    ],
  };

  const lastEl = document.getElementById('demo-last');
  const sheetEl = document.getElementById('demo-sheet');
  const overlay = document.getElementById('demo-overlay');
  const rowsEl = document.getElementById('demo-rows');
  const closeBtn = document.getElementById('demo-close');

  function render() {
    if (lastEl) lastEl.textContent = state.last;
    if (sheetEl) sheetEl.textContent = state.open ? 'open' : 'closed';
    if (overlay) {
      overlay.hidden = !state.open;
      overlay.classList.toggle('in', state.open);
    }
    if (rowsEl && state.open) {
      rowsEl.innerHTML = state.rows
        .map(
          (r) =>
            '<tr><td class="cfp-hotkeys-keys"><span class="cfp-hotkeys-key">' +
            escapeHtml(r.keys) +
            '</span></td><td class="cfp-hotkeys-text">' +
            escapeHtml(r.text) +
            '</td></tr>',
        )
        .join('');
    }
  }

  function flash(msg) {
    state.last = msg;
    render();
  }

  function toggleSheet() {
    state.open = !state.open;
    flash(state.open ? '? → open cheatsheet' : '? → close cheatsheet');
  }

  function closeSheet() {
    if (!state.open) return;
    state.open = false;
    flash('Esc → close cheatsheet');
  }

  document.addEventListener('keydown', (e) => {
    const target = e.target;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      return;
    }
    if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
      e.preventDefault();
      toggleSheet();
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      closeSheet();
      return;
    }
    if (e.ctrlKey && !e.metaKey && !e.altKey && e.key.toLowerCase() === 's') {
      e.preventDefault();
      flash('ctrl+s → Save');
      return;
    }
    if (e.ctrlKey && !e.metaKey && !e.altKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      flash('ctrl+z → Undo');
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      state.open = false;
      flash('close button → cheatsheet closed');
      render();
    });
  }

  render();
})();
