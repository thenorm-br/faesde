import { Link } from "react-router-dom";

const HeroBanner = () => {
  return (
    <section className="relative bg-hero-red py-12 md:py-20 overflow-hidden">
      {/* Christmas Background with Snowflakes */}
      <div className="absolute inset-0">
        {/* Snowflake pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ctext x='50' y='50' font-size='20' text-anchor='middle' fill='white'%3E❄%3C/text%3E%3Ctext x='25' y='25' font-size='12' text-anchor='middle' fill='white'%3E❄%3C/text%3E%3Ctext x='75' y='75' font-size='12' text-anchor='middle' fill='white'%3E❄%3C/text%3E%3Ctext x='85' y='20' font-size='8' text-anchor='middle' fill='white'%3E✦%3C/text%3E%3Ctext x='15' y='80' font-size='8' text-anchor='middle' fill='white'%3E✦%3C/text%3E%3C/svg%3E")`,
        }} />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-hero-red via-ecid-red to-ecid-red-light opacity-80" />
      </div>

      <div className="container relative mx-auto">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Christmas Ribbon */}
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full bg-ecid-yellow/20 px-4 py-2 backdrop-blur-sm">
            <span className="text-lg">🎄</span>
            <span className="text-sm font-semibold uppercase tracking-wider text-ecid-yellow">Promoção de Natal</span>
            <span className="text-lg">🎄</span>
          </div>

          {/* Main Content - Centered */}
          <div className="flex flex-col items-center">
            <p className="animate-fade-up text-lg font-semibold uppercase tracking-wider text-primary-foreground/90" style={{ animationDelay: "0.05s" }}>
              Invista no seu futuro
            </p>
            <h1 className="animate-fade-up mt-1 text-4xl font-extrabold leading-tight text-ecid-yellow md:text-5xl lg:text-6xl" style={{ animationDelay: "0.1s" }}>
              CURSOS TÉCNICOS
            </h1>
            <p className="animate-fade-up mt-1 text-xl font-bold text-primary-foreground md:text-2xl" style={{ animationDelay: "0.15s" }}>
              AUTORIZADOS PELO MEC
            </p>
          </div>

          {/* Centered Discount Badge */}
          <div className="animate-scale-in relative my-4" style={{ animationDelay: "0.2s" }}>
            {/* Christmas ornament style badge */}
            <div className="relative">
              {/* Ornament top hook */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <div className="h-6 w-1 rounded-full bg-ecid-yellow/60" />
                <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                  <div className="h-4 w-4 rounded-full border-2 border-ecid-yellow/60" />
                </div>
              </div>
              
              {/* Main badge */}
              <div className="relative flex h-44 w-44 items-center justify-center rounded-full border-4 border-ecid-yellow/40 bg-gradient-to-br from-ecid-red-light/50 to-hero-red/50 shadow-2xl md:h-56 md:w-56">
                {/* Inner glow ring */}
                <div className="absolute inset-2 rounded-full border-2 border-ecid-yellow/20" />
                
                <div className="text-center">
                  <span className="block text-6xl font-extrabold text-ecid-yellow drop-shadow-lg md:text-7xl">30%</span>
                  <span className="block text-sm font-bold uppercase tracking-wider text-primary-foreground">de desconto</span>
                </div>
              </div>
              
              {/* Decorative stars */}
              <span className="absolute -left-4 top-1/2 -translate-y-1/2 text-2xl animate-pulse">✨</span>
              <span className="absolute -right-4 top-1/2 -translate-y-1/2 text-2xl animate-pulse" style={{ animationDelay: "0.5s" }}>✨</span>
            </div>
          </div>

          {/* Bottom Content */}
          <div className="flex flex-col items-center gap-4">
            <p className="animate-fade-up text-lg font-semibold uppercase tracking-wider text-primary-foreground/90" style={{ animationDelay: "0.25s" }}>
              Em todos os cursos técnicos EAD
            </p>
            
            <div className="animate-fade-up flex items-center gap-3 rounded-xl bg-primary-foreground/10 px-5 py-3 backdrop-blur-sm" style={{ animationDelay: "0.3s" }}>
              <span className="text-sm font-medium text-primary-foreground">Utilize o cupom:</span>
              <span className="rounded-lg bg-ecid-yellow px-4 py-2 text-lg font-bold text-ecid-navy shadow-lg">
                FAESDE30
              </span>
            </div>
            
            {/* CTA Button */}
            <Link 
              to="/curso/seguranca-trabalho"
              className="mt-2 inline-flex animate-fade-up items-center gap-2 rounded-xl bg-ecid-yellow px-8 py-4 text-lg font-bold text-ecid-navy shadow-xl transition-all hover:scale-105 hover:bg-primary-foreground hover:shadow-2xl"
              style={{ animationDelay: "0.35s" }}
            >
              🎁 Quero me matricular
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
