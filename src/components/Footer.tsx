import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-ecid-navy text-primary-foreground">
      <div className="container mx-auto py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <span className="text-2xl font-extrabold tracking-tight">FAESDE</span>
            <p className="text-sm text-primary-foreground/70">
              Cursos técnicos EAD autorizados pelo MEC. Formação profissional de qualidade para você conquistar seu futuro.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Courses */}
          <div>
            <h3 className="mb-4 font-semibold">Cursos</h3>
            <ul className="space-y-2.5 text-sm text-primary-foreground/70">
              <li><Link to="/cursos?categoria=tecnico" className="hover:text-primary-foreground transition-colors">Cursos Técnicos EAD</Link></li>
              <li><Link to="/cursos?categoria=competencia" className="hover:text-primary-foreground transition-colors">Certificação por Competência</Link></li>
              <li><Link to="/curso/seguranca-trabalho" className="hover:text-primary-foreground transition-colors">Segurança do Trabalho</Link></li>
              <li><Link to="/curso/eletrotecnica" className="hover:text-primary-foreground transition-colors">Eletrotécnica</Link></li>
              <li><Link to="/curso/administracao" className="hover:text-primary-foreground transition-colors">Administração</Link></li>
            </ul>
          </div>

          {/* Institutional */}
          <div>
            <h3 className="mb-4 font-semibold">Institucional</h3>
            <ul className="space-y-2.5 text-sm text-primary-foreground/70">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Sobre a FAESDE</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Como funciona</a></li>
              <li><Link to="/faq" className="hover:text-primary-foreground transition-colors">Perguntas frequentes</Link></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Política de privacidade</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Termos de uso</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-semibold">Contato</h3>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <span>contato@faesde.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
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
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/10 pt-6 text-sm text-primary-foreground/50 md:flex-row">
          <p>© {new Date().getFullYear()} FAESDE. Todos os direitos reservados.</p>
          <p>Cursos técnicos autorizados pelo MEC</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
