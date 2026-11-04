"use client";

export function openTerminal() {
  window.dispatchEvent(new CustomEvent("open-creative", { detail: { mode: "terminal" } }));
}

export default function TerminalHint({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={openTerminal} className={`hint-pill ${className}`}>
      <span>
        Press <kbd>~</kbd> or tap to open the terminal
      </span>
    </button>
  );
}
