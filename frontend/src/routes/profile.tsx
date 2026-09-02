import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Field, inputClass, primaryButtonClass } from "@/components/auth/AuthLayout";
import { SmartImage } from "@/components/SmartImage";
import { useStore, type AppUser } from "@/lib/mock-store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile | Braj Setu Properties" },
      {
        name: "description",
        content:
          "Manage your Braj Setu Properties profile, property preferences, contact details and visit support.",
      },
    ],
  }),
  component: ProfilePage,
});

type ProfileDetails = {
  city: string;
  locality: string;
  address: string;
  intent: "Buy" | "Rent" | "Sell";
  propertyType: string;
  budget: string;
  moveTimeline: string;
  familySize: string;
  occupation: string;
  visitSlot: string;
  kycStatus: "Pending" | "In Review" | "Verified";
  notes: string;
  alerts: boolean;
};

const defaultDetails: ProfileDetails = {
  city: "",
  locality: "",
  address: "",
  intent: "Buy",
  propertyType: "",
  budget: "",
  moveTimeline: "",
  familySize: "",
  occupation: "",
  visitSlot: "",
  kycStatus: "Pending",
  notes: "",
  alerts: true,
};

function storageKey(user: AppUser) {
  return `braj-setu-profile-details-${user.id}`;
}

