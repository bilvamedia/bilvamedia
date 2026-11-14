import { useState, type ReactNode } from "react";
import { ArrowUpRight, RefreshCw, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { clockTime, dayMonth, industryLabel, perDay, timeAgo, verdict, views } from "@/lib/format";
import type { Meta, Source, Story, Video } from "@/lib/types";

export function Kicker({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`kicker ${className}`}>{children}</p>;
}

export function Panel({
  title,
  kicker,
  action,
  children,
  className = "",
}: {
  title: string;
  kicker?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`plate ${className}`}>
      <header className="flex items-end justify-between gap-3 border-b border-hairline px-[var(--space-3)] py-[var(--space-2)]">
        <div>
          {kicker ? <Kicker>{kicker}</Kicker> : null}
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        {action}
      </header>
      <div className="p-[var(--space-3)]">{children}</div>
    </section>
  );
}

export function LiveBadge({ meta, onRefresh }: { meta: Meta; onRefresh?: () => void }) {
  const live = !meta.snapshot;
  return (
    <div className="flex flex-wrap items-center gap-[var(--space-2)] text-sm text-muted-foreground">
      <span className="pill" style={{ borderColor: live ? "var(--hairline)" : "var(--hotline)" }}>
        <span
          className={`pulse-dot inline-block size-2 rounded-full ${live ? "" : "opacity-70"}`}
          style={{ background: live ? "var(--site-accent)" : "var(--hotline)" }}
        />
        {live ? `live · ${meta.liveSources}/${meta.totalSources} sources` : "snapshot · feeds unreachable"}
      </span>
      <span className="hidden sm:inline">
        updated {dayMonth(meta.capturedAt)} {clockTime(meta.capturedAt)} UTC
      </span>
      {onRefresh ? (
        <button
          type="button"
          onClick={onRefresh}
          className="pill hover:border-[color-mix(in_srgb,var(--site-accent)_60%,transparent)]"
        >
          <RefreshCw size={12} />
          refresh
        </button>
      ) : null}
    </div>
  );
}

export function FilterChips({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="scrollbar-none -mx-[var(--space-1)] flex gap-[var(--space-1)] overflow-x-auto px-[var(--space-1)] pb-1">
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.id)}
            className={`pill shrink-0 ${active ? "" : "opacity-70 hover:opacity-100"}`}
            style={
              active
                ? { background: "var(--site-accent)", color: "var(--site-on-accent)", borderColor: "var(--site-accent)" }
                : undefined
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="border-hairline bg-plate pr-9 pl-9"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}

function Thumb({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`filmstrip flex items-center justify-center bg-plate ${className}`} aria-hidden>
        <span className="font-display text-2xl tracking-[0.1em] text-muted-foreground">T</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}

export function StoryMeta({ item }: { item: Story }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
      <span className="text-foreground/80">{item.source}</span>
      <span aria-hidden>·</span>
      <span>{timeAgo(item.publishedAt)}</span>
      {item.industry ? (
        <>
          <span aria-hidden>·</span>
          <span className="uppercase tracking-[0.08em]">{industryLabel(item.industry)}</span>
        </>
      ) : null}
      {item.platform && item.platform !== "Unlisted" ? (
        <>
          <span aria-hidden>·</span>
          <span className="text-[color:var(--site-accent-text)]">{item.platform}</span>
        </>
      ) : null}
    </p>
  );
}

export function StoryRow({ item, promoted = false }: { item: Story; promoted?: boolean }) {
  return (
    <article className="rule-accent flex gap-[var(--space-3)] border-b border-hairline pb-[var(--space-3)]">
      <Thumb src={item.image} alt="" className="size-20 shrink-0 rounded-md sm:size-24" />
      <div className="min-w-0 flex-1">
        <StoryMeta item={item} />
        <h3 className={`mt-1 ${promoted ? "text-2xl" : "text-lg"} font-semibold`}>
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-[color:var(--site-accent-text)]">
            {item.title}
          </a>
        </h3>
        {item.summary ? <p className="clamp-two mt-1 text-sm text-muted-foreground">{item.summary}</p> : null}
      </div>
    </article>
  );
}

export function StoryCard({ item }: { item: Story }) {
  return (
    <article className="plate plate-hover flex flex-col overflow-hidden">
      <Thumb src={item.image} alt="" className="aspect-video w-full" />
      <div className="flex flex-1 flex-col gap-2 p-[var(--space-3)]">
        <StoryMeta item={item} />
        <h3 className="text-lg font-semibold">
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-[color:var(--site-accent-text)]">
            {item.title}
          </a>
        </h3>
        {item.summary ? <p className="clamp-two text-sm text-muted-foreground">{item.summary}</p> : null}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center gap-1 text-sm text-[color:var(--site-accent-text)]"
        >
          Read at {item.source} <ArrowUpRight className="size-4" />
        </a>
      </div>
    </article>
  );
}

