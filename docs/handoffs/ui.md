# UI handoff

Files: src/app/{globals.css,layout.tsx,page.tsx}; src/components/{Navbar,Hero,ParticlePortrait,TerminalHint,About,Superpowers,Projects,ShortsEngineCard,Footer}.tsx.

- Tokens in :root: --bg --fg --muted --line --accent --accent2 --warn --font-display --font-mono (Bricolage Grotesque + JetBrains Mono via next/font). Tailwind aliases: bg-bg text-fg text-muted border-line text-accent text-warn. Helpers: .f-display .f-mono .wrap .eyebrow .tok .hint-pill.
- TerminalHint (Navbar lg+, mobile menu, Hero) dispatches `open-creative` {mode:"terminal"}. Mobile navbar has a ">_" button too.
- Hero: 2D-canvas particle portrait (<=7056 particles desktop, 3600 tablet), GSAP-driven assembly, pointer repel. Static image on reduced motion, width<640, low cores/memory, saveData, or sustained <35fps.
- Projects order: KalshiSimulator, ShortsEngineCard, ExperiencePipeline; CreativeFeature after Projects in page.tsx.
- Not done: no browser visual check at 390px (tsc and eslint clean only); next build not run; Google Fonts need network at build.
