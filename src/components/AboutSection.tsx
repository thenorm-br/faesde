import { Award, Users, Globe, ThumbsUp } from "lucide-react";

const AboutSection = () => {
  const stats = [
    {
      icon: Award,
      title: "Reconhecimento pelo MEC",
      description: "Contamos com instituições, todas reconhecidas e credenciadas pelo MEC.",
    },
    {
      icon: Users,
      title: "Número de alunos",
      description: "Mais de 2000 alunos já contaram com o apoio de nossa equipe.",
    },
    {
      icon: Globe,
      title: "Melhor Rede",
      description: "A FAESDE conta com parceiras em todo o Brasil.",
    },
    {
      icon: ThumbsUp,
      title: "97% de aprovação",
      description: "Com o apoio de nossa equipe, a média de aprovação chega a 97%.",
    },
  ];

  return (
    <section id="about" className="py-16 md:py-24">
      <div className="container mx-auto">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Text Content */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-primary md:text-4xl">
              Somos a FAESDE
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Unir os melhores alunos às melhores instituições de ensino. Esse é o objetivo da Assessoria – FAESDE, uma unidade de apoio presencial. Desde 2015, representamos e assessoramos instituições de ensino que oferecem cursos técnicos, cursos de graduação e pós graduação, cursos de qualificação profissional e cursos livres tanto na modalidade presencial quanto à distância.
            </p>

            {/* Stats Grid */}
            <div className="grid gap-6 pt-4 sm:grid-cols-2">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="card-hover flex gap-4 rounded-xl bg-card p-5 shadow-sm"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-faesde-blue-light">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{stat.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{stat.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Illustration */}
          <div className="relative hidden lg:block">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
              alt="Estudantes"
              className="rounded-2xl shadow-lg"
            />
            <div className="absolute -bottom-6 -left-6 rounded-xl bg-accent p-6 text-primary-foreground shadow-orange">
              <p className="text-3xl font-bold">+2000</p>
              <p className="text-sm font-medium opacity-90">Alunos formados</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
