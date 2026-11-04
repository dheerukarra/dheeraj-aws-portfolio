"use client";
import { useCallback, useEffect, useState } from "react";
import Terminal from "./creative/Terminal";
import Game from "./creative/Game";

type Mode = "terminal" | "game" | null;

const btn: React.CSSProperties = {
  minHeight: 48, padding: "0 18px", borderRadius: 999, fontFamily: "var(--font-mono, ui-monospace, monospace)", fontSize: 14, cursor: "pointer",
  border: "1px solid var(--accent, #4ade80)", maxWidth: "100%",
};

export default function CreativeFeature() {
  const [mode, setMode] = useState<Mode>(null);
  const close = useCallback(() => setMode(null), []);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const m = (e as CustomEvent<{ mode?: string }>).detail?.mode;
      setMode(m === "game" ? "game" : "terminal");
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "~" && e.key !== "`") return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      e.preventDefault();
      setMode((m) => (m ? null : "terminal"));
    };
    window.addEventListener("open-creative", onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("open-creative", onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <section
      id="creative"
      aria-labelledby="creative-title"
      style={{ padding: "64px 16px", maxWidth: 960, margin: "0 auto", overflowX: "hidden", color: "var(--fg, #eaeaea)" }}
    >
      <p style={{ fontFamily: "var(--font-mono, ui-monospace, monospace)", color: "var(--accent, #4ade80)", margin: 0 }}>
        dheeraj@aws:~$ _
      </p>
      <h2 id="creative-title" style={{ fontFamily: "var(--font-display, inherit)", fontSize: "clamp(1.75rem, 6vw, 3rem)", margin: "8px 0" }}>
        Break things on purpose
      </h2>
      <button
        type="button"
        onClick={() => setMode("terminal")}
        style={{ background: "none", border: 0, padding: 0, minHeight: 44, textAlign: "left", cursor: "pointer", color: "var(--muted, #999)", fontFamily: "var(--font-mono, ui-monospace, monospace)", fontSize: 15, overflowWrap: "anywhere" }}
      >
        Press <kbd style={{ border: "1px solid var(--line, #333)", borderRadius: 4, padding: "0 6px", color: "var(--fg, #eaeaea)" }}>~</kbd> or tap here to open the terminal
      </button>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 20 }}>
        <button type="button" onClick={() => setMode("terminal")} style={{ ...btn, background: "var(--accent, #4ade80)", color: "var(--bg, #0a0a0a)", fontWeight: 700 }}>
          Launch terminal
        </button>
        <button type="button" onClick={() => setMode("game")} style={{ ...btn, background: "none", color: "var(--accent2, #60a5fa)", borderColor: "var(--accent2, #60a5fa)" }}>
          Play the 15-second QA bug-hunter
        </button>
      </div>
      {mode === "terminal" && <Terminal onClose={close} onGame={() => setMode("game")} />}
      {mode === "game" && <Game onClose={close} />}
    </section>
  );
}
