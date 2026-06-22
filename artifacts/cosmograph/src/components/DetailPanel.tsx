import { useAppState } from "@/lib/store";
import { galaxyData, getDomain, papersByDomain } from "@/data/galaxy";
import { motion } from "framer-motion";
import { X, ExternalLink, Lock } from "lucide-react";
import { getDomainColorStr } from "@/lib/colors";

export function DetailPanel() {
  const { selectedObject, setSelectedObject } = useAppState();

  if (!selectedObject) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      className="glass-panel flex flex-col"
    >
      <div className="flex justify-between items-center p-4 border-b-2 border-edge">
        <div className="font-mono text-[10px] uppercase tracking-widest text-ink-dim">
          {selectedObject.type === "sun" ? "Domain" : "Paper"}
        </div>
        <button
          onClick={() => setSelectedObject(null)}
          className="text-ink-dim hover:text-ink transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-5">
        {selectedObject.type === "sun" ? (
          <DomainDetail id={selectedObject.id} />
        ) : (
          <PlanetDetail id={selectedObject.id} />
        )}
      </div>
    </motion.div>
  );
}

function DomainDetail({ id }: { id: string }) {
  const { setCameraMode, setSelectedObject, canExplore, setPaywallOpen } =
    useAppState();
  const domain = getDomain(id);
  const colorStr = getDomainColorStr(galaxyData.domains.findIndex((d) => d.id === id));

  const goToPaper = (paperId: string) => {
    setCameraMode("god");
    setSelectedObject({ type: "planet", id: paperId });
  };

  if (!domain) return <div className="text-ink-dim">Domain not found</div>;

  const papers = papersByDomain[id] || [];
  const topPapers = [...papers].sort((a, b) => b.citations - a.citations).slice(0, 8);

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="h-3 w-3 border-2 border-edge" style={{ background: colorStr }} />
          <h2 className="text-xl font-display font-extrabold leading-tight text-ink">{domain.name}</h2>
        </div>
        <p className="text-ink-dim text-sm">{domain.field}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Metric label="Papers" value={String(domain.paperCount)} />
        <Metric label="Citations" value={domain.totalCitations.toLocaleString()} />
      </div>

      {/* Rich domain exploration — flying to individual papers — is part of the
          paid deep-dive. Locked scientists see the headline stats above plus an
          unlock prompt instead of the navigable Top Papers list. */}
      {canExplore ? (
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-ink-dim mb-3">Top Papers</div>
          <div className="space-y-2">
            {topPapers.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => goToPaper(p.id)}
                title="Fly to this planet"
                className="block w-full text-left bg-white/5 border-2 border-edge p-3 text-sm transition-colors hover:bg-accent/15 hover:border-accent"
              >
                <div className="text-ink line-clamp-2 leading-snug mb-2">{p.title}</div>
                <div className="flex gap-3 font-mono text-[11px]">
                  <span className="text-accent">{p.citations} citations</span>
                  {p.year && <span className="text-ink-dim">{p.year}</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="border-2 border-accent/50 bg-accent/5 p-4 space-y-3">
          <div className="flex items-center gap-2 text-accent">
            <Lock size={14} />
            <span className="font-mono text-[10px] uppercase tracking-widest">
              Locked exploration
            </span>
          </div>
          <p className="text-[13px] leading-relaxed text-ink-dim">
            Unlock full exploration to dive into this domain's top papers, fly the
            galaxy, and take the guided tour of any researcher you search.
          </p>
          <button
            type="button"
            onClick={() => setPaywallOpen(true)}
            style={{ background: "var(--accent)" }}
            className="glass-panel glass-panel-interactive flex items-center justify-center gap-2 w-full py-2.5 text-accent-foreground font-display text-[11px] uppercase tracking-widest"
          >
            <Lock size={13} />
            <span>Unlock for $10</span>
          </button>
        </div>
      )}
    </div>
  );
}

function PlanetDetail({ id }: { id: string }) {
  const { canExplore, setPaywallOpen } = useAppState();
  const paper = galaxyData.papers.find((p) => p.id === id);
  if (!paper) return <div className="text-ink-dim">Paper not found</div>;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-display font-bold leading-snug mb-3 text-ink">{paper.title}</h2>

        <div className="flex flex-wrap gap-2 font-mono text-[11px]">
          {paper.year && (
            <span className="px-2 py-1 bg-white/8 border-2 border-edge text-ink">{paper.year}</span>
          )}
          <span className="px-2 py-1 bg-accent text-accent-foreground border-2 border-edge">
            {paper.citations.toLocaleString()} citations
          </span>
          {paper.type && (
            <span className="px-2 py-1 bg-white/5 border-2 border-edge text-ink-dim">{paper.type}</span>
          )}
        </div>
      </div>

      {/* Free preview for a non-default searched scientist: stop at the headline
          stats above and offer the unlock. Venue / full co-author list / source
          link are part of deep exploration. */}
      {!canExplore && (
        <div className="border-2 border-accent/50 bg-accent/5 p-4 space-y-3">
          <div className="flex items-center gap-2 text-accent">
            <Lock size={14} />
            <span className="font-mono text-[10px] uppercase tracking-widest">
              Locked preview
            </span>
          </div>
          <p className="text-[13px] leading-relaxed text-ink-dim">
            Unlock full exploration to see this paper's venue, every co-author,
            and a link to the source — plus fly and tour any galaxy.
          </p>
          <button
            type="button"
            onClick={() => setPaywallOpen(true)}
            style={{ background: "var(--accent)" }}
            className="glass-panel glass-panel-interactive flex items-center justify-center gap-2 w-full py-2.5 text-accent-foreground font-display text-[11px] uppercase tracking-widest"
          >
            <Lock size={13} />
            <span>Unlock for $10</span>
          </button>
        </div>
      )}

      {canExplore && paper.venue && (
        <div className="text-sm">
          <div className="font-mono text-[10px] uppercase tracking-widest text-ink-dim mb-1">Venue</div>
          <div className="text-ink">{paper.venue}</div>
        </div>
      )}

      {canExplore && paper.coAuthors.length > 0 && (
        <div className="text-sm">
          <div className="font-mono text-[10px] uppercase tracking-widest text-ink-dim mb-2">
            Co-authors ({paper.coAuthorCount})
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1 pb-1">
            {paper.coAuthors.map((author, i) => (
              <span key={i} className="px-2 py-1 bg-white/5 border-2 border-edge text-[11px] text-ink-dim">
                {author}
              </span>
            ))}
          </div>
        </div>
      )}

      {canExplore && paper.url && (
        <a
          href={paper.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ background: "var(--accent)" }}
          className="glass-panel glass-panel-interactive flex items-center justify-center gap-2 w-full py-3 text-accent-foreground font-display text-xs uppercase tracking-widest"
        >
          <span>View Source</span>
          <ExternalLink size={14} />
        </a>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/5 border-2 border-edge p-3">
      <div className="font-mono text-[10px] uppercase tracking-widest text-ink-dim mb-1">{label}</div>
      <div className="font-mono text-lg text-ink">{value}</div>
    </div>
  );
}
