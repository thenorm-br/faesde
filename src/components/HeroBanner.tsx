import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const HeroBanner = () => {
  return (
    <section className="relative min-h-[550px] bg-hero-gradient flex items-center justify-center py-20 md:min-h-[600px]">
      <div className="container relative mx-auto text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Headline */}
          <h1 className="animate-fade-up text-4xl font-extrabold leading-tight tracking-tight text-primary-foreground md:text-5xl lg:text-6xl">
            Prepare-se para o futuro!
          </h1>
          
          {/* Subheadline */}
          <p className="animate-fade-up text-lg text-primary-foreground/80 md:text-xl" style={{ animationDelay: "0.1s" }}>
            Unir os melhores alunos às melhores instituições de ensino.
          </p>

          {/* Search Bar */}
          <div className="animate-fade-up mx-auto max-w-xl pt-4" style={{ animationDelay: "0.2s" }}>
            <div className="relative flex overflow-hidden rounded-full bg-card shadow-lg">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Escreva para iniciar a pesquisa..."
                  className="h-14 border-0 pl-12 pr-4 text-base focus-visible:ring-0"
                />
              </div>
              <Button className="m-1.5 h-11 rounded-full bg-accent px-6 font-semibold text-accent-foreground shadow-orange hover:bg-faesde-orange-dark">
                Pesquisar
              </Button>
            </div>
          </div>

          {/* CTAs */}
          <div className="animate-fade-up flex flex-wrap items-center justify-center gap-4 pt-4" style={{ animationDelay: "0.3s" }}>
            <Button
              variant="outline"
              className="h-12 rounded-full border-2 border-primary-foreground/30 bg-transparent px-8 font-semibold text-primary-foreground backdrop-blur-sm transition-all hover:border-primary-foreground/60 hover:bg-primary-foreground/10"
            >
              Ver Cursos
            </Button>
            <Button className="h-12 rounded-full bg-accent px-8 font-semibold text-accent-foreground shadow-orange transition-all hover:bg-faesde-orange-dark hover:shadow-lg">
              Fale Conosco
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
