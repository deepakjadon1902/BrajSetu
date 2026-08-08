import { createFileRoute } from "@tanstack/react-router";
import { ListingPage } from "@/components/ListingPage";

export const Route = createFileRoute("/rent")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? (search["q"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Homes & Shops for Rent | PropVista" },
      {
        name: "description",
        content:
          "Find flats, houses, shops and farm houses on rent with transparent pricing, verified owners and flexible lease terms.",
      },
      { property: "og:title", content: "Homes & Shops for Rent | PropVista" },
      {
        property: "og:description",
        content: "Rental homes and commercial spaces with verified owners and clear terms.",
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
      heading="Rent something you'll want to stay in"
      subheading="Long-lease homes and commercial spaces, each one photographed and inspected by a PropVista advisor."
      initialQuery={q ?? ""}
    />
  );
}
