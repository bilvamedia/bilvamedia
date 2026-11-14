import { useMemo, useState } from "react";
import { EmptyState, FilterChips, SearchField, SkeletonRows, StatTile, VideoCard, VideoRow } from "@/components/bits";
import { PageHeader } from "@/components/shell";
import { loadYouTube } from "@/lib/api";
import { useResource } from "@/lib/hooks";
import { ageHours, perDay, views } from "@/lib/format";

export default function Shorts() {
  const [region, setRegion] = useState("all");
  const [query, setQuery] = useState("");
  const { data, loading, refresh } = useResource("yt:shorts", () => loadYouTube("shorts"));

  const videos = data?.videos ?? [];
  const regions = useMemo(() => [...new Set(videos.map((video) => video.region))].filter(Boolean), [videos]);

  const pool = useMemo(
    () =>
      videos.filter(
        (video) =>
          (region === "all" || video.region === region) &&
          (!query.trim() || `${video.title} ${video.channelName}`.toLowerCase().includes(query.trim().toLowerCase())),
      ),
    [videos, region, query],
  );

  const ranked = useMemo(() => [...pool].sort((a, b) => b.views - a.views), [pool]);
  const maxViews = Math.max(1, ...ranked.map((video) => video.views));

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <PageHeader
        kicker="short films"
        title="The shorts shelf, sorted by who actually watched"
        blurb="Five channels that publish short work — festival curation, Indian sketch studios and the Telugu indie shelf. YouTube's public feed gives us views and upload time but no runtime, so the board ranks on audience rather than length."
        meta={data?.meta}
        onRefresh={refresh}
      />

      <div className="grid gap-[var(--space-2)] sm:grid-cols-3">
        <StatTile label="shorts tracked" value={String(videos.length)} hint="latest uploads per channel" />
        <StatTile label="views across the shelf" value={views(videos.reduce((sum, video) => sum + video.views, 0))} hint="summed" />
        <StatTile
          label="posted today"
          value={String(videos.filter((video) => ageHours(video.publishedAt) < 24).length)}
          hint="within the last 24 hours"
        />
      </div>

      <div className="flex flex-wrap items-center gap-[var(--space-2)]">
        <FilterChips options={[{ id: "all", label: "All origins" }, ...regions.map((name) => ({ id: name, label: name }))]} value={region} onChange={setRegion} />
        <SearchField value={query} onChange={setQuery} placeholder="Search shorts" />
      </div>

      {loading && !data ? (
        <SkeletonRows rows={5} height={140} />
      ) : ranked.length ? (
        <>
          <div className="grid gap-[var(--space-3)] sm:grid-cols-2 lg:grid-cols-4">
            {ranked.slice(0, 4).map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
          <section className="plate p-[var(--space-3)]">
            <p className="kicker mb-2">full shelf</p>
            <ol className="flex flex-col">
              {ranked.slice(4, 26).map((video, index) => (
                <VideoRow key={video.id} video={video} rank={index + 5} maxViews={maxViews} />
              ))}
            </ol>
          </section>
        </>
      ) : (
        <EmptyState title="Nothing on this shelf for that filter" hint="Try all origins, or clear the search." />
      )}
    </div>
  );
}
