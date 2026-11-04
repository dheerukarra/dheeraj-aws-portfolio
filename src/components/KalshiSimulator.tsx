"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { project } from "@/data/resume";

/* ---------- constants ---------- */
const AGENTS = [
  { id: "arb", name: "Arbitrage" },
  { id: "mom", name: "Momentum" },
  { id: "ofi", name: "Orderflow imbalance" },
  { id: "tail", name: "Tail-risk guard" },
] as const;
const LAYERS = ["L1 ARBITRAGE", "L2 MOMENTUM", "L3 RL POLICY"];
const FILES = [
  "README.md",
  "meta_learner_network.py",
  "websocket_ingestor.py",
  "memory_alignment_audit.py",
];
const FALLBACK = {
  bg: "#0b0d10",
  fg: "#e8eaed",
  muted: "#8b929b",
  line: "#262b33",
  accent: "#4ade80",
  accent2: "#60a5fa",
  warn: "#fbbf24",
};
type Palette = typeof FALLBACK;

/* ---------- simulation (mutable, lives in a ref) ---------- */
type Contract = { x: number; y: number; edge: number; fate: 0 | 1 | 2; id: number };
type Sim = {
  t: number;
  shock: number;
  spread: number;
  exposure: number;
  weights: number[];
  preds: number[];
  quarantine: number[];
  contracts: Contract[];
  spawn: number;
  nextId: number;
  flash: number;
  signals: number;
  fills: number;
  throttled: number;
  quarantined: number;
  latency: number;
  fillAcc: number;
  events: string[];
};
const newSim = (): Sim => ({
  t: 0, shock: 0, spread: 0.02, exposure: 1,
  weights: [0.25, 0.25, 0.25, 0.25], preds: [0, 0, 0, 0], quarantine: [0, 0, 0, 0],
  contracts: [], spawn: 0, nextId: 1, flash: 0,
  signals: 0, fills: 0, throttled: 0, quarantined: 0, latency: 61, fillAcc: 0, events: [],
});
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, k: number) => a + (b - a) * clamp(k, 0, 1);

function step(s: Sim, dt: number, aligned: boolean, forceBad: number | null) {
  s.t += dt;
  s.shock = Math.max(0, s.shock - dt / 7);
  s.flash = Math.max(0, s.flash - dt);
  s.spread = lerp(s.spread, 0.02 + 0.07 * s.shock + 0.004 * Math.sin(s.t * 1.3), dt * 4);
  const f = [0.9, 1.4, 1.1, 0.5];
  s.preds = f.map((fr, i) => Math.sin(s.t * fr + i * 1.7) * 0.6 + (Math.random() - 0.5) * 0.2);
  if (forceBad !== null) s.preds[forceBad] = (Math.random() < 0.5 ? -1 : 1) * (2.5 + Math.random() * 3);
  // schema validator: |prediction| must be finite and <= 1
  s.preds.forEach((p, i) => {
    if (!Number.isFinite(p) || Math.abs(p) > 1) {
      s.quarantine[i] = 2.5;
      s.quarantined += 1;
      s.flash = 0.8;
      s.events.push(
        `SIM guardrail: ${AGENTS[i].name} output ${p.toFixed(2)} outside [-1, 1]. Quarantined by schema validator.`,
      );
    }
  });
  s.quarantine = s.quarantine.map((q) => Math.max(0, q - dt));
  const logits = [
    s.spread * 32 - 0.4,
    1 + Math.abs(s.preds[1]),
    0.8 + Math.abs(s.preds[2]),
    0.3 + 4 * s.shock,
  ].map((l, i) => (s.quarantine[i] > 0 ? -9 : l));
  const mx = Math.max(...logits);
  const ex = logits.map((l) => Math.exp(l - mx));
  const sum = ex.reduce((a, b) => a + b, 0);
  s.weights = s.weights.map((w, i) => lerp(w, ex[i] / sum, dt * 3));
  s.exposure = lerp(s.exposure, 1 - 0.75 * clamp(s.shock * 1.2, 0, 1), dt * 3);
  const base = aligned ? 38 : 61;
  s.latency = lerp(s.latency, base * (1 + 0.3 * s.shock) + (Math.random() - 0.5) * 6, dt * 5);

  s.spawn += dt * (4 + 3 * s.shock);
  while (s.spawn >= 1) {
    s.spawn -= 1;
    s.contracts.push({ x: 0, y: Math.random(), edge: Math.random() * 0.08, fate: 0, id: s.nextId++ });
    s.signals += 1;
  }
  for (const c of s.contracts) {
    const before = c.x;
    c.x += dt * 0.2;
    if (before < 2 / 3 && c.x >= 2 / 3) {
      // L3 decision: exposure gates how many arb/momentum signals get sized in
      const strong = c.edge > s.spread * 0.7 || Math.random() < 0.4 + 0.3 * s.weights[1];
      if (strong && Math.random() < s.exposure) {
        c.fate = 1;
        s.fills += 1;
        s.fillAcc += 1;
      } else {
        c.fate = 2;
        if (strong) s.throttled += 1;
      }
    }
  }
  s.contracts = s.contracts.filter((c) => c.x < 1.02);
  if (s.fillAcc >= 12) {
    s.events.push(`SIM batch: ${s.fillAcc} paper fills, exposure ${(s.exposure * 100).toFixed(0)}%.`);
    s.fillAcc = 0;
  }
}

