import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Field, inputClass } from "@/components/auth/AuthLayout";
import { PageHeader } from "@/components/PageHeader";
import { PropertyCard } from "@/components/PropertyCard";
import { useStore } from "@/lib/mock-store";
import { useSavedProperties } from "@/lib/saved-properties";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "My Profile | Braj Setu Properties" }, { name: "robots", content: "noindex" }],
  }),
  component: ProfilePage,
});
type Preferences = {
  city: string;
  locality: string;
  intent: "Buy" | "Rent" | "Sell";
  propertyType: string;
  budget: string;
  moveTimeline: string;
  notes: string;
};
const defaults: Preferences = {
  city: "",
  locality: "",
  intent: "Buy",
  propertyType: "",
  budget: "",
  moveTimeline: "",
  notes: "",
};

function ProfilePage() {
  const { currentUser, updateCurrentUser, properties, sessionHydrated } = useStore();
  const { savedIds } = useSavedProperties();
  const [form, setForm] = useState({ name: "", phone: "" });
  const [preferences, setPreferences] = useState<Preferences>(defaults);
  const [saving, setSaving] = useState(false);
  const storageKey = currentUser ? "braj-setu-profile-details-" + currentUser.id : "";
  useEffect(() => {
    if (!currentUser) return;
    setForm({ name: currentUser.name, phone: currentUser.phone });
    try {
      const saved = JSON.parse(
        window.localStorage.getItem(storageKey) || "{}",
      ) as Partial<Preferences>;
      setPreferences({ ...defaults, ...saved });
    } catch {
      setPreferences(defaults);
    }
  }, [currentUser, storageKey]);
  const savedProperties = useMemo(
    () => properties.filter((property) => savedIds.includes(property.id)),
    [properties, savedIds],
  );

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!currentUser) return;
    setSaving(true);
    try {
      await updateCurrentUser({ ...currentUser, name: form.name.trim(), phone: form.phone.trim() });
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(preferences));
      } catch {
        toast.error("Contact details saved. This browser could not store your preferences.");
        return;
      }
      toast.success("Your profile has been saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Your profile could not be saved.");
    } finally {
      setSaving(false);
    }
  }
  function set<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setPreferences((previous) => ({ ...previous, [key]: value }));
  }

  if (!sessionHydrated)
    return (
      <div className="pv-container py-12">
        <p role="status" className="text-sm text-muted-foreground">
          Loading your profile…
        </p>
      </div>
    );
  if (!currentUser)
    return (
      <div className="bg-smoke py-12 sm:py-16">
        <div className="pv-container">
          <div className="pv-panel mx-auto max-w-md p-6 sm:p-8">
            <p className="pv-eyebrow">Your account</p>
            <h1 className="mt-4 text-2xl font-semibold text-navy">Sign in to view your profile.</h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Manage your contact details and property preferences in one place.
            </p>
            <div className="mt-6 grid gap-3">
              <Link to="/login" className="pv-button-primary">
                Sign in
              </Link>
              <Link to="/register" className="pv-button-secondary">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="bg-smoke pb-12">
      <PageHeader
        eyebrow="Your account"
        title="My profile"
        description="Keep your contact details and property preferences up to date."
      />
      <div className="pv-container mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <form onSubmit={submit} className="pv-panel p-5 sm:p-7">
          <h2 className="text-lg font-semibold text-navy">Contact details</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Full name">
              <input
                autoComplete="name"
                required
                minLength={2}
                maxLength={120}
                className={inputClass}
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </Field>
            <Field label="Phone number">
              <input
                type="tel"
                autoComplete="tel"
                minLength={8}
                maxLength={20}
                className={inputClass}
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
              />
            </Field>
            <div className="sm:col-span-2">
              <p className="text-sm font-medium text-navy">Account email</p>
              <p className="mt-2 break-all text-sm text-muted-foreground">{currentUser.email}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Contact our team if you need help with your account email.
              </p>
            </div>
          </div>
          <div className="mt-7 border-t border-border pt-6">
            <h2 className="text-lg font-semibold text-navy">Property preferences</h2>
            <p className="mt-2 text-xs text-muted-foreground">
              These preferences are saved on this device.
            </p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="I want to">
                <select
                  value={preferences.intent}
                  onChange={(event) => set("intent", event.target.value as Preferences["intent"])}
                  className={inputClass}
                >
                  <option>Buy</option>
                  <option>Rent</option>
                  <option>Sell</option>
                </select>
              </Field>
              <Field label="Property type">
                <select
                  value={preferences.propertyType}
                  onChange={(event) => set("propertyType", event.target.value)}
                  className={inputClass}
                >
                  <option value="">Any property type</option>
                  {["Flat", "House", "Plot", "Shop", "Farm House"].map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </Field>
              <Field label="Preferred city">
                <input
                  className={inputClass}
                  value={preferences.city}
                  onChange={(event) => set("city", event.target.value)}
                  placeholder="For example, Vrindavan"
                />
              </Field>
              <Field label="Preferred locality">
                <input
                  className={inputClass}
                  value={preferences.locality}
                  onChange={(event) => set("locality", event.target.value)}
                />
              </Field>
              <Field label="Budget">
                <input
                  className={inputClass}
                  value={preferences.budget}
                  onChange={(event) => set("budget", event.target.value)}
                  placeholder="For example, up to ₹50 lakh"
                />
              </Field>
              <Field label="When would you like to move?">
                <input
                  className={inputClass}
                  value={preferences.moveTimeline}
                  onChange={(event) => set("moveTimeline", event.target.value)}
                  placeholder="For example, in 3 months"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Notes for your own reference">
                  <textarea
                    rows={4}
                    className={inputClass}
                    value={preferences.notes}
                    onChange={(event) => set("notes", event.target.value)}
                  />
                </Field>
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="pv-button-primary mt-6 w-full sm:w-auto"
          >
            {saving ? "Saving…" : "Save profile"}
          </button>
        </form>
        <aside className="space-y-5">
          <section className="pv-panel p-5">
            <h2 className="text-base font-semibold text-navy">Your next step</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Explore current listings or share the details of a property you would like to sell or
              rent out.
            </p>
            <div className="mt-5 grid gap-3">
              <Link
                to={preferences.intent === "Rent" ? "/rent" : "/buy"}
                search={{ q: preferences.city || undefined }}
                className="pv-button-primary"
              >
                Browse properties
              </Link>
              <Link to="/list-property" className="pv-button-secondary">
                List a property
              </Link>
            </div>
          </section>
          <section className="pv-panel p-5">
            <h2 className="text-base font-semibold text-navy">Need some help?</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Our team can help with enquiries, property visits and listing questions.
            </p>
            <Link
              to="/contact"
              className="pv-tap mt-3 inline-flex items-center text-sm font-medium text-navy underline underline-offset-4"
            >
              Contact us
            </Link>
          </section>
        </aside>
      </div>
      <section className="pv-container mt-10">
        <h2 className="text-2xl font-semibold text-navy">Saved properties</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Saved on this device. Listings may change or become unavailable.
        </p>
        {savedProperties.length ? (
          <div className="pv-property-grid mt-5">
            {savedProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">
              No saved properties are available yet. Use Save on a property page to keep it here.
            </p>
            <Link to="/buy" search={{ q: undefined }} className="pv-button-secondary mt-4">
              Explore listings
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
