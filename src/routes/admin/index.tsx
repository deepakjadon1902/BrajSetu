import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Mail, Newspaper, TrendingUp, Users } from "lucide-react";

import { AdminShell } from "@/components/admin/AdminShell";
import { formatPrice } from "@/lib/api";
import { useStore } from "@/lib/mock-store";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard | PropVista Admin" },
      {
        name: "description",
        content: "Overview of listings, users, enquiries and news for PropVista staff.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Dashboard | PropVista Admin" },
      { property: "og:description", content: "PropVista administration overview." },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { properties, users, enquiries, news, can } = useStore();

  const allStats = [
    {
      label: "Listings",
      value: properties.length,
      hint: `${properties.filter((p) => p.featured).length} featured`,
      icon: Building2,
      to: "/admin/properties",
      permission: "properties" as const,
    },
    {
      label: "Registered users",
      value: users.filter((u) => u.role === "user").length,
      hint: `${users.filter((u) => u.role === "admin").length} admins`,
      icon: Users,
      to: "/admin/users",
      permission: "users" as const,
    },
    {
      label: "Enquiries",
      value: enquiries.length,
      hint: `${enquiries.filter((e) => e.status === "New").length} unread`,
      icon: Mail,
      to: "/admin/enquiries",
      permission: "enquiries" as const,
    },
    {
      label: "News articles",
      value: news.length,
      hint: "Published",
      icon: Newspaper,
      to: "/admin/news",
      permission: "news" as const,
    },
  ] as const;

  const stats = allStats.filter((stat) => can(stat.permission));

  const forSale = properties.filter((p) => p.intent === "Sale");
  const avgPrice =
    forSale.length > 0
      ? Math.round(forSale.reduce((sum, p) => sum + p.price, 0) / forSale.length)
      : 0;

  return (
    <AdminShell
      permission="dashboard"
      title="Dashboard"
      description="A live snapshot of the PropVista marketplace."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.to}
            className="rounded-3xl border border-border bg-card p-6 transition-shadow hover:shadow-[var(--shadow-lift)]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </span>
              <stat.icon className="h-4 w-4 text-gold-deep" />
            </div>
            <p className="mt-4 text-3xl font-extrabold tracking-tight text-navy">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-6 lg:col-span-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-navy">Latest enquiries</h2>
          <ul className="mt-4 divide-y divide-border">
            {enquiries.slice(0, 5).map((enquiry) => (
              <li key={enquiry.id} className="flex items-start gap-4 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-navy">{enquiry.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {enquiry.message}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-ice px-3 py-1 text-[11px] font-semibold text-navy">
                  {enquiry.status}
                </span>
              </li>
            ))}
            {enquiries.length === 0 ? (
              <li className="py-6 text-sm text-muted-foreground">No enquiries yet.</li>
            ) : null}
          </ul>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-navy">
            <TrendingUp className="h-4 w-4 text-gold-deep" /> Portfolio
          </h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Avg. sale price</dt>
              <dd className="font-semibold text-navy">{formatPrice(avgPrice)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">For sale</dt>
              <dd className="font-semibold text-navy">{forSale.length}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">For rent</dt>
              <dd className="font-semibold text-navy">
                {properties.filter((p) => p.intent === "Rent").length}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Suspended users</dt>
              <dd className="font-semibold text-navy">
                {users.filter((u) => u.status === "Suspended").length}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </AdminShell>
  );
}
