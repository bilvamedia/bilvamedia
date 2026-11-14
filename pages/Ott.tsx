import { useMemo, useState } from "react";
import { EmptyState, FilterChips, SearchField, SkeletonRows, StoryRow } from "@/components/bits";
import { PageHeader } from "@/components/shell";
import { loadWire } from "@/lib/api";
import { useResource } from "@/lib/hooks";
import { INDUSTRIES, INDUSTRY_LABEL, type IndustryFilter } from "@/pages/filters";

export default function Ott() {
  const [platform, setPlatform] = useState("all");
  const [industry, setIndustry] = useState<IndustryFilter>("all");
  const [query, setQuery] = useState("");
  const { data, loading, refresh } = useResource("wire:ott", () => loadWire("ott"));

  const items = data?.items ?? [];
  const platforms = useMemo(() => {
    const tally = new Map<string, number>();
    for (const item of items) {
      const key = item.platform && item.platform !== "Unlisted" ? String(item.platform) : "Unlisted";
      tally.set(key, (tally.get(key) ?? 0) + 1);
    }
    return [...tally.entries()].sort((a, b) => b[1] - a[1]);
  }, [items]);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter(
      (item) =>
        (platform === "all" || String(item.platform) === platform) &&
        (industry === "all" || item.industry === industry) &&
        (!needle || `${item.title} ${item.summary} ${item.source}`.toLowerCase().includes(needle)),
    );
  }, [items, platform, industry, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof rows>();
    for (const item of rows) {
      const key = item.platform && item.platform !== "Unlisted" ? String(item.platform) : "Mentioned, platform unconfirmed";
      map.set(key, [...(map.get(key) ?? []), item]);
    }
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [rows]);

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <PageHeader
        kicker="ott desk"
        title="What's moving to a screen near you"
        blurb="The wire is scanned for release language — “OTT”, “now streaming”, a named platform — and each hit is filed under the service it mentions. It is a movement board, not a catalogue, so the links go to the article that broke it."
        meta={data?.meta}
        onRefresh={refresh}
      />

      <div className="flex flex-wrap items-center gap-[var(--space-2)]">
        <FilterChips options={[{ id: "all", label: "All platforms" }, ...platforms.map(([name]) => ({ id: name, label: name }))]} value={platform} onChange={setPlatform} />
        <FilterChips options={INDUSTRIES.map((id) => ({ id, label: INDUSTRY_LABEL[id] }))} value={industry} onChange={(id) => setIndustry(id as IndustryFilter)} />
        <SearchField value={query} onChange={setQuery} placeholder="Search releases" />
      </div>

      {loading && !data ? (
        <SkeletonRows rows={6} height={96} />
      ) : grouped.length ? (
        <div className="grid gap-[var(--space-3)] lg:grid-cols-2">
          {grouped.map(([name, list]) => (
            <section key={name} className="plate">
              <header className="flex items-center justify-between gap-2 border-b border-hairline px-[var(--space-3)] py-[var(--space-2)]">
                <h2 className="font-display text-lg tracking-[0.06em] uppercase">{name}</h2>
                <span className="pill">{list.length} stories</span>
              </header>
              <div className="flex flex-col gap-[var(--space-2)] p-[var(--space-3)]">
                {list.map((item) => (
                  <div key={item.id}>
                    <StoryRow item={item} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState title="No platform movement in this filter" hint="Drop back to all platforms — the scanner only keeps the last three weeks of wire copy." />
      )}

      <div className="plate p-[var(--space-3)]">
        <p className="kicker mb-[var(--space-2)]">platform tally this pass</p>
        <ul className="flex flex-wrap gap-[var(--space-2)]">
          {platforms.map(([name, count]) => (
            <li key={name}>
              <button type="button" onClick={() => setPlatform(name)} className="pill hover:border-[color:var(--site-accent)]">
                {name}
                <span className="text-[color:var(--site-accent-text)]">{count}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
