import { Panel, StoryCard, StoryRow, VideoCard, VideoRow, ScoreDial, StatTile, Kicker, EmptyState, SkeletonRows } from "@/components/bits";
import { PageHeader } from "@/components/shell";
import { COLLECTIONS } from "@/data/collections";
import { loadNews, loadWire, loadYouTube } from "@/lib/api";
import { ageHours, industryLabel, perDay, timeAgo, views } from "@/lib/format";
import { useResource } from "@/lib/hooks";
import { Link } from "@/lib/router";
import type { NewsResult, Video } from "@/lib/types";

type Props = { refreshSignal: number };

const bySpeed = (a: Video, b: Video) => perDay(b.publishedAt, b.views) - perDay(a.publishedAt, a.views);
const byViews = (a: Video, b: Video) => b.views - a.views;

function SeeMore({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="pill hover:border-[color:var(--site-accent)]">
      {label}
    </Link>
  );
}

export default function Home({ refreshSignal }: Props) {
  const news = useResource(`news:all:${refreshSignal}`, () => loadNews("all"));
  const ott = useResource(`ott:${refreshSignal}`, () => loadWire("ott"));
  const reviews = useResource(`reviews:${refreshSignal}`, () => loadWire("reviews"));
  const youtube = useResource(`yt:all:${refreshSignal}`, () => loadYouTube("all"));

  const stories = news.data?.items ?? [];
  const lead = stories[0];
  const secondary = stories.slice(1, 4);
  const fresh = stories.filter((item) => ageHours(item.publishedAt) < 30);

  const songs = (youtube.data?.videos ?? []).filter((video) => video.kind === "songs");
  const shorts = (youtube.data?.videos ?? []).filter((video) => video.kind === "shorts");
  const rising = [...songs].sort(bySpeed).slice(0, 6);
  const maxSongViews = Math.max(1, ...songs.map((video) => video.views));

  const verdicts = (reviews.data?.items ?? []).filter((item) => item.isReview).slice(0, 3);
  const platformRows = (ott.data?.items ?? []).slice(0, 5);
  const channels = youtube.data?.channels ?? [];
  const maxChannelViews = Math.max(1, ...channels.map((channel) => channel.views));
  const totalViews = channels.reduce((sum, channel) => sum + channel.views, 0);

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <PageHeader
        kicker={`the marquee · ${new Date().toLocaleDateString("en", { weekday: "long", day: "numeric", month: "long" })}`}
        title="Everything moving in film, on one board"
        blurb="Twelve news wires, thirteen YouTube channels and the Takeok desk, read once and laid out like a reopening night: what's lead, what's selling, and what's climbing."
        meta={news.data?.meta}
        onRefresh={news.refresh}
      />

      <section className="grid gap-[var(--space-3)] lg:grid-cols-[1.55fr_1fr]">
        <div className="flex flex-col gap-[var(--space-3)]">
          {news.loading && !news.data ? (
            <SkeletonRows rows={2} height={220} />
          ) : lead ? (
            <StoryLead item={lead} />
          ) : (
            <EmptyState title="Waiting on the wires" hint="The first pass usually lands in a few seconds." />
          )}
          <div className="plate divide-y divide-[color:var(--hairline)] p-[var(--space-3)]">
            <div className="pb-[var(--space-2)]">
              <Kicker>also on the board</Kicker>
            </div>
            {secondary.map((item) => (
              <div key={item.id} className="pt-[var(--space-2)] last:pb-0">
                <StoryRow item={item} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-[var(--space-3)]">
          <div className="grid grid-cols-2 gap-[var(--space-2)]">
            <StatTile
              label="wire status"
              value={`${news.data?.meta.liveSources ?? 0}/${news.data?.meta.totalSources ?? 12}`}
              hint={news.data?.meta.snapshot ? "served from the desk snapshot" : "feeds answering right now"}
            />
            <StatTile label="last 30 hours" value={String(fresh.length)} hint="stories pulled across every desk" />
            <StatTile label="tracked views" value={views(totalViews)} hint="sum of the last uploads per channel" />
            <StatTile
              label="fastest song"
              value={rising[0] ? `${views(perDay(rising[0].publishedAt, rising[0].views))}/d` : "—"}
              hint={rising[0]?.channelName ?? "no ranking yet"}
            />
          </div>
          <Panel title="Review wire" kicker="verdicts filed today" action={<SeeMore to="/reviews" label="all reviews" />}>
            {verdicts.length ? (
              <ul className="flex flex-col gap-[var(--space-3)]">
                {verdicts.map((item) => (
                  <li key={item.id} className="border-b border-hairline pb-[var(--space-2)] last:border-0">
                    <p className="text-xs text-muted-foreground">
                      {item.source} · {timeAgo(item.publishedAt)}
                    </p>
                    <p className="text-base font-semibold">{item.film || item.title}</p>
                    <div className="mt-2">
                      <ScoreDial score={item.score ?? 0} />
                    </div>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-2 block text-sm text-[color:var(--site-accent-text)]">
                      Read the review
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No verdicts yet" hint="Review wires update when the desks publish." />
            )}
          </Panel>
        </div>
      </section>

      <section className="grid gap-[var(--space-3)] lg:grid-cols-2">
        <Panel title="Viral songs, right now" kicker="ranked by views per day" action={<SeeMore to="/songs" label="full board" />}>
          <ol className="flex flex-col">
            {rising.map((video, index) => (
              <VideoRow key={video.id} video={video} rank={index + 1} maxViews={maxSongViews} />
            ))}
          </ol>
        </Panel>

        <Panel title="On the platforms" kicker="OTT movement" action={<SeeMore to="/ott" label="all releases" />}>
          <ul className="flex flex-col gap-[var(--space-2)]">
            {platformRows.map((item) => (
              <li key={item.id} className="rule-accent bg-plate/60 rounded-[var(--radius)] p-[var(--space-2)]">
                <p className="text-xs tracking-[0.08em] text-[color:var(--site-accent-text)] uppercase">
                  {(item.platform ?? "Unlisted").toString()} · {item.source}
                </p>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="clamp-two block text-base font-semibold hover:text-[color:var(--site-accent-text)]">
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </Panel>
      </section>

      <section className="grid gap-[var(--space-3)] lg:grid-cols-[1fr_1.4fr]">
        <Panel title="YouTube movers" kicker="last uploads, summed" action={<SeeMore to="/youtube" label="stats board" />}>
          <ul className="flex flex-col gap-[var(--space-2)]">
            {channels.slice(0, 6).map((channel) => (
              <li key={channel.id}>
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="truncate font-semibold">{channel.name}</span>
                  <span className="font-display shrink-0 text-[color:var(--site-accent-text)]">{views(channel.views)}</span>
                </div>
                <p className="mt-0.5 mb-1 text-xs text-muted-foreground">
                  {channel.kind === "songs" ? "music" : channel.kind === "shorts" ? "shorts" : "review desk"} · {channel.videoCount} recent uploads
                  {channel.latestAt ? ` · last ${timeAgo(channel.latestAt)}` : ""}
                </p>
                <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--hairline)" }}>
                  <div
                    className="bar-fill h-full rounded-full"
                    style={{ width: `${Math.max(3, Math.round((channel.views / maxChannelViews) * 100))}%`, background: "var(--site-accent)" }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Short films worth the ten minutes" kicker="from the shorts wires" action={<SeeMore to="/shorts" label="more shorts" />}>
          <div className="grid gap-[var(--space-2)] sm:grid-cols-2">
            {[...shorts]
              .sort(byViews)
              .slice(0, 4)
              .map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
          </div>
        </Panel>
      </section>

      <Panel title="From the desk" kicker="curated collections" action={<SeeMore to="/collections" label="all collections" />}>
        <div className="grid gap-[var(--space-3)] sm:grid-cols-2 lg:grid-cols-3">
          {COLLECTIONS.slice(0, 3).map((collection) => (
            <Link key={collection.id} to={`/collections?id=${collection.id}`} className="plate plate-hover flex flex-col gap-2 p-[var(--space-3)]">
              <Kicker>{collection.kicker}</Kicker>
              <h3 className="text-lg leading-snug font-semibold">{collection.title}</h3>
              <p className="text-sm text-muted-foreground">{collection.blurb}</p>
              <p className="mt-auto text-xs text-[color:var(--site-accent-text)]">{collection.items.length} picks · {collection.window}</p>
            </Link>
          ))}
        </div>
      </Panel>

      <Panel title="Everything else today" kicker="the full wire" action={<SeeMore to="/news" label="news desk" />}>
        <div className="grid gap-[var(--space-3)] sm:grid-cols-2 lg:grid-cols-4">
          {stories.slice(4, 8).map((item) => (
            <StoryCard key={item.id} item={item} />
          ))}
        </div>
      </Panel>
    </div>
  );
}

function StoryLead({ item }: { item: NonNullable<NewsResult["items"][number]> }) {
  return (
    <article className="plate relative overflow-hidden">
      {item.image ? (
        <img
          src={item.image}
          alt=""
          className="absolute inset-0 size-full object-cover opacity-30"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : null}
      <div
        className="filmstrip absolute inset-x-0 top-0 h-1.5 opacity-70"
        style={{ backgroundImage: "repeating-linear-gradient(90deg, var(--site-accent) 0 14px, transparent 14px 26px)" }}
        aria-hidden
      />
      <div
        className="relative p-[var(--space-4)] sm:p-[var(--space-5)]"
        style={{ background: "linear-gradient(100deg, var(--plate) 26%, color-mix(in srgb, var(--plate) 62%, transparent) 58%, transparent)" }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="pill" style={{ background: "var(--hotline)", color: "var(--site-on-accent)", borderColor: "var(--hotline)" }}>
            lead
          </span>
          <span className="pill">{industryLabel(item.industry)}</span>
          <span className="pill">{item.region}</span>
        </div>
        <h2 className="mt-[var(--space-3)] max-w-2xl text-2xl leading-[1.12] font-bold sm:text-4xl">
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-[color:var(--site-accent-text)]">
            {item.title}
          </a>
        </h2>
        {item.summary ? <p className="clamp-three mt-[var(--space-2)] max-w-2xl text-sm text-muted-foreground sm:text-base">{item.summary}</p> : null}
        <p className="mt-[var(--space-3)] text-sm text-muted-foreground">
          {item.source} · {timeAgo(item.publishedAt)} ·{" "}
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[color:var(--site-accent-text)] hover:underline">
            open the story
          </a>
        </p>
      </div>
    </article>
  );
}
