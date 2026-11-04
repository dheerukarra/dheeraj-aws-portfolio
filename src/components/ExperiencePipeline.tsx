"use client";

import { useEffect, useRef, useState } from "react";
import { experience } from "../data/resume";

const CHECKS = [
  "Smoke",
  "Selenium regression",
  "Cypress E2E",
  "API contract",
  "JIRA gate",
] as const;

const STEP_MS = 650;

// Chronological order: oldest job first.
const stages = [...experience].reverse();

type RunState = "idle" | "running" | "green";

export default function ExperiencePipeline() {
  const [open, setOpen] = useState<number | null>(0);
  const [done, setDone] = useState(0);
  const [state, setState] = useState<RunState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function run() {
    if (state === "running") return;
    if (timer.current) clearTimeout(timer.current);
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      setDone(CHECKS.length);
      setState("green");
      return;
    }
    setDone(0);
    setState("running");
    let n = 0;
    const tick = () => {
      n += 1;
      setDone(n);
      if (n >= CHECKS.length) {
        setState("green");
      } else {
        timer.current = setTimeout(tick, STEP_MS);
      }
    };
    timer.current = setTimeout(tick, STEP_MS);
  }

  const green = "var(--accent, #22c55e)";
  const line = "var(--line, #2a2f3a)";
  const muted = "var(--muted, #8b93a1)";
  const fg = "var(--fg, #e8eaed)";

  return (
    <section
      aria-labelledby="experience"
      style={{
        background: "var(--bg, #0b0d12)",
        color: fg,
        padding: "4rem 1rem",
        overflowX: "hidden",
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto", minWidth: 0 }}>
        <h2
          id="experience"
          style={{
            fontFamily: "var(--font-display, system-ui, sans-serif)",
            fontSize: "clamp(1.75rem, 6vw, 2.75rem)",
            margin: 0,
            scrollMarginTop: "5rem",
          }}
        >
          Experience as a pipeline
        </h2>
        <p style={{ color: muted, margin: "0.5rem 0 1.5rem" }}>
          Two roles, run in order. Open a stage to see what I did there.
        </p>

        <ol
          style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 0 }}
        >
          {stages.map((job, i) => {
            const isOpen = open === i;
            const panelId = `exp-panel-${i}`;
            return (
              <li
                key={job.company}
                style={{
                  position: "relative",
                  paddingLeft: "2rem",
                  paddingBottom: i < stages.length - 1 ? "1rem" : 0,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: 4,
                    top: 18,
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: green,
                  }}
                />
                {i < stages.length - 1 && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: 10,
                      top: 32,
                      bottom: 0,
                      width: 2,
                      background: line,
                    }}
                  />
                )}
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? null : i)}
                  style={{
                    width: "100%",
                    minHeight: 48,
                    textAlign: "left",
                    background: "transparent",
                    color: fg,
                    border: `1px solid ${line}`,
                    borderRadius: 8,
                    padding: "0.75rem 1rem",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "0.75rem",
                    font: "inherit",
                  }}
                >
                  <span style={{ minWidth: 0 }}>
                    <span
                      style={{
                        display: "block",
                        fontFamily: "var(--font-display, system-ui, sans-serif)",
                        fontSize: "1.1rem",
                        overflowWrap: "anywhere",
                      }}
                    >
                      Stage {i + 1}: {job.company}
                    </span>
                    <span
                      style={{
                        display: "block",
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: "0.8rem",
                        color: muted,
                      }}
                    >
                      {job.title} · {job.dates}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    style={{ color: "var(--accent2, #38bdf8)", flexShrink: 0 }}
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                <div
                  id={panelId}
                  role="region"
                  aria-label={`${job.company} bullets`}
                  hidden={!isOpen}
                >
                  <ul
                    style={{
                      margin: "0.75rem 0 0",
                      paddingLeft: "1.25rem",
                      color: muted,
                      lineHeight: 1.6,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {job.bullets.map((b) => (
                      <li key={b} style={{ marginBottom: "0.4rem" }}>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ol>

        <div
          style={{
            marginTop: "2rem",
            border: `1px solid ${line}`,
            borderRadius: 8,
            padding: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <button
              type="button"
              onClick={run}
              disabled={state === "running"}
              style={{
                minHeight: 48,
                minWidth: 48,
                padding: "0 1.25rem",
                background: "var(--accent, #22c55e)",
                color: "var(--bg, #0b0d12)",
                border: "none",
                borderRadius: 8,
                fontFamily: "var(--font-mono, monospace)",
                fontWeight: 700,
                cursor: state === "running" ? "progress" : "pointer",
                opacity: state === "running" ? 0.6 : 1,
              }}
            >
              {state === "running"
                ? "Running…"
                : state === "green"
                  ? "Run the suite again"
                  : "Run the suite"}
            </button>
            <span
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.8rem",
                color: "var(--warn, #f59e0b)",
              }}
            >
              Demo animation, not real results
            </span>
          </div>

          <ul
            style={{
              listStyle: "none",
              margin: "1rem 0 0",
              padding: 0,
              display: "grid",
              gap: "0.5rem",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.9rem",
            }}
          >
            {CHECKS.map((name, i) => {
              const ok = i < done;
              const active = state === "running" && i === done;
              return (
                <li
                  key={name}
                  data-status={ok ? "pass" : active ? "running" : "pending"}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    minHeight: 44,
                    padding: "0 0.75rem",
                    border: `1px solid ${ok ? green : line}`,
                    borderRadius: 6,
                    color: ok ? green : active ? fg : muted,
                    transition: "color 0.3s, border-color 0.3s",
                  }}
                >
                  <span aria-hidden="true" style={{ width: "1.2em" }}>
                    {ok ? "✓" : active ? "…" : "○"}
                  </span>
                  <span style={{ overflowWrap: "anywhere" }}>{name}</span>
                  <span className="sr-only" style={srOnly}>
                    {ok ? "passed (demo)" : active ? "running" : "pending"}
                  </span>
                </li>
              );
            })}
          </ul>

          <div aria-live="polite" style={{ marginTop: "1rem", minHeight: 40 }}>
            {state === "green" && (
              <span
                style={{
                  display: "inline-block",
                  padding: "0.5rem 1rem",
                  border: `2px solid ${green}`,
                  borderRadius: 999,
                  color: green,
                  fontFamily: "var(--font-mono, monospace)",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                }}
              >
                PIPELINE GREEN
                <span style={srOnly}> (demo)</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const srOnly: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
};
