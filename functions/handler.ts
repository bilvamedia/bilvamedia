type Feed = {
  name: string;
  url: string;
  industry: string;
  region: string;
};

type Channel = {
  name: string;
  id: string;
  kind: "songs" | "shorts" | "reviews";
  region: string;
};

const NEWS_FEEDS: Feed[] = [
  { name: "Telugu360", url: "https://www.telugu360.com/feed/", industry: "telugu", region: "India" },
  { name: "123Telugu", url: "https://123telugu.com/feed/", industry: "telugu", region: "India" },
  { name: "IE Regional", url: "https://indianexpress.com/section/entertainment/regional/feed/", industry: "telugu", region: "India" },
  { name: "Bollywood Hungama", url: "https://www.bollywoodhungama.com/feed/", industry: "bollywood", region: "India" },
  { name: "IE Bollywood", url: "https://indianexpress.com/section/entertainment/bollywood/feed/", industry: "bollywood", region: "India" },
  { name: "Variety", url: "https://variety.com/feed/", industry: "hollywood", region: "Global" },
  { name: "Deadline", url: "https://deadline.com/feed/", industry: "hollywood", region: "Global" },
  { name: "Hollywood Reporter", url: "https://www.hollywoodreporter.com/feed/", industry: "hollywood", region: "Global" },
  { name: "IE Hollywood", url: "https://indianexpress.com/section/entertainment/hollywood/feed/", industry: "hollywood", region: "Global" },
  { name: "JoBlo", url: "https://www.joblo.com/feed/", industry: "hollywood", region: "Global" },
  { name: "Anime News Network", url: "https://www.animenewsnetwork.com/all/rss.xml", industry: "anime", region: "Japan" },
  { name: "Soompi", url: "https://www.soompi.com/feed", industry: "korean", region: "South Korea" },
];

const CHANNELS: Channel[] = [
  { name: "T-Series", id: "UCq-Fj5jknLsUf-MWSy4_brA", kind: "songs", region: "India" },
  { name: "Zee Music Company", id: "UCFFbwnve3yF62-tVXkTyHqg", kind: "songs", region: "India" },
  { name: "Aditya Music", id: "UCNApqoVYJbYSrni4YsbXzyQ", kind: "songs", region: "Telugu" },
  { name: "melody", id: "UCnmwuwXNbDp5_OXX9ISFWGg", kind: "songs", region: "Telugu" },
  { name: "Goldmines", id: "UCyoXW-Dse7fURq30EWl_CUA", kind: "songs", region: "South" },
  { name: "Short of the Week", id: "UCyp-EzJrdTOd9uNPvmdst-w", kind: "shorts", region: "Global" },
  { name: "Olypix", id: "UCFWKslbgsFnnSBL_tpL4xTw", kind: "shorts", region: "India" },
  { name: "BB Ki Vines", id: "UCqwUrj10mAEsqezcItqvwEw", kind: "shorts", region: "India" },
  { name: "FilterCopy", id: "UC7IMq6lLHbptAnSucW1pClA", kind: "shorts", region: "India" },
  { name: "TeamWorks Pictures", id: "UCBAfukPRzJs0ZrPUfH0mDpw", kind: "shorts", region: "Telugu" },
  { name: "IdleReviews", id: "UC0zYc8OU7gUyCq9suTiWxew", kind: "reviews", region: "Telugu" },
  { name: "FilmiBeat", id: "UCsaoYBUHz_lVB_dOmFwA9Zw", kind: "reviews", region: "India" },
  { name: "MovieFreak", id: "UCDbIpCi2ZdKFKvcmgxgr0fg", kind: "reviews", region: "India" },
];

const UPSTREAM_TIMEOUT_MS = 7000;
const NEWS_TTL_MS = 120_000;
const YOUTUBE_TTL_MS = 300_000;

const baseHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
};

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  middot: "·",
  bull: "•",
  laquo: "«",
  raquo: "»",
};

