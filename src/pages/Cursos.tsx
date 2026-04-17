import { useState, useEffect } from "react";
import { Search, ArrowLeft, Calendar, BadgeCheck, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
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
    if (course.category === "segundo-grau") return "EJA - Ensino Médio";
    return "Curso Técnico EAD";
  };

  return (
    <Link to={`/curso/${course.slug}`}>
      <article className="group card-hover flex flex-col overflow-hidden rounded-2xl bg-card shadow-card">
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
            {course.title}
          </h3>
          
          <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">
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

const Cursos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [activeTab, setActiveTab] = useState(searchParams.get("categoria") || "todos");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, slug, title, image_url, description, original_price, promo_price, installment, category")
        .eq("is_active", true)
        .order("title");
      if (!error && data) setCourses(data);
      setLoading(false);
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const categoria = searchParams.get("categoria");
    const q = searchParams.get("q");
    if (categoria) setActiveTab(categoria);
    if (q) setSearchTerm(q);
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const newParams = new URLSearchParams(searchParams);
    if (value === "todos") {
      newParams.delete("categoria");
    } else {
      newParams.set("categoria", value);
    }
    setSearchParams(newParams);
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeTab === "todos" || course.category === activeTab;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="bg-gradient-to-r from-ecid-navy to-ecid-navy/90 py-12">
        <div className="container mx-auto">
          <Link 
            to="/" 
            className="mb-4 inline-flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <h1 className="text-3xl font-bold text-primary-foreground md:text-4xl">
            Todos os <span className="underline decoration-ecid-blue-accent decoration-4 underline-offset-4">Cursos</span>
          </h1>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 w-full rounded-xl border-border bg-card pl-12 pr-4 text-base shadow-sm"
              />
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full md:w-auto">
              <TabsList className="grid w-full grid-cols-5 md:w-auto">
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="extensao">Extensão</TabsTrigger>
                <TabsTrigger value="competencia">Competência</TabsTrigger>
                <TabsTrigger value="pos-tecnico">Pós-Técnico</TabsTrigger>
                <TabsTrigger value="segundo-grau">Segundo Grau</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>

              {filteredCourses.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Nenhum curso encontrado para "{searchTerm}"
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Cursos;
