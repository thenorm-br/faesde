import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Award, Star, Play, CheckCircle, MessageCircle, BookOpen, Users, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useState } from "react";

interface CourseModule {
  name: string;
  subjects: { name: string; hours: number }[];
}

interface CourseData {
  title: string;
  subtitle: string;
  image: string;
  bannerImage: string;
  description: string;
  originalPrice: string;
  promoPrice: string;
  installment: string;
  hours: number;
  durationRange: string;
  certification: string;
  rating: number;
  youtubeVideoId: string;
  category: string;
  registration: {
    portaria: string;
    parecer: string;
    approvedDate: string;
    registerWith: string;
  };
  aboutCourse: string;
  howItWorks: string[];
  profession: string;
  market: string;
  methodology: {
    materials: string[];
    services: string[];
    responseTime: string;
  };
  requirements: string[];
  tutoring: string;
  tutorAttributes: string[];
  modules: CourseModule[];
  access: { title: string; description: string }[];
  faq: { question: string; answer: string }[];
}

const coursesData: Record<string, CourseData> = {
  "seguranca-trabalho": {
    title: "Curso Técnico de Segurança do Trabalho EAD",
    subtitle: "Escolher o Curso Técnico de Segurança do Trabalho EAD autorizado pelo MEC e com conclusão a partir de 6 meses é a sua escolha certa",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=600&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&h=400&fit=crop",
    description: "Você está pronto para assumir um papel vital na proteção e bem-estar dos trabalhadores? O Curso Técnico em Segurança do Trabalho EAD, autorizado pelo MEC, é a sua oportunidade de se destacar em uma área essencial e em constante demanda, oferecendo uma formação de qualidade, flexível e reconhecida nacionalmente. Este curso é ideal para estudantes que desejam iniciar uma carreira na área de segurança do trabalho, profissionais que buscam aprimorar suas habilidades ou qualquer pessoa interessada em uma mudança de carreira. Independentemente do seu nível de experiência, estamos aqui para apoiar seu desenvolvimento em cada etapa.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "R$ 125,00",
    hours: 1440,
    durationRange: "6 a 12 meses",
    certification: "Certificação válida para MTE",
    rating: 5.0,
    youtubeVideoId: "pn97Z1-ssFI",
    category: "Curso Técnico EAD",
    registration: {
      portaria: "SEE-PRC-2021/12170",
      parecer: "218/2021",
      approvedDate: "07/10/2021",
      registerWith: "Registro no MTE"
    },
    aboutCourse: "Você está pronto para assumir um papel vital na proteção e bem-estar dos trabalhadores? O Curso Técnico em Segurança do Trabalho EAD, autorizado pelo MEC, é a sua oportunidade de se destacar em uma área essencial e em constante demanda, oferecendo uma formação de qualidade, flexível e reconhecida nacionalmente. Este curso é ideal para estudantes que desejam iniciar uma carreira na área de segurança do trabalho, profissionais que buscam aprimorar suas habilidades ou qualquer pessoa interessada em uma mudança de carreira. Independentemente do seu nível de experiência, estamos aqui para apoiar seu desenvolvimento em cada etapa.",
    howItWorks: [
      "O Curso Técnico em Segurança do Trabalho na modalidade Educação a Distância (EAD) representa uma oportunidade única para aqueles que buscam especialização e qualificação em uma área de fundamental importância para o bem-estar e a proteção dos trabalhadores em diversos setores da economia. Autorizado pelo Ministério da Educação (MEC), este curso garante a qualidade e o reconhecimento necessários para que os profissionais possam atuar de maneira eficaz e com a credibilidade exigida pelo mercado de trabalho.",
      "O objetivo principal do Curso Técnico em Segurança do Trabalho EAD é formar profissionais capacitados para identificar, avaliar e controlar potenciais riscos à saúde e segurança dos trabalhadores, além de desenvolver e implementar políticas e programas de prevenção de acidentes e doenças ocupacionais. Por meio de uma abordagem multidisciplinar, o curso prepara o técnico para atuar em conformidade com a legislação trabalhista e as normas técnicas de segurança, promovendo ambientes de trabalho mais seguros e saudáveis.",
      "Além de ser autorizado pelo MEC, o curso está alinhado com as demandas atuais do mercado de trabalho, preparando os profissionais para atuarem em empresas de pequeno, médio e grande porte, tanto no setor público quanto no privado. Os técnicos em segurança do trabalho desempenham um papel crucial na prevenção de acidentes e na promoção da saúde ocupacional, contribuindo significativamente para a redução de custos relacionados a afastamentos e indenizações, e para o aumento da produtividade e satisfação dos trabalhadores.",
      "Investir no Curso Técnico em Segurança do Trabalho EAD é uma decisão estratégica para quem deseja se destacar em uma carreira com grande demanda por profissionais qualificados e comprometidos com a criação de ambientes de trabalho seguros e saudáveis."
    ],
    profession: "A profissão de Técnico em Segurança do Trabalho é vital para garantir ambientes laborais seguros e saudáveis, desempenhando um papel crucial na prevenção de acidentes e na promoção da saúde dos trabalhadores. Esses profissionais são responsáveis por identificar riscos, desenvolver planos de segurança, e assegurar a conformidade com normas regulamentadoras e legislações pertinentes. Com uma formação técnica especializada, eles estão aptos a atuar em uma ampla gama de setores, incluindo indústria, construção civil, saúde, educação, e até mesmo no setor público, adaptando-se às necessidades específicas de cada área para implementar as melhores práticas de segurança e saúde ocupacional. A demanda por Técnicos em Segurança do Trabalho é constante e abrangente, refletindo a crescente preocupação com a segurança no trabalho em diferentes segmentos econômicos. Este profissional não apenas contribui para a criação de um ambiente de trabalho seguro, mas também ajuda as empresas a reduzirem custos com acidentes e doenças ocupacionais, enfatizando a importância de uma cultura de prevenção e cuidado no ambiente de trabalho.",
    market: "O mercado de trabalho para o Técnico em Segurança do Trabalho encontra-se em constante expansão e diversificação, impulsionado pela crescente conscientização das empresas sobre a importância de manter ambientes de trabalho seguros e saudáveis. Esta demanda é reforçada pela rigorosa legislação trabalhista e normas regulamentadoras que exigem a presença de profissionais qualificados para gerenciar riscos ocupacionais e promover a saúde dos trabalhadores. Os setores industriais, de construção civil, petroquímico, mineração e saúde são tradicionalmente grandes empregadores desses técnicos, mas há também uma crescente oportunidade em setores emergentes e em pequenas e médias empresas que começam a reconhecer a importância de implementar práticas de segurança laboral.\n\nAlém disso, o avanço tecnológico e a introdução de novas metodologias de trabalho remoto trazem novos desafios e oportunidades para a atuação desses profissionais, que devem se adaptar para gerenciar riscos em ambientes de trabalho cada vez mais digitais e flexíveis. A formação em Segurança do Trabalho também abre portas para atuação em áreas de consultoria, treinamento e educação, ampliando ainda mais o leque de oportunidades. Com isso, a carreira promete não só estabilidade e uma ampla gama de áreas de atuação, mas também a possibilidade de fazer a diferença na vida das pessoas, promovendo ambientes de trabalho mais seguros e saudáveis. Assim, o mercado para o Técnico em Segurança do Trabalho se mostra promissor, com expectativas de crescimento e valorização desses profissionais no cenário econômico atual.",
    methodology: {
      materials: ["Video-aulas", "Apostilas", "Artigos", "Biblioteca digital"],
      services: ["Requerimento de declarações", "Histórico", "Estágio", "Matriz curricular", "E outras solicitações em geral"],
      responseTime: "Todos por abertura de chamados devidamente protocolado e respondidos dentro de 48 horas. Possuirá também acesso diretamente aos tutores devidamente qualificados e preparados para sanar dúvidas com relação ao conteúdo e atividades."
    },
    requirements: [
      "Cópia do RG e do CPF",
      "Comprovante de Residência",
      "Cópia do Histórico Escolar e do Certificado de Conclusão do Ensino Médio (2º Grau)"
    ],
    tutoring: "Durante todo o curso o aluno poderá sanar suas dúvidas e terá um acompanhamento do tutor pelo seu portal do aluno, com um tempo de resposta máximo de 48 horas. O tutor é o profissional que acompanha como mediador o seu processo de ensino e aprendizagem, com o objetivo de promover momentos de interação e colaboração que favoreçam a construção do conhecimento. Este profissional é responsável pela administração do fluxo de informações, tanto as originadas do conteúdo da disciplina quanto dos alunos.",
    tutorAttributes: [
      "Apoiar os alunos na plataforma de estudos e responder às mensagens",
      "Acompanhar e orientar os alunos durante o desenvolvimento das atividades de cada disciplina",
      "Buscar informações e questões destinadas à melhoria do processo de ensino e aprendizagem"
    ],
    modules: [
      {
        name: "Módulo 01",
        subjects: [
          { name: "Introdução ao EAD", hours: 80 },
          { name: "Gestão de Recursos Humanos", hours: 80 },
          { name: "Introdução à Segurança do Trabalho", hours: 60 },
          { name: "Psicologia do Trabalho", hours: 40 },
          { name: "Higiene do Trabalho", hours: 80 },
          { name: "Empreendedorismo", hours: 40 }
        ]
      },
      {
        name: "Módulo 02",
        subjects: [
          { name: "Prevenção e Combate a Incêndio", hours: 80 },
          { name: "Ergonomia", hours: 60 },
          { name: "Gestão Ambiental", hours: 40 },
          { name: "Gestão da Qualidade", hours: 40 }
        ]
      },
      {
        name: "Módulo 03",
        subjects: [
          { name: "Legislação e Normas Técnicas", hours: 80 },
          { name: "Certificação da Qualidade", hours: 60 },
          { name: "Segurança, Meio Ambiente, Saúde e Responsabilidade Social", hours: 80 },
          { name: "Segurança do Trabalho na Construção Civil MV18", hours: 80 }
        ]
      },
      {
        name: "Módulo 04",
        subjects: [
          { name: "Gestão de Riscos", hours: 80 },
          { name: "Planejamento Estratégico", hours: 80 },
          { name: "Auditorias, Perícias e Laudos", hours: 60 },
          { name: "Ética e Cidadania", hours: 80 },
          { name: "Orientações do Estágio Supervisionado", hours: 240 }
        ]
      }
    ],
    access: [
      { title: "Video Aulas", description: "E Apostilas para você estudar onde e quando quiser." },
      { title: "Tutoria", description: "Para sanar todas as dúvidas durante o curso." },
      { title: "Diploma", description: "Autorizado pelo MEC em até 30 dias após a conclusão." }
    ],
    faq: [
      { question: "Quais as formas de pagamento?", answer: "Aceitamos cartão de crédito em até 12x sem juros, boleto bancário e PIX." },
      { question: "É seguro comprar pelo site?", answer: "Sim, nosso site possui certificado SSL e todas as transações são processadas de forma segura." },
      { question: "Os cursos são autorizados pelo MEC?", answer: "Sim, todos os nossos cursos técnicos são devidamente autorizados pelo Ministério da Educação (MEC)." }
    ]
  }
};

