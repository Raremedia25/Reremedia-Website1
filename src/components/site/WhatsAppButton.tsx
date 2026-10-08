import { MessageCircle } from "lucide-react";
import { SITE } from "@/lib/site";
import { whatsappLink } from "@/lib/utils";

export function WhatsAppButton() {
  return (
    <a
      href={whatsappLink(SITE.phone, "Hello Raremedia, I would like to discuss a project.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Raremedia on WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-transform hover:scale-105"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
