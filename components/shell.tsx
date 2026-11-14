import type { ReactNode } from "react";
import { Link } from "@/lib/router";
import { LiveBadge, Kicker } from "@/components/bits";
import { ALL_NEWS_SOURCES } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import type { Meta, Story } from "@/lib/types";

export const NAV = [
  { to: "/", label: "Marquee" },
  { to: "/news", label: "News" },
  { to: "/reviews", label: "Reviews" },
  { to: "/ott", label: "OTT" },
  { to: "/songs", label: "Viral songs" },
  { to: "/shorts", label: "Short films" },
  { to: "/youtube", label: "YouTube stats" },
  { to: "/collections", label: "Collections" },
];

export function Ticker({ items }: { items: Story[] }) {
  const strip = items.slice(0, 14);
  if (!strip.length) return null;
  const doubled = [...strip, ...strip];
  return (
    <div className="border-y border-hairline bg-plate/70" role="region" aria-label="Latest headlines">
      <div className="marquee flex items-stretch">
        <span
          className="pill z-10 my-2 ml-[var(--space-2)] shrink-0"
          style={{ background: "var(--site-accent)", color: "var(--site-on-accent)", borderColor: "var(--site-accent)" }}
        >
          now playing
        </span>
        <div className="marquee-track items-center py-[var(--space-2)]">
          {doubled.map((item, index) => (
            <a
              key={`${item.id}-${index}`}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-[var(--space-3)] text-sm whitespace-nowrap hover:text-[color:var(--site-accent-text)]"
              aria-hidden={index >= strip.length}
            >
              <span className="font-display text-xs tracking-[0.12em] text-[color:var(--site-accent-text)] uppercase">
                {item.source}
              </span>
              <span className="text-foreground/90">{item.title}</span>
              <span className="text-xs text-muted-foreground">{timeAgo(item.publishedAt)}</span>
              <span className="text-muted-foreground" aria-hidden>
                /
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SiteHeader({ route }: { route: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-hairline backdrop-blur-md" style={{ background: "color-mix(in srgb, var(--site-bg) 88%, transparent)" }}>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-[var(--space-4)] gap-y-2 px-[var(--space-3)] py-[var(--space-2)] sm:px-[var(--space-4)]">
        <Link to="/" className="flex items-center gap-[var(--space-2)]">
          <img src="/mark.svg" alt="" className="h-10 w-10 shrink-0 sm:h-12 sm:w-12" />
          <span className="flex items-baseline gap-2">
            <span className="font-display text-2xl leading-none tracking-[0.02em] sm:text-3xl">TAKEOK</span>
            <span className="hidden text-xs tracking-[0.28em] text-[color:var(--site-accent-text)] uppercase sm:inline">
              entertainments
            </span>
          </span>
        </Link>
        <nav aria-label="Sections" className="scrollbar-none order-3 -mx-1 w-full overflow-x-auto px-1 lg:order-2 lg:w-auto lg:flex-1 lg:justify-end">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => {
              const active = item.to === route;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={`pill ${active ? "" : "opacity-75 hover:opacity-100"}`}
                    {...(active ? { "aria-current": "page" as const } : {})}
                    style={active ? { background: "var(--site-surface)", borderColor: "var(--site-accent)" } : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export function PageHeader({
  kicker,
  title,
  blurb,
  meta,
  onRefresh,
  children,
}: {
  kicker: string;
  title: string;
  blurb: string;
  meta?: Meta;
  onRefresh?: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-[var(--space-3)] border-b border-hairline pb-[var(--space-3)]">
      <div className="flex flex-wrap items-end justify-between gap-[var(--space-3)]">
        <div className="max-w-3xl">
          <Kicker>{kicker}</Kicker>
          <h1 className="mt-1 text-3xl font-bold sm:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">{blurb}</p>
        </div>
        {meta ? <LiveBadge meta={meta} onRefresh={onRefresh} /> : null}
      </div>
      {children}
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-[var(--space-6)] border-t border-hairline bg-plate/50">
      <div className="mx-auto grid max-w-7xl gap-[var(--space-4)] px-[var(--space-3)] py-[var(--space-5)] sm:px-[var(--space-4)] lg:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-[var(--space-3)]">
            <img src="/mark.svg" alt="" className="h-12 w-12 shrink-0" />
            <p className="font-display text-2xl">TAKEOK ENTERTAINMENTS</p>
          </div>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            A single marquee for film news, review verdicts, OTT movement, viral songs, short films and the YouTube numbers
            behind them. Headlines are pulled from public feeds and always link back to the publisher that wrote them.
          </p>
        </div>
        <div>
          <Kicker>Sections</Kicker>
          <ul className="mt-2 grid grid-cols-2 gap-1 text-sm">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="text-muted-foreground hover:text-[color:var(--site-accent-text)]">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <Kicker>Wires read by the desk</Kicker>
          <p className="mt-2 text-sm text-muted-foreground">{ALL_NEWS_SOURCES.map((source) => source.name).join(" · ")}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            Review, OTT and collection copy is Takeok's own editorial. Curated lists live in{" "}
            <code className="text-foreground/80">src/data/collections.ts</code>.
          </p>
        </div>
      </div>
      <div className="border-t border-hairline px-[var(--space-3)] py-[var(--space-2)] text-xs text-muted-foreground sm:px-[var(--space-4)]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <span>© 2026 Takeok Entertainments · a Bilva Media property, Hyderabad</span>
          <span>Figures are live counts from public channel feeds, not YouTube Analytics.</span>
        </div>
      </div>
    </footer>
  );
}
