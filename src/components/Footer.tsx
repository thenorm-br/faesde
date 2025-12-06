import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-faesde-blue-dark text-primary-foreground">
      <div className="container mx-auto py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative h-8 w-8">
                <div className="absolute inset-0 rotate-45 rounded-sm bg-faesde-red" />
                <div className="absolute inset-0.5 rotate-45 rounded-sm bg-primary-foreground" />
                <div className="absolute inset-1.5 rotate-45 rounded-sm bg-faesde-red" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">FAESDE</span>
            </div>
            <p className="text-sm text-primary-foreground/70">
              Unindo os melhores alunos às melhores instituições de ensino desde 2015.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-4 font-semibold">Cursos</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><a href="#" className="hover:text-primary-foreground">Cursos Técnicos</a></li>
              <li><a href="#" className="hover:text-primary-foreground">Especializações</a></li>
              <li><a href="#" className="hover:text-primary-foreground">Graduação</a></li>
              <li><a href="#" className="hover:text-primary-foreground">Pós-Graduação</a></li>
            </ul>
          </div>

          {/* Institutional */}
          <div>
            <h3 className="mb-4 font-semibold">Institucional</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><a href="#" className="hover:text-primary-foreground">Quem somos</a></li>
              <li><a href="#" className="hover:text-primary-foreground">Processo seletivo</a></li>
              <li><a href="#" className="hover:text-primary-foreground">Blog</a></li>
              <li><a href="#" className="hover:text-primary-foreground">Perguntas frequentes</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-semibold">Contato</h3>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>contato@faesde.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>(27) 2237-8054</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Rua dos Ipês, 212, Coqueiral<br />Aracruz/ES</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 border-t border-primary-foreground/10 pt-6 text-center text-sm text-primary-foreground/50">
          <p>© {new Date().getFullYear()} FAESDE. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
