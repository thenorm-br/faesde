import { Award, UserCheck, TrendingUp } from "lucide-react";

const benefits = [
  {
    icon: Award,
    title: "Certificado Técnico",
    subtitle: "Autorizado pelo MEC",
  },
  {
    icon: UserCheck,
    title: "Registro Profissional",
    subtitle: "no conselho de classe responsável",
  },
  {
    icon: TrendingUp,
    title: "Melhores oportunidades",
    subtitle: "no mercado de trabalho",
  },
];

const BenefitsBar = () => {
  return (
    <section className="relative -mt-6 z-10 px-4 md:-mt-8">
      <div className="container mx-auto">
        <div className="rounded-xl bg-card p-6 shadow-card md:p-8">
          <div className="grid gap-6 md:grid-cols-3">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-4"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-ecid-blue-light">
                  <benefit.icon className="h-6 w-6 text-ecid-navy" />
                </div>
                <div className="border-l-2 border-accent/20 pl-4">
                  <p className="font-semibold text-foreground">{benefit.title}</p>
                  <p className="text-sm text-muted-foreground">{benefit.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsBar;
