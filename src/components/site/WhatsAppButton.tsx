import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/site";

export function WhatsAppButton() {
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with OOTI on WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex size-13 items-center justify-center rounded-full bg-gold text-gold-foreground shadow-lift transition-transform hover:scale-105"
    >
      <MessageCircle className="size-6" aria-hidden="true" />
    </a>
  );
}
