import { useState, useEffect } from "react";
import { Calendar, BadgeCheck, ArrowRight, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Course {
  id: string;
  slug: string;
  title: string;
  image_url: string | null;
  description: string | null;
  original_price: string | null;
  promo_price: string | null;
  installment: string | null;
  category: string;
  hours: number | null;
  duration_range: string | null;
  certification: string | null;
}

const CourseCard = ({ course }: { course: Course }) => {
  const getShortTitle = (fullTitle: string) => {
    return fullTitle
      .replace("Curso Técnico de ", "")
      .replace("Curso Técnico em ", "")
      .replace("Certificação Técnica por Competência em ", "")
      .replace("Especialização Técnica em ", "")
      .replace(" EAD", "")
      .toUpperCase();
  };

  const getLabel = () => {
    if (course.category === "competencia") return "Certificação por Competência";
    if (course.category === "pos-tecnico") return "Pós-Técnico EAD";
    return "Curso Técnico EAD";
  };

  return (
    <Link to={`/curso/${course.slug}`} className="block">
      <article className="group card-hover flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-card transition-all hover:shadow-lg">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={course.image_url || "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop"}
            alt={course.title}
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
              {getShortTitle(course.title)}
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
            {course.hours && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <Clock className="h-3 w-3" />
                {course.hours}h
              </span>
            )}
            {course.duration_range && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {course.duration_range}
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-ecid-blue-accent/10 px-2.5 py-1 text-xs font-medium text-ecid-blue-accent">
              <BadgeCheck className="h-3 w-3" />
              {course.certification || "Autorizado pelo MEC"}
            </span>
          </div>

          <h3 className="mb-2 line-clamp-2 text-base font-bold text-foreground">
            {course.title}
          </h3>
          
          <p className="mb-4 line-clamp-3 flex-1 text-sm text-muted-foreground">
            {course.description}
          </p>

          <div className="mb-4 space-y-1 border-t border-border pt-4">
            {course.original_price && (
              <p className="text-xs text-muted-foreground">
                <span className="line-through">De {course.original_price}</span>
              </p>
            )}
            {course.promo_price && (
              <p className="text-sm text-muted-foreground">Por {course.promo_price}</p>
            )}
            {course.installment && (
              <p className="text-2xl font-bold text-ecid-blue-accent">{course.installment}</p>
            )}
            <p className="text-xs text-muted-foreground">s/ juros no cartão de crédito</p>
          </div>

          <Button className="w-full rounded-lg bg-ecid-red font-semibold text-primary-foreground hover:bg-ecid-red-light">
            Quero me matricular
          </Button>
        </div>
      </article>
    </Link>
  );
};

const CoursesSection = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, slug, title, image_url, description, original_price, promo_price, installment, category, hours, duration_range, certification")
        .eq("is_active", true)
        .order("title");
      if (!error && data) setCourses(data as Course[]);
      setLoading(false);
    };
    fetchCourses();
  }, []);

  const technicalCourses = courses.filter(c => c.category === "tecnico");
  const certificationCourses = courses.filter(c => c.category === "competencia");
  const postTechnicalCourses = courses.filter(c => c.category === "pos-tecnico");

  if (loading) {
    return (
      <section id="courses" className="py-16 md:py-20">
        <div className="container mx-auto flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  return (
    <section id="courses" className="py-16 md:py-20">
      <div className="container mx-auto">
        {/* Technical Courses */}
        {technicalCourses.length > 0 && (
          <div className="mb-16">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">
                Cursos Técnicos <span className="underline decoration-ecid-blue-accent decoration-4 underline-offset-4">EAD</span>
              </h2>
              <Link
                to="/cursos?categoria=tecnico"
                className="hidden items-center gap-1 text-sm font-semibold text-ecid-blue-accent hover:underline sm:flex"
              >
                Ver todos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {technicalCourses.slice(0, 5).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            <div className="mt-6 text-center sm:hidden">
              <Link to="/cursos?categoria=tecnico">
                <Button variant="outline" className="rounded-lg font-semibold">
                  Ver todos os cursos
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Certification Courses */}
        {certificationCourses.length > 0 && (
          <div className="mb-16">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">
                Certificação por <span className="underline decoration-ecid-blue-accent decoration-4 underline-offset-4">Competência</span>
              </h2>
              <Link
                to="/cursos?categoria=competencia"
                className="hidden items-center gap-1 text-sm font-semibold text-ecid-blue-accent hover:underline sm:flex"
              >
                Ver todos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {certificationCourses.slice(0, 5).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            <div className="mt-6 text-center sm:hidden">
              <Link to="/cursos?categoria=competencia">
                <Button variant="outline" className="rounded-lg font-semibold">
                  Ver todos os cursos
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Post-Technical Courses */}
        {postTechnicalCourses.length > 0 && (
          <div>
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">
                Cursos <span className="underline decoration-ecid-blue-accent decoration-4 underline-offset-4">Pós-Técnicos</span> EAD
              </h2>
              <Link
                to="/cursos?categoria=pos-tecnico"
                className="hidden items-center gap-1 text-sm font-semibold text-ecid-blue-accent hover:underline sm:flex"
              >
                Ver todos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {postTechnicalCourses.slice(0, 5).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            <div className="mt-6 text-center sm:hidden">
              <Link to="/cursos?categoria=pos-tecnico">
                <Button variant="outline" className="rounded-lg font-semibold">
                  Ver todos os cursos
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CoursesSection;
