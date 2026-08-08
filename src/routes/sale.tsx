import { createFileRoute } from "@tanstack/react-router";
import { ListingPage } from "@/components/ListingPage";

export const Route = createFileRoute("/sale")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? (search["q"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sell Your Property | PropVista" },
      {
        name: "description",
        content:
          "List your flat, house, plot, shop or farm house with PropVista and see what comparable properties are selling for right now.",
      },
      { property: "og:title", content: "Sell Your Property | PropVista" },
      {
        property: "og:description",
        content: "See live comparables and list your property with a boutique advisory team.",
      },
    ],
  }),
  component: SalePage,
});

function SalePage() {
  const { q } = Route.useSearch();
  return (
    <ListingPage
      intent="Sale"
      searchIntent="Sell"
      heading="Selling? Start with the comparables"
      subheading="See what similar properties in your locality are listed at, then let our team price yours accurately."
      initialQuery={q ?? ""}
    />
  );
}
