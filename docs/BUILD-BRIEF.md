# Build brief: new 3D portfolio (read this first)

Goal: win the AWS Student Builder Challenge. Due Nov 6 2026, 11:59 PM PST (= Nov 7 1:59 AM US Central). Owner: Dheeraj Reddy Karra.
Project folder: this repo (Next.js 16 static export, Tailwind 4, React 19). Read `AGENTS.md` and `node_modules/next/dist/docs/` before using Next APIs.

## Owner rules
- Dark mode. Not AI-slop. A real 3D interactive centerpiece. Motion graphics. Real tech logos. Pixar-style avatar.
- Do not use Gemini any more. Do not copy his photo.
- Every earlier design was rejected: be decisive, show real renders (screenshots), do not ask him to approve text descriptions.
- Check `get_usage` between phases; pause when the 5-hour window passes 95%.
- Never invent metrics. Kalshi numbers are simulated; the original Kalshi code was lost (say so on the page).

## Current state
- Live (old design): https://main.d20iokpmvk0ua7.amplifyapp.com
- AWS Amplify app `d20iokpmvk0ua7`, us-east-1, platform WEB. Auto-deploys on push to `main` of GitHub `dheerukarra/dheeraj-aws-portfolio` (currently PRIVATE; ask before making it public). `amplify.yml` uses `baseDirectory: out`.
- Components in `src/components`: Navbar, Hero, ParticlePortrait, About, Superpowers, Projects, ShortsEngineCard, ExperiencePipeline, KalshiSimulator, CreativeFeature (+ `creative/`: Terminal, Game, commands, useOverlay; opens on window event `open-creative` and the `~` key), Footer, TerminalHint.
- Data source of truth: `src/data/resume.ts` (profile, education, certifications, skillGroups, project, shortsEngine, experience, agents).
- Agents in `.claude/agents` (six roles). Subagents cannot call the Skill tool, so do skill-driven design in the main session.
- Hackathon rules: sections About, Skills/Tech Superpowers, Projects (anchors `#about #superpowers #projects`); one creative feature with a visible hint that never blocks navigation; hosted on Amplify; GitHub link; Builder Center post with screenshots; must work on mobile.
- Rubric: creativity 30, AWS implementation 25, communication 25, completeness/usability 20.

