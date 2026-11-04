import { profile } from "@/data/resume";

const rows = [
  { label: "Email", href: `mailto:${profile.email}`, text: profile.email },
  { label: "LinkedIn", href: profile.linkedin, text: "dheeraj-reddy-karra" },
  { label: "GitHub", href: profile.github, text: "dheerukarra" },
  { label: "Repo", href: profile.repo, text: "dheeraj-aws-portfolio" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-line pt-20 pb-10 md:pt-28">
      <div className="wrap">
        <p className="eyebrow">Contact</p>
        <a
          href={`mailto:${profile.email}`}
          className="f-display mt-4 block break-words text-[clamp(1.9rem,7.2vw,5rem)] font-extrabold leading-[0.98] hover:text-accent"
        >
          Let&apos;s build something that holds up.
        </a>

        <ul className="mt-14 grid gap-0 border-t border-line md:grid-cols-2">
          {rows.map((r) => {
            const ext = !r.href.startsWith("mailto:");
            return (
              <li key={r.label} className="border-b border-line md:odd:pr-8">
                <a
                  href={r.href}
                  {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="flex min-h-14 items-baseline justify-between gap-4 py-4 hover:text-accent"
                >
                  <span className="text-xs uppercase tracking-[0.16em] text-muted">{r.label}</span>
                  <span className="min-w-0 truncate text-sm">{r.text}</span>
                </a>
              </li>
            );
          })}
        </ul>

        <p className="mt-12 text-xs text-muted">
          {profile.name}, {profile.location}. Built for the AWS Student Builder Challenge.
        </p>
      </div>
    </footer>
  );
}
