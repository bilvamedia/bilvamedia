export type IndustryFilter = "all" | "telugu" | "bollywood" | "hollywood" | "korean" | "anime";

export const INDUSTRIES: IndustryFilter[] = ["all", "telugu", "bollywood", "hollywood", "korean", "anime"];

export const INDUSTRY_LABEL: Record<IndustryFilter, string> = {
  all: "All desks",
  telugu: "Telugu & South",
  bollywood: "Bollywood",
  hollywood: "Hollywood",
  korean: "Korean",
  anime: "Anime",
};
