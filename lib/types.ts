export type Meta = {
  capturedAt: string;
  liveSources: number;
  totalSources: number;
  cache: string;
  snapshot: boolean;
};

export type Story = {
  id: string;
  title: string;
  url: string;
  source: string;
  industry: string;
  region: string;
  publishedAt: string;
  summary: string;
  image: string;
  platform?: string;
  film?: string;
  score?: number;
  isReview?: boolean;
};

export type Video = {
  id: string;
  videoId: string;
  title: string;
  url: string;
  thumbnail: string;
  channelName: string;
  kind: "songs" | "shorts" | "reviews";
  region: string;
  publishedAt: string;
  views: number;
  ratingCount: number;
};

export type Channel = {
  name: string;
  id: string;
  kind: "songs" | "shorts" | "reviews";
  region: string;
  videoCount: number;
  views: number;
  latestAt: string;
};

export type Source = {
  name: string;
  industry: string;
  region: string;
  status: "ok" | "error";
  count: number;
};

export type NewsResult = { meta: Meta; sources: Source[]; items: Story[] };
export type WireResult = { meta: Meta; items: Story[] };
export type YouTubeResult = { meta: Meta; channels: Channel[]; videos: Video[] };
