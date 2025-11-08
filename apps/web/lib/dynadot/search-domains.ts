import z from "@/lib/zod";
import { DubApiError } from "../api/errors";
import { DomainStatusSchema } from "../zod/schemas/domains";
import { DYNADOT_API_KEY, DYNADOT_BASE_URL } from "./constants";

const schema = z.object({
  SearchResponse: z.object({
    ResponseCode: z.enum(["0", "-1"]),
    SearchResults: z.array(
      z.object({
        DomainName: z.string(),
        Available: z.enum(["yes", "no"]).nullish().default("no"),
        Price: z.string().nullish().default(null),
        Status: z.string().nullish().default(null),
      }),
    ),
  }),
});

export const searchDomainsAvailability = async ({
  domains,
}: {
  domains: Record<string, string>;
}) => {
  // Check if API key is configured
  if (!DYNADOT_API_KEY) {
    throw new DubApiError({
      code: "bad_request",
      message: "DYNADOT_API_KEY environment variable is not configured",
    });
  }

  const searchParams = new URLSearchParams({
    ...domains,
    command: "search",
    show_price: "1",
    currency: "USD",
    key: DYNADOT_API_KEY,
  });

  const response = await fetch(
    `${DYNADOT_BASE_URL}?${searchParams.toString()}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new DubApiError({
      code: "bad_request",
      message: `Failed to search domains: ${response.statusText}`,
    });
  }

  const responseJson = await response.json();

  // Add better error handling for unexpected response format
  const parseResult = schema.safeParse(responseJson);
  if (!parseResult.success) {
    console.error("Dynadot API returned unexpected format:", responseJson);
    throw new DubApiError({
      code: "bad_request",
      message: `Dynadot API returned an unexpected response format. Response: ${JSON.stringify(responseJson)}`,
    });
  }

  const data = parseResult.data;

  console.log(JSON.stringify(data, null, 2));

  if (data.SearchResponse.ResponseCode === "-1") {
    throw new DubApiError({
      code: "bad_request",
      message: `Failed to search domains: ${data.SearchResponse}`,
    });
  }

  const result = data.SearchResponse.SearchResults.map((result) => {
    const premium = result.Price && /is\s+a Premium Domain/.test(result.Price);

    return {
      domain: result.DomainName,
      available: result.Available === "yes" && !premium,
      price: result.Price,
      premium,
    };
  });

  return DomainStatusSchema.array().parse(result);
};
