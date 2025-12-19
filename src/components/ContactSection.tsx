import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    curso: "",
    mensagem: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    nome: "",
    telefone: "",
  });

  // Format phone number as (00) 00000-0000
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    if (numbers.length === 0) return "";
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  };

  // Validate email with @ and TLD
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(email);
  };

  // Validate name has at least two words (first and last name)
  const validateName = (name: string) => {
    const trimmed = name.trim();
    const words = trimmed.split(/\s+/).filter(word => word.length > 0);
    return words.length >= 2;
  };

  // Validate phone has 11 digits
  const validatePhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, "");
    return numbers.length === 11;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, telefone: formatted }));
    
    if (formatted && !validatePhone(formatted)) {
      setErrors(prev => ({ ...prev, telefone: "Telefone deve ter 11 dígitos" }));
    } else {
      setErrors(prev => ({ ...prev, telefone: "" }));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, email: value }));
    
    if (value && !validateEmail(value)) {
      setErrors(prev => ({ ...prev, email: "Email inválido (deve conter @ e domínio)" }));
    } else {
      setErrors(prev => ({ ...prev, email: "" }));
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, nome: value }));
    
    if (value && !validateName(value)) {
      setErrors(prev => ({ ...prev, nome: "Informe nome e sobrenome" }));
    } else {
      setErrors(prev => ({ ...prev, nome: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate all fields
    const emailValid = validateEmail(formData.email);
    const nameValid = validateName(formData.nome);
    const phoneValid = !formData.telefone || validatePhone(formData.telefone);
    
    setErrors({
      email: emailValid ? "" : "Email inválido (deve conter @ e domínio)",
      nome: nameValid ? "" : "Informe nome e sobrenome",
      telefone: phoneValid ? "" : "Telefone deve ter 11 dígitos",
    });
    
    if (emailValid && nameValid && phoneValid) {
      // Submit form via fetch
      const form = e.currentTarget;
      const formDataObj = new FormData(form);
      
      try {
        await fetch(form.action, {
          method: "POST",
          body: formDataObj,
          mode: "no-cors",
        });
        
        // Redirect to WhatsApp after successful submission
        window.location.href = "https://mensagem.faesde.com.br/";
      } catch (error) {
        console.error("Erro ao enviar formulário:", error);
      }
    }
  };

  return (
    <section id="contact" className="py-16 md:py-20">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
            Entre em contato
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Tire suas dúvidas sobre nossos cursos. Nossa equipe está pronta para ajudar você.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Form - Mautic Integration */}
          <div className="rounded-2xl bg-card p-6 shadow-card md:p-8">
            <h3 className="mb-6 text-xl font-bold text-foreground">
              Envie sua mensagem
            </h3>
            <form
              autoComplete="off"
              role="form"
              method="post"
              action="http://mautic.faesde.com.br/form/submit?formId=1"
              id="mauticform_cursotecnicoonlinecom"
              data-mautic-form="cursotecnicoonlinecom"
              encType="multipart/form-data"
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <input type="hidden" name="mauticform[formId]" value="1" />
              <input type="hidden" name="mauticform[return]" value="" />
              <input type="hidden" name="mauticform[formName]" value="cursotecnicoonlinecom" />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Nome *
                  </label>
                  <Input
                    type="text"
                    name="mauticform[nome]"
                    value={formData.nome}
                    onChange={handleNameChange}
                    placeholder="Seu nome"
                    className={`h-11 ${errors.nome ? "border-destructive" : ""}`}
                    required
                  />
                  {errors.nome && (
                    <p className="mt-1 text-sm text-destructive">{errors.nome}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Email *
                  </label>
                  <Input
                    type="email"
                    name="mauticform[email]"
                    value={formData.email}
                    onChange={handleEmailChange}
                    placeholder="seu@email.com"
                    className={`h-11 ${errors.email ? "border-destructive" : ""}`}
                    required
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Telefone
                  </label>
                  <Input
                    type="tel"
                    name="mauticform[telefone]"
                    value={formData.telefone}
                    onChange={handlePhoneChange}
                    placeholder="(00) 00000-0000"
                    className={`h-11 ${errors.telefone ? "border-destructive" : ""}`}
                  />
                  {errors.telefone && (
                    <p className="mt-1 text-sm text-destructive">{errors.telefone}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Curso de interesse
                  </label>
                  <Input
                    type="text"
                    name="mauticform[curso]"
                    value={formData.curso}
                    onChange={(e) => setFormData(prev => ({ ...prev, curso: e.target.value }))}
                    placeholder="Ex: Segurança do Trabalho"
                    className="h-11"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Mensagem *
                </label>
                <Textarea
                  name="mauticform[mensagem]"
                  value={formData.mensagem}
                  onChange={(e) => setFormData(prev => ({ ...prev, mensagem: e.target.value }))}
                  placeholder="Escreva sua mensagem..."
                  className="min-h-[100px]"
                  required
                />
              </div>

              <Button
                type="submit"
                className="h-11 w-full rounded-lg bg-ecid-red font-semibold text-primary-foreground hover:bg-ecid-red-light"
              >
                <Send className="mr-2 h-4 w-4" />
                Enviar Mensagem
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            {/* WhatsApp Card */}
            <a
              href="https://mensagem.faesde.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl bg-green-600 p-6 text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              <div className="flex items-center gap-4">
                <MessageCircle className="h-10 w-10" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold">Fale pelo WhatsApp</h3>
                  <p className="text-sm text-primary-foreground/80">Resposta rápida e atendimento personalizado</p>
                </div>
                <Button className="bg-primary-foreground text-green-600 hover:bg-primary-foreground/90">
                  Iniciar conversa
                </Button>
              </div>
            </a>

            {/* Contact Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-card p-5 shadow-card">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-ecid-blue-accent/10">
                  <Phone className="h-5 w-5 text-ecid-blue-accent" />
                </div>
                <h3 className="mb-2 font-bold text-foreground">Telefones</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>+55 (27) 99930-9740</p>
                  <p>+55 (27) 99661-3427</p>
                  <p>+55 (27) 2237-8054</p>
                </div>
              </div>

              <div className="rounded-2xl bg-card p-5 shadow-card">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-ecid-blue-accent/10">
                  <Clock className="h-5 w-5 text-ecid-blue-accent" />
                </div>
                <h3 className="mb-2 font-bold text-foreground">Horário</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Segunda a Sexta: 9h às 18h</p>
                  <p>Sábado: 9h às 13h</p>
                </div>
              </div>

              <div className="rounded-2xl bg-card p-5 shadow-card">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-ecid-blue-accent/10">
                  <Mail className="h-5 w-5 text-ecid-blue-accent" />
                </div>
                <h3 className="mb-2 font-bold text-foreground">Email</h3>
                <p className="text-sm text-muted-foreground">contato@faesde.com</p>
              </div>

              <div className="rounded-2xl bg-card p-5 shadow-card">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-ecid-blue-accent/10">
                  <MapPin className="h-5 w-5 text-ecid-blue-accent" />
                </div>
                <h3 className="mb-2 font-bold text-foreground">Endereço</h3>
                <p className="text-sm text-muted-foreground">
                  Rua dos Ipês, 212, Coqueiral<br />
                  Aracruz/ES
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
