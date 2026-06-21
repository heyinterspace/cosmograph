import { SITE } from "@/config/site";
import { useAppState } from "@/lib/store";

export function Footer() {
  const { setChangelogOpen } = useAppState();

  return (
    <footer className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-1 px-4 pb-1.5 pt-1 pointer-events-none">
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-center font-mono text-[10px] leading-relaxed tracking-wide text-ink-dim/70">
        <span>
          © 2026{" "}
          <button
            onClick={() => setChangelogOpen(true)}
            title="View the flight log"
            className="pointer-events-auto text-accent underline-offset-2 transition-colors hover:underline"
          >
            v{SITE.version}
          </button>
        </span>
        <span className="text-ink-dim/30">·</span>
        <span>
          <span className="text-ink-dim">{SITE.domain}</span> is an{" "}
          <a
            href={SITE.org.url}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto text-accent underline-offset-2 hover:underline"
          >
            {SITE.org.name}
          </a>
          . Built at the speed of thought with{" "}
          <a
            href={SITE.replitUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto text-accent underline-offset-2 hover:underline"
          >
            Replit
          </a>
          .
        </span>
      </div>
      <p className="max-w-5xl text-center font-mono text-[10px] leading-relaxed tracking-wide text-ink-dim/55">
        Any scientist's lifetime of research, rendered as an explorable galaxy —
        research domains are suns, papers are orbiting planets, co-authors are moons.
      </p>
    </footer>
  );
}
