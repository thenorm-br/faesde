import { useState, useEffect, useMemo, useDeferredValue } from "react";
import { Search, ArrowLeft, Calendar, BadgeCheck, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Header from "@/components/Header.tsx";
import Footer from "@/components/Footer.tsx";
import WhatsAppButton from "@/components/WhatsAppButton.tsx";
import { supabase } from "@/integrations/supabase/client.ts";
import { scoreCourse, getRelatedKeywords } from "@/lib/courseSearch.ts";
import {
  buildCategoryMetas,
  getCategoryPath,
  getCategorySlugFromRoute,
  getCourseCardLabel,
  getCourseCategoryMeta,
} from "@/lib/courseCategories.ts";
import { trackCourseCategoryView, trackCourseSearch, trackCourseSelect } from "@/lib/analytics.ts";

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

const CourseCard = ({ course, listName }: { course: Course; listName: string }) => {
  const getShortTitle = (fullTitle: string) => {
    return fullTitle
      .replace("Curso Técnico de ", "")
      .replace("Curso Técnico em ", "")
      .replace("Certificação Técnica por Competência em ", "")
      .replace("Especialização Técnica em ", "")
      .replace(" EAD", "")
      .toUpperCase();
  };

  return (
    <Link to={`/curso/${course.slug}`} onClick={() => trackCourseSelect(course, listName)}>
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
              {getCourseCardLabel(course.category)}
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
  const [searchParams] = useSearchParams();
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [activeTab, setActiveTab] = useState(
    categorySlug ? getCategorySlugFromRoute(categorySlug) : searchParams.get("categoria") || "todos",
  );
  const deferredSearchTerm = useDeferredValue(searchTerm);
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
    const categoria = categorySlug ? getCategorySlugFromRoute(categorySlug) : searchParams.get("categoria");
    const q = searchParams.get("q");
    setActiveTab(categoria || "todos");
    setSearchTerm(q || "");
  }, [categorySlug, searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("categoria");
    if (searchTerm.trim()) {
      newParams.set("q", searchTerm.trim());
    } else {
      newParams.delete("q");
    }
    const query = newParams.toString();
    const targetPath = value === "todos" ? "/cursos" : getCategoryPath(value);
    navigate(`${targetPath}${query ? `?${query}` : ""}`);
  };

  const filteredCourses = useMemo(() => {
    const byCategory = courses.filter(
      (c) => activeTab === "todos" || c.category === activeTab
    );
    const q = deferredSearchTerm.trim();
    if (!q) return byCategory;
    return byCategory
      .map((c) => ({ c, s: scoreCourse(c, q) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.c);
  }, [courses, activeTab, deferredSearchTerm]);

  const categoryTabs = useMemo(
    () => buildCategoryMetas(courses.map((course) => course.category)),
    [courses],
  );

  const relatedKeywords = useMemo(() => getRelatedKeywords(searchTerm), [searchTerm]);
  const activeCategoryMeta = activeTab === "todos" ? null : getCourseCategoryMeta(activeTab);

  useEffect(() => {
    if (loading) return;
    trackCourseCategoryView(activeTab, activeCategoryMeta?.label || "Todos os cursos", filteredCourses.length);
  }, [activeTab, activeCategoryMeta?.label, filteredCourses.length, loading]);

  useEffect(() => {
    if (loading) return;
    const term = deferredSearchTerm.trim();
    if (term.length < 2) return;

    const timer = window.setTimeout(() => {
      trackCourseSearch(term, filteredCourses.length, activeTab);
    }, 900);

    return () => window.clearTimeout(timer);
  }, [activeTab, deferredSearchTerm, filteredCourses.length, loading]);

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
            {activeCategoryMeta ? (
              <>{activeCategoryMeta.sectionTitle}</>
            ) : (
              <>Todos os <span className="underline decoration-ecid-blue-accent decoration-4 underline-offset-4">Cursos</span></>
            )}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-primary-foreground/80 md:text-base">
            {activeCategoryMeta
              ? `${activeCategoryMeta.description} Encontre formações FAESDE para estudar online, validar competências profissionais e ampliar oportunidades em concursos, processos seletivos e mercado de trabalho.`
              : "Busque cursos técnicos EAD, certificação por competência, pós-técnicos e EJA para estudar online, obter certificação e melhorar sua preparação profissional."}
          </p>
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
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted"
                  aria-label="Limpar busca"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full md:w-auto">
              <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0 md:w-auto">
                <TabsTrigger value="todos" className="rounded-lg border border-border bg-card px-4">
                  Todos
                </TabsTrigger>
                {categoryTabs.map((category) => (
                  <TabsTrigger
                    key={category.slug}
                    value={category.slug}
                    className="rounded-lg border border-border bg-card px-4"
                  >
                    {category.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {searchTerm && (
                <p className="mb-4 text-sm text-muted-foreground">
                  {filteredCourses.length} resultado{filteredCourses.length === 1 ? "" : "s"} para{" "}
                  <span className="font-semibold text-foreground">"{searchTerm}"</span>
                </p>
              )}

              {searchTerm && relatedKeywords.length > 0 && (
                <div className="mb-6 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">Relacionados:</span>
                  {relatedKeywords.map((kw) => (
                    <button
                      key={kw}
                      type="button"
                      onClick={() => setSearchTerm(kw)}
                      className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-ecid-blue-accent hover:text-primary-foreground"
                    >
                      {kw}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} listName={activeCategoryMeta?.label || "Todos os cursos"} />
                ))}
              </div>

              {filteredCourses.length === 0 && (
                <div className="py-12 text-center">
                  <p className="mb-2 text-muted-foreground">
                    Nenhum curso encontrado para "{searchTerm}"
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tente termos como: enfermagem, estética, informática, segurança, gastronomia
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