function decode(input: string): string {
  return input
    .replace(/&#(\d+);/g, (_m, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, code: string) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&([a-zA-Z#][a-zA-Z0-9]*);/g, (match, name: string) => ENTITIES[name] ?? match);
}

function unwrap(input: string): string {
  const cdata = /^<!\[CDATA\[([\s\S]*?)\]\]>$/.exec(input.trim());
  return decode(cdata ? cdata[1] : input);
}

function stripHtml(input: string, limit: number): string {
  const text = decode(input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ")).trim();
  if (text.length <= limit) return text;
  return `${text.slice(0, Math.max(0, text.lastIndexOf(" ", limit)) > 40 ? text.lastIndexOf(" ", limit) : limit).trimEnd()}…`;
}

function firstTag(block: string, names: string[]): string {
  for (const name of names) {
    const match = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i").exec(block);
    if (match) return unwrap(match[1]);
  }
  return "";
}

function attr(block: string, tag: string, attribute: string): string {
  const match = new RegExp(`<${tag}\\s[^>]*?${attribute}="([^"]*)"`, "i").exec(block);
  return match ? decode(match[1]) : "";
}

function attrAll(block: string, tag: string, attribute: string): string[] {
  const out: string[] = [];
  const re = new RegExp(`<${tag}\\s[^>]*?${attribute}="([^"]*)"`, "gi");
  let match = re.exec(block);
  while (match) {
    out.push(decode(match[1]));
    match = re.exec(block);
  }
  return out;
}

function blocks(source: string, tag: string): string[] {
  const out: string[] = [];
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "gi");
  let match = re.exec(source);
  while (match) {
    out.push(match[1]);
    match = re.exec(source);
  }
  return out;
}

function isoFrom(raw: string): string {
  if (!raw) return "";
  const time = Date.parse(raw);
  return Number.isNaN(time) ? "" : new Date(time).toISOString();
}

function cleanSummary(input: string): string {
  return input.replace(/^the post\s+/i, "").replace(/\s*\|\s*the post.*$/i, "").trim();
}

const POLITICAL_CORE =
  /\b(?:ruling party|opposition party|party president|chief minister|deputy chief|minister (?:of|for) (?:home|defence|defense|finance|information|external affairs)|cabinet (?:minister|meeting|reshuffle)|bjp|ysrcp|ysr cp|tdp|trs|brs|aimim|shiv sena|ncp|jdp|dmk|aiadmk|congress|rajya sabha|lok sabha|vidhan sabha|state assembly|assembly constituency|parishad|panchayat|zptc|mptc|sptc|bypoll|by-election|ballot|vote bank|exit poll|opinion poll|election commission|delimitation|no-confidence|donald trump|trump administration|white house|state department|mallikarjun|amit shah|rahul gandhi|narendra modi)\b/i;

const POLITICAL_TELUGU =
  /(?:ఎన్నిక|రాజకీయ|మంత్రి|పరిషత్|శాసనసభ|లోకసభ|రాజ్యసభ|తెలుగుదేశం|వైసీపీ|బీజేపీ|కాంగ్రెస్|ఓటు|ఓట్లు|అభ్యర్థి|ప్రచారం|ఎమ్మెల్యే|ఎంపీ|కూటమి)/;

const POLITICAL_HINDI =
  /(?:चुनाव|राजनीति|मंत्री|विधान सभा|लोकसभा|राज्यसभा|भाजपा|कांग्रेस|मतदान|एमएलए|सांसद)/;

const POLITICAL_SOFT =
  /\b(?:political|politicians?|politics|election|electoral|ministers?|mla|governor|senator|senate|parliament|member of parliament|government|alliance|voting|constituency)\b/i;

const SHOWBIZ =
  /\b(?:film|films|movie|movies|cinema|box office|trailer|teaser|song|songs|singer|singing|audio|album|review|reviews|actor|actors|actress|hero|heroine|director|producer|ott|web series|television|award|awards|star|stars|celebrity|entertainment|chamber|censor|cbfc|release|releasing|premiere|shoot|casting|screening|screen|festival|remake|sequence|music)\b/i;

function isPolitical(...parts: string[]): boolean {
  const text = parts.filter(Boolean).join(" ");
  if (!text) return false;
  if (POLITICAL_CORE.test(text) || POLITICAL_TELUGU.test(text) || POLITICAL_HINDI.test(text)) return true;
  return POLITICAL_SOFT.test(text) && !SHOWBIZ.test(text);
}

function inlineImage(block: string): string {
  const media =
    attr(block, "media:thumbnail", "url") ||
    attr(block, "media:content", "url") ||
    attr(block, "enclosure", "url") ||
    attr(block, "image", "url");
  if (media && media.startsWith("http")) return media;
  for (const candidate of attrAll(block, "img", "src")) {
    if (candidate.startsWith("http")) return candidate;
  }
  const css = /https?:\/\/[^"'\\\s)]+\.(?:jpe?g|png|webp)/i.exec(block);
  return css ? css[0] : "";
}

function parseFeed(feed: Feed, xml: string) {
  const items: Record<string, unknown>[] = [];
  const rssBlocks = blocks(xml, "item");
  const source = feed.name;
  const pool = rssBlocks.length
    ? rssBlocks
    : blocks(xml, "entry");
  for (const block of pool) {
    const isAtom = !rssBlocks.length;
    const title = stripHtml(firstTag(block, isAtom ? ["title", "media:title"] : ["title"]), 180);
    const link = firstTag(block, ["link"]) || attr(block, "link", "href");
    const publishedAt = firstTag(block, ["pubDate", "published", "date", "updated"]);
    if (!title || !link.startsWith("http")) continue;
    const summary = cleanSummary(stripHtml(firstTag(block, ["description", "summary", "media:description"]), 240));
    if (isPolitical(title, summary)) continue;
    items.push({
      id: `${source}:${link}`,
      title,
      url: link,
      source,
      sourceType: "news",
      industry: feed.industry,
      region: feed.region,
      publishedAt: isoFrom(publishedAt),
      summary,
      image: inlineImage(block),
    });
  }
  return items;
}

function parseChannel(channel: Channel, xml: string) {
  const videos: Record<string, unknown>[] = [];
  for (const block of blocks(xml, "entry")) {
    const videoId = firstTag(block, ["yt:videoId"]);
    const title = stripHtml(firstTag(block, ["media:title", "title"]), 180);
    const link = attr(block, "link", "href") || firstTag(block, ["link"]);
    const views = Number(attr(block, "media:statistics", "views") || "0");
    if (!videoId || !title || !link.startsWith("http")) continue;
    const description = stripHtml(firstTag(block, ["media:description"]), 200);
    if (isPolitical(title)) continue;
    videos.push({
      id: videoId,
      videoId,
      title,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      source: channel.name,
      sourceType: "youtube",
      kind: channel.kind,
      region: channel.region,
      channelId: channel.id,
      channelName: channel.name,
      thumbnail: attr(block, "media:thumbnail", "url") || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      publishedAt: isoFrom(firstTag(block, ["published", "updated"])),
      views: Number.isFinite(views) ? views : 0,
      ratingCount: Number(attr(block, "media:starRating", "count") || "0"),
      summary: description,
    });
  }
  return videos;
}

type CacheEntry = { at: number; payload: Record<string, unknown> };
const cache = new Map<string, CacheEntry>();

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    redirect: "follow",
    headers: { "User-Agent": "Mozilla/5.0 (compatible; TakeokDesk/1.0)" },
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`upstream_${response.status}`);
  return await response.text();
}