const defaultCourse: CourseData = {
  title: "Curso Técnico EAD",
  subtitle: "Formação técnica de qualidade reconhecida pelo MEC",
  image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=600&fit=crop",
  bannerImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&h=400&fit=crop",
  description: "Nossos cursos técnicos EAD oferecem formação completa e flexível, permitindo que você estude no seu ritmo e conquiste uma certificação reconhecida pelo MEC.",
  originalPrice: "R$ 2.500,00",
  promoPrice: "R$ 1.500,00",
  installment: "R$ 125,00",
  hours: 1200,
  durationRange: "6 a 12 meses",
  certification: "Certificação válida",
  rating: 5.0,
  youtubeVideoId: "",
  category: "Curso Técnico EAD",
  registration: {
    portaria: "",
    parecer: "",
    approvedDate: "",
    registerWith: "Registro Profissional"
  },
  aboutCourse: "Nossos cursos técnicos EAD oferecem formação completa e flexível, permitindo que você estude no seu ritmo e conquiste uma certificação reconhecida pelo MEC.",
  howItWorks: ["Formação técnica completa com flexibilidade do ensino a distância."],
  profession: "Formação profissional reconhecida nacionalmente.",
  market: "Mercado em expansão com diversas oportunidades.",
  methodology: {
    materials: ["Video-aulas", "Apostilas", "Biblioteca digital"],
    services: ["Requerimento de declarações", "Histórico", "Matriz curricular"],
    responseTime: "Chamados respondidos dentro de 48 horas."
  },
  requirements: [
    "Cópia do RG e do CPF",
    "Comprovante de Residência",
    "Certificado de Conclusão do Ensino Médio"
  ],
  tutoring: "Acompanhamento do tutor pelo portal do aluno.",
  tutorAttributes: ["Apoiar os alunos na plataforma", "Orientar durante as atividades"],
  modules: [],
  access: [
    { title: "Video Aulas", description: "Estude onde e quando quiser." },
    { title: "Tutoria", description: "Tire suas dúvidas." },
    { title: "Diploma", description: "Autorizado pelo MEC." }
  ],
  faq: []
};

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-5 w-5 ${i < rating ? "fill-ecid-yellow text-ecid-yellow" : "text-muted"}`}
        />
      ))}
      <span className="ml-2 text-lg font-bold text-primary-foreground">{rating.toFixed(1)}</span>
    </div>
  );
};

const CursoDetalhe = () => {
  const { id } = useParams();
  const course = coursesData[id || ""] || defaultCourse;
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Banner */}
      <section className="relative">
        <div 
          className="h-64 w-full bg-cover bg-center md:h-80"
          style={{ backgroundImage: `url(${course.bannerImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-ecid-navy/90 to-ecid-navy/70" />
        </div>
        
        <div className="container relative mx-auto -mt-32 px-4 md:-mt-40">
          <Link 
            to="/cursos" 
            className="mb-4 inline-flex items-center gap-2 text-sm text-primary-foreground/80 hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Left Content */}
            <div className="flex-1 pb-8">
              <StarRating rating={course.rating} />
              
              <h1 className="my-4 text-2xl font-bold text-primary-foreground md:text-4xl">
                {course.title}
              </h1>
              
              <h2 className="mb-6 text-base text-primary-foreground/80 md:text-lg">
                {course.subtitle}
              </h2>
              
              <p className="mb-6 text-sm leading-relaxed text-primary-foreground/70 md:text-base">
                {course.description}
              </p>
              
              {/* Badges */}
              <div className="mb-6 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2">
                  <Clock className="h-4 w-4 text-ecid-yellow" />
                  <span className="text-sm font-medium text-primary-foreground">{course.hours}</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2">
                  <Calendar className="h-4 w-4 text-ecid-yellow" />
                  <span className="text-sm font-medium text-primary-foreground">{course.durationRange}</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2">
                  <Award className="h-4 w-4 text-ecid-yellow" />
                  <span className="text-sm font-medium text-primary-foreground">{course.certification}</span>
                </div>
              </div>
              
              {/* Video Button */}
              {course.youtubeVideoId && (
                <Button 
                  variant="outline" 
                  className="gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                  onClick={() => setShowVideo(true)}
                >
                  <Play className="h-4 w-4" />
                  Ver vídeo
                </Button>
              )}
            </div>
            
            {/* Price Card */}
            <div className="w-full rounded-2xl bg-card p-6 shadow-xl lg:w-96">
              <div className="mb-4 rounded-lg bg-ecid-red px-4 py-2 text-center">
                <span className="text-lg font-bold text-primary-foreground">40% de desconto</span>
              </div>
              
              <h3 className="mb-4 text-lg font-bold text-foreground">{course.title}</h3>
              
              <div className="mb-4 space-y-1">
                <p className="text-sm text-muted-foreground">
                  De <span className="line-through">{course.originalPrice}</span> Por {course.promoPrice}
                </p>
                <p className="text-sm text-muted-foreground">12x</p>
                <p className="text-3xl font-bold text-ecid-blue-accent">{course.installment}</p>
                <p className="text-sm text-muted-foreground">s/ juros no cartão de crédito</p>
              </div>
              
              <div className="mb-4 rounded-lg bg-ecid-yellow/10 p-3">
                <p className="text-center text-sm font-medium text-ecid-navy">
                  Use o cupom <span className="font-bold">FAESDE30</span> e ganhe 30% OFF adicional!
                </p>
              </div>
              
              <Button className="mb-3 w-full rounded-lg bg-ecid-red py-6 text-lg font-semibold text-primary-foreground hover:bg-ecid-red-light">
                Matricule-se já
              </Button>
              
              <Button variant="outline" className="w-full rounded-lg border-green-500 py-6 text-green-600 hover:bg-green-50">
                <MessageCircle className="mr-2 h-5 w-5" />
                Falar no WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {showVideo && course.youtubeVideoId && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowVideo(false)}
        >
          <div className="relative aspect-video w-full max-w-4xl">
            <iframe
              src={`https://www.youtube.com/embed/${course.youtubeVideoId}?autoplay=1`}
              className="h-full w-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Course Content Sections */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Sobre o Curso */}
          <div className="mb-12">
            <h2 className="mb-2 text-2xl font-bold text-foreground">
              Sobre o curso <span className="text-ecid-red">_</span>
            </h2>
            <h3 className="mb-6 text-xl text-muted-foreground">Conheça um pouco mais sobre o curso.</h3>
            <p className="leading-relaxed text-muted-foreground">{course.aboutCourse}</p>
          </div>

          {/* O que você terá acesso */}
          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-foreground">
              O que você terá acesso <span className="text-ecid-red">_</span>
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {course.access.map((item, index) => (
                <div key={index} className="rounded-xl bg-card p-6 shadow-card">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ecid-blue-accent/10">
                    {index === 0 && <Play className="h-6 w-6 text-ecid-blue-accent" />}
                    {index === 1 && <Users className="h-6 w-6 text-ecid-blue-accent" />}
                    {index === 2 && <Award className="h-6 w-6 text-ecid-blue-accent" />}
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Como vai funcionar */}
          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-foreground">
              Entenda como vai funcionar o curso <span className="text-ecid-red">_</span>
            </h2>
            <div className="space-y-4">
              {course.howItWorks.map((paragraph, index) => (
                <p key={index} className="leading-relaxed text-muted-foreground">{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Registro do Curso */}
          {course.registration.portaria && (
            <div className="mb-12 rounded-xl bg-ecid-navy p-6">
              <h2 className="mb-4 text-xl font-bold text-primary-foreground">Registro do Curso</h2>
              <p className="mb-4 text-primary-foreground/80">
                Este curso foi autorizado, a nível nacional. Sendo assim, ao concluir o curso e ser aprovado, o aluno receberá um certificado com validade nacional e poderá se registrar no órgão responsável.
              </p>
              <div className="grid gap-4 text-sm md:grid-cols-2">
                <div>
                  <span className="text-primary-foreground/60">Portaria Curso:</span>
                  <span className="ml-2 font-medium text-primary-foreground">{course.registration.portaria}</span>
                </div>
                <div>
                  <span className="text-primary-foreground/60">Ato Autorizatório Parecer:</span>
                  <span className="ml-2 font-medium text-primary-foreground">{course.registration.parecer}</span>
                </div>
                <div>
                  <span className="text-primary-foreground/60">Aprovado em:</span>
                  <span className="ml-2 font-medium text-primary-foreground">{course.registration.approvedDate}</span>
                </div>
                <div>
                  <span className="font-medium text-ecid-yellow">{course.registration.registerWith}</span>
                </div>
              </div>
            </div>
          )}

          {/* Duração */}
          <div className="mb-12">
            <h2 className="mb-4 text-xl font-bold text-foreground">Duração</h2>
            <p className="leading-relaxed text-muted-foreground">
              O Curso Técnico em Segurança do Trabalho, com uma carga horária total de {course.hours} horas, oferece aos estudantes uma formação abrangente e detalhada, essencial para aqueles que desejam se especializar na proteção e bem-estar dos trabalhadores em diversos ambientes laborais. Este curso, projetado para atender às demandas atuais do mercado e às necessidades específicas dos profissionais da área, pode ser concluído em um prazo mínimo de 6 meses.
            </p>
          </div>

          {/* Profissão */}
          <div className="mb-12">
            <h2 className="mb-4 text-xl font-bold text-foreground">Profissão</h2>
            <p className="leading-relaxed text-muted-foreground">{course.profession}</p>
          </div>

          {/* Mercado */}
          <div className="mb-12">
            <h2 className="mb-4 text-xl font-bold text-foreground">Mercado</h2>
            <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{course.market}</p>
          </div>

          {/* Metodologia de Ensino */}
          <div className="mb-12">
            <h2 className="mb-4 text-xl font-bold text-foreground">Metodologia de Ensino</h2>
            <p className="mb-4 text-muted-foreground">O aluno estudará pela plataforma de estudos, sendo disponibilizados materiais acadêmicos como:</p>
            <ul className="mb-4 space-y-2">
              {course.methodology.materials.map((material, index) => (
                <li key={index} className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {material}
                </li>
              ))}
            </ul>
            <p className="mb-4 text-muted-foreground">O aluno também contará com atendimento para solicitação de serviços como:</p>
            <ul className="mb-4 space-y-2">
              {course.methodology.services.map((service, index) => (
                <li key={index} className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {service}
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground">{course.methodology.responseTime}</p>
          </div>

          {/* Requisitos para Matrícula */}
          <div className="mb-12">
            <h2 className="mb-4 text-xl font-bold text-foreground">Requisitos para Matrícula</h2>
            <ul className="space-y-2">
              {course.requirements.map((req, index) => (
                <li key={index} className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {req}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              Obs.: Após a liberação do curso, o aluno deverá anexar todos os documentos acima na plataforma de estudos.
            </p>
          </div>

          {/* Tutoria */}
          <div className="mb-12">
            <h2 className="mb-4 text-xl font-bold text-foreground">Tutoria</h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">{course.tutoring}</p>
            <p className="mb-4 text-muted-foreground">Dentre suas atribuições, destacam-se:</p>
            <ul className="space-y-2">
              {course.tutorAttributes.map((attr, index) => (
                <li key={index} className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {attr}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              Para conhecer o seu tutor, acesse a plataforma de estudos e visualize o nome do tutor, seu contato.
            </p>
          </div>

          {/* Grade Curricular */}
          {course.modules.length > 0 && (
            <div className="mb-12">
              <h2 className="mb-6 text-2xl font-bold text-foreground">
                Conteúdo <span className="text-ecid-red">_</span>
              </h2>
              <Accordion type="multiple" className="space-y-4">
                {course.modules.map((module, moduleIndex) => (
                  <AccordionItem 
                    key={moduleIndex} 
                    value={`module-${moduleIndex}`}
                    className="rounded-xl border bg-card px-6"
                  >
                    <AccordionTrigger className="py-4 text-lg font-bold text-foreground hover:no-underline">
                      {module.name}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pb-4">
                        {module.subjects.map((subject, subjectIndex) => (
                          <div 
                            key={subjectIndex}
                            className="flex items-center justify-between rounded-lg bg-muted/50 p-4"
                          >
                            <div className="flex items-center gap-3">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ecid-blue-accent text-sm font-bold text-primary-foreground">
                                {subjectIndex + 1}
                              </span>
                              <span className="font-medium text-foreground">{subject.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              {subject.hours} horas
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}

          {/* FAQ */}
          {course.faq.length > 0 && (
            <div className="mb-12">
              <h2 className="mb-6 text-2xl font-bold text-foreground">
                Dúvidas Frequentes <span className="text-ecid-red">_</span>
              </h2>
              <Accordion type="single" collapsible className="space-y-4">
                {course.faq.map((item, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`faq-${index}`}
                    className="rounded-xl border bg-card px-6"
                  >
                    <AccordionTrigger className="py-4 text-left font-medium text-foreground hover:no-underline">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="pb-4 text-muted-foreground">{item.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default CursoDetalhe;