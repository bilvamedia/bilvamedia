# Takeok Entertainments

A single marquee for film news, review verdicts, OTT movement, viral songs, short
films and the YouTube numbers behind them. Headlines are pulled from public feeds
and always link back to the publisher that wrote them.

Live site: <https://takeok-entertainments.netlify.app>

## What it shows

| Route | Source |
| --- | --- |
| `/` Marquee | Roll-up of everything below, plus wire status |
| `/news` News desk | 12 public feeds across Telugu, Bollywood, Hollywood, Korean and anime desks |
| `/reviews` Review wire | Reviews published inside a three-week window, with the publisher's own number when they file one |
| `/ott` OTT desk | Wire copy scanned for release language and filed under the service it names |
| `/songs` Viral songs | Recent uploads from five music labels, ranked by views per day |
| `/shorts` Short films | Five channels that publish short work |
| `/youtube` YouTube stats | Upload counts and view totals each channel publishes on its own public feed |
| `/collections` Collections | Six hand-edited lists written by the Takeok desk |

Election and party-politics copy is filtered out — the board is entertainment only.

Takeok does not re-rate films and does not invent numbers. Anything it cannot read
from a public feed is labelled as missing rather than estimated.

## Stack

Vite + React 19, TypeScript, Tailwind CSS 4. Client-side routing through a small
history-API router in `lib/router.tsx`. Design tokens live in `src/globals.css`
and follow the Takeok brand system: cream paper ground, ink type, vermilion
accent, five curtain hues.

## Develop

```bash
npm install
npm run dev
```

## The aggregator

`functions/handler.ts` is a self-contained, dependency-free request handler: it
fetches the feeds, parses RSS, filters politics, ranks by velocity and caches per
desk (2 minutes for news, 5 minutes for YouTube). It reads only public URLs and
needs no credentials.

`functions/index.ts` is the Deno entry point for Qoder Sites. `netlify/edge-functions/app.ts`
is the Netlify entry point — a thin wrapper that mounts the same handler at
`/functions/v1/app`, the path `lib/api.ts` already calls.

```bash
npm run check:function   # deno check functions/index.ts
npm run dev:function      # Deno service on 127.0.0.1:8000
```

Vite dev and preview proxy `/functions/v1/app` to that local service. Probe it with:

```bash
curl --fail 'http://127.0.0.1:5173/functions/v1/app?action=health'
```

Use Vite's actual port if it differs.

If the aggregator is unreachable — locally, or if the deployed function fails — the
client falls back to `data/snapshot.ts`, a capture of the same feeds. The UI says so
out loud: the badge reads **SNAPSHOT · FEEDS UNREACHABLE** and the timestamp is the
capture time, never a fake "live" claim.

## Deploy

`netlify.toml` builds `dist/`, pins Node 22 (the prebuild check rejects older 22.x),
redirects all paths to the app shell for client-side routing, and points Netlify's
serverless scanner at `netlify/functions` so the Deno code in `functions/` is not
compiled as a Node function.

```bash
npm run build
netlify deploy --no-build              # draft
netlify deploy --no-build --prod       # production
```

`--build` runs Netlify's build system on your own machine, and on Windows that step
fails while it installs its plugins into `.netlify/plugins` (`EPERM` / `ENOTEMPTY`
from file locking). Building first and passing `--no-build` uploads the same output
with the edge functions bundled by the CLI.

Continuous deployment works too, and sidesteps the local build entirely: connect this
repo in Netlify and pushes to `main` build and publish on Netlify's CI.

## Publishing with Qoder Sites

The project also carries a Qoder Sites descriptor. For that route, prepare with
`webDirectory: "dist"`, `functionDirectory: "functions"` and `spa: true`.

## Provenance

`PROVENANCE.md` records the starter template this project was adapted from and the
license for the vendored Shadcn stylesheet in `vendor/`.