async function getPayload(
  key: string,
  ttlMs: number,
  build: () => Promise<Record<string, unknown>>,
): Promise<{ payload: Record<string, unknown>; state: string }> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return { payload: hit.payload, state: "hit" };
  try {
    const payload = await build();
    cache.set(key, { at: Date.now(), payload });
    return { payload, state: "miss" };
  } catch (cause) {
    if (hit) return { payload: { ...hit.payload, upstreamError: true }, state: "stale" };
    throw cause;
  }
}

function respond(payload: Record<string, unknown>, state: string, maxAge = 60): Response {
  return Response.json({ ...payload, cache: state }, {
    headers: { ...baseHeaders, "Cache-Control": maxAge > 0 ? `public, max-age=${maxAge}` : "no-store" },
  });
}

function dedupe<T extends { id: string; title?: string }>(rows: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const row of rows) {
    const key = (row.title ?? row.id).toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 72);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }
  return out;
}

function recentIso(publishedAt: string): boolean {
  const time = Date.parse(publishedAt);
  if (Number.isNaN(time)) return false;
  return Date.now() - time < 21 * 864e5;
}

function byNewest(a: { publishedAt: string }, b: { publishedAt: string }): number {
  return Date.parse(b.publishedAt || 0) - Date.parse(a.publishedAt || 0);
}

async function buildNews(industry: string, poolSize = 150): Promise<Record<string, unknown>> {
  const feeds = industry && industry !== "all" ? NEWS_FEEDS.filter((f) => f.industry === industry) : NEWS_FEEDS;
  const settled = await Promise.allSettled(
    feeds.map(async (feed) => ({ feed, xml: await fetchText(feed.url) })),
  );
  const sources: Record<string, unknown>[] = [];
  const items: Record<string, unknown>[] = [];
  let live = 0;
  settled.forEach((result, index) => {
    const feed = feeds[index];
    if (result.status !== "fulfilled") {
      sources.push({ name: feed.name, industry: feed.industry, region: feed.region, status: "error", count: 0 });
      return;
    }
    const parsed = parseFeed(feed, result.value.xml).filter((row) => recentIso(String(row.publishedAt)));
    live += 1;
    items.push(...parsed);
    sources.push({ name: feed.name, industry: feed.industry, region: feed.region, status: "ok", count: parsed.length });
  });
  if (!live) throw new Error("all_feeds_failed");
  const unique = dedupe(items).sort(byNewest).slice(0, poolSize);
  return {
    ok: true,
    action: "news",
    generatedAt: new Date().toISOString(),
    liveSources: live,
    totalSources: feeds.length,
    sources: sources.sort((a, b) => String(a.name).localeCompare(String(b.name))),
    industries: [...new Set(NEWS_FEEDS.map((f) => f.industry))],
    items: unique,
  };
}

