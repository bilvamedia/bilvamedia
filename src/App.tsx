import { useEffect, useState } from "react";
import { SiteFooter, SiteHeader, Ticker } from "@/components/shell";
import { loadNews } from "@/lib/api";
import { useResource } from "@/lib/hooks";
import { useRoute } from "@/lib/router";
import Collections from "@/pages/Collections";
import Home from "@/pages/Home";
import News from "@/pages/News";
import Ott from "@/pages/Ott";
import Reviews from "@/pages/Reviews";
import Shorts from "@/pages/Shorts";
import Songs from "@/pages/Songs";
import YouTubeStats from "@/pages/YouTubeStats";

export default function App() {
  const route = useRoute();
  const [nonce, setNonce] = useState(0);
  const { data: feed } = useResource(`news:all:${nonce}`, () => loadNews("all"));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [route.path]);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader route={route.path} />
      <Ticker items={feed?.items ?? []} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-[var(--space-3)] py-[var(--space-4)] sm:px-[var(--space-4)]">
        {route.path === "/" ? (
          <Home refreshSignal={nonce} />
        ) : route.path === "/news" ? (
          <News industry={route.params.get("industry") ?? "all"} />
        ) : route.path === "/reviews" ? (
          <Reviews />
        ) : route.path === "/ott" ? (
          <Ott />
        ) : route.path === "/songs" ? (
          <Songs />
        ) : route.path === "/shorts" ? (
          <Shorts />
        ) : route.path === "/youtube" ? (
          <YouTubeStats />
        ) : route.path === "/collections" ? (
          <Collections id={route.params.get("id") ?? ""} />
        ) : (
          <section className="plate p-[var(--space-5)] text-center">
            <h1 className="text-2xl font-bold">That page is not on the marquee</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              The board covers news, reviews, OTT, viral songs, short films, YouTube stats and collections. Pick one from the header.
            </p>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
