import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, BadgeCheck, Clock, BookOpen, Award, Users, CheckCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const coursesData: Record<string, {
  title: string;
  image: string;
  description: string;
  fullDescription: string;
  originalPrice: string;
  promoPrice: string;
  installment: string;
  duration: string;
  modules: number;
  category: string;
  objectives: string[];
  targetAudience: string[];
  curriculum: string[];
}> = {
  "seguranca-trabalho": {
    title: "Curso Técnico de Segurança do Trabalho EAD",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=600&fit=crop",
    description: "Assuma um papel vital na proteção e bem-estar dos trabalhadores.",
    fullDescription: "Você está pronto para assumir um papel vital na proteção e bem-estar dos trabalhadores? O Curso Técnico em Segurança do Trabalho EAD, autorizado pelo MEC, é a sua oportunidade de se destacar em uma área essencial e em constante demanda, oferecendo uma formação de qualidade, flexível e reconhecida nacionalmente. Este curso é ideal para estudantes que desejam iniciar uma carreira na área de segurança do trabalho, profissionais que buscam aprimorar suas habilidades ou qualquer pessoa interessada em uma mudança de carreira.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    duration: "6 meses",
    modules: 12,
    category: "Curso Técnico EAD",
    objectives: [
      "Formar profissionais capacitados para atuar na prevenção de acidentes de trabalho",
      "Desenvolver competências para elaboração de programas de segurança",
      "Capacitar para inspeção e análise de riscos ocupacionais",
      "Preparar para atuar em conformidade com as Normas Regulamentadoras (NRs)",
    ],
    targetAudience: [
      "Estudantes que desejam iniciar carreira em segurança do trabalho",
      "Profissionais que buscam qualificação na área",
      "Pessoas interessadas em mudança de carreira",
      "Trabalhadores que atuam em ambientes industriais",
    ],
    curriculum: [
      "Introdução à Segurança do Trabalho",
      "Normas Regulamentadoras (NRs)",
      "Higiene Ocupacional",
      "Prevenção e Combate a Incêndios",
      "Ergonomia",
      "Primeiros Socorros",
      "Gestão de Riscos",
      "EPI e EPC",
      "CIPA e SIPAT",
      "Perícias e Laudos Técnicos",
      "Legislação Trabalhista",
      "Projeto Integrador",
    ],
  },
  "eletrotecnica": {
    title: "Curso Técnico em Eletrotécnica EAD",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&h=600&fit=crop",
    description: "Carreira promissora e com alta demanda no mercado.",
    fullDescription: "Está procurando uma carreira promissora e com alta demanda? Imagine se tornar um profissional qualificado em eletrotécnica em tempo recorde, com a flexibilidade do ensino a distância. Com o nosso Curso Técnico em Eletrotécnica EAD, você conquista seu diploma em apenas 6 meses e garante uma certificação reconhecida pelo MEC, abrindo portas para um futuro brilhante. O mercado clama por eletrotécnicos competentes e você pode ser um deles!",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    duration: "6 meses",
    modules: 12,
    category: "Curso Técnico EAD",
    objectives: [
      "Formar profissionais capacitados para projetos elétricos",
      "Desenvolver competências em instalações elétricas industriais",
      "Capacitar para manutenção de sistemas elétricos",
      "Preparar para atuação em conformidade com normas técnicas",
    ],
    targetAudience: [
      "Estudantes que desejam atuar na área elétrica",
      "Profissionais que buscam qualificação técnica",
      "Eletricistas que desejam formalizar conhecimentos",
      "Pessoas interessadas em carreiras na indústria",
    ],
    curriculum: [
      "Fundamentos de Eletricidade",
      "Circuitos Elétricos",
      "Instalações Elétricas Prediais",
      "Instalações Elétricas Industriais",
      "Máquinas Elétricas",
      "Eletrônica Básica",
      "Comandos Elétricos",
      "Automação Industrial",
      "Proteção de Sistemas Elétricos",
      "Eficiência Energética",
      "Normas Técnicas (NR-10)",
      "Projeto Integrador",
    ],
  },
  // Default fallback for courses not fully defined
};

const defaultCourse = {
  title: "Curso Técnico EAD",
  image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=600&fit=crop",
  description: "Formação técnica de qualidade reconhecida pelo MEC.",
  fullDescription: "Nossos cursos técnicos EAD oferecem formação completa e flexível, permitindo que você estude no seu ritmo e conquiste uma certificação reconhecida pelo MEC. Com professores qualificados e material didático atualizado, preparamos você para o mercado de trabalho.",
  originalPrice: "R$ 2.500,00",
  promoPrice: "R$ 1.500,00",
  installment: "12x R$ 125,00",
  duration: "6 meses",
  modules: 12,
  category: "Curso Técnico EAD",
  objectives: [
    "Formar profissionais qualificados para o mercado de trabalho",
    "Desenvolver competências técnicas e práticas",
    "Preparar para atuação em conformidade com normas técnicas",
    "Capacitar para obtenção de registro profissional",
  ],
  targetAudience: [
    "Estudantes que desejam formação técnica",
    "Profissionais que buscam qualificação",
    "Pessoas interessadas em mudança de carreira",
    "Trabalhadores que buscam melhores oportunidades",
  ],
  curriculum: [
    "Módulo 1 - Fundamentos",
    "Módulo 2 - Conceitos Básicos",
    "Módulo 3 - Aplicações Práticas",
    "Módulo 4 - Normas e Regulamentos",
    "Módulo 5 - Gestão e Processos",
    "Módulo 6 - Projeto Integrador",
  ],
};

