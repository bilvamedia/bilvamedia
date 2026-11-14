const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const plain = new Intl.NumberFormat("en");

export function views(value: number): string {
  return value >= 10_000 ? compact.format(value) : plain.format(value);
}

export function ageHours(publishedAt: string): number {
  const time = Date.parse(publishedAt);
  if (Number.isNaN(time)) return 9999;
  return Math.max(0, (Date.now() - time) / 36e5);
}

export function timeAgo(publishedAt: string): string {
  const hours = ageHours(publishedAt);
  if (hours < 1) return "just now";
  if (hours < 24) return `${Math.round(hours)}h ago`;
  const days = Math.round(hours / 24);
  if (days < 8) return `${days}d ago`;
  return new Date(publishedAt).toLocaleDateString("en", { day: "numeric", month: "short" });
}

export function clockTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function dayMonth(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en", { day: "2-digit", month: "short" }).toUpperCase();
}

export function perDay(publishedAt: string, value: number): number {
  const hours = ageHours(publishedAt);
  return Math.round(value / Math.max(0.25, hours / 24));
}

export function verdict(score: number): string {
  if (score >= 4) return "Must watch";
  if (score >= 3) return "Worth your time";
  if (score >= 2) return "Mixed";
  if (score > 0) return "Skip it";
  return "No score filed";
}

export function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const INDUSTRY_NAMES: Record<string, string> = {
  telugu: "Telugu",
  bollywood: "Bollywood",
  hindli: "Bollywood",
  hollywood: "Hollywood",
  korean: "Korean",
  anime: "Anime",
};

export function industryLabel(value: string): string {
  return INDUSTRY_NAMES[value.toLowerCase()] ?? value;
}
