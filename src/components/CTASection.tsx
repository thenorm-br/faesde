import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="bg-gradient-cta py-16 md:py-20">
      <div className="container mx-auto text-center">
        <h2 className="mb-4 text-3xl font-bold text-accent-foreground md:text-4xl">
          Capacite-se
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-lg text-accent-foreground/80">
          Escolha entre os mais variados cursos técnicos.
        </p>
        <Button
          variant="outline"
          className="h-12 rounded-full border-2 border-accent-foreground bg-transparent px-8 font-bold text-accent-foreground transition-all hover:bg-accent-foreground hover:text-accent"
        >
          VER CURSOS
        </Button>
      </div>
    </section>
  );
};

export default CTASection;
