import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourseCardProps {
  title: string;
  image: string;
}

const CourseCard = ({ title, image }: CourseCardProps) => {
  return (
    <article className="group card-hover overflow-hidden rounded-2xl bg-card shadow-md">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="mb-4 line-clamp-2 text-sm font-bold uppercase tracking-wide text-foreground">
          {title}
        </h3>
        <a
          href="#"
          className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-faesde-orange-dark"
        >
          Quero participar
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </a>
      </div>
    </article>
  );
};

const popularCourses = [
  "TÉCNICO EM ADMINISTRAÇÃO",
  "TÉCNICO EM SEGURANÇA DO TRABALHO",
  "TÉCNICO EM ELETRÔNICA",
  "TÉCNICO EM ELETROTÉCNICA",
  "TÉCNICO EM MECÂNICA INDUSTRIAL",
  "TÉCNICO EM EDIFICAÇÕES",
];

const featuredCourses = [
  {
    title: "ESPECIALIZAÇÃO TÉCNICA EM INSTALAÇÃO ELÉTRICA PREDIAL DE BAIXA TENSÃO",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80",
  },
  {
    title: "ESPECIALIZAÇÃO TÉCNICA EM ENERGIA SOLAR FOTOVOLTAICA",
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80",
  },
  {
    title: "ESPECIALIZAÇÃO TÉCNICA EM USINAGEM",
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80",
  },
  {
    title: "ESPECIALIZAÇÃO TÉCNICA EM BENEFÍCIOS",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80",
  },
];

const CoursesSection = () => {
  return (
    <section id="courses" className="bg-secondary py-16 md:py-24">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-primary md:text-4xl">Cursos</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Escolha entre os mais variados cursos técnicos e especializações.
          </p>
        </div>

        {/* Featured Courses Grid */}
        <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredCourses.map((course, index) => (
            <CourseCard key={index} {...course} />
          ))}
        </div>

        {/* Popular Courses */}
        <div className="rounded-2xl bg-card p-8 shadow-sm">
          <h3 className="mb-6 text-xl font-bold text-foreground">
            Cursos Técnicos Populares
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {popularCourses.map((course, index) => (
              <a
                key={index}
                href="#"
                className="flex items-center gap-3 rounded-lg border border-border p-4 transition-all hover:border-accent hover:bg-accent/5"
              >
                <div className="h-2 w-2 rounded-full bg-accent" />
                <span className="text-sm font-semibold text-foreground">{course}</span>
              </a>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button className="rounded-full bg-primary px-8 font-semibold text-primary-foreground hover:bg-faesde-blue-dark">
              VER TODOS OS CURSOS
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
