import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useActiveTheme } from "@/hooks/useActiveTheme";

const ExitIntentPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const { theme } = useActiveTheme();
  const [formData, setFormData] = useState({
    email: "",
    nome_completo: "",
    curso_de_interesse: "",
    telefone1: "",
    mensagem: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    nome_completo: "",
    telefone1: "",
  });

  const discount = theme?.discount_percentage || 0;
  const coupon = theme?.coupon_code;
  const hasDiscount = discount > 0 && coupon;

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    if (numbers.length === 0) return "";
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  const validateName = (name: string) => name.trim().split(/\s+/).filter(w => w.length > 0).length >= 2;
  const validatePhone = (phone: string) => phone.replace(/\D/g, "").length === 11;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, telefone1: formatted }));
    setErrors(prev => ({ ...prev, telefone1: formatted && !validatePhone(formatted) ? "Telefone deve ter 11 dígitos" : "" }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, email: value }));
    setErrors(prev => ({ ...prev, email: value && !validateEmail(value) ? "Email inválido" : "" }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, nome_completo: value }));
    setErrors(prev => ({ ...prev, nome_completo: value && !validateName(value) ? "Informe nome e sobrenome" : "" }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const emailValid = validateEmail(formData.email);
    const nameValid = validateName(formData.nome_completo);
    const phoneValid = !formData.telefone1 || validatePhone(formData.telefone1);
    setErrors({
      email: emailValid ? "" : "Email inválido",
      nome_completo: nameValid ? "" : "Informe nome e sobrenome",
      telefone1: phoneValid ? "" : "Telefone deve ter 11 dígitos",
    });
    if (!emailValid || !nameValid || !phoneValid) e.preventDefault();
  };

  useEffect(() => {
    const shown = sessionStorage.getItem("exitIntentShown");
    if (shown) { setHasShown(true); return; }
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        setIsOpen(true);
        setHasShown(true);
        sessionStorage.setItem("exitIntentShown", "true");
      }
    };
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [hasShown]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md bg-card p-0 overflow-hidden">
        <div className="bg-hero-red p-6 text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-ecid-yellow">
              {theme?.exit_popup_title || "Espere!"}
            </DialogTitle>
          </DialogHeader>
          <p className="mt-2 text-primary-foreground">
            {theme?.exit_popup_subtitle || "Não perca a oportunidade de transformar sua carreira!"}
          </p>
          {hasDiscount && (
            <p className="mt-1 text-sm text-primary-foreground/80">
              Use o cupom <span className="font-bold text-ecid-yellow">{coupon}</span> e ganhe {discount}% de desconto
            </p>
          )}
        </div>

        <div className="p-6">
          <h3 className="mb-4 text-lg font-bold text-foreground">
            Deixe seu contato e fale com um consultor
          </h3>
          <form
            autoComplete="off"
            method="post"
            action="https://mautic.faesde.com.br/form/submit?formId=2"
            id="mauticform_exit_intent"
            data-mautic-form="faesdecombr"
            encType="multipart/form-data"
            onSubmit={handleSubmit}
            className="space-y-3"
          >
            <input type="hidden" name="mauticform[formId]" value="2" />
            <input type="hidden" name="mauticform[return]" value="https://mensagem.faesde.com.br/" />
            <input type="hidden" name="mauticform[formName]" value="faesdecombr" />

            <div>
              <Input type="text" name="mauticform[nome_completo]" value={formData.nome_completo} onChange={handleNameChange} placeholder="Nome completo *" className={`h-11 ${errors.nome_completo ? "border-destructive" : ""}`} required />
              {errors.nome_completo && <p className="mt-1 text-xs text-destructive">{errors.nome_completo}</p>}
            </div>
            <div>
              <Input type="email" name="mauticform[email]" value={formData.email} onChange={handleEmailChange} placeholder="Seu email *" className={`h-11 ${errors.email ? "border-destructive" : ""}`} required />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
            </div>
            <div>
              <Input type="tel" name="mauticform[telefone1]" value={formData.telefone1} onChange={handlePhoneChange} placeholder="Telefone (00) 00000-0000" className={`h-11 ${errors.telefone1 ? "border-destructive" : ""}`} />
              {errors.telefone1 && <p className="mt-1 text-xs text-destructive">{errors.telefone1}</p>}
            </div>
            <div>
              <Input type="text" name="mauticform[curso_de_interesse]" value={formData.curso_de_interesse} onChange={(e) => setFormData(prev => ({ ...prev, curso_de_interesse: e.target.value }))} placeholder="Curso de interesse" className="h-11" />
            </div>
            <div>
              <Textarea name="mauticform[mensagem]" value={formData.mensagem} onChange={(e) => setFormData(prev => ({ ...prev, mensagem: e.target.value }))} placeholder="Sua mensagem..." className="min-h-[80px]" required />
            </div>
            <Button type="submit" name="mauticform[submit]" value="1" className="h-11 w-full rounded-lg bg-ecid-red font-semibold text-primary-foreground hover:bg-ecid-red-light">
              <Send className="mr-2 h-4 w-4" />
              Enviar
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExitIntentPopup;
