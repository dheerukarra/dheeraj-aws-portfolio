// Single source of truth. Every fact here comes from Dheeraj's resume. Do not invent.

export const profile = {
  name: "Dheeraj Reddy Karra",
  short: "Dheeraj",
  location: "Warrensburg, MO",
  email: "dheerajreddy.karra@gmail.com",
  phone: "+1 217-218-1955",
  linkedin: "https://www.linkedin.com/in/dheeraj-reddy-karra",
  github: "https://github.com/dheerukarra",
  repo: "https://github.com/dheerukarra/dheeraj-aws-portfolio",
  role: "Automation tester turned AI-native engineer",
  headline: "I test software for a living, so I know how to make AI agents behave.",
  summary:
    "B.S. Computer Science (Cum Laude, 3.51 GPA, Dean's List) and M.S. Data Science student at the University of Central Missouri. Two years as an automation tester, now directing AI coding agents to build systems with the same discipline: constraints, audits, regression checks.",
};

export const education = [
  {
    school: "University of Central Missouri",
    place: "Warrensburg, MO",
    degree: "Master of Science: Data Science",
    date: "05/2027",
    status: "In progress",
    note: "",
  },
  {
    school: "University of Central Missouri",
    place: "Warrensburg, MO",
    degree: "Bachelor of Science: Computer Science",
    date: "12/2023",
    status: "Graduated",
    note: "Cum Laude, GPA 3.51, Dean's List.",
  },
];

export const certifications = [
  { name: "Smart Supply Chain Management", issuer: "Indian Institute of Management Mumbai" },
  { name: "What is Data Science", issuer: "IBM, Coursera" },
  { name: "Python Certification", issuer: "freeCodeCamp" },
  { name: "Intro to Programming", issuer: "Kaggle" },
];

export const skillGroups = [
  {
    id: "ai",
    title: "AI and vibe coding",
    line: "Directing agents, not trusting them.",
    skills: [
      "Prompt Engineering",
      "AI-Assisted Development",
      "Code Generation & Refactoring",
      "Rapid Prototyping",
      "Debugging with AI",
      "Claude Code CLI",
      "Ollama",
      "Gemini CLI",
      "Kimi Code CLI",
      "Cursor",
      "Antigravity",
    ],
  },
  {
    id: "qa",
    title: "Testing and QA",
    line: "Where the discipline comes from.",
    skills: [
      "Selenium",
      "Cypress",
      "TestNG",
      "Postman",
      "API Testing",
      "Manual Testing",
      "Automation Testing",
      "Quality Assurance",
      "JIRA",
    ],
  },
  {
    id: "data",
    title: "Data science and ML",
    line: "Pandas to PyTorch.",
    skills: ["Python", "Pandas", "NumPy", "Matplotlib", "Data Analysis", "Data Cleaning", "Tableau"],
  },
  {
    id: "stack",
    title: "Languages, data and delivery",
    line: "The plumbing.",
    skills: [
      "Java",
      "Python",
      "SQL",
      "HTML",
      "CSS",
      "Bootstrap",
      "MySQL",
      "PostgreSQL",
      "Oracle",
      "MongoDB",
      "Git",
      "GitHub",
      "Agile",
      "Scrum",
      "TDD",
    ],
  },
];

export const project = {
  title: "Kalshi High-Frequency Trading System",
  tag: "100% Vibe Coded",
  stack: ["Python", "PyTorch", "WebSockets"],
  summary:
    "A fully autonomous algorithmic trading system for prediction markets, built by directing AI agents (LLMs) through a 3-layer execution architecture: Arbitrage, Momentum and Reinforcement Learning.",
  points: [
    {
      label: "AI orchestration and prompt engineering",
      text: "Guided the AI through rigorous, multi-prompt iterations to develop a PyTorch neural network with 4 independent specialist agents governed by a Meta-Learner.",
    },
    {
      label: "System design and debugging",
      text: "Diagnosed and resolved AI hallucinations and catastrophic interference bugs with strict prompt constraints, architectural audits and memory optimizations (64-byte alignment).",
    },
    {
      label: "Product execution",
      text: "Deployed the resilient, asynchronous Python system to a Linux VPS, with real-time WebSocket data and a custom Telegram UI for live telemetry.",
    },
  ],
  honestNote:
    "The original source files were lost. The simulator on this page and the code in /kalshi-reference are a reconstruction of the architecture. All numbers shown are simulated.",
};

// Source: github.com/dheerukarra/shorts-engine README. Repo is private; `repo` stays empty until made public.
export const shortsEngine = {
  title: "shorts-engine",
  tag: "Proof-first AI video pipeline",
  stack: ["Python", "FFmpeg", "Edge-TTS", "Playwright", "Pydantic", "FastAPI", "pytest"],
  summary:
    "A fully automated pipeline that produces vertical YouTube Shorts (30 to 59 seconds) where every on-screen claim is backed by retrievable evidence, using an AI-avatar split-screen format with overlays, SFX and music on a free-first, open-source stack.",
  points: [
    "Proof-first: no claim reaches audio or video without a verified source URL.",
    "Hard duration gate: output is rejected outside 30.0 to 59.0 seconds.",
    "Six-agent chain: intent router, evidence retriever, script writer, avatar renderer, audio pipeline, video composer.",
    "Evidence adapters for GitHub search, news and a Playwright web scraper.",
    "Test suite across smoke, unit, integration and end-to-end layers, with CI on GitHub Actions.",
  ],
  repo: "",
};

export const experience = [
  {
    company: "VSquare IT Inc.",
    title: "Automation Tester",
    dates: "12/2024 – 05/2025",
    bullets: [
      "Executed automated testing of web applications using Java and Selenium WebDriver, focusing on regression and functional testing.",
      "Collaborated with developers and product owners during sprint planning to understand feature requirements and upcoming changes.",
      "Created and maintained automated test scripts in Java and Selenium WebDriver for comprehensive coverage of new and existing features.",
      "Built and optimized test automation frameworks using Java and Selenium WebDriver to improve testing efficiency and maintainability.",
      "Performed smoke testing on new builds to verify system stability before in-depth testing.",
      "Managed defect tracking and resolution using JIRA, keeping the team updated.",
    ],
  },
  {
    company: "ICloud Technologies Corp",
    title: "Automation Tester",
    dates: "02/2023 – 11/2024",
    bullets: [
      "Performed manual testing of web-based applications in multiple browsers.",
      "Participated in sprint planning meetings with developers and product owners to understand upcoming features and changes.",
      "Created, executed and maintained automated scripts using Selenium WebDriver for regression testing.",
      "Assisted in developing test automation frameworks using tools such as the Cypress framework.",
      "Conducted smoke tests to ensure new builds were stable enough for further testing.",
      "Used defect tracking systems such as JIRA to monitor bug resolution progress.",
    ],
  },
];

export const agents = [
  { id: "cto-architect", role: "CTO and architect", does: "plan, data, review" },
  { id: "principal-ui-designer", role: "UI and motion", does: "identity, hero, sections" },
  { id: "quant-ml-engineer", role: "Quant and ML", does: "Kalshi simulator, reference code" },
  { id: "gamification-engineer", role: "Interactive", does: "terminal, bug-hunter game" },
  { id: "sdet-qa-lead", role: "SDET", does: "experience pipeline, Playwright QA" },
  { id: "aws-devops-devrel", role: "AWS and DevRel", does: "Amplify, write-up" },
] as const;
