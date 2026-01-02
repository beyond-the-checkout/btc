import { SolutionSection as SolutionSectionConfig } from "@/lib/niches";
import Markdown from "react-markdown";

export function SolutionSection({
  config,
}: {
  config: SolutionSectionConfig | undefined;
}) {
  if (!config) {
    return null;
  }

  const { header, paragraphs } = config;

  if (!header && !(paragraphs?.length)) {
    return null;
  }

  return (
    <section className="mx-auto mt-16 w-full max-w-screen-lg px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        {header && (
          <h2 className="font-display text-balance text-3xl font-medium text-content-default sm:text-4xl">
            {header}
          </h2>
        )}
        {paragraphs?.length ? (
          <div className="mt-6 flex flex-col gap-5 text-base sm:text-lg">
            {paragraphs.map((paragraph, idx) => (
              <Markdown
                key={idx}
                className="text-pretty leading-relaxed text-content-default"
                components={{
                  strong: ({ children }) => (
                    <strong className="font-semibold text-content-default">
                      {children}
                    </strong>
                  ),
                  p: ({ children }) => (
                    <p className="text-content-subtle">{children}</p>
                  ),
                }}
              >
                {paragraph}
              </Markdown>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}