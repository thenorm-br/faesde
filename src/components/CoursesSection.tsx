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
  return (
    <article className="group card-hover flex flex-col overflow-hidden rounded-2xl bg-card shadow-card">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Badges */}
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

        {/* Pricing */}
        <div className="mb-4 space-y-1 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            <span className="line-through">De {originalPrice}</span>
          </p>
          <p className="text-xl font-bold text-ecid-red">Por {promoPrice}</p>
          <p className="text-sm text-muted-foreground">{installment} s/ juros no cartão</p>
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
    description: "Assuma um papel vital na proteção e bem-estar dos trabalhadores. Formação de qualidade, flexível e reconhecida nacionalmente.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
  },
  {
    title: "Curso Técnico em Eletrotécnica EAD",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=400&fit=crop",
    description: "Carreira promissora e com alta demanda. Conquiste seu diploma em 6 meses com certificação reconhecida pelo MEC.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
  },
  {
    title: "Curso Técnico em Mecânica EAD",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop",
    description: "Formação rápida e reconhecida para entrar no mercado de trabalho. Diploma certificado pelo MEC em 6 meses.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
  },
  {
    title: "Curso Técnico de Administração EAD",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop",
    description: "Destaque-se no competitivo mundo dos negócios com a flexibilidade que só o ensino a distância pode oferecer.",
    originalPrice: "R$ 1.590,00",
    promoPrice: "R$ 900,00",
    installment: "12x R$ 75,00",
  },
  {
    title: "Curso Técnico de Edificações EAD",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&h=400&fit=crop",
    description: "Ingresse na promissora indústria da construção civil. Em 6 meses, esteja pronto para atuar em projetos e obras.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
  },
];

const certificationCourses = [
  {
    title: "Certificação Técnica por Competência em Administração",
    image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&h=400&fit=crop",
    description: "Aferição técnica para profissionais com experiência prática. Obtenha diploma e registro profissional.",
    originalPrice: "R$ 3.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
  },
  {
    title: "Certificação Técnica por Competência em Automação Industrial",
    image: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=600&h=400&fit=crop",
    description: "Valide suas habilidades e competências na área de automação industrial com diploma reconhecido pelo MEC.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
  },
  {
    title: "Certificação Técnica por Competência em Edificações",
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=400&fit=crop",
    description: "Profissionais com experiência prática podem obter diploma técnico com registro profissional no CREA.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
  },
  {
    title: "Certificação Técnica por Competência em Eletrotécnica",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
    description: "Reconheça suas competências técnicas em eletrotécnica e obtenha registro profissional no CREA.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
  },
  {
    title: "Certificação Técnica por Competência em Segurança do Trabalho",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=400&fit=crop",
    description: "Valide sua experiência profissional em segurança do trabalho com certificação reconhecida pelo MEC.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
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
            {technicalCourses.map((course, index) => (
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
        <div>
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
            {certificationCourses.map((course, index) => (
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
