import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/AdminShell";
import { uid, useStore } from "@/lib/mock-store";
import type { NewsArticle } from "@/types/property";

export const Route = createFileRoute("/admin/news")({
  head: () => ({
    meta: [
      { title: "News | Braj Setu Admin" },
      {
        name: "description",
        content: "Publish and edit the market insight articles shown on Braj Setu Properties.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "News | Braj Setu Admin" },
      { property: "og:description", content: "Manage Braj Setu Properties market insights." },
    ],
  }),
  component: AdminNews,
});

const inputClass =
  "w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm text-navy outline-none focus:border-navy";

function emptyArticle(): NewsArticle {
  return {
    id: uid("n"),
    title: "",
    excerpt: "",
    date: new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    image: "",
  };
}

function AdminNews() {
  const { news, saveNews, deleteNews } = useStore();
  const [draft, setDraft] = useState<NewsArticle | null>(null);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    if (!draft.title.trim() || !draft.excerpt.trim()) {
      toast.error("Title and excerpt are required.");
      return;
    }
    saveNews(draft);
    toast.success("Article saved.");
    setDraft(null);
  }

  return (
    <AdminShell
      permission="news"
      title="News & insights"
      description="Short market notes surfaced on the homepage carousel."
      actions={
        <button
          type="button"
          onClick={() => setDraft(emptyArticle())}
          className="flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-background"
        >
          <Plus className="h-4 w-4" /> New article
        </button>
      }
    >
      {draft ? (
        <form
          onSubmit={onSubmit}
          className="mb-6 grid gap-4 rounded-3xl border border-border bg-card p-6 sm:grid-cols-2"
        >
          <input
            className={`${inputClass} sm:col-span-2`}
            placeholder="Headline"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />
          <textarea
            className={`${inputClass} sm:col-span-2`}
            rows={3}
            placeholder="Excerpt"
            value={draft.excerpt}
            onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder="Date"
            value={draft.date}
            onChange={(e) => setDraft({ ...draft, date: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder="Image URL"
            value={draft.image}
            onChange={(e) => setDraft({ ...draft, image: e.target.value })}
          />
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button
              type="submit"
              className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-background"
            >
              Save article
            </button>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-navy"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {news.map((article) => (
          <article
            key={article.id}
            className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card"
          >
            {article.image ? (
              <img
                src={article.image}
                alt={article.title}
                loading="lazy"
                className="h-36 w-full object-cover"
              />
            ) : null}
            <div className="flex flex-1 flex-col p-5">
              <p className="text-xs text-muted-foreground">{article.date}</p>
              <h2 className="mt-2 text-sm font-bold text-navy">{article.title}</h2>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">
                {article.excerpt}
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setDraft(article)}
                  className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-navy hover:bg-ice"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteNews(article.id);
                    toast.success("Article deleted.");
                  }}
                  className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-destructive hover:bg-ice"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
