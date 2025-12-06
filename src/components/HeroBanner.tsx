import { Gift } from "lucide-react";

const HeroBanner = () => {
  return (
    <section className="relative overflow-hidden bg-christmas-pattern py-12 md:py-20">
      {/* Christmas decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-10 top-10 h-32 w-32 rotate-12 opacity-10">
          <svg viewBox="0 0 100 100" fill="currentColor" className="text-primary-foreground">
            <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" />
          </svg>
        </div>
        <div className="absolute -right-5 bottom-10 h-24 w-24 -rotate-12 opacity-10">
          <svg viewBox="0 0 100 100" fill="currentColor" className="text-primary-foreground">
            <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" />
          </svg>
        </div>
      </div>

      <div className="container relative mx-auto">
        <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:text-left">
          {/* Left Content */}
          <div className="flex-1 space-y-2">
            <p className="text-lg font-semibold uppercase tracking-wide text-ecid-gold">
              Presente de
            </p>
            <h1 className="text-5xl font-extrabold uppercase leading-tight tracking-tight text-ecid-gold md:text-6xl lg:text-7xl">
              Natal
            </h1>
            <p className="text-2xl font-bold uppercase tracking-wide text-primary-foreground/90 md:text-3xl">
              Antecipado ECID
            </p>
          </div>

          {/* Center - Ornament */}
          <div className="relative flex items-center justify-center">
            <div className="animate-float">
              {/* Ornament hook */}
              <div className="mx-auto mb-2 h-8 w-0.5 bg-primary-foreground/40" />
              <div className="mx-auto mb-1 h-4 w-6 rounded-full border-2 border-primary-foreground/40" />
              
              {/* Ornament ball */}
              <div className="flex h-40 w-40 items-center justify-center rounded-full border-4 border-primary-foreground/30 bg-primary-foreground/5 backdrop-blur-sm md:h-52 md:w-52">
                <span className="text-5xl font-extrabold text-ecid-gold md:text-7xl">
                  20<span className="text-3xl md:text-5xl">%</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 space-y-4 lg:text-right">
            <p className="text-lg font-semibold uppercase tracking-wide text-ecid-gold">
              Desconto em todos
            </p>
            <h2 className="text-3xl font-extrabold uppercase leading-tight tracking-tight text-primary-foreground md:text-4xl">
              Cursos Técnicos EAD
            </h2>
            <div className="flex items-center justify-center gap-3 lg:justify-end">
              <p className="text-lg font-medium text-primary-foreground/80">
                Utilize o cupom:
              </p>
              <span className="rounded-md border-2 border-ecid-gold/50 bg-ecid-gold/10 px-4 py-2 font-mono text-xl font-bold text-ecid-gold">
                NATAL20
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
