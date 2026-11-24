import { createFileRoute } from "@tanstack/react-router";
import { ListingPage } from "@/components/ListingPage";

export const Route = createFileRoute("/rent")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? (search["q"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Homes & Shops for Rent | Braj Setu Properties" },
      {
        name: "description",
        content:
          "Find flats, houses, shops and farm houses for rent across Braj. Confirm prices, availability and lease terms with the listing contact.",
      },
      { property: "og:title", content: "Homes & Shops for Rent | Braj Setu Properties" },
      {
        property: "og:description",
        content: "Explore rental homes and commercial spaces across Braj.",
      },
    ],
  }),
  component: RentPage,
});

function RentPage() {
  const { q } = Route.useSearch();
  return (
    <ListingPage
      intent="Rent"
      searchIntent="Rent"
      heading="Find your next rental."
      subheading="Browse homes and commercial spaces in Braj. Choose a location, set your budget and explore the available listings."
      initialQuery={q ?? ""}
    />
  );
}
