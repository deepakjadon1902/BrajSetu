import { useEffect, useId, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type SearchIntent = "Buy" | "Sell" | "Rent";
const intents: SearchIntent[] = ["Buy", "Rent", "Sell"];
const intentRoute = { Buy: "/buy", Rent: "/rent", Sell: "/sale" } as const;

interface SearchPillProps {
  variant?: "hero" | "bar";
  defaultIntent?: SearchIntent;
  defaultQuery?: string;
  onSearch?: (query: string, intent: SearchIntent) => void;
  className?: string;
}

export function SearchPill({
  variant = "hero",
  defaultIntent = "Buy",
  defaultQuery = "",
  onSearch,
  className,
}: SearchPillProps) {
  const [intent, setIntent] = useState<SearchIntent>(defaultIntent);
  const [query, setQuery] = useState(defaultQuery);
  const inputId = useId();
  const navigate = useNavigate();

  useEffect(() => {
    setIntent(defaultIntent);
  }, [defaultIntent]);
  useEffect(() => {
    setQuery(defaultQuery);
  }, [defaultQuery]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (onSearch && intent === defaultIntent) {
      onSearch(trimmed, intent);
      return;
    }
    void navigate({
      to: intentRoute[intent],
      search: { q: intent === "Sell" ? undefined : trimmed || undefined },
    });
  }

  return (
    <form
      onSubmit={submit}
      role="search"
      aria-label="Property search"
      className={cn("min-w-0", className)}
    >
      {variant === "hero" && (
        <div
          role="group"
          aria-label="Choose buy, rent or sell"
          className="mb-3 grid grid-cols-3 gap-1 rounded-xl bg-smoke p-1 sm:mb-4"
        >
          {intents.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={intent === option}
              onClick={() => setIntent(option)}
              className={cn(
                "pv-smooth-state min-h-11 rounded-lg px-2 text-sm font-semibold",
                intent === option
                  ? "bg-card text-navy shadow-[var(--shadow-soft)]"
                  : "text-muted-foreground hover:bg-card/70 hover:text-navy",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      )}
      {intent === "Sell" ? (
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <p className="text-sm text-muted-foreground">
            List your property and connect with people looking in Braj.
          </p>
          <button type="submit" className="pv-button-primary gap-2">
            Get started <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <>
          <label htmlFor={inputId} className="sr-only">
            City, locality or property type
          </label>
          <div className="pv-smooth-state flex min-w-0 items-center gap-1 rounded-xl border border-border bg-card p-1.5 focus-within:border-navy/60 focus-within:ring-2 focus-within:ring-navy/10 sm:gap-2">
            <MapPin
              className="ml-2 hidden h-5 w-5 shrink-0 text-muted-foreground sm:block"
              aria-hidden="true"
            />
            <input
              id={inputId}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="City, locality or type"
              autoComplete="off"
              enterKeyHint="search"
              className="min-h-11 w-full min-w-0 flex-1 bg-transparent px-2 text-sm text-navy outline-none focus-visible:outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              aria-label="Search properties"
              className="pv-button-primary shrink-0 gap-2 px-3 sm:px-5"
            >
              <Search className="hidden size-4 min-[380px]:block" aria-hidden="true" />
              Search
            </button>
          </div>
        </>
      )}
    </form>
  );
}
