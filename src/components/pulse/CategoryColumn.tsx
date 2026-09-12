import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Accent = "dark" | "motion" | "confirmed";

const accentStyles: Record<Accent, { chip: string; bar: string; dot: string }> = {
  dark: {
    chip: "bg-danger/10 text-danger border-danger/25",
    bar: "from-danger/70 to-danger/0",
    dot: "bg-danger",
  },
  motion: {
    chip: "bg-progress/10 text-progress border-progress/25",
    bar: "from-progress/70 to-progress/0",
    dot: "bg-progress",
  },
  confirmed: {
    chip: "bg-success/10 text-success border-success/25",
    bar: "from-success/70 to-success/0",
    dot: "bg-success",
  },
};

interface CategoryColumnProps {
  title: string;
  description: string;
  accent: Accent;
  count: number;
  icon: ReactNode;
  children: ReactNode;
  empty: string;
  isEmpty: boolean;
}

export function CategoryColumn({
  title,
  description,
  accent,
  count,
  icon,
  children,
  empty,
  isEmpty,
}: CategoryColumnProps) {
  const styles = accentStyles[accent];

  return (
    <section className="flex flex-col rounded-xl border border-border bg-card/60 backdrop-blur-sm">
      <div className={cn("h-px w-full bg-gradient-to-r", styles.bar)} />
      <header className="flex items-start justify-between gap-3 px-5 pt-5">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "mt-0.5 flex size-8 items-center justify-center rounded-lg border",
              styles.chip,
            )}
          >
            {icon}
          </span>
          <div>
            <h2 className="text-sm font-semibold tracking-[0.14em] text-foreground uppercase">
              {title}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
          </div>
        </div>
        <span
          className={cn(
            "rounded-md border px-2 py-0.5 font-mono text-xs tabular-nums",
            styles.chip,
          )}
          aria-label={`${count} items`}
        >
          {count}
        </span>
      </header>
      <div className="flex-1 space-y-3 p-5">
        {isEmpty ? (
          <p className="rounded-lg border border-dashed border-border/70 px-4 py-6 text-center text-xs text-muted-foreground">
            {empty}
          </p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

interface ItemCardProps {
  accent: Accent;
  person?: string | null | undefined;
  item: string;
  note?: string | null | undefined;
  noteLabel?: string | undefined;
  confidence?: number | null | undefined;
}

export function ItemCard({
  accent,
  person,
  item,
  note,
  noteLabel,
  confidence,
}: ItemCardProps) {
  const styles = accentStyles[accent];
  const pct =
    typeof confidence === "number" && Number.isFinite(confidence)
      ? Math.round((confidence > 1 ? confidence / 100 : confidence) * 100)
      : null;

  return (
    <article className="group rounded-lg border border-border bg-surface p-4 transition-colors hover:border-ring/50">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className={cn("size-1.5 shrink-0 rounded-full", styles.dot)} />
          <span className="truncate text-xs font-medium tracking-wide text-foreground/90">
            {person?.trim() ? person : "Unassigned"}
          </span>
        </div>
        {pct !== null && (
          <span className="shrink-0 font-mono text-[10px] text-muted-foreground tabular-nums">
            {pct}%
          </span>
        )}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-foreground">{item}</p>
      {note?.trim() && (
        <p className="mt-2 border-l border-border pl-3 text-xs leading-relaxed text-muted-foreground">
          {noteLabel ? <span className="text-foreground/60">{noteLabel}: </span> : null}
          {note}
        </p>
      )}
    </article>
  );
}
