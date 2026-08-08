import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Mic, Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export type SearchIntent = "Buy" | "Sell" | "Rent";

const intents: SearchIntent[] = ["Buy", "Sell", "Rent"];

const intentRoute: Record<SearchIntent, "/buy" | "/sale" | "/rent"> = {
  Buy: "/buy",
  Sell: "/sale",
  Rent: "/rent",
};

interface SearchPillProps {
  variant?: "hero" | "bar";
  defaultIntent?: SearchIntent;
  defaultQuery?: string;
  onSearch?: (query: string, intent: SearchIntent) => void;
  onToggleFilters?: () => void;
  className?: string;
}

export function SearchPill({
  variant = "hero",
  defaultIntent = "Buy",
  defaultQuery = "",
  onSearch,
  onToggleFilters,
  className,
}: SearchPillProps) {
  const [intent, setIntent] = useState<SearchIntent>(defaultIntent);
  const [query, setQuery] = useState(defaultQuery);
  const navigate = useNavigate();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (onSearch) {
      onSearch(query, intent);
      return;
    }
    void navigate({ to: intentRoute[intent], search: { q: query || undefined } });
  }

  return (
    <form
      onSubmit={submit}
      className={cn(
        "w-full bg-background",
        variant === "hero"
          ? "rounded-3xl p-4 shadow-[var(--shadow-float)] sm:rounded-[2rem] sm:p-5"
          : "rounded-3xl border border-border p-3 shadow-[var(--shadow-soft)] sm:rounded-full sm:py-2 sm:pr-2 sm:pl-3",
        className,
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-3",
          variant === "bar" && "sm:flex-row sm:items-center sm:gap-2",
        )}
      >
        <div
          className={cn(
            "flex rounded-full bg-ice p-1",
            variant === "hero" ? "w-full sm:w-auto sm:self-start" : "shrink-0",
          )}
          role="tablist"
          aria-label="Search intent"
        >
          {intents.map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={intent === option}
              onClick={() => setIntent(option)}
              className={cn(
                "flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors sm:flex-none sm:px-5",
                intent === option
                  ? "bg-gold text-primary-foreground shadow-[var(--shadow-soft)]"
                  : "text-navy-soft/80 hover:text-navy",
              )}
            >
              {option}
            </button>
          ))}
        </div>

        <div
          className={cn(
            "flex items-center gap-2 rounded-full",
            variant === "hero" ? "border border-border px-4 py-2" : "flex-1 px-2",
          )}
        >
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search properties"
            placeholder="A 3 BHK flat with a school nearby, in Baner, Pune"
            className="min-h-11 min-w-0 flex-1 bg-transparent text-sm text-navy outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            aria-label="Search by voice"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:text-navy"
          >
            <Mic className="h-4 w-4" />
          </button>
          {onToggleFilters && (
            <button
              type="button"
              onClick={onToggleFilters}
              aria-label="Toggle filters"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:text-navy"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          )}
          <button
            type="submit"
            aria-label="Search"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-navy text-background transition-transform duration-200 hover:scale-[1.02]"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </form>
  );
}
