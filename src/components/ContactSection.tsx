import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const ContactSection = () => {
  return (
    <section id="contact" className="py-16 md:py-24">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-primary md:text-4xl">Contato</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Entre em contato conosco e tire suas dúvidas sobre nossos cursos.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Form */}
          <div className="rounded-2xl bg-card p-8 shadow-sm">
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
                    className="h-12"
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
                    className="h-12"
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
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Assunto
                  </label>
                  <Input
                    type="text"
                    placeholder="Assunto da mensagem"
                    className="h-12"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Mensagem *
                </label>
                <Textarea
                  placeholder="Escreva sua mensagem..."
                  className="min-h-[120px]"
                  required
                />
              </div>
              <Button
                type="submit"
                className="h-12 w-full rounded-full bg-accent font-semibold text-accent-foreground shadow-orange hover:bg-faesde-orange-dark"
              >
                <Send className="mr-2 h-4 w-4" />
                Enviar Mensagem
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            {/* Phones */}
            <div className="rounded-2xl bg-card p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                <Phone className="h-5 w-5 text-accent" />
                Telefones
              </h3>
              <div className="space-y-2 text-muted-foreground">
                <p>+55(27)99930-9740</p>
                <p>+55(27)99661-3427</p>
                <p>+55(27)98892-0031 - Secretaria 1</p>
                <p>+55(27)99720-3344 - Secretaria 2</p>
                <p>+55(27)2237-8054</p>
              </div>
            </div>

            {/* Hours */}
            <div className="rounded-2xl bg-card p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                <Clock className="h-5 w-5 text-accent" />
                Horário Comercial
              </h3>
              <div className="space-y-1 text-muted-foreground">
                <p>Segunda a sexta: 9h às 18h</p>
                <p>Sábado: 9h às 13h</p>
              </div>
            </div>

            {/* Address */}
            <div className="rounded-2xl bg-card p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                <MapPin className="h-5 w-5 text-accent" />
                Unidade Aracruz
              </h3>
              <p className="text-muted-foreground">
                Rua dos Ipês, 212, Coqueiral<br />
                Aracruz/ES, CEP 29199-144
              </p>
            </div>

            {/* Newsletter */}
            <div className="rounded-2xl bg-primary p-6 text-primary-foreground">
              <h3 className="mb-2 text-lg font-bold">
                Receba os nossos informativos
              </h3>
              <p className="mb-4 text-sm text-primary-foreground/80">
                Fique por dentro de cursos altamente lucrativos e receba dicas exclusivas.
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Seu email"
                  className="h-11 border-0 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50"
                />
                <Button className="h-11 shrink-0 bg-accent font-semibold text-accent-foreground hover:bg-faesde-orange-dark">
                  Cadastrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
