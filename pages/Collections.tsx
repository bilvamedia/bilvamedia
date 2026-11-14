import { Kicker } from "@/components/bits";
import { PageHeader } from "@/components/shell";
import { COLLECTIONS } from "@/data/collections";
import { Link } from "@/lib/router";

export default function Collections({ id }: { id: string }) {
  const collection = COLLECTIONS.find((row) => row.id === id) ?? null;

  if (!collection) {
    return (
      <div className="flex flex-col gap-[var(--space-3)]">
        <PageHeader
          kicker="from the desk"
          title="Collections"
          blurb="Hand-edited lists from the Takeok desk. Not a wire, not an algorithm — six arguments about what is worth your evening."
        />
        <div className="grid gap-[var(--space-3)] sm:grid-cols-2 lg:grid-cols-3">
          {COLLECTIONS.map((row) => (
            <Link key={row.id} to={`/collections?id=${row.id}`} className="plate plate-hover flex flex-col gap-2 p-[var(--space-3)]">
              <Kicker>{row.kicker}</Kicker>
              <h2 className="text-xl leading-snug font-semibold">{row.title}</h2>
              <p className="text-sm text-muted-foreground">{row.blurb}</p>
              <p className="mt-auto text-xs text-[color:var(--site-accent-text)]">
                {row.items.length} picks · {row.window}
              </p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <PageHeader kicker={`collection · ${collection.kicker}`} title={collection.title} blurb={collection.blurb} />
      <Link to="/collections" className="pill self-start">
        all collections
      </Link>

      <ol className="plate divide-y divide-[color:var(--hairline)] p-[var(--space-3)]">
        {collection.items.map((item, index) => (
          <li key={`${item.title}-${item.year}`} className="flex gap-[var(--space-3)] py-[var(--space-2)] first:pt-0 last:pb-0">
            <span className="font-display w-8 shrink-0 text-2xl leading-none text-[color:var(--site-accent)]">{index + 1}</span>
            <div className="min-w-0">
              <p className="text-lg font-semibold">
                {item.title} <span className="text-muted-foreground">({item.year})</span>
              </p>
              <p className="text-xs tracking-[0.08em] text-[color:var(--site-accent-text)] uppercase">{item.origin}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.note}</p>
            </div>
          </li>
        ))}
      </ol>

      {collection.channels?.length ? (
        <section className="plate p-[var(--space-3)]">
          <Kicker>where to keep watching</Kicker>
          <ul className="mt-[var(--space-2)] flex flex-col gap-[var(--space-2)]">
            {collection.channels.map((channel) => (
              <li key={channel.url}>
                <a
                  href={channel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-base font-semibold hover:text-[color:var(--site-accent-text)]"
                >
                  {channel.name}
                </a>
                <p className="text-sm text-muted-foreground">{channel.why}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="text-xs text-muted-foreground">
        These lists are Takeok's own editorial, edited by hand in <code>src/data/collections.ts</code>. Availability on any platform
        moves week to week, so the notes stay about the work rather than where it streams tonight.
      </p>
    </div>
  );
}
