(() => {
  const sheet = document.getElementById('demo-sheet');
  const state = document.getElementById('demo-state');
  const last = document.getElementById('demo-last');
  let open = false;

  document.getElementById('btn-toggle')?.addEventListener('click', () => {
    open = !open;
    sheet.hidden = !open;
    state.textContent = open ? 'open' : 'closed';
  });

  document.getElementById('btn-save')?.addEventListener('click', () => {
    last.textContent = 'ctrl+s → Save';
  });

  // Keyboard affordances on the demo panel when focused
  document.getElementById('mini-demo')?.addEventListener('keydown', (e) => {
    if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
      open = !open;
      sheet.hidden = !open;
      state.textContent = open ? 'open' : 'closed';
      e.preventDefault();
    }
    if (e.key === 'Escape') {
      open = false;
      sheet.hidden = true;
      state.textContent = 'closed';
    }
  });
})();