export function ScoreDial({ score }: { score: number }) {
  const filled = score > 0;
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex size-11 shrink-0 items-center justify-center rounded-full font-display text-lg"
        style={{
          border: `2px solid ${filled ? "var(--site-accent)" : "var(--hairline)"}`,
          color: filled ? "var(--site-accent-text)" : "var(--site-muted)",
        }}
        aria-hidden
      >
        {filled ? score.toFixed(1) : "—"}
      </div>
      <div className="text-xs text-muted-foreground">
        <p className="font-display uppercase tracking-[0.1em] text-foreground/85">{filled ? verdict(score) : "unscored"}</p>
        <p>{filled ? "out of 5" : "wire did not file a number"}</p>
      </div>
    </div>
  );
}

export function Bar({ value, max, tone = "accent" }: { value: number; max: number; tone?: "accent" | "cool" }) {
  const pct = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--hairline)" }}>
      <div
        className="bar-fill h-full rounded-full"
        style={{ width: `${pct}%`, background: tone === "accent" ? "var(--site-accent)" : "var(--color-chart-3)" }}
      />
    </div>
  );
}

export function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="plate px-[var(--space-3)] py-[var(--space-2)]">
      <Kicker>{label}</Kicker>
      <p className="font-display text-3xl leading-tight text-[color:var(--site-accent)]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function VideoRow({ video, rank, maxViews }: { video: Video; rank: number; maxViews: number }) {
  const speed = perDay(video.publishedAt, video.views);
  return (
    <li className="flex items-center gap-[var(--space-3)] border-b border-hairline py-[var(--space-2)] last:border-0">
      <span className="font-display w-6 shrink-0 text-right text-lg text-muted-foreground">{rank}</span>
      <a href={video.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
        <Thumb src={video.thumbnail} alt="" className="aspect-video w-24 rounded-md sm:w-28" />
      </a>
      <div className="min-w-0 flex-1">
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="clamp-two block text-sm font-semibold hover:text-[color:var(--site-accent-text)]"
        >
          {video.title}
        </a>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          <span>{video.channelName}</span>
          <span aria-hidden>·</span>
          <span>{timeAgo(video.publishedAt)}</span>
          <span aria-hidden>·</span>
          <span className="text-[color:var(--site-accent-text)]">{views(speed)}/day</span>
        </p>
        <div className="mt-1 flex items-center gap-2">
          <Bar value={video.views} max={maxViews} />
          <span className="font-display w-14 shrink-0 text-right text-sm">{views(video.views)}</span>
        </div>
      </div>
    </li>
  );
}

export function VideoCard({ video }: { video: Video }) {
  const speed = perDay(video.publishedAt, video.views);
  return (
    <article className="plate plate-hover flex flex-col overflow-hidden">
      <a href={video.url} target="_blank" rel="noopener noreferrer" className="relative">
        <Thumb src={video.thumbnail} alt="" className="aspect-video w-full" />
        <span
          className="pill absolute bottom-2 left-2"
          style={{ background: "rgba(0,0,0,.65)", color: "#fff6e9", borderColor: "transparent" }}
        >
          {views(video.views)} views
        </span>
      </a>
      <div className="flex flex-1 flex-col gap-1 p-[var(--space-3)]">
        <h3 className="clamp-two text-base font-semibold">
          <a href={video.url} target="_blank" rel="noopener noreferrer" className="hover:text-[color:var(--site-accent-text)]">
            {video.title}
          </a>
        </h3>
        <p className="mt-auto text-xs text-muted-foreground">
          {video.channelName} · {timeAgo(video.publishedAt)} · {views(speed)} views/day
        </p>
      </div>
    </article>
  );
}

export function SkeletonRows({ rows = 4, height = 96 }: { rows?: number; height?: number }) {
  return (
    <div className="flex flex-col gap-[var(--space-2)]" aria-busy>
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="w-full rounded-lg" style={{ height }} />
      ))}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <p className="plate px-[var(--space-3)] py-[var(--space-4)] text-center text-sm text-muted-foreground">
      <span className="block font-display text-lg text-foreground/90">{title}</span>
      {hint}
    </p>
  );
}

export function SourceGrid({ sources }: { sources: Source[] }) {
  const failed = sources.filter((source) => source.status === "error");
  return (
    <div className="flex flex-wrap gap-[var(--space-1)]">
      {sources.map((source) => (
        <span
          key={source.name}
          className="pill"
          title={`${source.count} items in the last 21 days · ${source.region}`}
          style={{ opacity: source.status === "ok" ? 1 : 0.55, borderColor: source.status === "ok" ? "var(--hairline)" : "var(--hotline)" }}
        >
          {source.name}
          <span className="text-muted-foreground">{source.count}</span>
        </span>
      ))}
      {failed.length ? (
        <p className="mt-2 w-full text-xs text-muted-foreground">
          {failed.map((source) => source.name).join(", ")} did not answer this pass; their slots stay filled by the desk snapshot.
        </p>
      ) : null}
    </div>
  );
}
