# Creative feature handoff

Files: `src/components/CreativeFeature.tsx` (default export, no props, `id="creative"`), `src/components/creative/{Terminal,Game,commands,useOverlay}`.

- Opens on window event `open-creative` (`detail.mode` = "terminal" | "game", default terminal) and on `~` or backtick (ignored in inputs; toggles).
- In-page section has the hint "Press ~ or tap here to open the terminal", Launch terminal and Play buttons.
- Overlays: role=dialog, focus trap, Esc, close button, backdrop tap. Body overflow is hidden only while open and restored on unmount; focus restored.
- Commands: help, superpower, simulate-hft (labelled SIMULATED), run-selenium (labelled DEMO), agents, aws-verify (descriptive, no IDs), shorts-engine, contact (confetti), game, clear. Up/down history.
- Game: 15s, 4 bugs (500, 128-byte buffer label, weight 1.37, flaky selector), retry, confetti on win, philosophy line.
- Reduced motion: confetti skipped; no shaking is used anywhere.
- Uses CSS vars with fallbacks; no globals.css changes needed.
- Terminal chips cover all contract commands; the UI agent only needs to dispatch the event.
