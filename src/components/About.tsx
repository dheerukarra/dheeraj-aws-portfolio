"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { profile, education, certifications } from "@/data/resume";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function About() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // the spine draws as you read down the education timeline: progress made visible
        gsap.fromTo(
          "[data-spine]",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            transformOrigin: "top",
            scrollTrigger: { trigger: "[data-timeline]", start: "top 75%", end: "bottom 60%", scrub: true },
          },
        );
        gsap.from("[data-rise]", {
          opacity: 0,
          y: 28,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="about" className="relative py-24 md:py-36">
      <div className="wrap grid gap-12 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-28">
            <p className="eyebrow">01 / About me</p>
            <h2 className="f-display mt-4 text-[clamp(2.4rem,7vw,5rem)] font-extrabold leading-[0.92]">
              Break it first.
              <br />
              <span className="text-muted">Then build it.</span>
            </h2>
          </div>
        </div>

        <div className="md:col-span-7">
          <p data-rise className="f-display text-2xl font-semibold leading-snug md:text-3xl" style={{ letterSpacing: "-0.015em" }}>
            {profile.summary}
          </p>

          <div data-timeline className="relative mt-14 pl-8">
            <span aria-hidden className="absolute left-[5px] top-1 bottom-1 w-px bg-line" />
            <span
              aria-hidden
              data-spine
              className="absolute left-[5px] top-1 bottom-1 w-px bg-accent"
            />
            <p data-rise className="eyebrow mb-8 !text-muted">
              Education
            </p>
            <ol className="flex flex-col gap-10">
              {education.map((e) => (
                <li key={e.degree} data-rise className="relative">
                  <span
                    aria-hidden
                    className={`absolute -left-8 top-[7px] h-[11px] w-[11px] rounded-full border ${
                      e.status === "In progress" ? "border-accent bg-accent" : "border-accent bg-bg"
                    }`}
                  />
                  <p className="text-xs text-accent">
                    {e.date} / {e.status}
                  </p>
                  <h3 className="f-display mt-1 text-xl font-bold md:text-2xl">{e.degree}</h3>
                  <p className="mt-1 text-sm text-muted">
                    {e.school}, {e.place}
                  </p>
                  {e.note && <p className="mt-1 text-sm">{e.note}</p>}
                </li>
              ))}
            </ol>
          </div>

          <div data-rise className="mt-14">
            <p className="eyebrow mb-4 !text-muted">Certifications</p>
            <ul className="border-t border-line">
              {certifications.map((c) => (
                <li
                  key={c.name}
                  className="flex flex-col gap-1 border-b border-line py-4 sm:flex-row sm:items-baseline sm:justify-between"
                >
                  <span className="text-sm">{c.name}</span>
                  <span className="text-xs text-muted">{c.issuer}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
