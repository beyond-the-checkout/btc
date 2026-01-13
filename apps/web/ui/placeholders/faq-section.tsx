import { FAQSection as FAQSectionConfig } from "@/lib/niches";
import Markdown from "react-markdown";

export function FaqSection({ config }: { config?: FAQSectionConfig }) {
  if (!config) {
    return null;
  }

  const { header, items } = config;

  if (!header && !items?.length) {
    return null;
  }

  return (
    <section className="mx-auto mt-16 w-full max-w-screen-lg px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        {header && (
          <h2 className="font-display text-content-default text-balance text-3xl font-medium sm:text-4xl">
            {header}
          </h2>
        )}
      </div>

      {items?.length ? (
        <div className="mt-8 space-y-3">
          {items.map((item, idx) => (
            <details
              key={`${item.question}-${idx}`}
              name="faq-accordion"
              className="bg-subtle group rounded-2xl border border-neutral-200 px-4 py-3 shadow-sm sm:px-6"
              open={idx === 0}
            >
              <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-4 py-2 text-left [&::-webkit-details-marker]:hidden">
                <span className="text-content-default text-lg font-medium">
                  {item.question}
                </span>
                <span className="flex items-center justify-center rounded-full border border-neutral-200 bg-white p-1">
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-5 w-5 text-neutral-500 transition-transform duration-200 group-open:rotate-180"
                  >
                    <path
                      d="M6 9l6 6 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </summary>
              <div className="text-content-subtle pb-3 pt-1 text-base leading-relaxed sm:text-lg">
                <Markdown
                  className="space-y-3 text-pretty"
                  components={{
                    strong: ({ children }) => (
                      <strong className="text-content-default font-semibold">
                        {children}
                      </strong>
                    ),
                    p: ({ children }) => <p>{children}</p>,
                  }}
                >
                  {item.answer}
                </Markdown>
              </div>
            </details>
          ))}
        </div>
      ) : null}
    </section>
  );
}