const PLATFORMS: { name: string; test: RegExp }[] = [
  { name: "Netflix", test: /netflix/i },
  { name: "Prime Video", test: /prime video|amazon prime/i },
  { name: "JioHotstar", test: /jiohotstar|hotstar/i },
  { name: "Aha", test: /\baha\b|aha originals/i },
  { name: "Sun NXT", test: /sun nxt/i },
  { name: "ZEE5", test: /zee\s?5/i },
  { name: "Sony LIV", test: /sony liv|lionsbite/i },
  { name: "Disney+ Hotstar", test: /disney\+/i },
  { name: "YouTube Premiere", test: /youtube (premiere|release|direct)/i },
];

const OTT_TEST = /\b(ott|netflix|prime video|hotstar|jiohotstar|sun nxt|zee5|zee 5|sony liv|disney\+|digital premiere|direct to ott|now streaming|releasing on)\b|\baha\b\s*(?:ott|exclusive|release)/i;

function detectPlatform(text: string): string {
  for (const platform of PLATFORMS) if (platform.test.test(text)) return platform.name;
  return "Unlisted";
}

const GRADE_STEPS: Record<string, number> = {
  "A+": 5, A: 4.5, "A-": 4, "B+": 3.5, B: 3, "B-": 2.5, "C+": 2, C: 1.5, "C-": 1, "D+": 0.5, D: 0.5, F: 0,
};

function scoreOf(text: string): number {
  const outOfFive = /(\d(?:\.\d)?)\s*\/\s*(?:5|10)\b/i.exec(text);
  if (outOfFive) {
    const raw = Number(outOfFive[1]);
    return /\/\s*10\b/i.test(outOfFive[0]) ? Math.min(5, raw / 2) : Math.min(5, raw);
  }
  const stars = /(\d(?:\.\d)?)\s*stars?/i.exec(text);
  if (stars) return Math.min(5, Number(stars[1]));
  const rating = /rating[^0-9]*(\d(?:\.\d)?)/i.exec(text);
  if (rating) {
    const raw = Number(rating[1]);
    return raw > 5 ? raw / 2 : raw;
  }
  const letter = /(?:grade|rating|score)\s*[:\-]?\s*\b([A-F][+-]?)/i.exec(text);
  if (letter) return GRADE_STEPS[letter[1].toUpperCase()] ?? 0;
  return 0;
}

