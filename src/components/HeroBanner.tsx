import { Link } from "react-router-dom";

const HeroBanner = () => {
  return (
    <section className="relative bg-hero-red py-12 md:py-20 overflow-hidden">
      {/* Carnival Background with Confetti */}
      <div className="absolute inset-0">
        {/* Confetti pattern */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Ccircle cx='20' cy='20' r='4' fill='%23FFD700'/%3E%3Ccircle cx='80' cy='30' r='3' fill='%2300FF00'/%3E%3Ccircle cx='50' cy='50' r='5' fill='%23FF00FF'/%3E%3Ccircle cx='100' cy='70' r='4' fill='%2300FFFF'/%3E%3Ccircle cx='30' cy='90' r='3' fill='%23FF6B00'/%3E%3Ccircle cx='70' cy='100' r='4' fill='%23FFD700'/%3E%3Crect x='10' y='60' width='8' height='3' fill='%23FF00FF' transform='rotate(45 14 61.5)'/%3E%3Crect x='90' y='15' width='8' height='3' fill='%2300FF00' transform='rotate(-30 94 16.5)'/%3E%3Crect x='60' y='80' width='8' height='3' fill='%2300FFFF' transform='rotate(60 64 81.5)'/%3E%3C/svg%3E")`,
        }} />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-hero-red via-ecid-red to-ecid-red-light opacity-80" />
      </div>

      <div className="container relative mx-auto">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Carnival Ribbon */}
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full bg-ecid-yellow/20 px-4 py-2 backdrop-blur-sm">
            <span className="text-lg">🎭</span>
            <span className="text-sm font-semibold uppercase tracking-wider text-ecid-yellow">Promoção de Carnaval</span>
            <span className="text-lg">🎉</span>
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

          {/* Centered Discount Badge - Carnival Style */}
          <div className="animate-scale-in relative my-4" style={{ animationDelay: "0.2s" }}>
            <div className="relative">
              {/* Carnival decorative elements */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="text-3xl">🎊</span>
              </div>
              
              {/* Main badge with carnival colors */}
              <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500/30 via-ecid-yellow/20 to-cyan-400/30 shadow-2xl md:h-56 md:w-56" style={{
                border: '4px solid transparent',
                backgroundClip: 'padding-box',
                boxShadow: '0 0 0 4px rgba(255, 215, 0, 0.5), 0 0 30px rgba(255, 0, 255, 0.3), 0 0 60px rgba(0, 255, 255, 0.2)'
              }}>
                {/* Inner colorful ring */}
                <div className="absolute inset-2 rounded-full" style={{
                  background: 'linear-gradient(135deg, rgba(255, 0, 255, 0.2), rgba(0, 255, 255, 0.2), rgba(255, 215, 0, 0.2))',
                  border: '2px dashed rgba(255, 215, 0, 0.4)'
                }} />
                
                <div className="text-center">
                  <span className="block text-6xl font-extrabold text-ecid-yellow drop-shadow-lg md:text-7xl">30%</span>
                  <span className="block text-sm font-bold uppercase tracking-wider text-primary-foreground">de desconto</span>
                </div>
              </div>
              
              {/* Decorative carnival elements */}
              <span className="absolute -left-6 top-1/4 text-2xl animate-bounce">🎭</span>
              <span className="absolute -right-6 top-1/4 text-2xl animate-bounce" style={{ animationDelay: "0.3s" }}>🪇</span>
              <span className="absolute -left-4 bottom-1/4 text-xl animate-pulse">✨</span>
              <span className="absolute -right-4 bottom-1/4 text-xl animate-pulse" style={{ animationDelay: "0.5s" }}>✨</span>
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
              🎉 Quero me matricular
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
