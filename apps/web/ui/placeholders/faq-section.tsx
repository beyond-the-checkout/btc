"use client";

import { FAQSection as FAQSectionConfig } from "@/lib/niches";
import { cn } from "@dub/utils";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import Markdown from "react-markdown";

export function FaqSection({ config }: { config?: FAQSectionConfig }) {
  if (!config) {
    return null;
  }

  const { header, items } = config;

  if (!header && !items?.length) {
    return null;
  }

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

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
          {items.map((item, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={`${item.question}-${idx}`}
                className="bg-subtle rounded-2xl border border-neutral-200 px-4 py-3 shadow-sm sm:px-6"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between gap-4 py-2 text-left"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${idx}`}
                >
                  <span className="text-content-default text-lg font-medium">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-5 shrink-0 text-neutral-500 transition-transform duration-200",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
                <div
                  id={`faq-panel-${idx}`}
                  className={cn(
                    "grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-in-out",
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="text-content-subtle overflow-hidden pb-3 pt-1 text-base leading-relaxed sm:text-lg">
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
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
