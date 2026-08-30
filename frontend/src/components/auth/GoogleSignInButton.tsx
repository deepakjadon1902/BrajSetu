import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { API_BASE, useStore } from "@/lib/mock-store";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme: "outline";
              size: "large";
              type: "standard";
              shape: "pill";
              text: "continue_with";
              width: number;
            },
          ) => void;
        };
      };
    };
  }
}

let googleScriptPromise: Promise<void> | null = null;
let googleClientIdPromise: Promise<string> | null = null;

function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!googleScriptPromise) {
    googleScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[src="https://accounts.google.com/gsi/client"]',
      );
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener(
          "error",
          () => reject(new Error("Google sign-in failed to load.")),
          {
            once: true,
          },
        );
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Google sign-in failed to load."));
      document.head.appendChild(script);
    });
  }
  return googleScriptPromise;
}

function getGoogleClientId() {
  const envClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  if (envClientId) return Promise.resolve(envClientId);
  if (!googleClientIdPromise) {
    googleClientIdPromise = fetch(`${API_BASE}/auth/google/config`)
      .then((response) => response.json())
      .then((data: { clientId?: string }) => data.clientId || "");
  }
  return googleClientIdPromise;
}

interface GoogleSignInButtonProps {
  onSuccess: () => void;
}

export function GoogleSignInButton({ onSuccess }: GoogleSignInButtonProps) {
  const { googleLogin } = useStore();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;

    async function renderGoogleButton() {
      try {
        const [clientId] = await Promise.all([getGoogleClientId(), loadGoogleScript()]);
        if (cancelled || !buttonRef.current) return;
        if (!clientId) {
          setError("Google sign-in is not configured.");
          return;
        }

        window.google?.accounts.id.initialize({
          client_id: clientId,
          callback: async ({ credential }) => {
            if (!credential) {
              toast.error("Google did not return a sign-in credential.");
              return;
            }
            const result = await googleLogin(credential);
            if (!result.ok) {
              toast.error(result.error || "Google sign-in failed.");
              return;
            }
            toast.success("Signed in with Google.");
            onSuccess();
          },
        });

        buttonRef.current.innerHTML = "";
        window.google?.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          type: "standard",
          shape: "pill",
          text: "continue_with",
          width: Math.min(400, buttonRef.current.clientWidth || 360),
        });
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error ? loadError.message : "Google sign-in failed to load.",
          );
        }
      }
    }

    void renderGoogleButton();
    return () => {
      cancelled = true;
    };
  }, [googleLogin, onSuccess]);

  if (error) {
    return (
      <p className="rounded-2xl border border-border bg-ice px-4 py-3 text-center text-xs font-medium text-navy-soft">
        {error}
      </p>
    );
  }

  return <div ref={buttonRef} className="flex min-h-11 w-full justify-center" />;
}
