import { Search, ShoppingCart, User, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-ecid-navy">
      <div className="container mx-auto flex items-center justify-between py-4">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl font-extrabold tracking-tight text-primary-foreground">
            FAESDE
          </span>
        </a>

        {/* Categories Dropdown - Desktop */}
        <div className="hidden items-center gap-2 lg:flex">
          <Button
            variant="ghost"
            className="text-primary-foreground/90 hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            Categorias
            <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden flex-1 max-w-md mx-8 lg:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar cursos..."
              className="h-10 w-full rounded-lg border-0 bg-card pl-10 pr-4 text-sm"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            className="hidden rounded-lg bg-ecid-blue-accent px-6 font-semibold text-primary-foreground hover:bg-ecid-blue-accent/90 sm:flex"
          >
            Fale conosco
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <ShoppingCart className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <User className="h-5 w-5" />
          </Button>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t border-primary-foreground/10 bg-ecid-navy p-4 lg:hidden">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar cursos..."
                className="h-10 w-full rounded-lg border-0 bg-card pl-10 pr-4 text-sm"
              />
            </div>
          </div>
          <nav className="flex flex-col gap-2">
            <a
              href="#courses"
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Cursos Técnicos EAD
            </a>
            <a
              href="#courses"
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Certificação por Competência
            </a>
            <a
              href="#contact"
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Contato
            </a>
            <Button className="mt-2 w-full rounded-lg bg-ecid-blue-accent font-semibold text-primary-foreground">
              Fale conosco
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
