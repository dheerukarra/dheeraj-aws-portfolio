"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { profile } from "@/data/resume";
import ParticlePortrait from "./ParticlePortrait";
import TerminalHint from "./TerminalHint";

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ defaults: { ease: "power4.out" } })
          .from("[data-line]", { yPercent: 110, duration: 1.1, stagger: 0.12 }, 0.15)
          .from("[data-fade]", { opacity: 0, y: 16, duration: 0.8, stagger: 0.1 }, 0.7);
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="top" className="relative min-h-svh pt-24 pb-16 md:pt-28">
      <div className="wrap grid items-center gap-8 md:grid-cols-12 md:gap-0">
        {/* portrait: first on mobile, right and bleeding under the name on desktop */}
        <div className="md:col-span-6 md:col-start-7 md:row-start-1 md:-mr-6 lg:-mr-12">
          <div className="mx-auto w-full max-w-[420px] md:max-w-none">
            <ParticlePortrait />
          </div>
        </div>

        <div className="relative z-10 md:col-span-8 md:col-start-1 md:row-start-1 md:pr-0">
          <p data-fade className="eyebrow mb-5">
            {profile.role}
          </p>
          <h1 className="f-display text-[clamp(3.4rem,15.5vw,9.5rem)] font-extrabold leading-[0.86]">
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-line className="block">
                Dheeraj
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-line className="block text-accent">
                Reddy
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-line className="block">
                Karra
              </span>
            </span>
          </h1>
          <p data-fade className="mt-7 max-w-[34ch] text-base leading-relaxed text-fg md:text-lg">
            {profile.headline}
          </p>
          <div data-fade className="mt-7 flex flex-col items-start gap-5">
            <TerminalHint />
            <p className="text-xs text-muted">
              {profile.location} / M.S. Data Science, UCM 05/2027
            </p>
          </div>
        </div>
      </div>

      <a
        href="#about"
        className="absolute bottom-3 left-5 hidden min-h-11 items-center gap-3 text-xs uppercase tracking-[0.18em] text-muted md:flex lg:left-10"
      >
        <span className="h-px w-10 bg-muted" /> Scroll
      </a>
    </section>
  );
}
