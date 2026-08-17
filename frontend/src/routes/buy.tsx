import { createFileRoute } from "@tanstack/react-router";
import { ListingPage } from "@/components/ListingPage";

export const Route = createFileRoute("/buy")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? (search["q"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Buy Property in India | PropVista" },
      {
        name: "description",
        content:
          "Browse verified flats, houses, plots, shops and farm houses for sale with PropVista's map-led search and honest advisory.",
      },
      { property: "og:title", content: "Buy Property in India | PropVista" },
      {
        property: "og:description",
        content: "Verified homes and commercial spaces for sale, filtered the way you search.",
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
      heading="Buy with confidence"
      subheading="Every PropVista listing is title-checked and visited by our team before it reaches this page."
      initialQuery={q ?? ""}
    />
  );
}