function filmNameOf(title: string): string {
  const stripped = title
    .replace(/^\s*(?:video|exclusive|watch|interview|trailer|first\s+look|review)\s*(?:\d+(?:\.\d+)?\s*\/\s*\d+)?\s*[:–-]\s*/i, "")
    .replace(/^\s*(?:movie|film)\s+review\s*[:–-]\s*/i, "")
    .trim();
  const beforeReview = /^(.{2,48}?)\s+(?:movie|film)\s+review\b/i.exec(stripped);
  if (beforeReview) return beforeReview[1].replace(/[|·”"‘’].*$/, "").trim().slice(0, 56);
  const split = /^(.{2,48}?)(?:\s*[:–-]\s*|\s+review\b)/i.exec(stripped);
  return (split ? split[1] : stripped).replace(/[|·].*$/, "").trim().slice(0, 56);
}

function wireValue(item: Record<string, unknown>): string {
  return `${String(item.title ?? "")} ${String(item.summary ?? "")}`;
}

async function buildWire(kind: "ott" | "reviews"): Promise<Record<string, unknown>> {
  const { payload } = await getPayload("news:all", NEWS_TTL_MS, () => buildNews("all", 400));
  const items = (payload.items as Record<string, unknown>[]) ?? [];
  const picked = kind === "ott"
    ? items.filter((item) => OTT_TEST.test(wireValue(item)))
    : items.filter((item) => /\breview\b|\brevenue\b|box office|verdict|rating/i.test(String(item.title)));
  const rows = picked.slice(0, 70).map((item) => {
    const value = wireValue(item);
    const isReview = kind === "reviews" ? /\breview\b|\breview:\b|verdict/i.test(String(item.title)) : undefined;
    const base = {
      ...item,
      platform: kind === "ott" ? detectPlatform(value) : undefined,
      film: kind === "reviews" ? filmNameOf(String(item.title)) : undefined,
      score: isReview ? scoreOf(value) : undefined,
      isReview,
    };
    return base;
  });
  const buckets = [...new Set(rows.map((row) => (kind === "ott" ? row.platform : row.industry)))];
  return {
    ok: true,
    action: kind,
    generatedAt: new Date().toISOString(),
    liveSources: payload.liveSources,
    totalSources: payload.totalSources,
    sources: payload.sources,
    buckets,
    items: rows,
  };
}

async function buildYouTube(kind: string): Promise<Record<string, unknown>> {
  const channels = kind && kind !== "all" ? CHANNELS.filter((c) => c.kind === kind) : CHANNELS;
  const settled = await Promise.allSettled(
    channels.map(async (channel) => ({
      channel,
      xml: await fetchText(`https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`),
    })),
  );
  const videos: Record<string, unknown>[] = [];
  const channelsOut: Record<string, unknown>[] = [];
  let live = 0;
  settled.forEach((result, index) => {
    const channel = channels[index];
    if (result.status !== "fulfilled") {
      channelsOut.push({ name: channel.name, id: channel.id, kind: channel.kind, region: channel.region, status: "error", videoCount: 0, views: 0 });
      return;
    }
    const parsed = parseChannel(channel, result.value.xml);
    live += 1;
    videos.push(...parsed);
    channelsOut.push({
      name: channel.name,
      id: channel.id,
      kind: channel.kind,
      region: channel.region,
      status: "ok",
      videoCount: parsed.length,
      views: parsed.reduce((sum, row) => sum + Number(row.views), 0),
      latestAt: parsed.map((row) => String(row.publishedAt)).sort().at(0) ?? "",
    });
  });
  if (!live) throw new Error("all_channels_failed");
  const unique = dedupe(videos).sort(byNewest);
  return {
    ok: true,
    action: "youtube",
    generatedAt: new Date().toISOString(),
    liveSources: live,
    totalSources: channels.length,
    channels: channelsOut.sort((a, b) => Number(b.views) - Number(a.views)),
    videos: unique.slice(0, 160),
  };
}

async function serveNews(industry: string): Promise<Response> {
  const shared = industry === "all";
  try {
    const { payload, state } = await getPayload(
      shared ? "news:all" : `news:${industry}`,
      NEWS_TTL_MS,
      () => buildNews(industry, shared ? 400 : 150),
    );
    if (!shared) return respond(payload, state);
    return respond({ ...payload, items: ((payload.items as unknown[]) ?? []).slice(0, 150) }, state);
  } catch (cause) {
    return upstreamFailure(cause);
  }
}

function upstreamFailure(cause: unknown): Response {
  return Response.json(
    { ok: false, error: "upstream_unavailable", detail: String((cause as Error).message ?? cause) },
    { status: 502, headers: { ...baseHeaders, "Cache-Control": "no-store" } },
  );
}

async function serve(
  key: string,
  ttlMs: number,
  build: () => Promise<Record<string, unknown>>,
): Promise<Response> {
  try {
    const { payload, state } = await getPayload(key, ttlMs, build);
    return respond(payload, state);
  } catch (cause) {
    return upstreamFailure(cause);
  }
}

export function handler(request: Request): Response {
  if (request.method !== "GET") {
    return Response.json({ ok: false, error: "method_not_allowed" }, {
      status: 405,
      headers: { ...baseHeaders, Allow: "GET" },
    });
  }
  const url = new URL(request.url);
  const action = (url.searchParams.get("action") ?? "").trim().toLowerCase();
  if (action === "health") {
    return respond({
      ok: true,
      action: "health",
      runtime: "edge",
      newsSources: NEWS_FEEDS.length,
      youtubeChannels: CHANNELS.length,
      checkedAt: new Date().toISOString(),
    }, "none", 0);
  }
  if (action === "news") {
    const industry = (url.searchParams.get("industry") ?? "all").trim().toLowerCase();
    return serveNews(industry);
  }
  if (action === "ott") return serve("wire:ott", NEWS_TTL_MS, () => buildWire("ott"));
  if (action === "reviews") return serve("wire:reviews", NEWS_TTL_MS, () => buildWire("reviews"));
  if (action === "youtube") {
    const kind = (url.searchParams.get("kind") ?? "all").trim().toLowerCase();
    return serve(`yt:${kind}`, YOUTUBE_TTL_MS, () => buildYouTube(kind));
  }
  return Response.json({ ok: false, error: "unknown_action", actions: ["health", "news", "ott", "reviews", "youtube"] }, {
    status: 400,
    headers: { ...baseHeaders, "Cache-Control": "no-store" },
  });
}
