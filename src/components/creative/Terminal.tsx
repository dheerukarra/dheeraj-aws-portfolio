"use client";
import { useEffect, useRef, useState } from "react";
import { CHIPS, run } from "./commands";
import { useOverlay } from "./useOverlay";

const PROMPT = "dheeraj@aws:~$";

export default function Terminal({ onClose, onGame }: { onClose: () => void; onGame: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const aliveRef = useRef(true);
  const [lines, setLines] = useState<string[]>(["Welcome. Type a command or tap a chip. Esc closes.", 'Try "help".']);
  const [val, setVal] = useState("");
  const [busy, setBusy] = useState(false);
  const hist = useRef<string[]>([]);
  const hi = useRef(-1);
  useOverlay(ref, onClose);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [lines]);

  const exec = async (cmd: string) => {
    if (busy) return;
    const c = cmd.trim();
    if (!c) return;
    hist.current.push(c);
    hi.current = -1;
    setLines((l) => [...l, `${PROMPT} ${c}`]);
    setBusy(true);
    await run(c, {
      print: (line) => {
        if (aliveRef.current) setLines((l) => [...l, line]);
      },
      sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
      alive: () => aliveRef.current,
      clear: () => setLines([]),
      openGame: onGame,
    });
    if (aliveRef.current) setBusy(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const v = val;
      setVal("");
      void exec(v);
    } else if (e.key === "ArrowUp" && hist.current.length) {
      e.preventDefault();
      hi.current = hi.current < 0 ? hist.current.length - 1 : Math.max(0, hi.current - 1);
      setVal(hist.current[hi.current]);
    } else if (e.key === "ArrowDown" && hi.current >= 0) {
      e.preventDefault();
      hi.current += 1;
      if (hi.current >= hist.current.length) {
        hi.current = -1;
        setVal("");
      } else setVal(hist.current[hi.current]);
    }
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.7)", display: "grid", placeItems: "center", padding: 12 }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="Terminal"
        tabIndex={-1}
        style={{
          width: "100%", maxWidth: 720, maxHeight: "90dvh", display: "flex", flexDirection: "column", overflow: "hidden",
          background: "var(--bg, #0a0a0a)", color: "var(--fg, #eaeaea)", border: "1px solid var(--line, #333)", borderRadius: 12,
          fontFamily: "var(--font-mono, ui-monospace, monospace)", fontSize: 13,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 12px", borderBottom: "1px solid var(--line, #333)" }}>
          <span style={{ color: "var(--accent, #4ade80)" }}>{PROMPT}</span>
          <button type="button" onClick={onClose} aria-label="Close terminal" style={{ minWidth: 44, minHeight: 44, color: "var(--fg, #eaeaea)", background: "none", border: 0, cursor: "pointer", fontFamily: "inherit" }}>
            Esc / Close
          </button>
        </div>
        <div ref={bodyRef} aria-live="polite" style={{ flex: 1, minHeight: 180, overflowY: "auto", overflowX: "hidden", padding: 12, overscrollBehavior: "contain" }}>
          {lines.map((l, i) => (
            <div key={i} style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", color: l.startsWith(PROMPT) ? "var(--accent, #4ade80)" : "var(--fg, #eaeaea)" }}>
              {l || " "}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "8px 12px", borderTop: "1px solid var(--line, #333)" }}>
          {CHIPS.map((c) => (
            <button
              key={c}
              type="button"
              disabled={busy}
              onClick={() => void exec(c)}
              style={{ minHeight: 40, padding: "0 10px", borderRadius: 999, border: "1px solid var(--line, #333)", background: "none", color: "var(--accent2, #60a5fa)", fontFamily: "inherit", cursor: busy ? "wait" : "pointer", opacity: busy ? 0.5 : 1 }}
            >
              {c}
            </button>
          ))}
        </div>
        <label style={{ display: "flex", gap: 8, padding: "8px 12px", borderTop: "1px solid var(--line, #333)", alignItems: "center" }}>
          <span style={{ color: "var(--accent, #4ade80)", whiteSpace: "nowrap" }}>{PROMPT}</span>
          <input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="Command"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            style={{ flex: 1, minWidth: 0, background: "none", border: 0, outline: "none", color: "var(--fg, #eaeaea)", font: "inherit", fontSize: 16 }}
          />
        </label>
      </div>
    </div>
  );
}
