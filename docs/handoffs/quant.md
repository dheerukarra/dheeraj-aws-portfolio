# Quant handoff: Kalshi simulator

Files
- `src/components/KalshiSimulator.tsx`: default export, no props, "use client". Heading `id="kalshi"`. Banner uses `project.honestNote`.
- `public/kalshi-reference/`: README.md, meta_learner_network.py, websocket_ingestor.py, memory_alignment_audit.py.

Behaviour
- Canvas rAF loop, paused off-screen (IntersectionObserver). Under prefers-reduced-motion the loop does not run; a "Step simulation" button advances it.
- Controls: Inject volatility shock, Trigger guardrail, 64-byte alignment ON/OFF (aria-pressed), Inspect reference code (modal, fetches `/kalshi-reference/*`, tabs, Esc, focus trap).
- All figures are labelled simulated. Latency is a toy model, labelled SIMULATED. No Sharpe, P&L or live results.

Integration notes
- Needs `@/` alias (tsc passes). Needs the globals.css variables; fallbacks are built in.
- The modal fetches from the absolute path `/kalshi-reference/`. If a basePath is ever set, update `FILES` fetch URL.

Verification
- `npx tsc --noEmit` and `npx eslint` on the component: clean.
- `python -m py_compile` passes on all three .py files; audit and ingestor scripts run. torch is not installed here, so meta_learner_network.py was compiled but not executed.
- `npm run build` not run, as instructed. Not visually checked at 390px in a browser.
