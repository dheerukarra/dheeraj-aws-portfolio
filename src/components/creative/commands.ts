import { agents, profile, shortsEngine } from "@/data/resume";

export const CHIPS = ["help", "superpower", "simulate-hft", "run-selenium", "agents", "aws-verify", "shorts-engine", "contact"] as const;

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export async function fireConfetti() {
  if (reducedMotion()) return;
  const confetti = (await import("canvas-confetti")).default;
  confetti({ particleCount: 120, spread: 80, origin: { y: 0.7 }, zIndex: 100000 });
}

export type Ctx = {
  print: (line: string) => void;
  sleep: (ms: number) => Promise<void>;
  alive: () => boolean;
  clear: () => void;
  openGame: () => void;
};

const HELP = [
  "Available commands:",
  "  help          list commands",
  "  superpower    why a tester makes AI agents reliable",
  "  simulate-hft  simulated arbitrage run (not real trading)",
  "  run-selenium  demo test-suite output",
  "  agents        the six agents behind this site",
  "  aws-verify    how this site is deployed",
  "  shorts-engine proof-first video pipeline",
  "  contact       email and LinkedIn",
  "  game          15-second QA bug-hunter",
  "  clear         clear the screen",
];

const SUPER = [
  "THE SUPERPOWER",
  "An AI agent is a very fast junior who never doubts itself.",
  "A tester's job is to doubt, on purpose, with evidence.",
  "So I give agents what testers give software:",
  "  1. Constraints before code (a spec, not a vibe).",
  "  2. Audits after every change (read it, do not trust it).",
  "  3. Regression checks so yesterday's fix stays fixed.",
  "Result: agents that ship, and a human who can prove it.",
];

export async function run(raw: string, c: Ctx): Promise<void> {
  const cmd = raw.trim().toLowerCase();
  const out = async (lines: string[], ms = 0) => {
    for (const l of lines) {
      if (!c.alive()) return;
      c.print(l);
      if (ms) await c.sleep(ms);
    }
  };
  switch (cmd) {
    case "":
      return;
    case "help":
      return out(HELP);
    case "clear":
      return c.clear();
    case "superpower":
      return out(SUPER, 120);
    case "agents":
      return out(
        ["Six agents, one human directing them:", ...agents.map((a) => `  ${a.id.padEnd(24)} ${a.role}: ${a.does}`)],
        90,
      );
    case "aws-verify":
      return out(
        [
          "Checking deployment model (descriptive, no account IDs shown)...",
          "[ok] Next.js static export: output is plain HTML, CSS and JS",
          "[ok] AWS Amplify Hosting serves the exported files",
          "[ok] Amazon CloudFront CDN fronts the site for fast, cached delivery",
          "[ok] No server runtime, no secrets in the bundle",
          `Source: ${profile.repo}`,
        ],
        260,
      );
    case "shorts-engine":
      return out(
        [
          `${shortsEngine.title}: ${shortsEngine.tag}`,
          `Stack: ${shortsEngine.stack.join(", ")}`,
          ...shortsEngine.points.map((p) => `  - ${p}`),
        ],
        100,
      );
    case "contact":
      c.print(`Email:    ${profile.email}`);
      c.print(`LinkedIn: ${profile.linkedin}`);
      c.print(`GitHub:   ${profile.github}`);
      void fireConfetti();
      return;
    case "game":
      c.print("Opening the bug-hunter...");
      c.openGame();
      return;
    case "simulate-hft": {
      await out(["[SIMULATED] Arbitrage layer demo. No real market, no real money."]);
      let pnl = 0;
      for (let i = 1; i <= 8; i++) {
        if (!c.alive()) return;
        const yes = 0.4 + Math.random() * 0.15;
        const no = 0.4 + Math.random() * 0.15;
        const sum = yes + no;
        const edge = 1 - sum;
        const hit = edge > 0.02;
        if (hit) pnl += edge * 100;
        const bar = "#".repeat(Math.max(0, Math.round(edge * 100) + 4)).padEnd(10, ".");
        c.print(
          `t+${String(i).padStart(2, "0")} YES ${yes.toFixed(2)} NO ${no.toFixed(2)} sum ${sum.toFixed(2)} [${bar}] ${hit ? "ARB" : "skip"}`,
        );
        await c.sleep(350);
      }
      return out([`[SIMULATED] paper P&L: +${pnl.toFixed(2)} units. Reconstruction of the architecture, numbers are fake.`]);
    }
    case "run-selenium": {
      await out(["[DEMO] Not a live browser. Illustrative suite output.", "$ mvn test -Dsuite=regression"], 200);
      const tests = ["loginTest", "searchTest", "checkoutSmoke", "apiContractTest", "flakySelectorTest"];
      for (const t of tests) {
        if (!c.alive()) return;
        c.print(`  running ${t} ...`);
        await c.sleep(350);
        c.print(
          t === "flakySelectorTest" ? `  [RETRY] ${t}: stale element, retried with explicit wait -> PASS` : `  [PASS] ${t}`,
        );
        await c.sleep(150);
      }
      return out(["Tests run: 5, Failures: 0, Skipped: 0 (demo)"]);
    }
    default:
      return out([`command not found: ${cmd.slice(0, 40)}. Type "help".`]);
  }
}
