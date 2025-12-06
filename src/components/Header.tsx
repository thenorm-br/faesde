import { Phone, Mail, Clock, Facebook, Instagram, Linkedin, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navLinks = [
  { label: "Home", href: "#" },
  { label: "Quem somos", href: "#about" },
  { label: "Cursos", href: "#courses" },
  { label: "Processo seletivo", href: "#" },
  { label: "Perguntas frequentes", href: "#" },
  { label: "Blog", href: "#blog" },
  { label: "Contato", href: "#contact" },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Bar */}
      <div className="bg-faesde-blue-dark py-2 text-sm text-primary-foreground/90">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-4">
            <a href="tel:+552722378054" className="flex items-center gap-1.5 transition-colors hover:text-primary-foreground">
              <Phone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">+55 (27) 2237-8054</span>
            </a>
            <a href="mailto:contato@faesde.com" className="flex items-center gap-1.5 transition-colors hover:text-primary-foreground">
              <Mail className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">contato@faesde.com</span>
            </a>
            <span className="hidden items-center gap-1.5 md:flex">
              <Clock className="h-3.5 w-3.5" />
              Seg - Sex: 9h - 17h | Sáb: 9h - 12h
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#" className="transition-opacity hover:opacity-80" aria-label="Facebook">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="#" className="transition-opacity hover:opacity-80" aria-label="Instagram">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" className="transition-opacity hover:opacity-80" aria-label="LinkedIn">
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto flex items-center justify-between py-3">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="flex items-center">
              <div className="relative h-10 w-10">
                <div className="absolute inset-0 rotate-45 rounded-sm bg-faesde-red" />
                <div className="absolute inset-1 rotate-45 rounded-sm bg-primary" />
                <div className="absolute inset-2 rotate-45 rounded-sm bg-faesde-red" />
              </div>
              <span className="ml-2 text-xl font-extrabold tracking-tight text-primary">
                FAESDE
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-6 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-foreground/80 transition-colors hover:text-accent"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="hidden rounded-full border-primary font-semibold text-primary hover:bg-primary hover:text-primary-foreground sm:flex"
            >
              Minha Conta
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="border-t border-border bg-card p-4 lg:hidden">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-accent"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <Button className="mt-2 w-full rounded-full bg-accent font-semibold text-accent-foreground hover:bg-faesde-orange-dark">
                Minha Conta
              </Button>
            </nav>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
