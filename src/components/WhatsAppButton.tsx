import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  return (
    <a
      href="https://wa.me/5527999309740"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-faesde-green px-5 py-3 font-medium text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl"
      aria-label="Fale conosco pelo WhatsApp"
    >
      <MessageCircle className="h-5 w-5" fill="currentColor" />
      <span className="hidden sm:inline">Como posso ajudar?</span>
    </a>
  );
};

export default WhatsAppButton;
