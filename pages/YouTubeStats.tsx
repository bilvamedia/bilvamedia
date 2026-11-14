import { useMemo, useState } from "react";
import { EmptyState, FilterChips, SearchField, SkeletonRows, StatTile, VideoRow } from "@/components/bits";
import { PageHeader } from "@/components/shell";
import { loadYouTube } from "@/lib/api";
import { useResource } from "@/lib/hooks";
import { perDay, timeAgo, views } from "@/lib/format";
import type { Channel } from "@/lib/types";

const KINDS = [
  { id: "all", label: "Every channel" },
  { id: "songs", label: "Music labels" },
  { id: "shorts", label: "Short films" },
  { id: "reviews", label: "Review desks" },
];

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

export default function YouTubeStats() {
  const [kind, setKind] = useState("all");
  const [query, setQuery] = useState("");
  const { data, loading, refresh } = useResource("yt:all", () => loadYouTube("all"));

  const channels = data?.channels ?? [];
  const videos = data?.videos ?? [];

  const shown = useMemo(
    () =>
      channels.filter(
        (channel) => (kind === "all" || channel.kind === kind) && (!query.trim() || channel.name.toLowerCase().includes(query.trim().toLowerCase())),
      ),
    [channels, kind, query],
  );

  const perChannel = useMemo(() => {
    const map = new Map<string, { total: number; median: number; speed: number }>();
    for (const channel of channels) {
      const rows = videos.filter((video) => video.channelName === channel.name);
      const values = rows.map((video) => video.views);
      map.set(channel.name, {
        total: values.reduce((sum, value) => sum + value, 0),
        median: median(values),
        speed: Math.round(rows.reduce((sum, video) => sum + perDay(video.publishedAt, video.views), 0) / Math.max(1, rows.length)),
      });
    }
    return map;
  }, [channels, videos]);

  const movers = useMemo(
    () =>
      [...videos]
        .filter((video) => kind === "all" || video.kind === kind)
        .sort((a, b) => perDay(b.publishedAt, b.views) - perDay(a.publishedAt, a.views))
        .slice(0, 12),
    [videos, kind],
  );

  const maxMover = Math.max(1, ...movers.map((video) => video.views));
  const biggest = [...channels].sort((a, b) => b.views - a.views)[0] as Channel | undefined;

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <PageHeader
        kicker="youtube stats"
        title="The numbers behind the noise"
        blurb="Views here are the counts each channel publishes on its own public feed, read at the moment of the pass. It is a snapshot board, not Analytics: no subscriber totals, no watch time, no revenue."
        meta={data?.meta}
        onRefresh={refresh}
      />

      <div className="grid gap-[var(--space-2)] sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="channels read" value={`${channels.length}`} hint="music, shorts and review desks" />
        <StatTile label="uploads in the set" value={String(videos.length)} hint="roughly 15 per channel" />
        <StatTile label="summed views" value={views(channels.reduce((sum, channel) => sum + channel.views, 0))} hint="across the last uploads" />
        <StatTile label="loudest channel" value={biggest ? views(biggest.views) : "—"} hint={biggest?.name ?? "waiting"} />
      </div>

      <div className="flex flex-wrap items-center gap-[var(--space-2)]">
        <FilterChips options={KINDS} value={kind} onChange={setKind} />
        <SearchField value={query} onChange={setQuery} placeholder="Find a channel" />
      </div>

      {loading && !data ? (
        <SkeletonRows rows={6} height={72} />
      ) : shown.length ? (
        <section className="plate overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-hairline text-xs text-muted-foreground uppercase">
              <tr>
                <th scope="col" className="px-[var(--space-3)] py-2 font-normal">Channel</th>
                <th scope="col" className="px-2 py-2 font-normal">Desk</th>
                <th scope="col" className="px-2 py-2 text-right font-normal">Uploads</th>
                <th scope="col" className="px-2 py-2 text-right font-normal">Views</th>
                <th scope="col" className="px-2 py-2 text-right font-normal">Median</th>
                <th scope="col" className="px-2 py-2 text-right font-normal">Views/day</th>
                <th scope="col" className="px-[var(--space-3)] py-2 text-right font-normal">Last upload</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((channel) => {
                const stats = perChannel.get(channel.name) ?? { total: 0, median: 0, speed: 0 };
                return (
                  <tr key={channel.id} className="border-b border-hairline last:border-0 hover:bg-plate/70">
                    <th scope="row" className="px-[var(--space-3)] py-[var(--space-2)] text-left font-semibold">
                      <a
                        href={`https://www.youtube.com/channel/${channel.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[color:var(--site-accent-text)]"
                      >
                        {channel.name}
                      </a>
                      <span className="block text-xs font-normal text-muted-foreground">{channel.region}</span>
                    </th>
                    <td className="px-2 py-[var(--space-2)] text-muted-foreground">
                      {channel.kind === "songs" ? "music" : channel.kind === "shorts" ? "shorts" : "reviews"}
                    </td>
                    <td className="px-2 py-[var(--space-2)] text-right">{channel.videoCount}</td>
                    <td className="px-2 py-[var(--space-2)] text-right font-display text-[color:var(--site-accent-text)]">{views(channel.views)}</td>
                    <td className="px-2 py-[var(--space-2)] text-right text-muted-foreground">{views(stats.median)}</td>
                    <td className="px-2 py-[var(--space-2)] text-right">{views(stats.speed)}</td>
                    <td className="px-[var(--space-3)] py-[var(--space-2)] text-right text-muted-foreground">
                      {channel.latestAt ? timeAgo(channel.latestAt) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ) : (
        <EmptyState title="No channel matches" hint="Clear the search or switch back to every channel." />
      )}

      <section className="plate p-[var(--space-3)]">
        <p className="kicker mb-2">fastest movers in this set</p>
        <ol className="flex flex-col">
          {movers.map((video, index) => (
            <VideoRow key={video.id} video={video} rank={index + 1} maxViews={maxMover} />
          ))}
        </ol>
      </section>

      <div className="plate p-[var(--space-3)] text-sm text-muted-foreground">
        <p className="kicker mb-2">what this board can and cannot tell you</p>
        <ul className="grid gap-1 lg:grid-cols-2">
          <li>Views are the number stamped on the video at fetch time, so the same upload reads higher on every pass.</li>
          <li>The feed only carries the most recent uploads per channel — roughly fifteen — not the full catalogue.</li>
          <li>Subscriber counts, watch hours and revenue are not public data and are never estimated here.</li>
          <li>Views per day divides the count by the age of the upload, which flatters anything posted this morning.</li>
        </ul>
      </div>
    </div>
  );
}
