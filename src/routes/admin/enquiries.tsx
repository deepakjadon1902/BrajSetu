import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/AdminShell";
import { useStore, type Enquiry } from "@/lib/mock-store";

export const Route = createFileRoute("/admin/enquiries")({
  head: () => ({
    meta: [
      { title: "Enquiries | PropVista Admin" },
      {
        name: "description",
        content: "Inbox of buyer, tenant and seller enquiries submitted on PropVista.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Enquiries | PropVista Admin" },
      { property: "og:description", content: "PropVista enquiry inbox." },
    ],
  }),
  component: AdminEnquiries,
});

const statuses: Enquiry["status"][] = ["New", "Contacted", "Closed"];

function AdminEnquiries() {
  const { enquiries, setEnquiryStatus, deleteEnquiry, properties } = useStore();
  const [filter, setFilter] = useState<"All" | Enquiry["status"]>("All");

  const visible =
    filter === "All" ? enquiries : enquiries.filter((e) => e.status === filter);

  return (
    <AdminShell
      title="Enquiries"
      description="Every lead captured from the contact form and property pages."
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {(["All", ...statuses] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFilter(option)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
              filter === option
                ? "bg-navy text-background"
                : "border border-border bg-card text-navy hover:bg-ice"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {visible.map((enquiry) => {
          const property = properties.find((p) => p.id === enquiry.propertyId);
          return (
            <article
              key={enquiry.id}
              className="rounded-3xl border border-border bg-card p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-navy">{enquiry.name}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {enquiry.email} · {enquiry.phone}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    aria-label={`Status for ${enquiry.name}`}
                    value={enquiry.status}
                    onChange={(e) =>
                      setEnquiryStatus(enquiry.id, e.target.value as Enquiry["status"])
                    }
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-navy"
                  >
                    {statuses.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    aria-label={`Delete enquiry from ${enquiry.name}`}
                    onClick={() => {
                      deleteEnquiry(enquiry.id);
                      toast.success("Enquiry deleted.");
                    }}
                    className="rounded-full border border-border p-2 text-destructive hover:bg-ice"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-navy-soft">
                {enquiry.message}
              </p>

              <p className="mt-4 text-xs text-muted-foreground">
                {new Date(enquiry.createdAt).toLocaleString("en-IN")}
                {property ? ` · ${property.title}` : ""}
              </p>
            </article>
          );
        })}
        {visible.length === 0 ? (
          <p className="rounded-3xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            No enquiries in this view.
          </p>
        ) : null}
      </div>
    </AdminShell>
  );
}
