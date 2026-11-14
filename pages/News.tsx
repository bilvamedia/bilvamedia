import { useMemo, useState } from "react";
import { EmptyState, FilterChips, SearchField, SkeletonRows, SourceGrid, StoryCard, StoryRow } from "@/components/bits";
import { PageHeader } from "@/components/shell";
import { loadNews } from "@/lib/api";
import { useResource } from "@/lib/hooks";
import type { IndustryFilter } from "@/pages/filters";
import { INDUSTRIES, INDUSTRY_LABEL } from "@/pages/filters";

export default function News({ industry: initial }: { industry: string }) {
  const [industry, setIndustry] = useState<string>(initial || "all");
  const [query, setQuery] = useState("");
  const [layout, setLayout] = useState<"list" | "grid">("list");
  const { data, loading, refresh } = useResource(`news:${industry}`, () => loadNews(industry as IndustryFilter));

  const items = useMemo(() => {
    const rows = data?.items ?? [];
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((item) => `${item.title} ${item.summary} ${item.source} ${item.industry}`.toLowerCase().includes(needle));
  }, [data, query]);

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <PageHeader
        kicker="news desk"
        title="Global entertainment wire"
        blurb="Twelve public feeds from the Telugu, Bollywood, Hollywood, Korean and anime desks, deduped and newest-first. Election and party-politics copy is filtered out — this board is entertainment only. Every headline opens the publisher's own page."
        meta={data?.meta}
        onRefresh={refresh}
      />

      <div className="flex flex-wrap items-center justify-between gap-[var(--space-2)]">
        <FilterChips
          options={INDUSTRIES.map((id) => ({ id, label: INDUSTRY_LABEL[id] }))}
          value={industry}
          onChange={setIndustry}
        />
        <div className="flex items-center gap-[var(--space-2)]">
          <SearchField value={query} onChange={setQuery} placeholder="Filter headlines" />
          <button type="button" onClick={() => setLayout(layout === "list" ? "grid" : "list")} className="pill">
            {layout === "list" ? "cards" : "list"}
          </button>
        </div>
      </div>

      {loading && !data ? (
        <SkeletonRows rows={6} height={110} />
      ) : items.length ? (
        <div className={layout === "grid" ? "grid gap-[var(--space-3)] sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-[var(--space-3)]"}>
          {layout === "grid"
            ? items.slice(0, 24).map((item) => <StoryCard key={item.id} item={item} />)
            : (
                <div className="plate divide-y divide-[color:var(--hairline)] p-[var(--space-3)]">
                  {items.slice(0, 40).map((item) => (
                    <div key={item.id} className="py-[var(--space-2)] first:pt-0 last:pb-0">
                      <StoryRow item={item} />
                    </div>
                  ))}
                </div>
              )}
        </div>
      ) : (
        <EmptyState title={`Nothing matches “${query}”`} hint="Clear the filter or switch desk — the wires only hold the last three weeks." />
      )}

      <div className="plate p-[var(--space-3)]">
        <p className="kicker mb-[var(--space-2)]">feed status</p>
        {data?.sources ? <SourceGrid sources={data.sources} /> : <p className="text-sm text-muted-foreground">Reading the wires…</p>}
      </div>
    </div>
  );
}
