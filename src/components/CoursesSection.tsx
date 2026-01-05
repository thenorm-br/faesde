import { Calendar, BadgeCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface CourseCardProps {
  title: string;
  image: string;
  description: string;
  originalPrice: string;
  promoPrice: string;
  installment: string;
  slug?: string;
}

const CourseCard = ({ title, image, description, originalPrice, promoPrice, installment, slug }: CourseCardProps) => {
  const getShortTitle = (fullTitle: string) => {
    const name = fullTitle
      .replace("Curso Técnico de ", "")
      .replace("Curso Técnico em ", "")
      .replace("Certificação Técnica por Competência em ", "")
      .replace("Especialização Técnica em ", "")
      .replace(" EAD", "")
      .toUpperCase();
    return name;
  };

  const isCompetency = title.includes("Competência");
  const isSpecialization = title.includes("Especialização");

  const getLabel = () => {
    if (isCompetency) return "Certificação por Competência";
    if (isSpecialization) return "Pós-Técnico EAD";
    return "Curso Técnico EAD";
  };

  const courseSlug = slug || title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return (
    <Link to={`/curso/${courseSlug}`} className="block">
      <article className="group card-hover flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-card transition-all hover:shadow-lg">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={image}
            alt={title}
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
              {getShortTitle(title)}
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
            {title}
          </h3>
          
          <p className="mb-4 line-clamp-3 flex-1 text-sm text-muted-foreground">
            {description}
          </p>

          <div className="mb-4 space-y-1 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              <span className="line-through">De {originalPrice}</span>
            </p>
            <p className="text-sm text-muted-foreground">Por {promoPrice}</p>
            <p className="text-2xl font-bold text-ecid-blue-accent">{installment}</p>
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

const technicalCourses = [
  {
    title: "Curso Técnico de Segurança do Trabalho EAD",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop",
    description: "Assuma um papel vital na proteção e bem-estar dos trabalhadores. Formação de qualidade, flexível e reconhecida nacionalmente. Ideal para iniciar uma carreira ou mudança profissional.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    slug: "seguranca-trabalho",
  },
  {
    title: "Curso Técnico em Eletrotécnica EAD",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=400&fit=crop",
    description: "Carreira promissora e com alta demanda. Conquiste seu diploma em 6 meses com certificação reconhecida pelo MEC. O mercado clama por eletrotécnicos competentes!",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    slug: "eletrotecnica",
  },
  {
    title: "Curso Técnico em Mecânica EAD",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop",
    description: "Formação rápida e reconhecida para entrar no mercado de trabalho. Diploma certificado pelo MEC em 6 meses. Atue em indústrias, oficinas e concessionárias.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    slug: "mecanica",
  },
  {
    title: "Curso Técnico de Administração EAD",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop",
    description: "Destaque-se no competitivo mundo dos negócios com a flexibilidade que só o ensino a distância pode oferecer. Ideal para quem busca carreira promissora.",
    originalPrice: "R$ 1.590,00",
    promoPrice: "R$ 900,00",
    installment: "12x R$ 75,00",
    slug: "administracao",
  },
  {
    title: "Curso Técnico de Edificações EAD",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&h=400&fit=crop",
    description: "Ingresse na promissora indústria da construção civil. Em 6 meses, esteja pronto para atuar em projetos, obras e fiscalizações com certificado pelo MEC.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    slug: "edificacoes",
  },
  {
    title: "Curso Técnico em Eletromecânica EAD",
    image: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=600&h=400&fit=crop",
    description: "Especialize-se em uma área que une eletricidade e mecânica. Capacite-se em 6 meses e torne-se um profissional completo para a Indústria 4.0.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    slug: "eletromecanica",
  },
  {
    title: "Curso Técnico em Transações Imobiliárias (TTI) EAD",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop",
    description: "O mercado imobiliário está em constante crescimento. Em 6 meses, esteja certificado e pronto para atuar como corretor de imóveis com respaldo do CRECI.",
    originalPrice: "R$ 1.750,00",
    promoPrice: "R$ 900,00",
    installment: "12x R$ 75,00",
    slug: "tti",
  },
  {
    title: "Curso Técnico em Agropecuária EAD",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop",
    description: "A agropecuária é um setor essencial e em constante crescimento. Domine técnicas de produção agrícola, pecuária, gestão rural e sustentabilidade.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    slug: "agropecuaria",
  },
  {
    title: "Curso Técnico em Farmácia EAD",
    image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&h=400&fit=crop",
    description: "Mergulhe no mundo da saúde e faça a diferença na vida das pessoas. Formação de qualidade, flexível e reconhecida nacionalmente no setor farmacêutico.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    slug: "farmacia",
  },
  {
    title: "Curso Técnico em Agricultura EAD",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop",
    description: "Transforme sua paixão pelo campo em uma carreira de sucesso. Domine as mais modernas técnicas agrícolas em apenas 6 meses com certificado pelo MEC.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    slug: "agricultura",
  },
  {
    title: "Curso Técnico de Logística EAD",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=400&fit=crop",
    description: "Impulsione sua carreira em um setor crucial. Domine gestão de estoques, transporte e distribuição com formação completa e prática em 6 meses.",
    originalPrice: "R$ 1.590,00",
    promoPrice: "R$ 900,00",
    installment: "12x R$ 75,00",
    slug: "logistica",
  },
  {
    title: "Curso Técnico de Meio Ambiente EAD",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop",
    description: "Atue na preservação da natureza, controle da poluição e gestão de recursos naturais. Formação completa e prática em 6 meses com certificado pelo MEC.",
    originalPrice: "R$ 1.590,00",
    promoPrice: "R$ 900,00",
    installment: "12x R$ 75,00",
    slug: "meio-ambiente",
  },
  {
    title: "Curso Técnico em Agrimensura EAD",
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&h=400&fit=crop",
    description: "Atue com medições, levantamentos topográficos, georreferenciamento e mapeamento territorial utilizando tecnologias modernas como GPS e drones.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    slug: "agrimensura",
  },
  {
    title: "Curso Técnico em Agroindústria EAD",
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&h=400&fit=crop",
    description: "Atue no processamento, produção e controle de qualidade de alimentos e produtos de origem vegetal e animal. Alta empregabilidade no setor.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    slug: "agroindustria",
  },
  {
    title: "Curso Técnico em Análises Clínicas EAD",
    image: "https://images.unsplash.com/photo-1579165466949-3180a3d056d5?w=600&h=400&fit=crop",
    description: "Prepare-se para atuar em um dos setores mais promissores do mercado de trabalho na área da saúde com formação completa e flexível.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    slug: "analises-clinicas",
  },
  {
    title: "Curso Técnico em Automação Industrial EAD",
    image: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=600&h=400&fit=crop",
    description: "Especialize-se em programar, operar e manter sistemas automatizados. Alta demanda por profissionais qualificados na Indústria 4.0.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    slug: "automacao-industrial",
  },
  {
    title: "Curso Técnico em Compliance EAD",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=400&fit=crop",
    description: "Atue na prevenção de riscos legais, éticos e regulatórios. Implemente políticas de conformidade, auditoria e integridade organizacional.",
    originalPrice: "R$ 1.590,00",
    promoPrice: "R$ 900,00",
    installment: "12x R$ 75,00",
    slug: "compliance",
  },
  {
    title: "Curso Técnico em Computação Gráfica EAD",
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&h=400&fit=crop",
    description: "Transforme sua paixão por design e tecnologia em uma carreira de sucesso no mundo vibrante e inovador da computação gráfica.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 900,00",
    installment: "12x R$ 75,00",
    slug: "computacao-grafica",
  },
  {
    title: "Curso Técnico em Contabilidade EAD",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop",
    description: "Domine os números e destaque-se no mundo financeiro. Formação de excelência, flexível e reconhecida nacionalmente.",
    originalPrice: "R$ 1.590,00",
    promoPrice: "R$ 900,00",
    installment: "12x R$ 75,00",
    slug: "contabilidade",
  },
  {
    title: "Curso Técnico em Cuidador de Idosos EAD",
    image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=600&h=400&fit=crop",
    description: "Profissionalize-se em uma das áreas que mais crescem no Brasil. Ofereça cuidados completos e humanizados à pessoa idosa.",
    originalPrice: "R$ 1.590,00",
    promoPrice: "R$ 900,00",
    installment: "12x R$ 75,00",
    slug: "cuidador-idosos",
  },
  {
    title: "Curso Técnico em Desenvolvimento de Sistemas EAD",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop",
    description: "Transforme sua paixão por tecnologia em uma carreira de sucesso no crescente e dinâmico setor de TI.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    slug: "desenvolvimento-sistemas",
  },
  {
    title: "Curso Técnico em Design Gráfico EAD",
    image: "https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=600&h=400&fit=crop",
    description: "Forme-se como profissional criativo e qualificado para produzir peças visuais impressas e digitais. Transforme criatividade em profissão.",
    originalPrice: "R$ 1.500,00",
    promoPrice: "R$ 900,00",
    installment: "12x R$ 75,00",
    slug: "design-grafico",
  },
  {
    title: "Curso Técnico em Eletroeletrônica EAD",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop",
    description: "Domine circuitos elétricos, sistemas de automação e as mais recentes tecnologias. Atue em indústrias e empresas de manutenção.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    slug: "eletroeletronica",
  },
  {
    title: "Curso Técnico em Eletrônica EAD",
    image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=600&h=400&fit=crop",
    description: "Entenda como a tecnologia funciona e seja capaz de criar, reparar e inovar. Alta demanda por profissionais qualificados.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    slug: "eletronica",
  },
  {
    title: "Curso Técnico em Estética e Cosmetologia EAD",
    image: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=600&h=400&fit=crop",
    description: "Transforme sua paixão pela beleza em uma carreira de sucesso no fascinante universo da estética.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    slug: "estetica-cosmetologia",
  },
  {
    title: "Curso Técnico em Finanças EAD",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&h=400&fit=crop",
    description: "Atue na gestão financeira de empresas com foco em controle de custos, fluxo de caixa, investimentos e planejamento financeiro.",
    originalPrice: "R$ 1.590,00",
    promoPrice: "R$ 900,00",
    installment: "12x R$ 75,00",
    slug: "financas",
  },
  {
    title: "Curso Técnico em Guia de Turismo EAD",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop",
    description: "Transforme sua paixão por viagens em uma carreira repleta de aventuras. Lidere grupos e explore destinos incríveis.",
    originalPrice: "R$ 3.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    slug: "guia-turismo",
  },
  {
    title: "Curso Técnico em Informática EAD",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop",
    description: "Explore o universo da tecnologia e transforme sua paixão por informática em uma carreira de sucesso.",
    originalPrice: "R$ 1.750,00",
    promoPrice: "R$ 900,00",
    installment: "12x R$ 75,00",
    slug: "informatica",
  },
  {
    title: "Curso Técnico em Informática para Internet EAD",
    image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&h=400&fit=crop",
    description: "Torne-se um especialista em soluções digitais para uma carreira dinâmica e inovadora.",
    originalPrice: "R$ 1.750,00",
    promoPrice: "R$ 900,00",
    installment: "12x R$ 75,00",
    slug: "informatica-internet",
  },
  {
    title: "Curso Técnico em Inteligência Artificial EAD",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop",
    description: "Desenvolva soluções inteligentes usando machine learning, big data e automação. Atue nas áreas mais promissoras da tecnologia.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    slug: "inteligencia-artificial",
  },
  {
    title: "Curso Técnico em Manutenção Automotiva EAD",
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=400&fit=crop",
    description: "Atue na inspeção, diagnóstico, reparo e manutenção de veículos automotores com tecnologias modernas.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    slug: "manutencao-automotiva",
  },
  {
    title: "Curso Técnico em Manutenção de Máquinas Industriais EAD",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop",
    description: "Atue na instalação, operação, análise e manutenção de equipamentos industriais garantindo eficiência e segurança.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    slug: "manutencao-maquinas-industriais",
  },
  {
    title: "Curso Técnico em Manutenção e Suporte em Informática EAD",
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&h=400&fit=crop",
    description: "Torne-se especialista em tecnologia e garanta que sistemas e dispositivos funcionem perfeitamente.",
    originalPrice: "R$ 1.750,00",
    promoPrice: "R$ 900,00",
    installment: "12x R$ 75,00",
    slug: "manutencao-suporte-informatica",
  },
  {
    title: "Curso Técnico em Marketing e Comunicação EAD",
    image: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=600&h=400&fit=crop",
    description: "Destaque-se no dinâmico mundo do marketing e transforme suas ideias em estratégias de sucesso.",
    originalPrice: "R$ 1.590,00",
    promoPrice: "R$ 900,00",
    installment: "12x R$ 75,00",
    slug: "marketing-comunicacao",
  },
  {
    title: "Curso Técnico em Mineração EAD",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop",
    description: "Especialize-se em um setor essencial para a economia com formação em geologia, topografia de minas e técnicas de extração.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    slug: "mineracao",
  },
  {
    title: "Curso Técnico em Nutrição e Dietética EAD",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop",
    description: "Transforme sua paixão por saúde e bem-estar em uma carreira gratificante na área de nutrição.",
    originalPrice: "R$ 1.750,00",
    promoPrice: "R$ 900,00",
    installment: "12x R$ 75,00",
    slug: "nutricao-dietetica",
  },
  {
    title: "Curso Técnico em Papel e Celulose EAD",
    image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&h=400&fit=crop",
    description: "Atue nos processos de produção de papel e celulose, controle de qualidade e gestão ambiental do setor.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    slug: "papel-celulose",
  },
  {
    title: "Curso Técnico em Petróleo e Gás EAD",
    image: "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=600&h=400&fit=crop",
    description: "Atue em todas as etapas da cadeia produtiva do setor energético, desde a prospecção até o refino.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    slug: "petroleo-gas",
  },
  {
    title: "Curso Técnico em Programação de Jogos Digitais EAD",
    image: "https://images.unsplash.com/photo-1556438064-2d7646166914?w=600&h=400&fit=crop",
    description: "Domine habilidades para criar mundos virtuais, desenvolver personagens e mecânicas de jogo inovadoras.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    slug: "programacao-jogos-digitais",
  },
  {
    title: "Curso Técnico em Prótese Dentária EAD",
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&h=400&fit=crop",
    description: "Atue na confecção, reparo e ajuste de próteses dentárias com alta empregabilidade na área da saúde.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    slug: "protese-dentaria",
  },
  {
    title: "Curso Técnico em Qualidade EAD",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop",
    description: "Atue no controle, análise e melhoria contínua de processos garantindo padrões de eficiência e excelência.",
    originalPrice: "R$ 1.500,00",
    promoPrice: "R$ 900,00",
    installment: "12x R$ 75,00",
    slug: "qualidade",
  },
  {
    title: "Curso Técnico em Química EAD",
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&h=400&fit=crop",
    description: "Atue em processos químicos industriais, análises laboratoriais e controle de qualidade em diversos segmentos.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    slug: "quimica",
  },
  {
    title: "Curso Técnico em Recursos Humanos EAD",
    image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&h=400&fit=crop",
    description: "Domine as principais rotinas de RH, desde recrutamento e seleção até gestão de benefícios e desenvolvimento de pessoas.",
    originalPrice: "R$ 1.590,00",
    promoPrice: "R$ 900,00",
    installment: "12x R$ 75,00",
    slug: "recursos-humanos",
  },
  {
    title: "Curso Técnico em Rede de Computadores EAD",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop",
    description: "Projete, instale, configure e gerencie redes de computadores. Alta empregabilidade e ótimos salários.",
    originalPrice: "R$ 1.750,00",
    promoPrice: "R$ 900,00",
    installment: "12x R$ 75,00",
    slug: "rede-computadores",
  },
  {
    title: "Curso Técnico em Refrigeração e Climatização EAD",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=400&fit=crop",
    description: "Domine tecnologias de refrigeração, instalação e manutenção de sistemas de ar condicionado e câmaras frigoríficas.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    slug: "refrigeracao-climatizacao",
  },
  {
    title: "Curso Técnico em Saúde Bucal EAD",
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&h=400&fit=crop",
    description: "Atue no apoio a procedimentos odontológicos promovendo saúde, prevenção e bem-estar aos pacientes.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "12x R$ 125,00",
    slug: "saude-bucal",
  },
  {
    title: "Curso Técnico em Secretaria Escolar EAD",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=400&fit=crop",
    description: "Tenha papel fundamental na organização de instituições de ensino dominando rotinas administrativas e legislação educacional.",
    originalPrice: "R$ 1.590,00",
    promoPrice: "R$ 900,00",
    installment: "12x R$ 75,00",
    slug: "secretaria-escolar",
  },
  {
    title: "Curso Técnico em Serviços Jurídicos EAD",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&h=400&fit=crop",
    description: "Atue como auxiliar jurídico em escritórios de advocacia, tribunais, cartórios e departamentos jurídicos de empresas.",
    originalPrice: "R$ 1.590,00",
    promoPrice: "R$ 900,00",
    installment: "12x R$ 75,00",
    slug: "servicos-juridicos",
  },
];

const certificationCourses = [
  {
    title: "Certificação Técnica por Competência em Administração",
    image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&h=400&fit=crop",
    description: "Transforme sua experiência em gestão empresarial, RH, finanças e processos organizacionais em diploma técnico reconhecido pelo MEC com registro no CRA.",
    originalPrice: "R$ 3.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
    slug: "certificacao-tecnica-competencia-administracao-empresarial",
  },
  {
    title: "Certificação Técnica por Competência em Automação Industrial",
    image: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=600&h=400&fit=crop",
    description: "Formalize sua experiência com CLPs (Siemens, Rockwell, WEG), sensores, redes industriais e sistemas SCADA com diploma técnico e registro no CREA.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
    slug: "certificacao-tecnica-competencia-automacao-industrial-clp-sensores",
  },
  {
    title: "Certificação Técnica por Competência em Edificações",
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=400&fit=crop",
    description: "Transforme sua experiência em obras, projetos, orçamentos e fiscalização em diploma técnico reconhecido pelo MEC com registro no CREA.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
    slug: "certificacao-tecnica-competencia-edificacoes-construcao-civil",
  },
  {
    title: "Certificação Técnica por Competência em Eletrotécnica",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
    description: "Formalize sua experiência em instalações elétricas, comandos, máquinas elétricas e manutenção com diploma técnico e registro no CREA.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
    slug: "certificacao-tecnica-competencia-eletrotecnica-instalacoes-eletricas",
  },
  {
    title: "Certificação Técnica por Competência em Segurança do Trabalho",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=400&fit=crop",
    description: "Formalize sua experiência em SST, Normas Regulamentadoras, prevenção de acidentes e programas de segurança com diploma técnico e registro no MTE.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
    slug: "certificacao-tecnica-competencia-seguranca-trabalho-sst-nr",
  },
  {
    title: "Certificação Técnica por Competência em Agricultura",
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&h=400&fit=crop",
    description: "Transforme sua experiência em cultivo, manejo de solo, irrigação e mecanização agrícola em diploma técnico reconhecido pelo MEC.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
    slug: "certificacao-tecnica-competencia-agricultura-producao-rural",
  },
  {
    title: "Certificação Técnica por Competência em Agropecuária",
    image: "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=600&h=400&fit=crop",
    description: "Formalize sua experiência integrada em produção agrícola e pecuária, manejo de rebanhos e gestão rural com diploma técnico.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
    slug: "certificacao-tecnica-competencia-agropecuaria-producao-animal-vegetal",
  },
  {
    title: "Certificação Técnica por Competência em Análises Clínicas",
    image: "https://images.unsplash.com/photo-1579165466949-3180a3d056d5?w=600&h=400&fit=crop",
    description: "Formalize sua experiência em laboratório, coleta de amostras, bioquímica, hematologia e microbiologia com diploma técnico pelo MEC.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
    slug: "certificacao-tecnica-competencia-analises-clinicas-laboratorio",
  },
  {
    title: "Certificação Técnica por Competência em Eletroeletrônica",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop",
    description: "Formalize sua experiência em eletrônica analógica, digital, microcontroladores e instrumentação com diploma técnico e registro no CREA.",
    originalPrice: "R$ 3.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
    slug: "certificacao-tecnica-competencia-eletroeletronica-circuitos-microcontroladores",
  },
  {
    title: "Certificação Técnica por Competência em Mecânica",
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop",
    description: "Formalize sua experiência em mecânica industrial, usinagem, manutenção e processos de fabricação com diploma técnico e registro no CREA.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "12x R$ 133,25",
    slug: "certificacao-tecnica-competencia-mecanica-industrial-manutencao",
  },
];

const postTechnicalCourses = [
  {
    title: "Especialização Técnica em Administração da Produção EAD",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop",
    description: "Aprofunde conhecimentos na gestão de processos produtivos, planejamento, controle da produção, qualidade e melhoria contínua.",
    originalPrice: "R$ 1.500,00",
    promoPrice: "R$ 850,00",
    installment: "12x R$ 70,83",
    slug: "pos-administracao-producao",
  },
  {
    title: "Especialização Técnica em Administração de Materiais EAD",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=400&fit=crop",
    description: "Gestão de estoques, compras, almoxarifado, logística e controle de suprimentos para profissionais técnicos.",
    originalPrice: "R$ 1.500,00",
    promoPrice: "R$ 850,00",
    installment: "12x R$ 70,83",
    slug: "pos-materiais",
  },
  {
    title: "Especialização Técnica em Farmácia Hospitalar EAD",
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&h=400&fit=crop",
    description: "Gestão e controle de medicamentos, materiais e insumos em ambientes hospitalares e clínicos.",
    originalPrice: "R$ 1.500,00",
    promoPrice: "R$ 850,00",
    installment: "12x R$ 70,83",
    slug: "pos-farmacia-hospitalar",
  },
  {
    title: "Especialização Técnica em Saúde Pública EAD",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop",
    description: "Políticas públicas, vigilância em saúde, prevenção de doenças e promoção da saúde coletiva no SUS.",
    originalPrice: "R$ 1.500,00",
    promoPrice: "R$ 850,00",
    installment: "12x R$ 70,83",
    slug: "pos-saude-publica",
  },
  {
    title: "Especialização Técnica em Oncologia EAD",
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&h=400&fit=crop",
    description: "Cuidado e tratamento de pacientes com câncer. Atue de forma qualificada e humanizada em equipes multiprofissionais.",
    originalPrice: "R$ 1.500,00",
    promoPrice: "R$ 850,00",
    installment: "12x R$ 70,83",
    slug: "pos-oncologia",
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
            {technicalCourses.slice(0, 5).map((course, index) => (
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
        <div className="mb-16">
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
            {certificationCourses.slice(0, 5).map((course, index) => (
              <CourseCard key={index} {...course} />
            ))}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Button variant="outline" className="rounded-lg font-semibold">
              Ver todos os cursos
            </Button>
          </div>
        </div>

        {/* Post-Technical Courses */}
        <div>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              Cursos <span className="underline decoration-ecid-blue-accent decoration-4 underline-offset-4">Pós-Técnicos</span> EAD
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
            {postTechnicalCourses.map((course, index) => (
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