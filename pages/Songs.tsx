import { useMemo, useState } from "react";
import { EmptyState, FilterChips, SearchField, SkeletonRows, StatTile, VideoCard, VideoRow } from "@/components/bits";
import { PageHeader } from "@/components/shell";
import { loadYouTube } from "@/lib/api";
import { useResource } from "@/lib/hooks";
import { ageHours, perDay, timeAgo, views } from "@/lib/format";
import type { Video } from "@/lib/types";

const MODES = [
  { id: "rising", label: "Fastest rising" },
  { id: "views", label: "Most viewed" },
  { id: "fresh", label: "Newest uploads" },
];

export default function Songs() {
  const [mode, setMode] = useState("rising");
  const [channel, setChannel] = useState("all");
  const [query, setQuery] = useState("");
  const { data, loading, refresh } = useResource("yt:songs", () => loadYouTube("songs"));

  const songs = data?.videos ?? [];
  const channels = data?.channels ?? [];

  const pool = useMemo(
    () =>
      songs.filter(
        (video) =>
          (channel === "all" || video.channelName === channel) &&
          (!query.trim() || video.title.toLowerCase().includes(query.trim().toLowerCase())),
      ),
    [songs, channel, query],
  );

  const ranked = useMemo(() => {
    const copy = [...pool];
    if (mode === "views") return copy.sort((a, b) => b.views - a.views);
    if (mode === "fresh") return copy.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
    return copy.sort((a, b) => perDay(b.publishedAt, b.views) - perDay(a.publishedAt, a.views));
  }, [pool, mode]);

  const maxViews = Math.max(1, ...ranked.map((video) => video.views));
  const top = ranked.slice(0, 3);
  const rest = ranked.slice(3, 24);
  const leader: Video | undefined = ranked[0];

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <PageHeader
        kicker="viral songs board"
        title="What the music channels are pushing today"
        blurb="Recent uploads from five music labels, ranked by the numbers YouTube publishes on each channel feed. Velocity divides views by the age of the upload in days, so a four-hour-old single competes with a four-week-old blockbuster."
        meta={data?.meta}
        onRefresh={refresh}
      />

      <div className="grid gap-[var(--space-2)] sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="uploads tracked" value={String(songs.length)} hint="last 15 per channel" />
        <StatTile label="views in the set" value={views(songs.reduce((sum, video) => sum + video.views, 0))} hint="summed across labels" />
        <StatTile
          label="fastest riser"
          value={leader ? `${views(perDay(leader.publishedAt, leader.views))}/day` : "—"}
          hint={leader?.title.slice(0, 38) ?? "no data"}
        />
        <StatTile label="under 24h old" value={String(songs.filter((video) => ageHours(video.publishedAt) < 24).length)} hint="released since yesterday" />
      </div>

      <div className="flex flex-wrap items-center gap-[var(--space-2)]">
        <FilterChips options={MODES} value={mode} onChange={setMode} />
        <FilterChips
          options={[{ id: "all", label: "All labels" }, ...channels.map((row) => ({ id: row.name, label: row.name }))]}
          value={channel}
          onChange={setChannel}
        />
        <SearchField value={query} onChange={setQuery} placeholder="Search song titles" />
      </div>

      {loading && !data ? (
        <SkeletonRows rows={5} height={120} />
      ) : ranked.length ? (
        <>
          <div className="grid gap-[var(--space-3)] sm:grid-cols-2 lg:grid-cols-3">
            {top.map((video, index) => (
              <div key={video.id} className="flex flex-col gap-2">
                <p className="kicker flex items-center justify-between">
                  <span>{MODES.find((option) => option.id === mode)?.label}</span>
                  <span className="text-[color:var(--site-accent-text)]">#{index + 1}</span>
                </p>
                <VideoCard video={video} />
                <p className="text-xs text-muted-foreground">
                  {views(video.views)} views · {views(perDay(video.publishedAt, video.views))}/day · {timeAgo(video.publishedAt)} · {video.channelName}
                </p>
              </div>
            ))}
          </div>

          <section className="plate p-[var(--space-3)]">
            <p className="kicker mb-2">the rest of the board</p>
            <ol className="flex flex-col">
              {rest.map((video, index) => (
                <VideoRow key={video.id} video={video} rank={index + 4} maxViews={maxViews} />
              ))}
            </ol>
          </section>
        </>
      ) : (
        <EmptyState title="No uploads match that combination" hint="Reset the label filter or the search to see the whole board." />
      )}
    </div>
  );
}