const CursoDetalhe = () => {
  const { id } = useParams();
  const course = coursesData[id || ""] || defaultCourse;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-ecid-navy to-ecid-navy/90 py-12">
        <div className="container mx-auto">
          <Link 
            to="/cursos" 
            className="mb-4 inline-flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para cursos
          </Link>
          
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
            <div className="flex-1">
              <span className="mb-2 inline-block rounded-full bg-ecid-yellow px-3 py-1 text-xs font-bold uppercase tracking-wide text-ecid-navy">
                {course.category}
              </span>
              <h1 className="mb-4 text-3xl font-bold text-primary-foreground md:text-4xl">
                {course.title}
              </h1>
              <p className="mb-6 text-lg text-primary-foreground/80">
                {course.description}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 rounded-lg bg-primary-foreground/10 px-4 py-2">
                  <Clock className="h-5 w-5 text-ecid-yellow" />
                  <span className="text-sm font-medium text-primary-foreground">{course.duration}</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-primary-foreground/10 px-4 py-2">
                  <BookOpen className="h-5 w-5 text-ecid-yellow" />
                  <span className="text-sm font-medium text-primary-foreground">{course.modules} módulos</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-primary-foreground/10 px-4 py-2">
                  <Award className="h-5 w-5 text-ecid-yellow" />
                  <span className="text-sm font-medium text-primary-foreground">Autorizado pelo MEC</span>
                </div>
              </div>
            </div>
            
            {/* Price Card */}
            <div className="w-full rounded-2xl bg-card p-6 shadow-lg lg:w-96">
              <div className="mb-4 overflow-hidden rounded-xl">
                <img src={course.image} alt={course.title} className="h-48 w-full object-cover" />
              </div>
              
              <div className="mb-4 space-y-1">
                <p className="text-sm text-muted-foreground line-through">De {course.originalPrice}</p>
                <p className="text-lg text-muted-foreground">Por {course.promoPrice}</p>
                <p className="text-3xl font-bold text-ecid-blue-accent">{course.installment}</p>
                <p className="text-sm text-muted-foreground">s/ juros no cartão de crédito</p>
              </div>
              
              <div className="mb-4 rounded-lg bg-ecid-yellow/10 p-3">
                <p className="text-center text-sm font-medium text-ecid-navy">
                  Use o cupom <span className="font-bold">FAESDE30</span> e ganhe 30% OFF!
                </p>
              </div>
              
              <Button className="mb-3 w-full rounded-lg bg-ecid-red py-6 text-lg font-semibold text-primary-foreground hover:bg-ecid-red-light">
                Quero me matricular
              </Button>
              
              <Button variant="outline" className="w-full rounded-lg border-green-500 py-6 text-green-600 hover:bg-green-50">
                <MessageCircle className="mr-2 h-5 w-5" />
                Falar no WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Course Details */}
      <section className="py-12">
        <div className="container mx-auto">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              <div className="rounded-2xl bg-card p-6 shadow-card">
                <h2 className="mb-4 text-xl font-bold text-foreground">Sobre o Curso</h2>
                <p className="text-muted-foreground leading-relaxed">{course.fullDescription}</p>
              </div>
              
              {/* Objectives */}
              <div className="rounded-2xl bg-card p-6 shadow-card">
                <h2 className="mb-4 text-xl font-bold text-foreground">Objetivos do Curso</h2>
                <ul className="space-y-3">
                  {course.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                      <span className="text-muted-foreground">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Target Audience */}
              <div className="rounded-2xl bg-card p-6 shadow-card">
                <h2 className="mb-4 text-xl font-bold text-foreground">Público-Alvo</h2>
                <ul className="space-y-3">
                  {course.targetAudience.map((audience, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Users className="mt-0.5 h-5 w-5 flex-shrink-0 text-ecid-blue-accent" />
                      <span className="text-muted-foreground">{audience}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Curriculum */}
              <div className="rounded-2xl bg-card p-6 shadow-card">
                <h2 className="mb-4 text-xl font-bold text-foreground">Grade Curricular</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {course.curriculum.map((module, index) => (
                    <div key={index} className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ecid-blue-accent text-sm font-bold text-primary-foreground">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-foreground">{module}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Benefits */}
              <div className="rounded-2xl bg-ecid-navy p-6">
                <h3 className="mb-4 text-lg font-bold text-primary-foreground">Benefícios</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-ecid-yellow" />
                    <span className="text-sm text-primary-foreground/80">Início imediato</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <BadgeCheck className="h-5 w-5 text-ecid-yellow" />
                    <span className="text-sm text-primary-foreground/80">Certificado MEC</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-ecid-yellow" />
                    <span className="text-sm text-primary-foreground/80">Estude no seu ritmo</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-ecid-yellow" />
                    <span className="text-sm text-primary-foreground/80">Registro profissional</span>
                  </li>
                </ul>
              </div>
              
              {/* Help */}
              <div className="rounded-2xl bg-green-600 p-6">
                <h3 className="mb-2 text-lg font-bold text-primary-foreground">Ficou com dúvidas?</h3>
                <p className="mb-4 text-sm text-primary-foreground/80">
                  Nossa equipe está pronta para te ajudar!
                </p>
                <Button className="w-full bg-primary-foreground text-green-600 hover:bg-primary-foreground/90">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Falar no WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default CursoDetalhe;