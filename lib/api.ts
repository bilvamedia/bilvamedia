import { SNAPSHOT } from "@/data/snapshot";
import type { Channel, Meta, NewsResult, Source, Story, Video, WireResult, YouTubeResult } from "./types";

const ENDPOINT = "/functions/v1/app";
const inflight = new Map<string, Promise<Record<string, unknown>>>();

const asArray = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

function metaOf(payload: Record<string, unknown>, snapshot: boolean): Meta {
  return {
    capturedAt: String(payload.generatedAt ?? SNAPSHOT.capturedAt),
    liveSources: Number(payload.liveSources ?? 0),
    totalSources: Number(payload.totalSources ?? SNAPSHOT.sources.length),
    cache: snapshot ? "snapshot" : String(payload.cache ?? "miss"),
    snapshot,
  };
}

function storyFrom(row: Record<string, unknown>, index: number): Story {
  return {
    id: String(row.id ?? `${index}`),
    title: String(row.title ?? row.t ?? ""),
    url: String(row.url ?? row.u ?? "#"),
    source: String(row.source ?? row.s ?? ""),
    industry: String(row.industry ?? row.i ?? ""),
    region: String(row.region ?? row.g ?? ""),
    publishedAt: String(row.publishedAt ?? row.d ?? ""),
    summary: String(row.summary ?? row.x ?? ""),
    image: String(row.image ?? row.p ?? ""),
    platform: row.platform ? String(row.platform) : row.pf ? String(row.pf) : undefined,
    film: row.film ? String(row.film) : row.f ? String(row.f) : undefined,
    score: row.score === undefined ? (row.sc === undefined ? undefined : Number(row.sc)) : Number(row.score),
    isReview: row.isReview === undefined ? (row.rv === undefined ? undefined : Boolean(row.rv)) : Boolean(row.isReview),
  };
}

function videoFrom(row: Record<string, unknown>, index: number): Video {
  const videoId = String(row.videoId ?? row.v ?? index);
  return {
    id: `yt:${videoId}`,
    videoId,
    title: String(row.title ?? row.t ?? ""),
    url: `https://www.youtube.com/watch?v=${videoId}`,
    thumbnail: String(row.thumbnail ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`),
    channelName: String(row.channelName ?? row.c ?? ""),
    kind: (String(row.kind ?? row.k ?? "songs") as Video["kind"]) ?? "songs",
    region: String(row.region ?? row.r ?? ""),
    publishedAt: String(row.publishedAt ?? row.d ?? ""),
    views: Number(row.views ?? row.n ?? 0),
    ratingCount: Number(row.ratingCount ?? row.l ?? 0),
  };
}

function channelFrom(row: Record<string, unknown>): Channel {
  return {
    name: String(row.name ?? row.n ?? ""),
    id: String(row.id ?? row.i ?? ""),
    kind: String(row.kind ?? row.k ?? "songs") as Channel["kind"],
    region: String(row.region ?? row.r ?? ""),
    videoCount: Number(row.videoCount ?? row.c ?? 0),
    views: Number(row.views ?? row.v ?? 0),
    latestAt: String(row.latestAt ?? row.d ?? ""),
  };
}

function sourceFrom(row: Record<string, unknown>): Source {
  return {
    name: String(row.name ?? row.n ?? ""),
    industry: String(row.industry ?? row.i ?? ""),
    region: String(row.region ?? row.k ?? ""),
    status: String(row.status ?? row.st ?? "ok") === "error" ? "error" : "ok",
    count: Number(row.count ?? row.c ?? 0),
  };
}

async function request(query: string): Promise<Record<string, unknown>> {
  const existing = inflight.get(query);
  if (existing) return existing;
  const call = (async () => {
    const response = await fetch(`${ENDPOINT}?${query}`, { signal: AbortSignal.timeout(14000) });
    const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    if (!response.ok || payload.ok !== true) {
      throw new Error(String(payload.error ?? `request_failed_${response.status}`));
    }
    return payload;
  })();
  inflight.set(query, call);
  try {
    return await call;
  } finally {
    inflight.delete(query);
  }
}

export async function loadNews(industry: string): Promise<NewsResult> {
  try {
    const payload = await request(`action=news&industry=${encodeURIComponent(industry)}`);
    const items = asArray<Record<string, unknown>>(payload.items).map(storyFrom);
    if (!items.length) throw new Error("empty_payload");
    return { meta: metaOf(payload, false), sources: asArray<Record<string, unknown>>(payload.sources).map(sourceFrom), items };
  } catch {
    const items = SNAPSHOT.news.map(storyFrom).filter((item) => industry === "all" || item.industry === industry);
    return {
      meta: metaOf({ generatedAt: SNAPSHOT.capturedAt, liveSources: 0, totalSources: SNAPSHOT.sources.length }, true),
      sources: SNAPSHOT.sources.map(sourceFrom),
      items,
    };
  }
}

export async function loadWire(kind: "ott" | "reviews"): Promise<WireResult> {
  try {
    const payload = await request(`action=${kind}`);
    const items = asArray<Record<string, unknown>>(payload.items).map(storyFrom);
    if (!items.length) throw new Error("empty_payload");
    return { meta: metaOf(payload, false), items };
  } catch {
    const rows = kind === "ott" ? SNAPSHOT.wireNews : SNAPSHOT.reviewNews;
    return {
      meta: metaOf({ generatedAt: SNAPSHOT.capturedAt, liveSources: 0, totalSources: SNAPSHOT.sources.length }, true),
      items: rows.map(storyFrom),
    };
  }
}

export async function loadYouTube(kind: string): Promise<YouTubeResult> {
  try {
    const payload = await request(`action=youtube&kind=${encodeURIComponent(kind)}`);
    const videos = asArray<Record<string, unknown>>(payload.videos).map(videoFrom);
    if (!videos.length) throw new Error("empty_payload");
    return {
      meta: metaOf(payload, false),
      videos,
      channels: asArray<Record<string, unknown>>(payload.channels).map(channelFrom),
    };
  } catch {
    const videos = SNAPSHOT.videos.map(videoFrom).filter((row) => kind === "all" || row.kind === kind);
    const channels = SNAPSHOT.channels.map(channelFrom).filter((row) => kind === "all" || row.kind === (kind as Channel["kind"]));
    return {
      meta: metaOf({ generatedAt: SNAPSHOT.capturedAt, liveSources: 0, totalSources: SNAPSHOT.channels.length }, true),
      videos,
      channels,
    };
  }
}

export const ALL_NEWS_SOURCES = SNAPSHOT.sources.map(sourceFrom);
