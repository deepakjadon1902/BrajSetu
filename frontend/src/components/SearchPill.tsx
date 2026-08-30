import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Mic, Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export type SearchIntent = "Buy" | "Sell" | "Rent";

const intents: SearchIntent[] = ["Buy", "Sell", "Rent"];
const brajAreas = ["Vrindavan", "Mathura", "Govardhan", "Barsana", "Chhatikara"];

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
  const debounceReady = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIntent(defaultIntent);
  }, [defaultIntent]);

  useEffect(() => {
    setQuery(defaultQuery);
  }, [defaultQuery]);

  useEffect(() => {
    if (variant !== "bar" || !onSearch) return;
    if (!debounceReady.current) {
      debounceReady.current = true;
      return;
    }
    const id = window.setTimeout(() => onSearch(query, intent), 300);
    return () => window.clearTimeout(id);
  }, [intent, onSearch, query, variant]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (onSearch) {
      onSearch(query, intent);
      return;
    }
    void navigate({ to: intentRoute[intent], search: { q: query || undefined } });
  }

  function chooseIntent(option: SearchIntent) {
    setIntent(option);
    if (variant === "bar" && location.pathname !== intentRoute[option]) {
      void navigate({ to: intentRoute[option], search: { q: query || undefined } });
      return;
    }
    onSearch?.(query, option);
  }

  return (
    <form
      onSubmit={submit}
      className={cn(
        "pv-smooth-state w-full bg-background/95 backdrop-blur-md",
        variant === "hero"
          ? "rounded-[1.75rem] border border-background/70 p-4 shadow-[var(--shadow-float)] sm:rounded-[2rem] sm:p-5"
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
              onClick={() => chooseIntent(option)}
              className={cn(
                "pv-smooth-state flex-1 rounded-full px-4 py-2 text-sm font-semibold sm:flex-none sm:px-5",
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
            placeholder="Plot near Prem Mandir, flat in Vrindavan, shop near Mathura Junction"
            className="min-h-11 min-w-0 flex-1 bg-transparent text-sm text-navy outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            aria-label="Search by voice"
            className="pv-smooth-state grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-navy"
          >
            <Mic className="h-4 w-4" />
          </button>
          {onToggleFilters && (
            <button
              type="button"
              onClick={onToggleFilters}
              aria-label="Toggle filters"
              className="pv-smooth-state grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-navy"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          )}
          <button
            type="submit"
            aria-label="Search"
            className="pv-smooth-state grid h-11 w-11 shrink-0 place-items-center rounded-full bg-navy text-background hover:scale-[1.02]"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      {variant === "hero" ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {brajAreas.map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => setQuery(area)}
              className="pv-smooth-state rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-navy-soft hover:border-gold hover:text-navy"
            >
              {area}
            </button>
          ))}
        </div>
      ) : null}
    </form>
  );
}
