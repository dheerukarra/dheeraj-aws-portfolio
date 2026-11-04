"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { skillGroups } from "@/data/resume";

gsap.registerPlugin(useGSAP);

// indigo-violet to teal-emerald, one stop per group, matching the portrait gradient
const hues = ["#6d4cff", "#3f7fb4", "#27a8a0", "#1fd6a0"];

export default function Superpowers() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const group = skillGroups[active];
  const total = skillGroups.reduce((n, g) => n + g.skills.length, 0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-tok]",
          { opacity: 0, y: 10, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "power3.out", stagger: 0.03, overwrite: true },
        );
      });
    },
    { scope: root, dependencies: [active] },
  );

  const onKey = (e: React.KeyboardEvent) => {
    const n = skillGroups.length;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") setActive((a) => (a + 1) % n);
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") setActive((a) => (a + n - 1) % n);
    else return;
    e.preventDefault();
  };

  return (
    <section ref={root} id="superpowers" className="relative py-24 md:py-36">
      <div className="wrap">
        <p className="eyebrow">02 / Tech superpowers</p>
        <h2 className="f-display mt-4 max-w-[14ch] text-[clamp(2.4rem,7vw,5rem)] font-extrabold leading-[0.92]">
          Four disciplines, one habit: verify.
        </h2>

        {/* proportional strip: segment width = skills in the group */}
        <div className="mt-12 flex h-3 gap-1" aria-hidden>
          {skillGroups.map((g, i) => (
            <button
              key={g.id}
              type="button"
              tabIndex={-1}
              onClick={() => setActive(i)}
              className="h-full transition-[opacity,flex-grow] duration-500"
              style={{
                flexGrow: g.skills.length,
                flexBasis: 0,
                background: hues[i],
                opacity: i === active ? 1 : 0.28,
              }}
            />
          ))}
        </div>
        <p className="mt-2 text-right text-xs text-muted">{total} skills, width = share</p>

        <div className="mt-10 grid gap-10 md:grid-cols-12 md:gap-8">
          <div role="tablist" aria-orientation="vertical" className="md:col-span-6" onKeyDown={onKey}>
            {skillGroups.map((g, i) => {
              const on = i === active;
              return (
                <button
                  key={g.id}
                  role="tab"
                  id={`tab-${g.id}`}
                  aria-selected={on}
                  aria-controls="skills-panel"
                  tabIndex={on ? 0 : -1}
                  type="button"
                  onClick={() => setActive(i)}
                  className="group flex min-h-20 w-full items-baseline gap-4 border-t border-line py-5 text-left last:border-b"
                >
                  <span className="f-mono w-8 text-xs" style={{ color: hues[i] }}>
                    {String(g.skills.length).padStart(2, "0")}
                  </span>
                  <span className="flex-1">
                    <span
                      className={`f-display block text-[clamp(1.6rem,5vw,2.6rem)] font-bold leading-[1.02] transition-colors duration-300 ${
                        on ? "text-fg" : "text-muted group-hover:text-fg"
                      }`}
                    >
                      {g.title}
                    </span>
                    <span
                      className={`mt-1 block overflow-hidden text-sm text-muted transition-all duration-300 ${
                        on ? "max-h-10 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      {g.line}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className={`text-lg transition-transform duration-300 ${on ? "translate-x-0 text-accent" : "-translate-x-2 text-muted"}`}
                  >
                    {"->"}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            id="skills-panel"
            role="tabpanel"
            aria-labelledby={`tab-${group.id}`}
            className="relative min-h-[260px] border border-line p-5 md:col-span-6 md:p-8"
            style={{ boxShadow: `inset 0 3px 0 ${hues[active]}` }}
          >
            <p className="text-xs uppercase tracking-[0.16em] text-muted">{group.title}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {group.skills.map((s) => (
                <li key={`${group.id}-${s}`} data-tok className="tok" style={{ borderColor: `${hues[active]}66` }}>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