function ProfilePage() {
  const { currentUser, updateCurrentUser, properties, enquiries } = useStore();
  const navigate = useNavigate();
  const [userForm, setUserForm] = useState({
    name: currentUser?.name ?? "",
    email: currentUser?.email ?? "",
    phone: currentUser?.phone ?? "",
  });
  const [details, setDetails] = useState<ProfileDetails>(defaultDetails);

  useEffect(() => {
    if (!currentUser) return;
    setUserForm({
      name: currentUser.name,
      email: currentUser.email,
      phone: currentUser.phone,
    });
    const saved = window.localStorage.getItem(storageKey(currentUser));
    if (saved) {
      setDetails({ ...defaultDetails, ...(JSON.parse(saved) as Partial<ProfileDetails>) });
    }
  }, [currentUser]);

  const recommended = useMemo(
    () =>
      properties
        .filter((property) => property.intent === (details.intent === "Rent" ? "Rent" : "Sale"))
        .slice(0, 3),
    [details.intent, properties],
  );

  if (!currentUser) {
    return (
      <div className="bg-[linear-gradient(135deg,#fffaf0,#f2ead7_52%,#fff7df)] py-20">
        <div className="pv-container">
          <div className="mx-auto max-w-xl rounded-xl border border-gold/25 bg-card p-8 text-center shadow-[var(--shadow-float)]">
            <p className="text-xs font-black uppercase text-gold-deep">Braj Setu Account</p>
            <h1 className="mt-5 text-3xl font-black text-navy">Sign in to view your profile</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Your profile keeps contact details, property preferences, visit support and saved
              matches in one premium Braj Setu account.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                to="/login"
                className="rounded-full bg-navy px-6 py-3 text-sm font-black text-background"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full border border-gold/35 bg-background px-6 py-3 text-sm font-black text-navy"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function setUser(key: keyof typeof userForm, value: string) {
    setUserForm((prev) => ({ ...prev, [key]: value }));
  }

  function setDetail<K extends keyof ProfileDetails>(key: K, value: ProfileDetails[K]) {
    setDetails((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!userForm.name.trim() || !userForm.email.trim() || !userForm.phone.trim()) {
      toast.error("Name, email and phone are required.");
      return;
    }
    const updatedUser = {
      ...currentUser,
      name: userForm.name.trim(),
      email: userForm.email.trim(),
      phone: userForm.phone.trim(),
    };
    await updateCurrentUser(updatedUser);
    window.localStorage.setItem(storageKey(updatedUser), JSON.stringify(details));
    toast.success("Profile updated with your latest property preferences.");
    navigate({ to: "/profile" });
  }

  return (
    <div className="bg-[linear-gradient(180deg,#fffaf0_0%,#f7f1e5_46%,#ffffff_100%)] pb-16">
      <section className="relative overflow-hidden border-b border-gold/20 bg-navy py-12 text-background">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gold" />
        <div className="pv-container">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
            <div>
              <p className="inline-flex rounded-full border border-gold/30 bg-background/10 px-4 py-2 text-xs font-black uppercase">
                Braj Setu user profile
              </p>
              <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
                {currentUser.name}
              </h1>
              <div className="mt-5 grid gap-2 text-sm text-background/84 sm:grid-cols-3">
                <span>{currentUser.email}</span>
                <span>{currentUser.phone}</span>
                <span>{details.kycStatus} profile</span>
              </div>
            </div>
            <div className="rounded-xl border border-gold/30 bg-background/10 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
              <p className="text-xs font-black uppercase text-gold">Preferred requirement</p>
              <p className="mt-2 text-2xl font-black">
                {details.intent}
                {details.propertyType ? ` ${details.propertyType}` : ""}
              </p>
              <p className="mt-2 text-sm text-background/78">
                {[details.locality, details.city, details.budget].filter(Boolean).join(" | ") ||
                  "No property requirement added yet"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="pv-container mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_23rem]">
        <main>
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { label: "Saved", value: "00" },
              { label: "Seen", value: "00" },
              { label: "Searches", value: "00" },
              { label: "Enquiries", value: String(enquiries.length).padStart(2, "0") },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-gold/20 bg-card p-4 shadow-[var(--shadow-soft)]"
              >
                <p className="text-2xl font-black text-navy">{item.value}</p>
                <p className="text-xs font-bold uppercase text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>

          <form
            onSubmit={onSubmit}
            className="mt-6 rounded-xl border border-gold/20 bg-card p-5 shadow-[var(--shadow-lift)] sm:p-7"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
              <div>
                <h2 className="text-xl font-black text-navy">Editable profile details</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Keep your contact, requirement and visit support details current.
                </p>
              </div>
              <span className="inline-flex rounded-full bg-gold/15 px-4 py-2 text-xs font-black text-gold-deep">
                Premium ready
              </span>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Field label="Full name">
                <input
                  className={inputClass}
                  value={userForm.name}
                  onChange={(e) => setUser("name", e.target.value)}
                />
              </Field>
              <Field label="Phone number">
                <input
                  className={inputClass}
                  value={userForm.phone}
                  onChange={(e) => setUser("phone", e.target.value)}
                />
              </Field>
              <Field label="Email address">
                <input
                  className={inputClass}
                  value={userForm.email}
                  onChange={(e) => setUser("email", e.target.value)}
                />
              </Field>
              <Field label="Occupation">
                <input
                  className={inputClass}
                  value={details.occupation}
                  onChange={(e) => setDetail("occupation", e.target.value)}
                />
              </Field>
              <Field label="Requirement">
                <select
                  className={inputClass}
                  value={details.intent}
                  onChange={(e) => setDetail("intent", e.target.value as ProfileDetails["intent"])}
                >
                  <option>Buy</option>
                  <option>Rent</option>
                  <option>Sell</option>
                </select>
              </Field>
              <Field label="Property type">
                <select
                  className={inputClass}
                  value={details.propertyType}
                  onChange={(e) => setDetail("propertyType", e.target.value)}
                >
                  <option>Flat</option>
                  <option>House</option>
                  <option>Plot</option>
                  <option>Shop</option>
                  <option>Farm House</option>
                </select>
              </Field>
              <Field label="Preferred city">
                <input
                  className={inputClass}
                  value={details.city}
                  onChange={(e) => setDetail("city", e.target.value)}
                />
              </Field>
              <Field label="Preferred locality">
                <input
                  className={inputClass}
                  value={details.locality}
                  onChange={(e) => setDetail("locality", e.target.value)}
                />
              </Field>
              <Field label="Budget">
                <input
                  className={inputClass}
                  value={details.budget}
                  onChange={(e) => setDetail("budget", e.target.value)}
                />
              </Field>
              <Field label="Move timeline">
                <input
                  className={inputClass}
                  value={details.moveTimeline}
                  onChange={(e) => setDetail("moveTimeline", e.target.value)}
                />
              </Field>
              <Field label="Family size">
                <input
                  className={inputClass}
                  value={details.familySize}
                  onChange={(e) => setDetail("familySize", e.target.value)}
                />
              </Field>
              <Field label="Visit slot">
                <input
                  className={inputClass}
                  value={details.visitSlot}
                  onChange={(e) => setDetail("visitSlot", e.target.value)}
                />
              </Field>
              <Field label="Current address">
                <input
                  className={inputClass}
                  value={details.address}
                  onChange={(e) => setDetail("address", e.target.value)}
                  placeholder="House, street, landmark"
                />
              </Field>
              <Field label="KYC status">
                <select
                  className={inputClass}
                  value={details.kycStatus}
                  onChange={(e) =>
                    setDetail("kycStatus", e.target.value as ProfileDetails["kycStatus"])
                  }
                >
                  <option>Pending</option>
                  <option>In Review</option>
                  <option>Verified</option>
                </select>
              </Field>
            </div>

            <Field label="Advisor notes">
              <textarea
                className={`${inputClass} min-h-28 rounded-2xl`}
                value={details.notes}
                onChange={(e) => setDetail("notes", e.target.value)}
              />
            </Field>

            <label className="mt-5 flex items-center gap-3 rounded-2xl border border-border bg-background p-4 text-sm font-bold text-navy">
              <input
                type="checkbox"
                checked={details.alerts}
                onChange={(e) => setDetail("alerts", e.target.checked)}
                className="h-4 w-4 accent-[var(--gold)]"
              />
              Send me premium match alerts and visit confirmations.
            </label>

            <button type="submit" className={`${primaryButtonClass} mt-6 sm:w-auto`}>
              Save profile
            </button>
          </form>
        </main>

        <aside className="space-y-5">
          <section className="rounded-xl border border-gold/20 bg-card p-5 shadow-[var(--shadow-lift)]">
            <h2 className="text-lg font-black text-navy">Profile completeness</h2>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-smoke">
              <div className="h-full w-[82%] rounded-full bg-gold" />
            </div>
            <div className="mt-4 grid gap-3 text-sm">
              {[
                "Contact details added",
                "Requirement preference selected",
                "Advisor notes available",
                "KYC document pending",
              ].map((item, index) => (
                <span key={item} className="flex items-center gap-2 text-navy-soft">
                  <span className="h-2 w-2 rounded-full bg-gold" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-gold/20 bg-card p-5 shadow-[var(--shadow-lift)]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-black text-navy">Recommended for you</h2>
            </div>
            <div className="mt-4 grid gap-4">
              {recommended.length > 0 ? (
                recommended.map((property) => {
                  const image = property.images[0];
                  const src = typeof image === "string" ? image : image.src;
                  return (
                    <Link
                      key={property.id}
                      to="/property/$propertyId"
                      params={{ propertyId: property.id }}
                      className="group block overflow-hidden rounded-2xl border border-border bg-background"
                    >
                      <SmartImage src={src} alt={property.title} aspect="aspect-[16/9]" />
                      <div className="p-3">
                        <p className="truncate text-sm font-black text-navy">{property.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {property.location.locality}, {property.location.city}
                        </p>
                      </div>
                    </Link>
                  );
                })
              ) : null}
            </div>
          </section>

          <section className="rounded-xl border border-gold/25 bg-background p-5">
            <h2 className="text-lg font-black text-navy">Property support desk</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Share documents, shortlist needs, preferred routes and visit windows with your Braj
              Setu advisor.
            </p>
            <Link
              to="/contact"
              className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-navy text-sm font-black text-background"
            >
              Contact advisor
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
