const HeroBanner = () => {
  return (
    <section className="relative bg-hero-red py-16 md:py-24 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container relative mx-auto">
        <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <p className="animate-fade-up mb-2 text-lg font-semibold uppercase tracking-wider text-primary-foreground/80">
              Invista no seu futuro
            </p>
            <h1 className="animate-fade-up text-4xl font-extrabold leading-tight text-ecid-yellow md:text-5xl lg:text-6xl" style={{ animationDelay: "0.1s" }}>
              CURSOS<br />TÉCNICOS
            </h1>
            <p className="animate-fade-up mt-2 text-xl font-bold text-primary-foreground md:text-2xl" style={{ animationDelay: "0.15s" }}>
              AUTORIZADOS PELO MEC
            </p>
          </div>

          {/* Center - Discount Badge */}
          <div className="animate-scale-in relative" style={{ animationDelay: "0.2s" }}>
            <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-4 border-primary-foreground/30 md:h-52 md:w-52">
              <div className="text-center">
                <span className="text-5xl font-extrabold text-ecid-yellow md:text-6xl">20%</span>
              </div>
            </div>
            {/* Ornament */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="h-8 w-8 rounded-full border-4 border-primary-foreground/30" />
            </div>
          </div>

          {/* Right Content */}
          <div className="text-center lg:text-right">
            <p className="animate-fade-up text-lg font-semibold uppercase tracking-wider text-primary-foreground/80" style={{ animationDelay: "0.25s" }}>
              Desconto em todos
            </p>
            <h2 className="animate-fade-up text-2xl font-extrabold text-ecid-yellow md:text-3xl" style={{ animationDelay: "0.3s" }}>
              CURSOS TÉCNICOS EAD
            </h2>
            <div className="animate-fade-up mt-4 inline-flex items-center gap-3" style={{ animationDelay: "0.35s" }}>
              <span className="text-sm font-medium text-primary-foreground/80">Utilize o cupom:</span>
              <span className="rounded-lg bg-primary-foreground/20 px-4 py-2 text-lg font-bold text-ecid-yellow">
                FAESDE20
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