function draw(ctx: CanvasRenderingContext2D, w: number, h: number, s: Sim, p: Palette) {
  ctx.clearRect(0, 0, w, h);
  const top = 22;
  const colW = w / 3;
  ctx.font = "10px ui-monospace, monospace";
  ctx.textBaseline = "top";
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i === 1 ? "rgba(128,128,128,0.05)" : "rgba(128,128,128,0.0)";
    ctx.fillRect(i * colW, 0, colW, h);
    ctx.strokeStyle = p.line;
    ctx.beginPath();
    ctx.moveTo(i * colW + 0.5, 0);
    ctx.lineTo(i * colW + 0.5, h);
    ctx.stroke();
    ctx.fillStyle = p.muted;
    ctx.fillText(LAYERS[i], i * colW + 8, 6);
  }
  // spread band in L1
  const mid = top + (h - top) / 2;
  const gap = s.spread * (h - top) * 3;
  ctx.strokeStyle = s.shock > 0.05 ? p.warn : p.accent2;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(0, mid - gap / 2); ctx.lineTo(colW, mid - gap / 2);
  ctx.moveTo(0, mid + gap / 2); ctx.lineTo(colW, mid + gap / 2);
  ctx.stroke();
  ctx.setLineDash([]);
  for (const c of s.contracts) {
    const x = c.x * w;
    const y = top + 8 + c.y * (h - top - 16);
    ctx.globalAlpha = c.fate === 2 ? clamp(1 - (c.x - 2 / 3) * 3, 0.1, 1) : 1;
    ctx.fillStyle = c.fate === 1 ? p.accent : c.fate === 2 ? p.muted : c.x < 1 / 3 ? p.accent2 : p.fg;
    ctx.beginPath();
    ctx.arc(x, y, c.fate === 1 ? 3.5 : 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // exposure bar (right edge)
  ctx.fillStyle = p.line;
  ctx.fillRect(w - 6, top, 4, h - top - 4);
  ctx.fillStyle = s.exposure < 0.7 ? p.warn : p.accent;
  const eh = (h - top - 4) * s.exposure;
  ctx.fillRect(w - 6, h - 4 - eh, 4, eh);
  if (s.flash > 0) {
    ctx.strokeStyle = p.warn;
    ctx.lineWidth = 3;
    ctx.globalAlpha = clamp(s.flash, 0, 1);
    ctx.strokeRect(1.5, 1.5, w - 3, h - 3);
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;
  }
}

/* ---------- styles ---------- */
const v = (n: string, fb: string) => `var(--${n}, ${fb})`;
const C = {
  bg: v("bg", FALLBACK.bg), fg: v("fg", FALLBACK.fg), muted: v("muted", FALLBACK.muted),
  line: v("line", FALLBACK.line), accent: v("accent", FALLBACK.accent),
  accent2: v("accent2", FALLBACK.accent2), warn: v("warn", FALLBACK.warn),
};
const mono = v("font-mono", "ui-monospace, SFMono-Regular, Menlo, monospace");
const display = v("font-display", "inherit");
const btn = (on = false, tone = C.accent): CSSProperties => ({
  minHeight: 44, padding: "0 14px", font: `600 13px ${mono}`, color: on ? C.bg : C.fg,
  background: on ? tone : "transparent", border: `1px solid ${on ? tone : C.line}`,
  borderRadius: 8, cursor: "pointer", maxWidth: "100%",
});
const card: CSSProperties = { border: `1px solid ${C.line}`, borderRadius: 10, padding: 14, minWidth: 0 };
const small: CSSProperties = { font: `12px/1.5 ${mono}`, color: C.muted };

const subscribeRM = (cb: () => void) => {
  const m = window.matchMedia("(prefers-reduced-motion: reduce)");
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
const getRM = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- component ---------- */
export default function KalshiSimulator() {
  const reduced = useSyncExternalStore(subscribeRM, getRM, () => false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<Sim>(newSim());
  const alignedRef = useRef(true);
  const badRef = useRef<number | null>(null);
  const paletteRef = useRef<Palette>(FALLBACK);
  const sizeRef = useRef({ w: 300, h: 230 });
  const redrawRef = useRef<() => void>(() => {});

  const [aligned, setAligned] = useState(true);
  const [snap, setSnap] = useState(() => {
    const s = newSim();
    return { w: s.weights, spread: s.spread, exp: s.exposure, lat: s.latency, sig: 0, fills: 0, thr: 0, qr: 0, q: s.quarantine, shock: 0 };
  });
  const [feed, setFeed] = useState<string[]>(["SIM bot online (reconstruction, paper only). No real orders exist."]);

  const flush = useCallback(() => {
    const s = simRef.current;
    setSnap({ w: [...s.weights], spread: s.spread, exp: s.exposure, lat: s.latency, sig: s.signals, fills: s.fills, thr: s.throttled, qr: s.quarantined, q: [...s.quarantine], shock: s.shock });
    if (s.events.length) {
      const ev = s.events.splice(0);
      setFeed((f) => [...ev.map((e) => `T+${s.t.toFixed(0)}s ${e}`).reverse(), ...f].slice(0, 7));
    }
  }, []);

  // canvas sizing and palette
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const resize = () => {
      const w = cv.clientWidth || 300;
      const h = 230;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = w * dpr;
      cv.height = h * dpr;
      sizeRef.current = { w, h };
      const cs = getComputedStyle(cv);
      const pal = { ...FALLBACK };
      (Object.keys(pal) as (keyof Palette)[]).forEach((k) => {
        const val = cs.getPropertyValue(`--${k}`).trim();
        if (val) pal[k] = val;
      });
      paletteRef.current = pal;
      redrawRef.current();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    resize();
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    redrawRef.current = () => {
      const cv = canvasRef.current;
      const ctx = cv?.getContext("2d");
      if (!cv || !ctx) return;
      const dpr = cv.width / sizeRef.current.w;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(ctx, sizeRef.current.w, sizeRef.current.h, simRef.current, paletteRef.current);
    };
    redrawRef.current();
  });

  // animation loop (skipped under reduced motion, paused off-screen)
  useEffect(() => {
    if (reduced) return;
    const cv = canvasRef.current;
    if (!cv) return;
    let raf = 0;
    let last = 0;
    let acc = 0;
    let visible = false;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      step(simRef.current, dt, alignedRef.current, badRef.current);
      badRef.current = null;
      redrawRef.current();
      acc += dt;
      if (acc >= 0.25) { acc = 0; flush(); }
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([e]) => {
      const nowVisible = e.isIntersecting;
      if (nowVisible && !visible) { last = performance.now(); raf = requestAnimationFrame(frame); }
      if (!nowVisible && visible) cancelAnimationFrame(raf);
      visible = nowVisible;
    });
    io.observe(cv);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [reduced, flush]);

  const manualStep = () => {
    for (let i = 0; i < 6; i++) step(simRef.current, 0.1, alignedRef.current, i === 0 ? badRef.current : null);
    badRef.current = null;
    redrawRef.current();
    flush();
  };
  const settle = () => { if (reduced) manualStep(); };
  const shock = () => {
    const s = simRef.current;
    s.shock = 1;
    s.events.push("SIM shock: volatility spike, spread widening. Tail-risk guard throttling exposure.");
    settle();
  };
  const guardrail = () => {
    badRef.current = Math.floor(Math.random() * 4);
    settle();
  };
  const toggleAlign = () => {
    const next = !aligned;
    alignedRef.current = next;
    setAligned(next);
    simRef.current.events.push(`SIM 64-byte alignment ${next ? "ON" : "OFF"}: simulated latency model switched.`);
    settle();
  };

  const [open, setOpen] = useState(false);
  const pct = (n: number) => `${(n * 100).toFixed(0)}%`;

  return (
    <section aria-labelledby="kalshi" style={{ color: C.fg, fontFamily: display, maxWidth: "100%", overflowX: "clip" }}>
      <h2 id="kalshi" style={{ font: `700 clamp(1.4rem, 5vw, 2rem)/1.2 ${display}`, margin: "0 0 4px" }}>
        {project.title} <span style={{ ...small, whiteSpace: "nowrap" }}>{project.tag}</span>
      </h2>
      <p style={{ margin: "0 0 12px", color: C.muted, lineHeight: 1.55 }}>{project.summary}</p>
      <p role="note" style={{ margin: "0 0 14px", padding: "10px 12px", border: `1px solid ${C.warn}`, borderRadius: 8, font: `13px/1.5 ${mono}` }}>
        <strong style={{ color: C.warn }}>RECONSTRUCTION. </strong>{project.honestNote}
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        <button type="button" style={btn(snap.shock > 0.05, C.warn)} onClick={shock}>Inject volatility shock</button>
        <button type="button" style={btn()} onClick={guardrail}>Trigger guardrail</button>
        <button type="button" style={btn(aligned)} aria-pressed={aligned} onClick={toggleAlign}>
          64-byte alignment: {aligned ? "ON" : "OFF"}
        </button>
        <button type="button" style={btn()} onClick={() => setOpen(true)} aria-haspopup="dialog">Inspect reference code</button>
        {reduced && <button type="button" style={btn(false, C.accent2)} onClick={manualStep}>Step simulation</button>}
      </div>
      {reduced && <p style={small}>Reduced motion is on. The simulator is paused; use Step simulation to advance it.</p>}

      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Simulated contracts flowing through the arbitrage, momentum and reinforcement learning layers. Right edge bar shows simulated exposure."
        style={{ display: "block", width: "100%", height: 230, border: `1px solid ${C.line}`, borderRadius: 10, background: C.bg }}
      />
      <p style={{ ...small, margin: "6px 0 14px" }}>
        Dots are simulated contracts. Green dots are paper fills, grey dots are dropped. Right bar is simulated exposure.
      </p>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 270px), 1fr))" }}>
        <div style={card}>
          <h3 style={{ font: `600 14px ${mono}`, margin: "0 0 8px" }}>Meta-learner gate (simulated weights)</h3>
          {AGENTS.map((a, i) => (
            <div key={a.id} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, font: `12px ${mono}` }}>
                <span>{a.name}{snap.q[i] > 0 ? " (quarantined)" : ""}</span>
                <span>{pct(snap.w[i])}</span>
              </div>
              <div style={{ height: 8, background: C.line, borderRadius: 4 }}>
                <div style={{ height: 8, width: pct(snap.w[i]), borderRadius: 4, background: snap.q[i] > 0 ? C.warn : i === 3 ? C.accent2 : C.accent }} />
              </div>
            </div>
          ))}
          <p style={small}>Specialist outputs are detached before the gate sees them (gradient isolation, see reference code).</p>
        </div>

        <div style={card}>
          <h3 style={{ font: `600 14px ${mono}`, margin: "0 0 8px" }}>Telemetry (all simulated)</h3>
          <dl style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "4px 10px", margin: 0, font: `12px ${mono}` }}>
            <dt style={{ color: C.muted }}>Spread (simulated)</dt><dd style={{ margin: 0 }}>{(snap.spread * 100).toFixed(1)}c</dd>
            <dt style={{ color: C.muted }}>Exposure (simulated)</dt><dd style={{ margin: 0 }}>{pct(snap.exp)}</dd>
            <dt style={{ color: C.muted }}>Signals (simulated)</dt><dd style={{ margin: 0 }}>{snap.sig}</dd>
            <dt style={{ color: C.muted }}>Paper fills (simulated)</dt><dd style={{ margin: 0 }}>{snap.fills}</dd>
            <dt style={{ color: C.muted }}>Throttled (simulated)</dt><dd style={{ margin: 0 }}>{snap.thr}</dd>
            <dt style={{ color: C.muted }}>Quarantined outputs (simulated)</dt><dd style={{ margin: 0 }}>{snap.qr}</dd>
            <dt style={{ color: C.accent2 }}>SIMULATED tick-to-trade latency</dt>
            <dd style={{ margin: 0, color: C.accent2 }}>{snap.lat.toFixed(0)} us</dd>
          </dl>
          <p style={small}>Latency is a toy model that differs by toggle. It is not a measurement of the original system.</p>
        </div>

        <div style={{ ...card, gridColumn: "1 / -1" }}>
          <h3 style={{ font: `600 14px ${mono}`, margin: "0 0 8px" }}>Mock Telegram feed (simulated, nothing is sent)</h3>
          <ul role="log" aria-live="polite" style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 6 }}>
            {feed.map((m, i) => (
              <li key={`${i}-${m}`} style={{ font: `12px/1.45 ${mono}`, padding: "6px 10px", border: `1px solid ${C.line}`, borderRadius: 8, overflowWrap: "anywhere", opacity: i === 0 ? 1 : 0.75 }}>
                {m}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {open && <CodeModal onClose={() => setOpen(false)} />}
    </section>
  );
}

/* ---------- modal ---------- */
function CodeModal({ onClose }: { onClose: () => void }) {
  const [files, setFiles] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    let alive = true;
    Promise.all(
      FILES.map((f) =>
        fetch(`/kalshi-reference/${f}`).then((r) => {
          if (!r.ok) throw new Error(f);
          return r.text();
        }),
      ),
    )
      .then((t) => alive && setFiles(Object.fromEntries(FILES.map((f, i) => [f, t[i]]))))
      .catch(() => alive && setError(true));
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    tabRefs.current[0]?.focus();
    return () => { document.body.style.overflow = overflow; prev?.focus?.(); };
  }, []);

  const onKey = (e: ReactKeyboardEvent) => {
    if (e.key === "Escape") { e.stopPropagation(); onClose(); return; }
    if (e.key !== "Tab") return;
    const els = dialogRef.current?.querySelectorAll<HTMLElement>("button, [tabindex='0']");
    if (!els?.length) return;
    const first = els[0], lastEl = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
    else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
  };
  const onTabKey = (e: ReactKeyboardEvent, i: number) => {
    const n = FILES.length;
    const j = e.key === "ArrowRight" ? (i + 1) % n : e.key === "ArrowLeft" ? (i + n - 1) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (j < 0) return;
    e.preventDefault();
    setTab(j);
    tabRefs.current[j]?.focus();
  };

  return (
    <div
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.65)", display: "grid", placeItems: "center", padding: 12 }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="kalshi-modal-title"
        onKeyDown={onKey}
        style={{ background: C.bg, color: C.fg, border: `1px solid ${C.line}`, borderRadius: 12, width: "min(100%, 860px)", maxHeight: "90vh", display: "flex", flexDirection: "column", padding: 14, gap: 10 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <h3 id="kalshi-modal-title" style={{ font: `600 15px ${mono}`, margin: 0 }}>Reference code (reconstruction)</h3>
          <button type="button" style={btn()} onClick={onClose} aria-label="Close reference code">Close</button>
        </div>
        <div role="tablist" aria-label="Reference files" style={{ display: "flex", gap: 6, overflowX: "auto" }}>
          {FILES.map((f, i) => (
            <button
              key={f}
              ref={(el) => { tabRefs.current[i] = el; }}
              role="tab"
              id={`kalshi-tab-${i}`}
              aria-selected={tab === i}
              aria-controls="kalshi-panel"
              tabIndex={tab === i ? 0 : -1}
              onClick={() => setTab(i)}
              onKeyDown={(e) => onTabKey(e, i)}
              style={{ ...btn(tab === i, C.accent2), flex: "0 0 auto" }}
            >
              {f}
            </button>
          ))}
        </div>
        <div id="kalshi-panel" role="tabpanel" aria-labelledby={`kalshi-tab-${tab}`} style={{ minHeight: 0, overflow: "auto", border: `1px solid ${C.line}`, borderRadius: 8 }}>
          {error ? (
            <p style={{ ...small, padding: 12 }}>Could not load the reference files from /kalshi-reference.</p>
          ) : !files ? (
            <p style={{ ...small, padding: 12 }}>Loading...</p>
          ) : (
            <pre tabIndex={0} style={{ margin: 0, padding: 12, font: `12px/1.5 ${mono}`, whiteSpace: "pre", overflow: "auto", maxHeight: "60vh" }}>
              {files[FILES[tab]]}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
