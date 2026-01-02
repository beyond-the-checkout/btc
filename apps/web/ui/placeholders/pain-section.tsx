import { PainSection as PainSectionConfig } from "@/lib/niches";

export function PainSection({ config }: { config: PainSectionConfig }) {
  if (!config) {
    return null;
  }

  const { header, intro, quotes, conclusion } = config;

  return (
    <section className="mx-auto mt-16 w-full max-w-screen-lg px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-balance text-3xl font-medium text-content-default sm:text-4xl">
          {header}
        </h2>
        {intro && (
          <p className="mt-3 text-base text-content-subtle sm:text-lg">
            {intro}
          </p>
        )}
      </div>

      {quotes?.length > 0 && (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {quotes.map((item, idx) => (
            <blockquote
              key={`${item.quote}-${idx}`}
              className="rounded-2xl border border-neutral-200 bg-subtle px-6 py-5 text-left shadow-sm"
            >
              <p className="text-base leading-relaxed text-content-default">
                {item.quote}
              </p>
              {item.attribution && (
                <cite className="mt-4 block text-sm text-content-subtle not-italic">
                  — {item.attribution}
                </cite>
              )}
            </blockquote>
          ))}
        </div>
      )}

      {conclusion && (
        <p className="mt-12 text-center text-lg text-content-default sm:text-xl">
          <strong>{conclusion}</strong>
        </p>
      )}
    </section>
  );
}