"use client";

import { useEffect, useState } from "react";
import TerminalHint, { openTerminal } from "./TerminalHint";

const links = [
  { href: "#about", label: "About" },
  { href: "#superpowers", label: "Superpowers" },
  { href: "#projects", label: "Projects" },
  { href: "#creative", label: "Creative" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        scrolled || open ? "border-line bg-bg/85 backdrop-blur-md" : "border-transparent"
      }`}
    >
      <nav className="wrap flex h-16 items-center justify-between gap-4" aria-label="Primary">
        <a href="#top" className="f-display flex min-h-11 items-center text-xl font-bold" aria-label="Dheeraj Reddy Karra, top">
          DRK<span className="text-accent">.</span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="flex min-h-11 items-center px-3 text-[13px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-fg"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden lg:block">
          <TerminalHint />
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <button
            type="button"
            onClick={openTerminal}
            aria-label="Open the terminal"
            className="hint-pill !min-h-11 !min-w-11 !justify-center !px-3 font-bold"
          >
            <span aria-hidden>{">_"}</span>
          </button>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="relative flex h-11 w-11 items-center justify-center"
          >
            <span
              className={`absolute h-px w-6 bg-fg transition-transform duration-300 ${open ? "rotate-45" : "-translate-y-[5px]"}`}
            />
            <span
              className={`absolute h-px w-6 bg-fg transition-transform duration-300 ${open ? "-rotate-45" : "translate-y-[5px]"}`}
            />
          </button>
        </div>
      </nav>

      <div
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-x-0 top-16 bottom-0 overflow-y-auto bg-bg px-5 pb-10 pt-6 md:hidden"
      >
        <ul className="flex flex-col">
          {links.map((l, i) => (
            <li key={l.href} className="border-b border-line">
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                className="f-display flex min-h-16 items-baseline gap-4 py-3 text-4xl font-bold"
              >
                <span className="f-mono text-xs font-normal text-accent">0{i + 1}</span>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-8" onClick={() => setOpen(false)}>
          <TerminalHint />
        </div>
      </div>
    </header>
  );
}
