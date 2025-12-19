import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const ContactSection = () => {
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
          {/* Form */}
          <div className="rounded-2xl bg-card p-6 shadow-card md:p-8">
            <h3 className="mb-6 text-xl font-bold text-foreground">
              Envie sua mensagem
            </h3>
            <form className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Nome *
                  </label>
                  <Input
                    type="text"
                    placeholder="Seu nome"
                    className="h-11"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Email *
                  </label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    className="h-11"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Telefone
                  </label>
                  <Input
                    type="tel"
                    placeholder="(00) 00000-0000"
                    className="h-11"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Curso de interesse
                  </label>
                  <Input
                    type="text"
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
