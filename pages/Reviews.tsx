import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, FilterChips, ScoreDial, SearchField, SkeletonRows, StoryRow } from "@/components/bits";
import { PageHeader } from "@/components/shell";
import { loadWire } from "@/lib/api";
import { useResource } from "@/lib/hooks";
import { industryLabel, timeAgo } from "@/lib/format";
import { INDUSTRIES, INDUSTRY_LABEL, type IndustryFilter } from "@/pages/filters";

export default function Reviews() {
  const [industry, setIndustry] = useState<IndustryFilter>("all");
  const [tab, setTab] = useState("verdicts");
  const [query, setQuery] = useState("");
  const { data, loading, refresh } = useResource("wire:reviews", () => loadWire("reviews"));

  const rows = useMemo(() => {
    const all = (data?.items ?? []).filter((item) => industry === "all" || item.industry === industry);
    const needle = query.trim().toLowerCase();
    const pool = needle ? all.filter((item) => `${item.title} ${item.film} ${item.summary}`.toLowerCase().includes(needle)) : all;
    return tab === "verdicts" ? pool.filter((item) => item.isReview) : pool.filter((item) => !item.isReview);
  }, [data, industry, tab, query]);

  const scored = (data?.items ?? []).filter((item) => (item.score ?? 0) > 0);
  const average = scored.length ? scored.reduce((sum, item) => sum + (item.score ?? 0), 0) / scored.length : 0;

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <PageHeader
        kicker="review wire"
        title="Verdicts as the desks file them"
        blurb="Every review the wires publish inside the three-week window, with the film name, the publisher's own number when they print one, and a link to the full piece. Takeok does not re-rate anything."
        meta={data?.meta}
        onRefresh={refresh}
      />

      <div className="grid gap-[var(--space-2)] sm:grid-cols-3">
        <div className="plate px-[var(--space-3)] py-[var(--space-2)]">
          <p className="kicker">reviews in the window</p>
          <p className="font-display text-3xl text-[color:var(--site-accent)]">{(data?.items ?? []).filter((item) => item.isReview).length}</p>
        </div>
        <div className="plate px-[var(--space-3)] py-[var(--space-2)]">
          <p className="kicker">numbers the publishers filed</p>
          <p className="font-display text-3xl text-[color:var(--site-accent)]">{scored.length}</p>
        </div>
        <div className="plate px-[var(--space-3)] py-[var(--space-2)]">
          <p className="kicker">average of filed numbers</p>
          <p className="font-display text-3xl text-[color:var(--site-accent)]">{average ? `${average.toFixed(1)}/5` : "—"}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-[var(--space-2)]">
        <FilterChips options={INDUSTRIES.map((id) => ({ id, label: INDUSTRY_LABEL[id] }))} value={industry} onChange={(id) => setIndustry(id as IndustryFilter)} />
        <SearchField value={query} onChange={setQuery} placeholder="Search films" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList variant="line" className="border-b border-hairline">
          <TabsTrigger value="verdicts">Verdicts</TabsTrigger>
          <TabsTrigger value="trade">Box office &amp; trade</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading && !data ? (
        <SkeletonRows rows={5} height={120} />
      ) : rows.length ? (
        <div className="grid gap-[var(--space-3)] lg:grid-cols-2">
          {rows.map((item) => (
            <article key={item.id} className="plate plate-hover flex flex-col gap-[var(--space-2)] p-[var(--space-3)]">
              <div className="flex items-start justify-between gap-[var(--space-2)]">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">
                    {item.source} · {timeAgo(item.publishedAt)} · <span className="uppercase">{industryLabel(item.industry)}</span>
                  </p>
                  <h2 className="truncate text-xl font-semibold">{item.film || item.title}</h2>
                </div>
                {tab === "verdicts" ? <ScoreDial score={item.score ?? 0} /> : null}
              </div>
              {item.summary ? <p className="clamp-two text-sm text-muted-foreground">{item.summary}</p> : null}
              <p className="text-xs text-muted-foreground">
                {item.title}
                {item.isReview ? " · review" : " · trade story"}
              </p>
              <div className="mt-auto flex items-center justify-between gap-2">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill"
                  style={{ background: "var(--site-accent)", color: "var(--site-on-accent)", borderColor: "var(--site-accent)" }}
                >
                  Read the full review
                </a>
                <span className="text-xs text-muted-foreground">{item.region}</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title={tab === "verdicts" ? "No verdicts filed on this desk today" : "No trade stories in this window"}
          hint="Try another desk, or clear the search. The wire only holds the last three weeks."
        />
      )}

      <div className="plate p-[var(--space-3)]">
        <p className="kicker mb-2">how the number is read</p>
        <p className="text-sm text-muted-foreground">
          Scores are parsed straight out of the publisher's headline or summary — "3/5", "2.75/5", "rating 2", "grade: B+" — and
          normalised to five. Out of ten is halved, a letter grade maps to its own step. If a review publishes no number the dial shows
          a dash rather than an invented average, and most desks now write their verdict in prose, so a dash is the normal state of the
          wire rather than a gap in it.
        </p>
        <div className="mt-[var(--space-3)] border-t border-hairline pt-[var(--space-2)]">
          <p className="kicker mb-2">latest from the same wires</p>
          {(data?.items ?? []).slice(0, 3).map((item) => (
            <div key={item.id} className="py-1">
              <StoryRow item={item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
