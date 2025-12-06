import { Search, ShoppingCart, User, Menu, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-ecid-navy shadow-lg">
      <div className="container mx-auto flex items-center justify-between gap-4 py-3">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl font-extrabold tracking-tight text-primary-foreground">
            ecid
          </span>
        </a>

        {/* Categories - Desktop */}
        <nav className="hidden items-center gap-6 lg:flex">
          <button className="flex items-center gap-1 text-sm font-medium text-primary-foreground/90 transition-colors hover:text-primary-foreground">
            Categorias
            <ChevronDown className="h-4 w-4" />
          </button>
        </nav>

        {/* Search */}
        <div className="hidden flex-1 max-w-md md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar cursos..."
              className="w-full rounded-full border-0 bg-card pl-10 pr-4 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="hidden rounded-full bg-ecid-red px-6 font-semibold text-primary-foreground shadow-button transition-all hover:bg-ecid-red-dark hover:shadow-lg sm:flex"
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
            className="text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t border-primary-foreground/10 bg-ecid-navy-dark p-4 lg:hidden">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar cursos..."
                className="w-full rounded-full border-0 bg-card pl-10 pr-4 text-sm"
              />
            </div>
          </div>
          <nav className="flex flex-col gap-2">
            <button className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-primary-foreground/90 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground">
              Categorias
              <ChevronDown className="h-4 w-4" />
            </button>
            <Button className="w-full rounded-full bg-ecid-red font-semibold text-primary-foreground shadow-button hover:bg-ecid-red-dark">
              Fale conosco
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
