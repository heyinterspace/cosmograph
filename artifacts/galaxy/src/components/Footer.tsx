import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { SITE } from "@/config/site";
import { galaxyData } from "@/data/galaxy";

export function Footer() {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <>
      <footer className="absolute inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-1.5 pt-1 pointer-events-none">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-center font-mono text-[10px] leading-relaxed tracking-wide text-ink-dim/70">
          <span>© 2026 v{SITE.version}</span>
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
          <span className="text-ink-dim/30">·</span>
          <button
            onClick={() => setAboutOpen(true)}
            className="pointer-events-auto uppercase tracking-widest transition-colors hover:text-ink"
          >
            About
          </button>
        </div>
      </footer>

      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  );
}

function AboutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-auto"
        >
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="about-title"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="custom-scrollbar relative glass-panel w-full max-w-lg max-h-[calc(100vh-3rem)] overflow-y-auto p-7"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              autoFocus
              className="absolute top-4 right-4 text-ink-dim transition-colors hover:text-ink"
            >
              <X size={18} />
            </button>

            <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
              About this project
            </span>
            <h2
              id="about-title"
              className="mt-1 mb-5 text-2xl font-title font-bold tracking-tight text-ink"
            >
              A galaxy for a life in science
            </h2>

            <div className="space-y-4 text-[13px] leading-relaxed text-ink-dim">
              <p>
                Galactic turns a scientist's lifetime of research into a universe you can fly
                through. Every <span className="text-ink">sun</span> is a field they helped shape,
                every <span className="text-ink">planet</span> a paper they published, and every{" "}
                <span className="text-ink">moon</span> a collaborator who worked alongside them.
                Right now you're exploring the work of{" "}
                <span className="text-ink">{galaxyData.author.name}</span>.
              </p>
              <p>
                It began as a Father's Day gift — a way to make one researcher's life's work feel as
                vast as it truly is. A career in science usually disappears into citation counts and
                PDFs; this is an attempt to let you <em>feel</em> the scale of it, and to say thank
                you to the people who spend their lives expanding what we know.
              </p>
              <p>
                Galactic is open source and built for anyone. Point it at any researcher — a parent,
                a mentor, or yourself — and it rebuilds the entire galaxy from public data on{" "}
                <span className="text-ink">OpenAlex</span>. No identity is hardcoded; everything you
                see is generated from a single data snapshot.
              </p>
            </div>

            <p className="mt-6 border-t-2 border-edge pt-4 font-mono text-[11px] leading-relaxed text-ink-dim">
              Built frontend-only with React, Three.js & React Three Fiber. Bibliographic data from
              OpenAlex — {galaxyData.papers.length.toLocaleString()} papers across{" "}
              {galaxyData.domains.length} domains.
            </p>

            <p className="mt-4 font-mono text-[10px] leading-relaxed text-ink-dim/70">
              v{SITE.version} ·{" "}
              <span className="text-ink-dim">{SITE.domain}</span> is an{" "}
              <a
                href={SITE.org.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline-offset-2 hover:underline"
              >
                {SITE.org.name}
              </a>
              .
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
