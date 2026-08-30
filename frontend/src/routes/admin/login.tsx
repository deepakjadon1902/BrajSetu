import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { useStore } from "@/lib/mock-store";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin sign in | Braj Setu Console" },
      {
        name: "description",
        content: "Restricted sign in for the Braj Setu Properties administration console.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin sign in | Braj Setu Console" },
      {
        property: "og:description",
        content: "Restricted sign in for Braj Setu Properties staff.",
      },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { adminLogin, adminUser, hydrated } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (hydrated && adminUser) navigate({ to: "/admin", replace: true });
  }, [hydrated, adminUser, navigate]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter your admin email and password.");
      return;
    }
    const result = await adminLogin(email, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success("Signed in to the admin console.");
    navigate({ to: "/admin", replace: true });
  }

  const inputClass =
    "w-full rounded-2xl border border-background/15 bg-background/5 px-4 py-3 text-sm text-background outline-none transition-colors placeholder:text-background/40 focus:border-gold";

  return (
    <div className="grid min-h-screen place-items-center bg-navy px-4 py-14">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold text-sm font-extrabold text-navy">
            BS
          </span>
          <span className="text-lg font-extrabold tracking-tight text-background">
            Braj Setu Admin
          </span>
        </div>

        <div className="mt-6 rounded-3xl border border-background/10 bg-background/5 p-7 sm:p-9">
          <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-background">
            <Lock className="h-5 w-5 text-gold" /> Restricted access
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-background/60">
            This console is separate from the public site. Only accounts with an admin role can sign
            in.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-background/60">
                Admin email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="admin@brajsetuproperties.in"
                className={`mt-2 ${inputClass}`}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-background/60">
                Password
              </span>
              <div className="relative mt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-3 grid w-8 place-items-center text-background/55 transition-colors hover:text-background"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {error ? <span className="mt-2 block text-xs text-gold">{error}</span> : null}
            </label>

            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-full bg-gold px-6 py-3.5 text-sm font-bold text-navy transition-transform duration-200 hover:scale-[1.01]"
            >
              Sign in to console
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
