import { createFileRoute } from "@tanstack/react-router";
import { ListingPage } from "@/components/ListingPage";

export const Route = createFileRoute("/buy")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? (search["q"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Buy Property in Braj | Braj Setu Properties" },
      {
        name: "description",
        content:
          "Browse flats, houses, plots, shops and farm houses for sale across Vrindavan, Mathura and nearby Braj towns.",
      },
      { property: "og:title", content: "Buy Property in Braj | Braj Setu Properties" },
      {
        property: "og:description",
        content:
          "Search homes and commercial spaces for sale by location, budget and property type.",
      },
    ],
  }),
  component: BuyPage,
});

function BuyPage() {
  const { q } = Route.useSearch();
  return (
    <ListingPage
      intent="Sale"
      searchIntent="Buy"
      heading="Find a property to buy."
      subheading="Explore flats, houses, plots and commercial spaces in Braj. Compare details and contact our team when a property feels right."
      initialQuery={q ?? ""}
    />
  );
}
