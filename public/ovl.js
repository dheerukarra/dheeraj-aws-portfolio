// Shared behaviour for the two full-screen overlays (the model card story and the deploy control room):
// fade in/out, pause the home globe behind them, trap focus, close on Escape, and give focus back.
let cur = null;

// `dissolve` (optional): { ms, run } lets an overlay play an exit animation before it is actually hidden.
export function showOvl(el, onClose, dissolve) {
  if (cur) finish();
  const last = document.activeElement;
  const trap = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); hideOvl(); return; }
    if (e.key !== 'Tab') return;
    const f = [...el.querySelectorAll('button:not([hidden]),a[href]')].filter((n) => n.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], end = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); end.focus(); } else if (!e.shiftKey && document.activeElement === end) { e.preventDefault(); first.focus(); }
  };
  const x = el.querySelector('.ovl-x'); const xh = () => hideOvl();
  x.addEventListener('click', xh);
  document.addEventListener('keydown', trap, true);
  el.hidden = false; document.body.classList.add('ovl-open'); window.__paused = true;
  requestAnimationFrame(() => { el.classList.add('on'); x.focus({ preventScroll: true }); });
  cur = { el, last, trap, x, xh, onClose, dissolve, closing: false };
}

export function hideOvl() {
  if (!cur) return;
  if (cur.dissolve && !cur.closing) { cur.closing = true; cur.dissolve.run(); const c = cur; setTimeout(() => { if (cur === c) finish(); }, cur.dissolve.ms); return; }
  finish();
}

function finish() {
  if (!cur) return;
  const { el, last, trap, x, xh, onClose } = cur; cur = null;
  document.removeEventListener('keydown', trap, true); x.removeEventListener('click', xh);
  el.classList.remove('on'); document.body.classList.remove('ovl-open'); window.__paused = false;
  setTimeout(() => { if (!el.classList.contains('on')) el.hidden = true; }, 380);
  if (history.replaceState && location.hash) history.replaceState(null, '', location.pathname + location.search);
  if (onClose) onClose();
  if (last && last.focus) last.focus({ preventScroll: true });
}

export const isOvlOpen = () => !!cur;
