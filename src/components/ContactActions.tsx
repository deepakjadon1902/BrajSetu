import { MessageCircle, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

const PHONE = "+919000000000";
const WHATSAPP = "919000000000";

interface ContactActionsProps {
  message?: string;
  layout?: "stacked" | "row";
  className?: string;
}

export function ContactActions({
  message = "Hi PropVista, I'd like to know more about a property listed on your site.",
  layout = "stacked",
  className,
}: ContactActionsProps) {
  return (
    <div className={cn("flex gap-3", layout === "stacked" ? "flex-col" : "flex-row", className)}>
      <a
        href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="pv-tap flex flex-1 items-center justify-center gap-2 rounded-full bg-gold px-5 text-sm font-semibold text-primary-foreground transition-transform duration-200 hover:scale-[1.02]"
      >
        <MessageCircle className="h-4 w-4" />
        WhatsApp
      </a>
      <a
        href={`tel:${PHONE}`}
        className="pv-tap flex flex-1 items-center justify-center gap-2 rounded-full bg-navy px-5 text-sm font-semibold text-background transition-transform duration-200 hover:scale-[1.02]"
      >
        <Phone className="h-4 w-4" />
        Call now
      </a>
    </div>
  );
}
