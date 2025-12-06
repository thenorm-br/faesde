import { Award, UserCheck, TrendingUp } from "lucide-react";

const benefits = [
  {
    icon: Award,
    title: "Certificado Técnico",
    subtitle: "Autorizado pelo MEC",
    color: "text-ecid-blue-accent",
  },
  {
    icon: UserCheck,
    title: "Registro Profissional",
    subtitle: "no conselho de classe responsável",
    color: "text-ecid-blue-accent",
  },
  {
    icon: TrendingUp,
    title: "Melhores oportunidades",
    subtitle: "no mercado de trabalho",
    color: "text-ecid-blue-accent",
  },
];

const BenefitsBar = () => {
  return (
    <section className="relative -mt-8 z-10 px-4">
      <div className="container mx-auto">
        <div className="bg-benefits-card rounded-2xl p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-3">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-4"
              >
                <div className={`shrink-0 ${benefit.color}`}>
                  <benefit.icon className="h-10 w-10" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.subtitle}</p>
                </div>
                {index < benefits.length - 1 && (
                  <div className="hidden h-12 w-px bg-gradient-to-b from-transparent via-border to-transparent md:block ml-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsBar;
