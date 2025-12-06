import { ArrowRight, Calendar, BadgeCheck } from "lucide-react";
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
    <article className="group card-hover flex flex-col overflow-hidden rounded-2xl bg-card shadow-md">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Badges */}
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-1 text-xs font-medium text-accent">
            <Calendar className="h-3 w-3" />
            Início imediato
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            <BadgeCheck className="h-3 w-3" />
            Autorizado MEC
          </span>
        </div>

        <h3 className="mb-2 line-clamp-2 text-sm font-bold uppercase tracking-wide text-foreground">
          {title}
        </h3>
        
        <p className="mb-4 line-clamp-3 flex-1 text-xs text-muted-foreground">
          {description}
        </p>

        {/* Pricing */}
        <div className="mb-4 space-y-1">
          <p className="text-xs text-muted-foreground line-through">De {originalPrice}</p>
          <p className="text-lg font-bold text-accent">Por {promoPrice}</p>
          <p className="text-xs text-muted-foreground">{installment} s/ juros no cartão</p>
        </div>

        <a
          href="#"
          className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-faesde-orange-dark"
        >
          Quero me matricular
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </a>
      </div>
    </article>
  );
};

const courses = [
  {
    title: "Curso Técnico de Segurança do Trabalho EAD",
    image: "https://ecid-storage.nyc3.cdn.digitaloceanspaces.com/p/courses/cover_01K6KS8VRM15DNPN4HAQSK595G.jpg",
    description: "Assuma um papel vital na proteção e bem-estar dos trabalhadores. Formação de qualidade, flexível e reconhecida nacionalmente.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
  },
  {
    title: "Curso Técnico em Eletrotécnica EAD",
    image: "https://ecid-storage.nyc3.cdn.digitaloceanspaces.com/p/courses/cover_01K6KSBC760Q5ZQWPZ9JAKM8CJ.jpg",
    description: "Carreira promissora e com alta demanda. Conquiste seu diploma em 6 meses com certificação reconhecida pelo MEC.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
  },
  {
    title: "Curso Técnico em Mecânica EAD",
    image: "https://ecid-storage.nyc3.cdn.digitaloceanspaces.com/p/courses/cover_01K6KSCYNA53ABH0G1RZ9E1Y28.jpg",
    description: "Formação rápida e reconhecida para entrar no mercado de trabalho. Diploma certificado pelo MEC em 6 meses.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
  },
  {
    title: "Curso Técnico de Administração EAD",
    image: "https://ecid-storage.nyc3.cdn.digitaloceanspaces.com/p/courses/cover_01K6KSDXT1SHS2T79XHVD2ZKJ3.jpg",
    description: "Destaque-se no competitivo mundo dos negócios com a flexibilidade que só o ensino a distância pode oferecer.",
    originalPrice: "R$ 1.590,00",
    promoPrice: "R$ 900,00",
    installment: "12x R$ 75,00",
  },
  {
    title: "Curso Técnico de Edificações EAD",
    image: "https://ecid-storage.nyc3.cdn.digitaloceanspaces.com/p/courses/cover_01K6KSEVDXTP3SDDSWJ4B6BQ0E.jpg",
    description: "Ingresse na promissora indústria da construção civil. Em 6 meses, esteja pronto para atuar em projetos e obras.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
  },
  {
    title: "Curso Técnico em Eletromecânica EAD",
    image: "https://ecid-storage.nyc3.cdn.digitaloceanspaces.com/p/courses/cover_01JETVPMPF5WRDRZT1XSP5ZR3P.jpg",
    description: "Una o poder da eletricidade com a precisão da mecânica. Profissional completo para os desafios da Indústria 4.0.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
  },
  {
    title: "Curso Técnico em Transações Imobiliárias (TTI) EAD",
    image: "https://ecid-storage.nyc3.cdn.digitaloceanspaces.com/p/courses/cover_01JERFFZHBMF3S13QWTHWZYPKA.jpg",
    description: "Carreira promissora com alta remuneração e flexibilidade. Em 6 meses, certificado e pronto para atuar com CRECI.",
    originalPrice: "R$ 1.750,00",
    promoPrice: "R$ 900,00",
    installment: "12x R$ 75,00",
  },
  {
    title: "Curso Técnico em Agropecuária EAD",
    image: "https://ecid-storage.nyc3.cdn.digitaloceanspaces.com/p/courses/cover_01JEVKVVKP4QJF8NS0QK44G6E1.jpg",
    description: "Setor essencial e em constante crescimento. Domine técnicas de produção agrícola, pecuária e gestão rural.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
  },
  {
    title: "Curso Técnico em Agricultura EAD",
    image: "https://ecid-storage.nyc3.cdn.digitaloceanspaces.com/p/courses/cover_01JEVKE7PV0TRXK1FR22Y9YQ6Q.jpg",
    description: "Transforme sua paixão pelo campo em uma carreira de sucesso. Domine as mais modernas técnicas agrícolas.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
  },
  {
    title: "Curso Técnico em Farmácia EAD",
    image: "https://ecid-storage.nyc3.cdn.digitaloceanspaces.com/p/courses/cover_01JE91G40RQ577YMBA9NFMBBN7.jpg",
    description: "Mergulhe no mundo da saúde e faça a diferença na vida das pessoas. Destaque-se no setor farmacêutico.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
  },
  {
    title: "Certificação Técnica por Competência em Administração",
    image: "https://ecid-storage.nyc3.cdn.digitaloceanspaces.com/p/courses/cover_01JEVNEK40PA0R7V2TAFMXHNMF.jpg",
    description: "Aferição técnica para profissionais com experiência prática. Obtenha diploma e registro profissional.",
    originalPrice: "R$ 3.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
  },
  {
    title: "Certificação Técnica por Competência em Automação Industrial",
    image: "https://ecid-storage.nyc3.cdn.digitaloceanspaces.com/p/courses/cover_01JFCZ04KYVXJFK9YH9CY5D879.jpg",
    description: "Valide suas habilidades e competências na área de automação industrial com diploma reconhecido pelo MEC.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
  },
];

const CoursesSection = () => {
  return (
    <section id="courses" className="bg-secondary py-16 md:py-24">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-primary md:text-4xl">Nossos Cursos</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Cursos técnicos EAD autorizados pelo MEC. Estude no seu ritmo e conquiste sua certificação.
          </p>
        </div>

        {/* Courses Grid */}
        <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course, index) => (
            <CourseCard key={index} {...course} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button className="rounded-full bg-primary px-8 font-semibold text-primary-foreground hover:bg-faesde-blue-dark">
            VER TODOS OS CURSOS
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
