import { Mail, MessageCircle, Phone } from "lucide-react";
import { useStore } from "@/lib/mock-store";
import { cn } from "@/lib/utils";

interface ContactActionsProps {
  message?: string;
  layout?: "stacked" | "row";
  className?: string;
}
export function ContactActions({
  message = "Hello, I would like to know more about a property on Braj Setu.",
  layout = "stacked",
  className,
}: ContactActionsProps) {
  const { settings } = useStore();
  const phone = settings.contactPhone.replace(/[^+\d]/g, "");
  const whatsapp = phone.replace(/\D/g, "");
  return (
    <div className={cn("grid gap-3", layout === "row" && "min-[400px]:grid-cols-2", className)}>
      {phone ? (
        <>
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="pv-button-secondary gap-2"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
          <a href={`tel:${phone}`} className="pv-button-primary gap-2">
            <Phone className="h-4 w-4" /> Call our team
          </a>
        </>
      ) : (
        <a
          href={`mailto:${settings.contactEmail}?subject=Property%20enquiry&body=${encodeURIComponent(message)}`}
          className="pv-button-primary gap-2"
        >
          <Mail className="h-4 w-4" /> Email our team
        </a>
      )}
    </div>
  );
}
