import { useState } from "react";
import { Search, ChevronDown, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqData = [
  {
    question: "Onde fica nossa sede?",
    answer: "Nossa sede fica na Rua dos Ipês, 212, Coqueiral - Aracruz/ES. Atendemos de segunda a sexta das 9h às 18h e aos sábados das 9h às 13h."
  },
  {
    question: "Posso acessar o curso em qualquer lugar e a qualquer momento?",
    answer: "Sim! Nossos cursos são 100% online (EAD), permitindo que você estude de qualquer lugar do mundo, a qualquer hora do dia. Basta ter acesso à internet e um dispositivo (computador, tablet ou smartphone)."
  },
  {
    question: "Se o aluno reprovar em alguma disciplina, o que fazer?",
    answer: "Caso o aluno reprove em alguma disciplina, ele terá a oportunidade de refazer as atividades e provas. Entre em contato com nossa equipe de suporte para orientações específicas sobre seu caso."
  },
  {
    question: "É necessário formar turma para o aluno iniciar os estudos?",
    answer: "Não! O início é imediato. Assim que sua matrícula for confirmada, você já pode começar a estudar. Não é necessário aguardar formação de turma."
  },
  {
    question: "O aluno consegue eliminar disciplinas?",
    answer: "Sim, é possível eliminar disciplinas mediante apresentação de histórico escolar de cursos técnicos anteriores na mesma área. Nossa equipe avaliará cada caso individualmente."
  },
  {
    question: "Como funciona a troca de curso?",
    answer: "A troca de curso é permitida dentro do período estabelecido no contrato. Entre em contato com nossa secretaria para solicitar a troca e verificar as condições específicas."
  },
  {
    question: "O que é um curso técnico a distância?",
    answer: "Um curso técnico a distância (EAD) é uma modalidade de ensino profissionalizante onde todas as aulas e atividades são realizadas online. O aluno tem acesso a videoaulas, materiais didáticos, fóruns de discussão e avaliações através de uma plataforma virtual de aprendizagem."
  },
  {
    question: "Como funciona a metodologia de ensino a distância?",
    answer: "Nossa metodologia combina videoaulas gravadas, material didático digital, atividades práticas, fóruns de discussão e avaliações online. Você estuda no seu ritmo, com acompanhamento de tutores especializados que estão disponíveis para tirar dúvidas."
  },
  {
    question: "Quais são os requisitos técnicos para participar do curso?",
    answer: "Você precisa de um computador, tablet ou smartphone com acesso à internet. Recomendamos uma conexão estável de pelo menos 2 Mbps para assistir às videoaulas. Navegadores recomendados: Google Chrome, Firefox ou Safari atualizados."
  },
  {
    question: "O diploma de um curso técnico a distância tem a mesma validade de um curso presencial?",
    answer: "Sim! Nossos cursos são autorizados pelo MEC (Ministério da Educação) e os diplomas têm a mesma validade nacional de um curso presencial. Você poderá atuar profissionalmente e obter registro no conselho de classe da sua área."
  },
  {
    question: "Como são realizadas as avaliações?",
    answer: "As avaliações são realizadas online através da nossa plataforma de ensino. Cada disciplina possui atividades avaliativas que podem incluir questionários, trabalhos práticos e provas online. A nota final é calculada com base no desempenho em todas as atividades."
  },
  {
    question: "Existe algum encontro presencial obrigatório?",
    answer: "Para a maioria dos cursos, não há encontros presenciais obrigatórios. Algumas certificações específicas podem exigir avaliações presenciais em polos de apoio. Consulte as informações do curso desejado para mais detalhes."
  },
  {
    question: "Como é o suporte ao aluno?",
    answer: "Oferecemos suporte completo através de diversos canais: chat online na plataforma, WhatsApp, e-mail e telefone. Nossa equipe de tutores está disponível para tirar dúvidas sobre conteúdo, e nossa secretaria atende questões administrativas."
  },
  {
    question: "Como faço para me inscrever no curso?",
    answer: "É muito simples! Escolha o curso desejado, clique em 'Quero me matricular' e preencha o formulário de inscrição. Após o pagamento da primeira parcela, você receberá os dados de acesso à plataforma de estudos."
  },
  {
    question: "Posso conciliar o curso com trabalho ou outras atividades?",
    answer: "Com certeza! Essa é uma das principais vantagens do EAD. Você estuda quando e onde quiser, organizando seus horários de acordo com sua rotina. Não há horários fixos de aulas."
  },
  {
    question: "O que acontece se eu não conseguir cumprir os prazos das atividades?",
    answer: "Entendemos que imprevistos acontecem. Entre em contato com nossa equipe de suporte para negociar prazos alternativos. Buscamos sempre flexibilizar para que você consiga concluir seu curso com sucesso."
  },
  {
    question: "Como é feita a interação com Professores/Tutores?",
    answer: "A interação acontece através de fóruns de discussão na plataforma, mensagens diretas, e-mail e chat. Nossos tutores respondem dúvidas em até 24 horas úteis e acompanham seu progresso ao longo do curso."
  },
  {
    question: "O curso oferece estágio supervisionado?",
    answer: "Alguns cursos incluem estágio supervisionado como parte da grade curricular. Nesses casos, auxiliamos o aluno a encontrar oportunidades de estágio em empresas parceiras ou orientamos sobre como realizar o estágio em seu local de trabalho atual."
  },
];

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFaq = faqData.filter(
    (item) =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-ecid-navy to-ecid-navy/90 py-12">
        <div className="container mx-auto">
          <a 
            href="/" 
            className="mb-4 inline-flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </a>
          <h1 className="text-3xl font-bold text-primary-foreground md:text-4xl">
            Todas <span className="underline decoration-ecid-blue-accent decoration-4 underline-offset-4">Perguntas frequentes</span>
          </h1>
        </div>
      </section>

      {/* Search and FAQ */}
      <section className="py-12">
        <div className="container mx-auto max-w-4xl">
          {/* Search */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Pesquisar"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 w-full rounded-xl border-border bg-card pl-12 pr-4 text-base shadow-sm"
              />
            </div>
          </div>

          {/* FAQ Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {filteredFaq.map((item, index) => (
              <Accordion key={index} type="single" collapsible className="w-full">
                <AccordionItem 
                  value={`item-${index}`} 
                  className="rounded-xl border-0 bg-muted/50 px-4"
                >
                  <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </div>

          {filteredFaq.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                Nenhuma pergunta encontrada para "{searchTerm}"
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

export default FAQ;