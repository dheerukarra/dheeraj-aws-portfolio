"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { fireConfetti } from "./commands";
import { useOverlay } from "./useOverlay";

const TOTAL = 15;
type Phase = "idle" | "playing" | "won" | "lost";
type BugId = "status" | "buffer" | "weight" | "selector";

const mono = "var(--font-mono, ui-monospace, monospace)";
const line = "1px solid var(--line, #333)";

export default function Game({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [left, setLeft] = useState(TOTAL);
  const [found, setFound] = useState<BugId[]>([]);
  const [best, setBest] = useState<number | null>(null);
  const foundRef = useRef<BugId[]>([]);
  useOverlay(ref, onClose);

  const start = () => {
    foundRef.current = [];
    setFound([]);
    setLeft(TOTAL);
    setPhase("playing");
  };

  useEffect(() => {
    if (phase !== "playing") return;
    const t0 = performance.now();
    const id = window.setInterval(() => {
      const remaining = TOTAL - (performance.now() - t0) / 1000;
      if (foundRef.current.length >= 4) return;
      if (remaining <= 0) {
        setLeft(0);
        setPhase("lost");
      } else setLeft(remaining);
    }, 100);
    return () => window.clearInterval(id);
  }, [phase]);

  const hit = useCallback(
    (b: BugId) => {
      if (phase !== "playing" || foundRef.current.includes(b)) return;
      foundRef.current = [...foundRef.current, b];
      setFound(foundRef.current);
      if (foundRef.current.length === 4) {
        setPhase("won");
        setBest((p) => (p === null ? left : Math.max(p, left)));
        void fireConfetti();
      }
    },
    [phase, left],
  );

  const bug = (b: BugId, extra: React.CSSProperties = {}): React.CSSProperties => ({
    cursor: phase === "playing" ? "pointer" : "default",
    background: found.includes(b) ? "var(--warn, #f59e0b)" : "transparent",
    color: found.includes(b) ? "var(--bg, #0a0a0a)" : "inherit",
    border: 0, font: "inherit", padding: "6px 4px", minHeight: 36, textAlign: "left", borderRadius: 4,
    outline: found.includes(b) ? "2px solid var(--warn, #f59e0b)" : "none",
    ...extra,
  });
  const score = found.length;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.7)", display: "grid", placeItems: "center", padding: 12 }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="QA bug-hunter game"
        tabIndex={-1}
        style={{ width: "100%", maxWidth: 560, maxHeight: "92dvh", overflowY: "auto", overflowX: "hidden", background: "var(--bg, #0a0a0a)", color: "var(--fg, #eaeaea)", border: line, borderRadius: 12, fontFamily: mono, fontSize: 13, padding: 14, overscrollBehavior: "contain" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <strong style={{ fontFamily: "var(--font-display, inherit)", fontSize: 16 }}>QA bug-hunter</strong>
          <span aria-live="polite" style={{ color: left < 5 && phase === "playing" ? "var(--warn, #f59e0b)" : "var(--accent, #4ade80)" }}>
            {left.toFixed(1)}s | bugs {score}/4
          </span>
          <button type="button" onClick={onClose} aria-label="Close game" style={{ minWidth: 44, minHeight: 44, background: "none", border: 0, color: "var(--fg, #eaeaea)", cursor: "pointer", fontFamily: "inherit" }}>
            Esc / Close
          </button>
        </div>
        <div style={{ height: 4, background: "var(--line, #333)", borderRadius: 2, margin: "6px 0 10px" }}>
          <div style={{ height: 4, width: `${(left / TOTAL) * 100}%`, background: "var(--accent, #4ade80)", borderRadius: 2 }} />
        </div>

        <p style={{ margin: "0 0 8px", color: "var(--muted, #999)" }}>
          This trading dashboard (mock) hides 4 bugs: a bad status code, a mis-aligned buffer label, an impossible weight, a flaky selector. Tap them all in 15 seconds.
        </p>

        <div style={{ border: line, borderRadius: 8, padding: 10, display: "grid", gap: 6, opacity: phase === "idle" ? 0.35 : 1, pointerEvents: phase === "playing" ? "auto" : "none" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
            <span>Mock Trading Dashboard (simulated)</span>
            <button type="button" onClick={() => hit("status")} aria-label="API status panel" style={bug("status")}>
              GET /api/orderbook -&gt; 500
            </button>
          </div>
          <div style={{ borderTop: line, paddingTop: 6, display: "grid", gap: 2, overflow: "hidden" }}>
            <span style={{ color: "var(--muted, #999)" }}>memory layout</span>
            <span>arb_buf: 64-byte aligned</span>
            <button type="button" onClick={() => hit("buffer")} aria-label="Buffer label" style={bug("buffer", { transform: "translateX(9px)", width: "fit-content" })}>
              mom_buf: 128-byte aligned
            </button>
            <span>rl_buf: 64-byte aligned</span>
          </div>
          <div style={{ borderTop: line, paddingTop: 6, display: "grid", gap: 2 }}>
            <span style={{ color: "var(--muted, #999)" }}>meta-learner weights (sum to 1.0)</span>
            <span>arbitrage: 0.35</span>
            <button type="button" onClick={() => hit("weight")} aria-label="Weight value" style={bug("weight", { width: "fit-content" })}>
              momentum: 1.37
            </button>
            <span>rl: 0.25</span>
          </div>
          <div style={{ borderTop: line, paddingTop: 6, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <span style={{ color: "var(--muted, #999)" }}>e2e:</span>
            <button type="button" onClick={() => hit("selector")} aria-label="Submit selector" style={bug("selector", { border: "1px dashed var(--line, #666)", overflowWrap: "anywhere" })}>
              {"click(\"div:nth-child(3) > .btn-7f3a\") // passes 6 of 10 runs"}
            </button>
          </div>
        </div>

        <div style={{ marginTop: 10, minHeight: 64 }}>
          {phase === "idle" && (
            <button type="button" onClick={start} style={primary}>
              Start (15s)
            </button>
          )}
          {phase === "won" && (
            <div>
              <p style={{ color: "var(--accent, #4ade80)", margin: "0 0 4px" }}>
                All 4 found with {left.toFixed(1)}s left. Best: {best?.toFixed(1)}s left.
              </p>
              <p style={{ margin: "0 0 8px" }}>Trust the agent. Verify the output. Ship only what survives the test.</p>
              <button type="button" onClick={start} style={primary}>
                Play again
              </button>
            </div>
          )}
          {phase === "lost" && (
            <div>
              <p style={{ color: "var(--warn, #f59e0b)", margin: "0 0 4px" }}>
                Time. Score {score}/4. Bugs that escape to production cost more.
              </p>
              <button type="button" onClick={start} style={primary}>
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const primary: React.CSSProperties = {
  minHeight: 44, padding: "0 18px", borderRadius: 999, border: "1px solid var(--accent, #4ade80)", background: "var(--accent, #4ade80)",
  color: "var(--bg, #0a0a0a)", fontFamily: "inherit", fontWeight: 700, cursor: "pointer",
};
