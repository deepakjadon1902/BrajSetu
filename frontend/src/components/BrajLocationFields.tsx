import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { mathuraVillages, mathuraVrindavanWards } from "@/data/mathura-localities";
import { cn } from "@/lib/utils";
import type { Property } from "@/types/property";

// Mathura district municipalities, tehsil and block centres, and towns on the wider Braj circuit.
// https://mathura.nic.in/municipal-corporation/
// https://mathura.nic.in/subdivision-blocks/
// https://mathura.nic.in/brij-parikrama/
const towns = [
  "Mathura",
  "Vrindavan",
  "Govardhan",
  "Barsana",
  "Nandgaon",
  "Gokul",
  "Baldev",
  "Raya",
  "Chaumuha",
  "Kosi Kalan",
  "Chhata",
  "Mahavan",
  "Mant",
  "Naujheel",
  "Farah",
  "Sonkh",
  "Bajna",
  "Radha Kund",
  "Isapur Banger",
  "Deeg",
  "Kaman",
  "Bharatpur",
  "Kumher",
  "Hodal",
  "Palwal",
];

const nearbyLocalities: Record<string, readonly string[]> = {
  mathura: [
    "Holi Gate",
    "Dampier Nagar",
    "Krishna Nagar",
    "Bhuteshwar",
    "Dhauli Pyau",
    "Civil Lines",
    "Govind Nagar",
    "Krishna Janmabhoomi",
    "Vishram Ghat",
    "Yamuna Kinara",
    "Masani",
    "Sadar Bazaar",
    "Aurangabad",
    "Refinery Nagar",
    "Janmabhoomi Link Road",
    "Raya Road",
    "Ganeshra",
    "Maholi",
    "Narholi",
    "Bakalpur",
    "Pali Khera",
    "NH-19",
    ...mathuraVrindavanWards,
  ],
  vrindavan: [
    "Raman Reti",
    "Prem Mandir Road",
    "ISKCON Road",
    "Chaitanya Vihar",
    "Chhatikara",
    "Chhatikara Road",
    "Sunrakh Road",
    "Parikrama Marg",
    "Banke Bihari Mandir",
    "Moti Jheel",
    "Atalla Chungi",
    "Gaura Nagar",
    "Radha Niwas",
    "Radhika Vihar",
    "Kesi Ghat",
    "Vidyapeeth Chauraha",
    "Seva Kunj",
    "Nidhivan",
    "Rajpur Bangar",
    "Jait",
    "Sunrakh Bangar",
    "Sakaraya",
    "Yamuna Kinara",
  ],
  govardhan: [
    "Radha Kund Road",
    "Jatipura",
    "Kusum Sarovar",
    "Manasi Ganga",
    "Aanyor",
    "Deeg Road",
  ],
  barsana: [
    "Barsana Road",
    "Rangeeli Mahal Road",
    "Ladli Ji Temple Road",
    "Sankari Khor",
    "Priya Kund",
    "Mor Kuti",
  ],
  nandgaon: ["Nand Bhavan", "Pavan Sarovar", "Kokilavan", "Kadam Khandi"],
  gokul: ["Raman Reti", "Gokul Barrage", "Brahmand Ghat", "Chaurasi Khamba"],
  mahavan: ["Raman Reti", "Brahmand Ghat", "Chaurasi Khamba"],
  baldev: ["Dauji Temple", "Kshir Sagar", "Raya Road"],
  chaumuha: ["Ajhai Kalan", "Ajhai Khurd", "Jait", "NH-19"],
  raya: ["Raya Road", "Yamuna Expressway", "Sonai", "Bisawar"],
  deeg: ["Deeg Palace", "Poonchri", "Poonchri Ka Lautha", "Govardhan Road"],
  kaman: ["Kamaban", "Vimala Kund", "Charan Pahari", "Chaurasi Khamba"],
  hodal: ["Bulwana", "Anjani Kund", "Dabchick", "Sati Temple"],
};

const localities = [
  ...new Set([
    ...towns,
    ...Object.values(nearbyLocalities).flat(),
    "Aading",
    "Basonti",
    "Jachonda",
    "Khamini",
    "Ral",
    "Mathura-Vrindavan Road",
    ...mathuraVillages,
  ]),
].sort((a, b) => a.localeCompare(b, "en-IN"));

