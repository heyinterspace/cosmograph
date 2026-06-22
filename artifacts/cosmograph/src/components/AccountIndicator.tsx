import { Show, UserButton } from "@clerk/react";
import { useLocation } from "wouter";
import { LogIn, ShieldCheck, Sparkles } from "lucide-react";
import { useAppState } from "@/lib/store";

// Lightweight auth state in the console: signed-out shows a Sign in button,
// signed-in shows Clerk's UserButton (avatar + sign-out menu) plus whether the
// account has the global unlock. Renders nothing about the default scientist —
// that experience is free and account-agnostic.
export function AccountIndicator() {
  const { entitled } = useAppState();
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col gap-1.5">
      <Show when="signed-out">
        <button
          type="button"
          onClick={() => setLocation("/sign-in")}
          className="flex w-full items-center gap-2 border-2 border-edge bg-white/5 px-3 py-2 text-[11px] font-display uppercase tracking-wider text-ink transition-all hover:bg-white/10"
        >
          <LogIn size={14} />
          Sign in
        </button>
      </Show>

      <Show when="signed-in">
        <div className="flex items-center gap-2 border-2 border-edge bg-white/5 px-2 py-1.5">
          <UserButton />
          <span
            className={`flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest ${
              entitled ? "text-accent" : "text-ink-dim"
            }`}
          >
            {entitled ? <ShieldCheck size={12} /> : <Sparkles size={12} />}
            {entitled ? "Full access" : "Free preview"}
          </span>
        </div>
      </Show>
    </div>
  );
}

// Compact variant for the collapsed rail: just the auth glyph / avatar.
export function AccountIndicatorRail() {
  const [, setLocation] = useLocation();

  return (
    <>
      <Show when="signed-out">
        <button
          type="button"
          aria-label="Sign in"
          title="Sign in"
          onClick={() => setLocation("/sign-in")}
          className="flex h-9 w-9 items-center justify-center border-2 border-edge bg-white/5 text-ink transition-all hover:bg-white/10"
        >
          <LogIn size={15} />
        </button>
      </Show>
      <Show when="signed-in">
        <div className="flex h-9 w-9 items-center justify-center">
          <UserButton />
        </div>
      </Show>
    </>
  );
}
