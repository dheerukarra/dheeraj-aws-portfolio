"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { shortsEngine } from "@/data/resume";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// The six-agent chain is the third point in the data: "Six-agent chain: a, b, c, d, e and f."
const chainPoint = shortsEngine.points.find((p) => p.startsWith("Six-agent chain")) ?? "";
const chain = chainPoint
  .replace(/^Six-agent chain:\s*/, "")
  .replace(/\.$/, "")
  .split(/,\s*|\s+and\s+/)
  .filter(Boolean);
const otherPoints = shortsEngine.points.filter((p) => p !== chainPoint);

export default function ShortsEngineCard() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // the chain runs in order: each stage lights as the reader reaches it, ending at the gate
        const tl = gsap.timeline({
          scrollTrigger: { trigger: "[data-chain]", start: "top 80%", once: true },
        });
        tl.from("[data-stage]", { opacity: 0.15, x: -14, duration: 0.4, stagger: 0.18, ease: "power2.out" })
          .from("[data-gate]", { scaleX: 0, transformOrigin: "left", duration: 0.7, ease: "power3.inOut" }, "-=0.1")
          .from("[data-gate-label]", { opacity: 0, y: 8, duration: 0.4 }, "-=0.2");
      });
    },
    { scope: root },
  );

  return (
    <article ref={root} className="relative border-t border-line py-16 md:py-24" aria-labelledby="shorts-title">
      <div className="grid gap-10 md:grid-cols-12 md:gap-8">
        <header className="md:col-span-5">
          <p className="eyebrow">Project 02 / {shortsEngine.tag}</p>
          <h3 id="shorts-title" className="f-display mt-4 text-[clamp(2.6rem,8vw,5.5rem)] font-extrabold leading-[0.9]">
            {shortsEngine.title}
          </h3>
          <p className="mt-6 text-sm leading-relaxed text-muted">{shortsEngine.summary}</p>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Stack">
            {shortsEngine.stack.map((s) => (
              <li key={s} className="tok">
                {s}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-muted">
            {shortsEngine.repo ? (
              <a href={shortsEngine.repo} className="inline-flex min-h-11 items-center text-accent underline underline-offset-4">
                Source on GitHub
              </a>
            ) : (
              <span className="inline-flex min-h-11 items-center">Repository: private for now</span>
            )}
          </p>
        </header>

        <div className="md:col-span-7">
          <div data-chain>
            <p className="mb-4 text-xs uppercase tracking-[0.16em] text-muted">Agent chain</p>
            <ol className="relative">
              {chain.map((c, i) => (
                <li
                  key={c}
                  data-stage
                  className="relative flex min-h-11 items-center gap-4 border-b border-line py-3 first:border-t"
                >
                  <span className="w-7 text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <span className="f-display text-xl font-semibold capitalize md:text-2xl">{c}</span>
                </li>
              ))}
            </ol>

            {/* the gate: a 30 to 59 second window; anything outside is rejected */}
            <div className="mt-8">
              <div className="relative h-10" aria-hidden>
                <div className="absolute inset-x-0 top-1/2 h-px bg-line" />
                <div
                  data-gate
                  className="absolute top-1/2 h-3 -translate-y-1/2 bg-accent"
                  style={{ left: `${(30 / 70) * 100}%`, width: `${(29 / 70) * 100}%` }}
                />
                <div className="absolute top-0 h-full w-px bg-warn" style={{ left: `${(30 / 70) * 100}%` }} />
                <div className="absolute top-0 h-full w-px bg-warn" style={{ left: `${(59 / 70) * 100}%` }} />
              </div>
              <div data-gate-label className="relative mt-1 flex justify-between text-xs text-muted">
                <span>0s</span>
                <span className="text-warn">gate 30.0 to 59.0s, else rejected</span>
              </div>
            </div>
          </div>

          <ul className="mt-10 space-y-3 text-sm leading-relaxed">
            {otherPoints.map((p) => (
              <li key={p} className="flex gap-3">
                <span aria-hidden className="mt-2 h-px w-4 shrink-0 bg-accent" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
