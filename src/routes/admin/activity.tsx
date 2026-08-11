import { createFileRoute } from "@tanstack/react-router";
import { History, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/AdminShell";
import { useStore, type ActivityArea } from "@/lib/mock-store";

export const Route = createFileRoute("/admin/activity")({
  head: () => ({
    meta: [
      { title: "Activity Log | PropVista Admin" },
      {
        name: "description",
        content:
          "Audit trail of admin changes plus settings version history with one-click rollback.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Activity Log | PropVista Admin" },
      { property: "og:description", content: "Who changed what, and when." },
    ],
  }),
  component: AdminActivity,
});

const areas: Array<ActivityArea | "All"> = [
  "All",
  "Settings",
  "Properties",
  "Users",
  "Enquiries",
  "News",
  "Auth",
];

function when(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function AdminActivity() {
  const { activity, settingsHistory, restoreSettingsVersion, clearActivity } = useStore();
  const [area, setArea] = useState<ActivityArea | "All">("All");

  const rows = area === "All" ? activity : activity.filter((a) => a.area === area);

  return (
    <AdminShell
      permission="activity"
      title="Activity & versions"
      description="Every admin change is recorded here, and settings can be rolled back to any earlier version."
      actions={
        <button
          type="button"
          onClick={() => {
            clearActivity();
            toast.success("Activity log cleared.");
          }}
          className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-navy"
        >
          <Trash2 className="h-4 w-4" /> Clear log
        </button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="rounded-3xl border border-border bg-background p-6">
          <div className="flex flex-wrap items-center gap-2">
            {areas.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setArea(item)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                  area === item
                    ? "bg-navy text-background"
                    : "border border-border text-navy"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {rows.length === 0 ? (
            <p className="mt-8 text-sm text-muted-foreground">
              No activity recorded yet. Changes you make in the admin console appear here.
            </p>
          ) : (
            <ul className="mt-6 space-y-3">
              {rows.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-2xl border border-border/70 bg-smoke/40 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-navy/10 px-3 py-1 text-[11px] font-semibold text-navy">
                      {entry.area}
                    </span>
                    <p className="text-sm font-semibold text-navy">{entry.action}</p>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {when(entry.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{entry.detail}</p>
                  <p className="mt-1 text-xs text-muted-foreground">by {entry.actor}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-3xl border border-border bg-background p-6">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-gold" />
            <h2 className="text-base font-bold text-navy">Settings version history</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Each save stores the previous configuration so you can roll back.
          </p>

          {settingsHistory.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              No earlier versions yet — save a settings change to create one.
            </p>
          ) : (
            <ul className="mt-5 space-y-3">
              {settingsHistory.map((version) => (
                <li
                  key={version.id}
                  className="rounded-2xl border border-border/70 p-4"
                >
                  <p className="text-sm font-semibold text-navy">
                    {version.settings.siteName} · {version.summary}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {when(version.createdAt)} · by {version.actor}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      restoreSettingsVersion(version.id);
                      toast.success("Rolled back to the selected version.");
                    }}
                    className="mt-3 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold text-navy"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Roll back to this
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
