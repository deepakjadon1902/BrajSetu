import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in to PropVista" },
      {
        name: "description",
        content:
          "Sign in to PropVista with Google to save searches, shortlist properties and track your enquiries.",
      },
      { property: "og:title", content: "Sign in to PropVista" },
      {
        property: "og:description",
        content: "Save searches and shortlist properties with a PropVista account.",
      },
    ],
  }),
  component: LoginPage,
});

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.45a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.65Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.92l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.95H1.26v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56V6.63H1.26a12 12 0 0 0 0 10.74l4.01-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.17 15.24 0 12 0A12 12 0 0 0 1.26 6.63l4.01 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center bg-ice py-14">
      <div className="pv-container">
        <div className="mx-auto w-full max-w-md rounded-3xl bg-card p-7 shadow-[var(--shadow-lift)] sm:p-10">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy text-sm font-extrabold text-background">
              PV
            </span>
            <span className="text-lg font-extrabold tracking-tight text-navy">
              PropVista
            </span>
          </div>

          <h1 className="mt-8 text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
            Sign in to continue
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Save searches, shortlist properties and pick up enquiries where you left
            them. One account, no passwords to remember.
          </p>

          <button
            type="button"
            className="pv-tap mt-8 flex w-full items-center justify-center gap-3 rounded-full border border-border bg-background px-6 text-sm font-semibold text-navy shadow-[var(--shadow-soft)] transition-transform duration-200 hover:scale-[1.01]"
          >
            <GoogleMark />
            Continue with Google
          </button>

          <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
            We only read your name and email address. We never post anything on your
            behalf.
          </p>

          <p className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground">
            By continuing you agree to our{" "}
            <Link to="/terms" className="font-semibold text-navy hover:text-gold-deep">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="font-semibold text-navy hover:text-gold-deep">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
