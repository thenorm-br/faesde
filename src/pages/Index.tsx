import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import BenefitsBar from "@/components/BenefitsBar";
import CourseSection from "@/components/CourseSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

// Course data
const cursosTecnicos = [
  {
    id: 1,
    title: "Curso Técnico de Segurança do Trabalho EAD",
    description: "Assuma um papel vital na proteção e bem-estar dos trabalhadores com formação autorizada pelo MEC.",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80",
    originalPrice: "R$ 2.500,00",
    discountedPrice: "R$ 1.500,00",
    installments: "12x R$ 125,00",
  },
  {
    id: 2,
    title: "Curso Técnico em Eletrotécnica EAD",
    description: "Torne-se um profissional qualificado em eletrotécnica com diploma reconhecido pelo MEC em 6 meses.",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80",
    originalPrice: "R$ 2.500,00",
    discountedPrice: "R$ 1.500,00",
    installments: "12x R$ 125,00",
  },
  {
    id: 3,
    title: "Curso Técnico em Mecânica EAD",
    description: "Formação rápida e reconhecida para entrar no mercado de trabalho ou alavancar sua carreira na mecânica.",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80",
    originalPrice: "R$ 2.500,00",
    discountedPrice: "R$ 1.500,00",
    installments: "12x R$ 125,00",
  },
  {
    id: 4,
    title: "Curso Técnico de Administração EAD",
    description: "Destaque-se no competitivo mundo dos negócios com a flexibilidade do ensino a distância.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
    originalPrice: "R$ 1.590,00",
    discountedPrice: "R$ 900,00",
    installments: "12x R$ 75,00",
  },
  {
    id: 5,
    title: "Curso Técnico de Edificações EAD",
    description: "Ingresse na promissora indústria da construção civil com certificado autorizado pelo MEC.",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80",
    originalPrice: "R$ 2.500,00",
    discountedPrice: "R$ 1.500,00",
    installments: "12x R$ 125,00",
  },
];

const certificacoes = [
  {
    id: 6,
    title: "Certificação Técnica por Competência em Segurança do Trabalho",
    description: "Aferição técnica para profissionais com experiência prática na área de segurança do trabalho.",
    image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=800&q=80",
    originalPrice: "R$ 3.500,00",
    discountedPrice: "R$ 1.599,00",
    installments: "12x R$ 133,25",
  },
  {
    id: 7,
    title: "Certificação Técnica por Competência em Eletrotécnica",
    description: "Diploma técnico por habilidades e competências com registro profissional no conselho de classe.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    originalPrice: "R$ 3.500,00",
    discountedPrice: "R$ 1.599,00",
    installments: "12x R$ 133,25",
  },
  {
    id: 8,
    title: "Certificação Técnica por Competência em Mecânica",
    description: "Valide sua experiência profissional com um diploma técnico reconhecido nacionalmente.",
    image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80",
    originalPrice: "R$ 3.500,00",
    discountedPrice: "R$ 1.599,00",
    installments: "12x R$ 133,25",
  },
  {
    id: 9,
    title: "Certificação Técnica por Competência em Edificações",
    description: "Obtenha seu diploma técnico em edificações através de aferição de competências.",
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80",
    originalPrice: "R$ 3.500,00",
    discountedPrice: "R$ 1.599,00",
    installments: "12x R$ 133,25",
  },
];

const posTecnicos = [
  {
    id: 10,
    title: "Especialização Técnica em Administração da Produção EAD",
    description: "Aprofunde seus conhecimentos em gestão de processos produtivos e melhoria contínua.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    originalPrice: "R$ 1.500,00",
    discountedPrice: "R$ 850,00",
    installments: "12x R$ 70,83",
  },
  {
    id: 11,
    title: "Especialização Técnica em Farmácia Hospitalar EAD",
    description: "Especialize-se na gestão de medicamentos e insumos em ambientes hospitalares.",
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=80",
    originalPrice: "R$ 1.500,00",
    discountedPrice: "R$ 850,00",
    installments: "12x R$ 70,83",
  },
  {
    id: 12,
    title: "Especialização Técnica em Saúde Pública EAD",
    description: "Amplie seus conhecimentos sobre políticas públicas e vigilância em saúde.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
    originalPrice: "R$ 1.500,00",
    discountedPrice: "R$ 850,00",
    installments: "12x R$ 70,83",
  },
  {
    id: 13,
    title: "Especialização Técnica em Oncologia EAD",
    description: "Aprofunde seus conhecimentos no cuidado e tratamento de pacientes com câncer.",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80",
    originalPrice: "R$ 1.500,00",
    discountedPrice: "R$ 850,00",
    installments: "12x R$ 70,83",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroBanner />
        <BenefitsBar />
        
        <CourseSection
          title="Cursos Técnicos"
          highlight="EAD"
          courses={cursosTecnicos}
        />
        
        <div className="bg-muted/50">
          <CourseSection
            title="Certificação por"
            highlight="Competência"
            courses={certificacoes}
          />
        </div>
        
        <CourseSection
          title="Cursos Pós-Técnicos"
          highlight="EAD"
          courses={posTecnicos}
        />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
