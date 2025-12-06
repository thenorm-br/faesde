import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-ecid-navy text-primary-foreground">
      <div className="container mx-auto py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <span className="text-2xl font-extrabold tracking-tight">ecid</span>
            <p className="text-sm text-primary-foreground/70">
              Cursos Online de Qualificação Profissional com Certificação Válida e autorizada pelo MEC.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-4 font-semibold">Cursos</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><a href="#" className="hover:text-primary-foreground">Cursos Técnicos EAD</a></li>
              <li><a href="#" className="hover:text-primary-foreground">Certificação por Competência</a></li>
              <li><a href="#" className="hover:text-primary-foreground">Cursos Pós-Técnicos</a></li>
              <li><a href="#" className="hover:text-primary-foreground">EJA Supletivo</a></li>
            </ul>
          </div>

          {/* Institutional */}
          <div>
            <h3 className="mb-4 font-semibold">Institucional</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><a href="#" className="hover:text-primary-foreground">Sobre nós</a></li>
              <li><a href="#" className="hover:text-primary-foreground">Política de Privacidade</a></li>
              <li><a href="#" className="hover:text-primary-foreground">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-primary-foreground">Blog</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-semibold">Contato</h3>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>contato@ecid.com.br</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>(11) 9999-9999</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>São Paulo - SP, Brasil</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 border-t border-primary-foreground/10 pt-6 text-center text-sm text-primary-foreground/50">
          <p>© {new Date().getFullYear()} ECID. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
