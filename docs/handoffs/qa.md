# QA handoff

## Phase 1: ExperiencePipeline (done)
- `src/components/ExperiencePipeline.tsx`: "use client", default export, no props, h2 `id="experience"`.
- Stages in chronological order: ICloud Technologies Corp (02/2023 – 11/2024), then VSquare IT Inc. (12/2024 – 05/2025). Bullets are rendered verbatim from `experience` in `src/data/resume.ts`.
- "Run the suite" animates Smoke, Selenium regression, Cypress E2E, API contract, JIRA gate, then shows "PIPELINE GREEN". Labelled "Demo animation, not real results". No counts.
- Reduced motion: jumps straight to green with no timers.
- Inline styles use CSS variables with fallbacks; 48px targets; wrapping text for 390px.
- `npx tsc --noEmit` and eslint clean.
- Note: "API contract" is a demo stage name requested by the brief, not a resume bullet.

## Phase 2 (pending)
Playwright at 1440x900 and 390x844, anchors, creative feature, `npm run build`. Not started.
