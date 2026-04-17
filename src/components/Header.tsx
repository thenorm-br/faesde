import { Search, User, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/logo.webp";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/cursos?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
    }
  };

  const scrollToContact = () => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-ecid-navy">
      <div className="container mx-auto flex items-center justify-between py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src={logo} alt="FAESDE" className="h-10" />
        </Link>

        {/* Categories Dropdown - Desktop */}
        <div className="hidden items-center gap-2 lg:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="text-primary-foreground/90 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                Categorias
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/cursos">Todos os Cursos</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/cursos?categoria=extensao">Cursos por Extensão EAD</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/cursos?categoria=competencia">Certificação por Competência</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/cursos?categoria=pos-tecnico">Cursos Pós-Técnicos</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Link 
            to="/faq" 
            className="rounded-lg px-4 py-2 text-sm font-medium text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            FAQ
          </Link>
        </div>

        {/* Search Bar - Desktop */}
        <form onSubmit={handleSearch} className="hidden flex-1 max-w-md mx-8 lg:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar cursos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border-0 bg-card pl-10 pr-4 text-sm"
            />
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            onClick={scrollToContact}
            className="hidden rounded-lg bg-ecid-blue-accent px-6 font-semibold text-primary-foreground hover:bg-ecid-blue-accent/90 sm:flex"
          >
            Fale conosco
          </Button>
          
          <a
            href="http://faesde.eadplataforma.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <User className="h-5 w-5" />
            </Button>
          </a>

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
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar cursos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-lg border-0 bg-card pl-10 pr-4 text-sm"
              />
            </div>
          </form>
          <nav className="flex flex-col gap-2">
            <Link
              to="/cursos"
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Todos os Cursos
            </Link>
            <Link
              to="/cursos?categoria=extensao"
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Cursos Técnicos EAD
            </Link>
            <Link
              to="/cursos?categoria=competencia"
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Certificação por Competência
            </Link>
            <Link
              to="/faq"
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </Link>
            <Button 
              onClick={() => {
                setIsMenuOpen(false);
                scrollToContact();
              }}
              className="mt-2 w-full rounded-lg bg-ecid-blue-accent font-semibold text-primary-foreground"
            >
              Fale conosco
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;