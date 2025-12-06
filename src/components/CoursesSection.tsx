import { Calendar, BadgeCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourseCardProps {
  title: string;
  image: string;
  description: string;
  originalPrice: string;
  promoPrice: string;
  installment: string;
}

const CourseCard = ({ title, image, description, originalPrice, promoPrice, installment }: CourseCardProps) => {
  const getShortTitle = (fullTitle: string) => {
    const name = fullTitle
      .replace("Curso Técnico de ", "")
      .replace("Curso Técnico em ", "")
      .replace("Certificação Técnica por Competência em ", "")
      .replace("Especialização Técnica em ", "")
      .replace(" EAD", "")
      .toUpperCase();
    return name;
  };

  const isCompetency = title.includes("Competência");
  const isSpecialization = title.includes("Especialização");

  const getLabel = () => {
    if (isCompetency) return "Certificação por Competência";
    if (isSpecialization) return "Pós-Técnico EAD";
    return "Curso Técnico EAD";
  };

  return (
    <article className="group card-hover flex flex-col overflow-hidden rounded-2xl bg-card shadow-card">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ecid-navy/90 via-ecid-navy/50 to-transparent" />
        
        <div className="absolute left-0 top-3 bg-ecid-yellow px-3 py-1">
          <span className="text-[10px] font-bold uppercase tracking-wide text-ecid-navy">
            {getLabel()}
          </span>
        </div>
        
        <div className="absolute bottom-8 left-3 right-3">
          <h4 className="text-sm font-bold uppercase leading-tight text-white drop-shadow-lg">
            {getShortTitle(title)}
          </h4>
        </div>
        
        <div className="absolute bottom-2 left-3">
          <span className="inline-block border border-white/80 bg-white/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-white backdrop-blur-sm">
            Autorizado pelo MEC
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Início imediato
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-ecid-blue-accent/10 px-2.5 py-1 text-xs font-medium text-ecid-blue-accent">
            <BadgeCheck className="h-3 w-3" />
            Autorizado pelo MEC
          </span>
        </div>

        <h3 className="mb-2 line-clamp-2 text-base font-bold text-foreground">
          {title}
        </h3>
        
        <p className="mb-4 line-clamp-3 flex-1 text-sm text-muted-foreground">
          {description}
        </p>

        <div className="mb-4 space-y-1 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            <span className="line-through">De {originalPrice}</span>
          </p>
          <p className="text-sm text-muted-foreground">Por {promoPrice}</p>
          <p className="text-2xl font-bold text-ecid-blue-accent">{installment}</p>
          <p className="text-xs text-muted-foreground">s/ juros no cartão de crédito</p>
        </div>

        <Button className="w-full rounded-lg bg-ecid-red font-semibold text-primary-foreground hover:bg-ecid-red-light">
          Quero me matricular
        </Button>
      </div>
    </article>
  );
};

const technicalCourses = [
  {
    title: "Curso Técnico de Segurança do Trabalho EAD",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop",
    description: "Assuma um papel vital na proteção e bem-estar dos trabalhadores. Formação de qualidade, flexível e reconhecida nacionalmente. Ideal para iniciar uma carreira ou mudança profissional.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
  },
  {
    title: "Curso Técnico em Eletrotécnica EAD",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=400&fit=crop",
    description: "Carreira promissora e com alta demanda. Conquiste seu diploma em 6 meses com certificação reconhecida pelo MEC. O mercado clama por eletrotécnicos competentes!",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
  },
  {
    title: "Curso Técnico em Mecânica EAD",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop",
    description: "Formação rápida e reconhecida para entrar no mercado de trabalho. Diploma certificado pelo MEC em 6 meses. Atue em indústrias, oficinas e concessionárias.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
  },
  {
    title: "Curso Técnico de Administração EAD",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop",
    description: "Destaque-se no competitivo mundo dos negócios com a flexibilidade que só o ensino a distância pode oferecer. Ideal para quem busca carreira promissora.",
    originalPrice: "R$ 1.590,00",
    promoPrice: "R$ 900,00",
    installment: "12x R$ 75,00",
  },
  {
    title: "Curso Técnico de Edificações EAD",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&h=400&fit=crop",
    description: "Ingresse na promissora indústria da construção civil. Em 6 meses, esteja pronto para atuar em projetos, obras e fiscalizações com certificado pelo MEC.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
  },
  {
    title: "Curso Técnico em Eletromecânica EAD",
    image: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=600&h=400&fit=crop",
    description: "Especialize-se em uma área que une eletricidade e mecânica. Capacite-se em 6 meses e torne-se um profissional completo para a Indústria 4.0.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
  },
  {
    title: "Curso Técnico em Transações Imobiliárias (TTI) EAD",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop",
    description: "O mercado imobiliário está em constante crescimento. Em 6 meses, esteja certificado e pronto para atuar como corretor de imóveis com respaldo do CRECI.",
    originalPrice: "R$ 1.750,00",
    promoPrice: "R$ 900,00",
    installment: "12x R$ 75,00",
  },
  {
    title: "Curso Técnico em Agropecuária EAD",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop",
    description: "A agropecuária é um setor essencial e em constante crescimento. Domine técnicas de produção agrícola, pecuária, gestão rural e sustentabilidade.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
  },
  {
    title: "Curso Técnico em Farmácia EAD",
    image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&h=400&fit=crop",
    description: "Mergulhe no mundo da saúde e faça a diferença na vida das pessoas. Formação de qualidade, flexível e reconhecida nacionalmente no setor farmacêutico.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
  },
  {
    title: "Curso Técnico em Agricultura EAD",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop",
    description: "Transforme sua paixão pelo campo em uma carreira de sucesso. Domine as mais modernas técnicas agrícolas em apenas 6 meses com certificado pelo MEC.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
  },
];

const certificationCourses = [
  {
    title: "Certificação Técnica por Competência em Administração",
    image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&h=400&fit=crop",
    description: "Aferição técnica para profissionais com experiência prática. Obtenha diploma e registro profissional no conselho de classe responsável.",
    originalPrice: "R$ 3.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
  },
  {
    title: "Certificação Técnica por Competência em Automação Industrial",
    image: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=600&h=400&fit=crop",
    description: "Valide suas habilidades e competências na área de automação industrial com diploma reconhecido pelo MEC e registro no CREA.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
  },
  {
    title: "Certificação Técnica por Competência em Edificações",
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=400&fit=crop",
    description: "Profissionais com experiência prática podem obter diploma técnico com registro profissional no CREA para atuar na construção civil.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
  },
  {
    title: "Certificação Técnica por Competência em Eletrotécnica",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
    description: "Reconheça suas competências técnicas em eletrotécnica e obtenha registro profissional no CREA para atuar legalmente na área.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
  },
  {
    title: "Certificação Técnica por Competência em Segurança do Trabalho",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=400&fit=crop",
    description: "Valide sua experiência profissional em segurança do trabalho com certificação reconhecida pelo MEC e registro no conselho de classe.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
  },
  {
    title: "Certificação Técnica por Competência em Agricultura",
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&h=400&fit=crop",
    description: "Profissionais do agronegócio podem obter diploma técnico por habilidades e competências com registro profissional.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
  },
  {
    title: "Certificação Técnica por Competência em Agropecuária",
    image: "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=600&h=400&fit=crop",
    description: "Candidatos com experiência prática na agropecuária podem obter diploma técnico com registro no conselho de classe responsável.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
  },
  {
    title: "Certificação Técnica por Competência em Análises Clínicas",
    image: "https://images.unsplash.com/photo-1579165466949-3180a3d056d5?w=600&h=400&fit=crop",
    description: "Profissionais de laboratório podem validar suas competências e obter diploma técnico reconhecido pelo MEC.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
  },
  {
    title: "Certificação Técnica por Competência em Eletroeletrônica",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop",
    description: "Valide suas habilidades em eletroeletrônica e obtenha diploma técnico com registro profissional no CREA.",
    originalPrice: "R$ 3.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
  },
  {
    title: "Certificação Técnica por Competência em Mecânica",
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop",
    description: "Mecânicos experientes podem obter diploma técnico oficial por aferição de habilidades e competências.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
  },
];

const postTechnicalCourses = [
  {
    title: "Especialização Técnica em Administração da Produção EAD",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop",
    description: "Aprofunde conhecimentos na gestão de processos produtivos, planejamento, controle da produção, qualidade e melhoria contínua.",
    originalPrice: "R$ 1.500,00",
    promoPrice: "R$ 850,00",
    installment: "12x R$ 70,83",
  },
  {
    title: "Especialização Técnica em Administração de Materiais EAD",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=400&fit=crop",
    description: "Gestão de estoques, compras, almoxarifado, logística e controle de suprimentos para profissionais técnicos.",
    originalPrice: "R$ 1.500,00",
    promoPrice: "R$ 850,00",
    installment: "12x R$ 70,83",
  },
  {
    title: "Especialização Técnica em Farmácia Hospitalar EAD",
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&h=400&fit=crop",
    description: "Gestão e controle de medicamentos, materiais e insumos em ambientes hospitalares e clínicos.",
    originalPrice: "R$ 1.500,00",
    promoPrice: "R$ 850,00",
    installment: "12x R$ 70,83",
  },
  {
    title: "Especialização Técnica em Saúde Pública EAD",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop",
    description: "Políticas públicas, vigilância em saúde, prevenção de doenças e promoção da saúde coletiva no SUS.",
    originalPrice: "R$ 1.500,00",
    promoPrice: "R$ 850,00",
    installment: "12x R$ 70,83",
  },
  {
    title: "Especialização Técnica em Oncologia EAD",
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&h=400&fit=crop",
    description: "Cuidado e tratamento de pacientes com câncer. Atue de forma qualificada e humanizada em equipes multiprofissionais.",
    originalPrice: "R$ 1.500,00",
    promoPrice: "R$ 850,00",
    installment: "12x R$ 70,83",
  },
];

const CoursesSection = () => {
  return (
    <section id="courses" className="py-16 md:py-20">
      <div className="container mx-auto">
        {/* Technical Courses */}
        <div className="mb-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              Cursos Técnicos <span className="underline decoration-ecid-blue-accent decoration-4 underline-offset-4">EAD</span>
            </h2>
            <a
              href="#"
              className="hidden items-center gap-1 text-sm font-semibold text-ecid-blue-accent hover:underline sm:flex"
            >
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {technicalCourses.slice(0, 5).map((course, index) => (
              <CourseCard key={index} {...course} />
            ))}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Button variant="outline" className="rounded-lg font-semibold">
              Ver todos os cursos
            </Button>
          </div>
        </div>

        {/* Certification Courses */}
        <div className="mb-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              Certificação por <span className="underline decoration-ecid-blue-accent decoration-4 underline-offset-4">Competência</span>
            </h2>
            <a
              href="#"
              className="hidden items-center gap-1 text-sm font-semibold text-ecid-blue-accent hover:underline sm:flex"
            >
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {certificationCourses.slice(0, 5).map((course, index) => (
              <CourseCard key={index} {...course} />
            ))}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Button variant="outline" className="rounded-lg font-semibold">
              Ver todos os cursos
            </Button>
          </div>
        </div>

        {/* Post-Technical Courses */}
        <div>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              Cursos <span className="underline decoration-ecid-blue-accent decoration-4 underline-offset-4">Pós-Técnicos</span> EAD
            </h2>
            <a
              href="#"
              className="hidden items-center gap-1 text-sm font-semibold text-ecid-blue-accent hover:underline sm:flex"
            >
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {postTechnicalCourses.map((course, index) => (
              <CourseCard key={index} {...course} />
            ))}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Button variant="outline" className="rounded-lg font-semibold">
              Ver todos os cursos
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;