export function BrajLocationFields({
  location,
  onChange,
  inputClassName,
  labelClassName,
}: {
  location: Property["location"];
  onChange: (location: Property["location"]) => void;
  inputClassName: string;
  labelClassName: string;
}) {
  const hintId = useId();
  const city = location.city.trim().toLowerCase();
  const nearby = Object.hasOwn(nearbyLocalities, city) ? nearbyLocalities[city] : undefined;
  const localityOptions = useMemo(
    () => (nearby ? [...new Set([...nearby, ...localities])] : localities),
    [nearby],
  );

  return (
    <>
      <LocationDropdown
        label="Main city or town"
        value={location.city}
        onChange={(city) => onChange({ ...location, city })}
        options={towns}
        placeholder="e.g. Vrindavan"
        maxLength={80}
        hintId={hintId}
        inputClassName={inputClassName}
        labelClassName={labelClassName}
      />
      <LocationDropdown
        label="Locality or village"
        value={location.locality}
        onChange={(locality) => onChange({ ...location, locality })}
        options={localityOptions}
        placeholder="e.g. Raman Reti"
        maxLength={120}
        hintId={hintId}
        inputClassName={inputClassName}
        labelClassName={labelClassName}
      />
      <p id={hintId} className="text-xs text-muted-foreground sm:col-span-2">
        Open the list to browse, type to search, or enter your exact location.
      </p>
    </>
  );
}

function LocationDropdown({
  label,
  value,
  onChange,
  options,
  placeholder,
  maxLength,
  hintId,
  inputClassName,
  labelClassName,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder: string;
  maxLength: number;
  hintId: string;
  inputClassName: string;
  labelClassName: string;
}) {
  const id = useId();
  const listId = `${id}-locations`;
  const anchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const matches = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? options.filter((name) => name.toLowerCase().includes(query)) : options;
  }, [options, search]);

  useEffect(() => {
    if (open && activeIndex >= 0) {
      listRef.current?.children.item(activeIndex)?.scrollIntoView({ block: "nearest" });
    }
  }, [open, activeIndex]);

  function changeOpen(next: boolean) {
    setOpen(next);
    setSearch("");
    setActiveIndex(-1);
  }

  function selectLocation(name: string) {
    onChange(name);
    changeOpen(false);
    inputRef.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) changeOpen(true);
      if (matches.length === 0) return;
      const last = matches.length - 1;
      if (event.key === "ArrowDown") setActiveIndex(Math.min(activeIndex + 1, last));
      else setActiveIndex(activeIndex < 0 ? last : Math.max(activeIndex - 1, 0));
    } else if (open && event.key === "Enter") {
      event.preventDefault();
      const selected = matches[activeIndex];
      if (selected) selectLocation(selected);
      else changeOpen(false);
    } else if (open && event.key === "Escape") {
      event.preventDefault();
      changeOpen(false);
    } else if (open && event.key === "Tab") {
      changeOpen(false);
    }
  }

  return (
    <div className="min-w-0">
      <label id={`${id}-label`} htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <Popover open={open} onOpenChange={changeOpen}>
        <PopoverAnchor asChild>
          <div className="relative" ref={anchorRef}>
            <input
              ref={inputRef}
              id={id}
              className={cn(inputClassName, "pr-11")}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={open}
              aria-controls={open ? listId : undefined}
              aria-activedescendant={
                open && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined
              }
              aria-describedby={hintId}
              value={value}
              onClick={() => {
                if (!open) changeOpen(true);
              }}
              onChange={(event) => {
                const text = event.target.value;
                onChange(text);
                setSearch(text);
                setActiveIndex(-1);
                setOpen(true);
              }}
              onKeyDown={onKeyDown}
              placeholder={placeholder}
              autoComplete="off"
              minLength={2}
              maxLength={maxLength}
              required
            />
            <PopoverTrigger asChild>
              <button
                type="button"
                tabIndex={-1}
                aria-label={`Browse ${label.toLowerCase()} options`}
                aria-haspopup="listbox"
                aria-controls={open ? listId : undefined}
                className="absolute right-1 bottom-1 grid size-9 cursor-pointer place-items-center rounded-md text-navy-soft hover:bg-ice hover:text-navy"
              >
                <ChevronDown aria-hidden="true" className={cn("size-4", open && "rotate-180")} />
              </button>
            </PopoverTrigger>
          </div>
        </PopoverAnchor>
        <PopoverContent
          ref={listRef}
          id={listId}
          role="listbox"
          aria-labelledby={`${id}-label`}
          align="start"
          collisionPadding={12}
          className="z-[70] max-h-[min(18rem,var(--radix-popover-content-available-height))] w-[var(--radix-popover-trigger-width)] overflow-y-auto overscroll-contain rounded-lg border-border bg-card p-1 text-navy"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onInteractOutside={(event) => {
            if (anchorRef.current?.contains(event.target as Node)) event.preventDefault();
          }}
        >
          {matches.map((name, index) => (
            <div
              key={name}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className="flex min-h-9 cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 text-sm hover:bg-ice aria-selected:bg-ice"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectLocation(name)}
            >
              {name}
              {name === value && <Check aria-hidden="true" className="size-4 shrink-0" />}
            </div>
          ))}
          {matches.length === 0 && (
            <p role="status" className="px-3 py-2 text-sm text-muted-foreground">
              Press Enter to keep the location you typed.
            </p>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