## Avatar
Pixar-style poses (LOW-RES 328px placeholders) in `public/avatar/`: `neutral.png`, `wave.png`, `laugh.png`, `turn-left.png` (head turned to the viewer's left), `thumbs.png`. Dark charcoal-navy background. The owner may replace them with full-resolution files, or add `public/avatar/avatar.glb`. Sideload.gg avatars cost $2 USDC (x402 on Base); Claude cannot pay. Make swapping assets trivial. Fade image edges with a CSS radial mask so no rectangle shows.

## Design direction (from his resources)
"Dark tech keynote x toy/material 3D" (awesomeclaude motion styles 7 and 16).
- Palette: ground #07090d, hairline grid rgba(244,239,231,.07), warm white #f4efe7, ONE accent orange #ff6a1f (the jacket). Violet #8b7cff only as 3D rim light. Lime only for terminal/data.
- Fonts via next/font: Syne 800 display, Instrument Sans body, JetBrains Mono labels.
- Hero: giant kinetic type; avatar swaps poses with the cursor (turn-left when cursor is left of him, wave on load and click, laugh on hover of fun items, thumbs on tools); real three.js/R3F scene with REAL 3D brand logos (extrude simple-icons SVG paths with SVGLoader; paths in `C:\Users\dheer\AppData\Local\Temp\claude\ad9b5dbc5693f730\26436bc6-765f-48f9-9e20-df9a6338ae5a\scratchpad\icons-min.json`, or `cdn.jsdelivr.net/npm/simple-icons@13.15.0/icons/<slug>.svg`; slugs: python pytorch pandas numpy tableau selenium cypress openjdk postgresql mysql mongodb git github anthropic ollama googlegemini postman jira oracle html5 css3 bootstrap); parallax depth; LOW bloom only.
- Prototype to reuse: `C:\Users\dheer\AppData\Local\Temp\claude\ad9b5dbc5693f730\a6ded318-2f85-4ed0-b105-58b4649ebb38\scratchpad\world.tpl.html` (three r155 modules, camera flying between 5 stages, logos ring to grid, pose crossfade shader, Kalshi bars, terminal canvas). FIX its weaknesses: hazy gray-blue background (keep near-black, no fog haze, high bloom threshold), name text overlapping the terminal, logos overlapping the avatar face, sticker-like avatar disc.
- Scroll storytelling: GSAP ScrollTrigger (pinned, scrubbed), shape-morph transitions, kinetic type reveals.
- Sections: hero; `#about` (education drawn as a single self-drawing SVG line; 4 certifications); `#superpowers` (3D logo wall, hover shows name and group: AI/vibe coding, Testing/QA, Data/ML, Stack); `#projects` (Kalshi reconstruction + simulator, shorts-engine card, experience pipeline for the two jobs); `#creative` (the `~` terminal and the 15 s bug-hunter, visible hint in nav and hero); footer (dheerajreddy.karra@gmail.com, https://www.linkedin.com/in/dheeraj-reddy-karra, GitHub).
- Restyle existing components through CSS variables in `src/app/globals.css`. Optional small AWS "judge" panel mapping rubric to sections.
- Mobile 390px no horizontal scroll, 44px targets, no-WebGL fallback (static avatar), `prefers-reduced-motion` fallback, 60fps (DPR cap 1.75, pause off-screen).

## Skills installed in `.claude/skills` (use them via the Skill tool)
taste-skill and impeccable (art direction, critique, headless-browser check) first; then web3d-integration-patterns, threejs-webgl, react-three-fiber, gsap-scrolltrigger, gsap-react, gsap-timeline, motion-framer, modern-web-design, lightweight-3d-effects, lottie-animations, motion-design; genjutsu cast/paint if useful.
Apply Emil Kowalski web-animation rules: ease-out cubic-bezier(.16,1,.3,1), 300-700 ms entrances, springs for gestures, animate only transform/opacity, interruptible, reduced-motion for every animation. Apply the "dark tech keynote" spec: near-black stage, hairline grid, one giant word/number, one accent, no particle bursts or lens flares.

## Motion-graphics reel
Use `explainer-high-energy` (Barty-Bart/motion-graphics; needs Node 18+, ffmpeg, Playwright) for a 15 s reel in the dark tech keynote style: title slam "DHEERAJ REDDY KARRA", kinetic words TESTER -> AI ENGINEER, a signature shape moment, a terminal micro-interaction, end card with the live URL. Add audio with `sound-effects`. Save `public/reel.mp4` (+ poster, under 8 MB) and embed as a "Play the reel" modal from the hero.

## Delivery steps
1. Art-direction pass (taste + impeccable), short design spec.
2. Build hero + 3D scene; screenshot at 1440x900 and 390x844; show the owner a real render before building the rest.
3. Build the sections.
4. Reel.
5. `npm run build` (static export must succeed); Playwright QA: zero console errors, no overflow at 390, anchors work, `~` opens the terminal, game playable, simulator controls work.
6. Commit and push to `main`; verify the live URL after ~3 min.
7. Write `docs/SUBMISSION.md` (story, architecture, AWS services, learnings, challenges, honest Kalshi note, six-agent team, skills used, screenshot list).
8. Ask the owner before making the repo public and for the 5 screenshots. Aim to be deployed by Nov 5 evening; Nov 6 is polish and submission.

## Lessons
- The Fact-Forcing Gate hook denies the first Write/Edit/Bash of each kind: state the facts in text and retry.
- Background browser tabs pause `requestAnimationFrame`; view WebGL in the foreground tab.
- Claude in Chrome tab 1806388213 is the owner's logged-in browser (AWS console). Do not use Gemini.
