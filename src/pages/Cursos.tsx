import { useState, useEffect } from "react";
import { Search, ArrowLeft, Calendar, BadgeCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

interface Course {
  id: string;
  title: string;
  image: string;
  description: string;
  originalPrice: string;
  promoPrice: string;
  installment: string;
  category: "tecnico" | "competencia" | "pos-tecnico";
}

const allCourses: Course[] = [
  // Cursos Técnicos
  {
    id: "seguranca-trabalho",
    title: "Curso Técnico de Segurança do Trabalho EAD",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop",
    description: "Assuma um papel vital na proteção e bem-estar dos trabalhadores.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    category: "tecnico",
  },
  {
    id: "eletrotecnica",
    title: "Curso Técnico em Eletrotécnica EAD",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=400&fit=crop",
    description: "Carreira promissora e com alta demanda no mercado.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    category: "tecnico",
  },
  {
    id: "mecanica",
    title: "Curso Técnico em Mecânica EAD",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop",
    description: "Formação rápida e reconhecida para o mercado de trabalho.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    category: "tecnico",
  },
  {
    id: "administracao",
    title: "Curso Técnico de Administração EAD",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop",
    description: "Destaque-se no competitivo mundo dos negócios.",
    originalPrice: "R$ 1.590,00",
    promoPrice: "R$ 900,00",
    installment: "12x R$ 75,00",
    category: "tecnico",
  },
  {
    id: "edificacoes",
    title: "Curso Técnico de Edificações EAD",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&h=400&fit=crop",
    description: "Ingresse na promissora indústria da construção civil.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    category: "tecnico",
  },
  {
    id: "eletromecanica",
    title: "Curso Técnico em Eletromecânica EAD",
    image: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=600&h=400&fit=crop",
    description: "Especialize-se em eletricidade e mecânica.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    category: "tecnico",
  },
  {
    id: "tti",
    title: "Curso Técnico em Transações Imobiliárias (TTI) EAD",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop",
    description: "Atue como corretor de imóveis com respaldo do CRECI.",
    originalPrice: "R$ 1.750,00",
    promoPrice: "R$ 900,00",
    installment: "12x R$ 75,00",
    category: "tecnico",
  },
  {
    id: "agropecuaria",
    title: "Curso Técnico em Agropecuária EAD",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop",
    description: "Domine técnicas de produção agrícola e pecuária.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    category: "tecnico",
  },
  {
    id: "farmacia",
    title: "Curso Técnico em Farmácia EAD",
    image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&h=400&fit=crop",
    description: "Mergulhe no mundo da saúde e faça a diferença.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    category: "tecnico",
  },
  {
    id: "agricultura",
    title: "Curso Técnico em Agricultura EAD",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop",
    description: "Transforme sua paixão pelo campo em carreira de sucesso.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    category: "tecnico",
  },
  // Certificação por Competência
  {
    id: "certificacao-tecnica-competencia-administracao-empresarial",
    title: "Certificação Técnica por Competência em Administração",
    image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&h=400&fit=crop",
    description: "Transforme sua experiência em gestão empresarial, RH, finanças e processos organizacionais em diploma técnico reconhecido pelo MEC com registro no CRA.",
    originalPrice: "R$ 3.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
    category: "competencia",
  },
  {
    id: "certificacao-tecnica-competencia-automacao-industrial-clp-sensores",
    title: "Certificação Técnica por Competência em Automação Industrial",
    image: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=600&h=400&fit=crop",
    description: "Formalize sua experiência com CLPs (Siemens, Rockwell, WEG), sensores, redes industriais e sistemas SCADA com diploma técnico e registro no CREA.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
    category: "competencia",
  },
  {
    id: "certificacao-tecnica-competencia-edificacoes-construcao-civil",
    title: "Certificação Técnica por Competência em Edificações",
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=400&fit=crop",
    description: "Transforme sua experiência em obras, projetos, orçamentos e fiscalização em diploma técnico reconhecido pelo MEC com registro no CREA.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
    category: "competencia",
  },
  {
    id: "certificacao-tecnica-competencia-eletrotecnica-instalacoes-eletricas",
    title: "Certificação Técnica por Competência em Eletrotécnica",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
    description: "Formalize sua experiência em instalações elétricas, comandos, máquinas elétricas e manutenção com diploma técnico e registro no CREA.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
    category: "competencia",
  },
  {
    id: "certificacao-tecnica-competencia-seguranca-trabalho-sst-nr",
    title: "Certificação Técnica por Competência em Segurança do Trabalho",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=400&fit=crop",
    description: "Formalize sua experiência em SST, Normas Regulamentadoras, prevenção de acidentes e programas de segurança com diploma técnico e registro no MTE.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
    category: "competencia",
  },
  {
    id: "certificacao-tecnica-competencia-agricultura-producao-rural",
    title: "Certificação Técnica por Competência em Agricultura",
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&h=400&fit=crop",
    description: "Transforme sua experiência em cultivo, manejo de solo, irrigação e mecanização agrícola em diploma técnico reconhecido pelo MEC.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
    category: "competencia",
  },
  {
    id: "certificacao-tecnica-competencia-agropecuaria-producao-animal-vegetal",
    title: "Certificação Técnica por Competência em Agropecuária",
    image: "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=600&h=400&fit=crop",
    description: "Formalize sua experiência integrada em produção agrícola e pecuária, manejo de rebanhos e gestão rural com diploma técnico.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
    category: "competencia",
  },
  {
    id: "certificacao-tecnica-competencia-analises-clinicas-laboratorio",
    title: "Certificação Técnica por Competência em Análises Clínicas",
    image: "https://images.unsplash.com/photo-1579165466949-3180a3d056d5?w=600&h=400&fit=crop",
    description: "Formalize sua experiência em laboratório, coleta de amostras, bioquímica, hematologia e microbiologia com diploma técnico pelo MEC.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
    category: "competencia",
  },
  {
    id: "certificacao-tecnica-competencia-eletroeletronica-circuitos-microcontroladores",
    title: "Certificação Técnica por Competência em Eletroeletrônica",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop",
    description: "Formalize sua experiência em eletrônica analógica, digital, microcontroladores e instrumentação com diploma técnico e registro no CREA.",
    originalPrice: "R$ 3.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
    category: "competencia",
  },
  {
    id: "certificacao-tecnica-competencia-mecanica-industrial-manutencao",
    title: "Certificação Técnica por Competência em Mecânica",
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop",
    description: "Formalize sua experiência em mecânica industrial, usinagem, manutenção e processos de fabricação com diploma técnico e registro no CREA.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
    category: "competencia",
  },
  // Pós-Técnicos
  {
    id: "pos-administracao-producao",
    title: "Especialização Técnica em Administração da Produção EAD",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop",
    description: "Aprofunde conhecimentos na gestão de processos produtivos, planejamento, controle da produção, qualidade e melhoria contínua.",
    originalPrice: "R$ 1.500,00",
    promoPrice: "R$ 850,00",
    installment: "12x R$ 70,83",
    category: "pos-tecnico",
  },
  {
    id: "pos-materiais",
    title: "Especialização Técnica em Administração de Materiais EAD",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=400&fit=crop",
    description: "Gestão de estoques, compras, almoxarifado, logística e controle de suprimentos para profissionais técnicos.",
    originalPrice: "R$ 1.500,00",
    promoPrice: "R$ 850,00",
    installment: "12x R$ 70,83",
    category: "pos-tecnico",
  },
  {
    id: "pos-farmacia-hospitalar",
    title: "Especialização Técnica em Farmácia Hospitalar EAD",
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&h=400&fit=crop",
    description: "Gestão e controle de medicamentos, materiais e insumos em ambientes hospitalares e clínicos.",
    originalPrice: "R$ 1.500,00",
    promoPrice: "R$ 850,00",
    installment: "12x R$ 70,83",
    category: "pos-tecnico",
  },
  {
    id: "pos-saude-publica",
    title: "Especialização Técnica em Saúde Pública EAD",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop",
    description: "Políticas públicas, vigilância em saúde, prevenção de doenças e promoção da saúde coletiva no SUS.",
    originalPrice: "R$ 1.500,00",
    promoPrice: "R$ 850,00",
    installment: "12x R$ 70,83",
    category: "pos-tecnico",
  },
  {
    id: "pos-oncologia",
    title: "Especialização Técnica em Oncologia EAD",
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&h=400&fit=crop",
    description: "Cuidado e tratamento de pacientes com câncer. Atue de forma qualificada e humanizada em equipes multiprofissionais.",
    originalPrice: "R$ 1.500,00",
    promoPrice: "R$ 850,00",
    installment: "12x R$ 70,83",
    category: "pos-tecnico",
  },
];

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
    <Link to={`/curso/${course.id}`}>
      <article className="group card-hover flex flex-col overflow-hidden rounded-2xl bg-card shadow-card">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={course.image}
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
            <p className="text-xs text-muted-foreground">
              <span className="line-through">De {course.originalPrice}</span>
            </p>
            <p className="text-sm text-muted-foreground">Por {course.promoPrice}</p>
            <p className="text-2xl font-bold text-ecid-blue-accent">{course.installment}</p>
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

  // Sync URL params with state
  useEffect(() => {
    const categoria = searchParams.get("categoria");
    const q = searchParams.get("q");
    if (categoria) setActiveTab(categoria);
    if (q) setSearchTerm(q);
  }, [searchParams]);

  // Update URL when tab changes
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

  const filteredCourses = allCourses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeTab === "todos" || course.category === activeTab;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
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

      {/* Courses List */}
      <section className="py-12">
        <div className="container mx-auto">
          {/* Search and Filter */}
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
              <TabsList className="grid w-full grid-cols-4 md:w-auto">
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="tecnico">Técnicos</TabsTrigger>
                <TabsTrigger value="competencia">Competência</TabsTrigger>
                <TabsTrigger value="pos-tecnico">Pós-Técnico</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Courses Grid */}
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
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Cursos;