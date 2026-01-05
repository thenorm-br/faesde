import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Award, Star, Play, CheckCircle, MessageCircle, BookOpen, Users, ChevronDown, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  },
  "eletrotecnica": {
    title: "Curso Técnico em Eletrotécnica EAD",
    subtitle: "Formação completa em sistemas elétricos com certificação reconhecida pelo MEC e registro no CREA",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&h=600&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1920&h=400&fit=crop",
    description: "O Curso Técnico em Eletrotécnica EAD prepara você para atuar em projetos, instalação, operação e manutenção de sistemas elétricos industriais e prediais. Com formação reconhecida pelo MEC, você estará apto a trabalhar em indústrias, empresas de energia e como profissional autônomo.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "R$ 125,00",
    hours: 1200,
    durationRange: "6 a 12 meses",
    certification: "Registro no CREA",
    rating: 5.0,
    youtubeVideoId: "pn97Z1-ssFI",
    category: "Curso Técnico EAD",
    registration: {
      portaria: "SEE-PRC-2021/12171",
      parecer: "219/2021",
      approvedDate: "07/10/2021",
      registerWith: "Registro no CREA"
    },
    aboutCourse: "O Técnico em Eletrotécnica é o profissional que planeja, instala, opera e mantém sistemas elétricos industriais e prediais, garantindo segurança e eficiência energética. Este curso forma profissionais capacitados para atuar em diversos setores da economia.",
    howItWorks: [
      "O curso aborda desde os fundamentos da eletricidade até sistemas complexos de automação e controle.",
      "Você aprenderá sobre instalações elétricas, comandos elétricos, eletrônica de potência e muito mais.",
      "A metodologia EAD permite flexibilidade nos estudos com todo o suporte necessário."
    ],
    profession: "O Técnico em Eletrotécnica pode atuar em indústrias, concessionárias de energia, empresas de manutenção, construção civil e como autônomo. É responsável por projetos elétricos, instalações, manutenção preventiva e corretiva de sistemas elétricos.",
    market: "O mercado para técnicos em eletrotécnica é amplo e aquecido. Com a crescente demanda por energia e automação industrial, profissionais qualificados são cada vez mais requisitados em diversos setores da economia.",
    methodology: {
      materials: ["Video-aulas", "Apostilas", "Artigos", "Biblioteca digital"],
      services: ["Requerimento de declarações", "Histórico", "Estágio", "Matriz curricular"],
      responseTime: "Chamados respondidos dentro de 48 horas."
    },
    requirements: ["Cópia do RG e do CPF", "Comprovante de Residência", "Certificado de Conclusão do Ensino Médio"],
    tutoring: "Acompanhamento completo do tutor durante todo o curso.",
    tutorAttributes: ["Apoiar os alunos na plataforma", "Orientar durante as atividades", "Esclarecer dúvidas técnicas"],
    modules: [
      { name: "Módulo 01", subjects: [{ name: "Introdução ao EAD", hours: 80 }, { name: "Eletricidade Básica", hours: 80 }, { name: "Matemática Aplicada", hours: 60 }, { name: "Desenho Técnico", hours: 60 }] },
      { name: "Módulo 02", subjects: [{ name: "Circuitos Elétricos", hours: 80 }, { name: "Comandos Elétricos", hours: 80 }, { name: "Instalações Elétricas", hours: 80 }] },
      { name: "Módulo 03", subjects: [{ name: "Eletrônica Básica", hours: 60 }, { name: "Eletrônica de Potência", hours: 80 }, { name: "Automação Industrial", hours: 80 }] },
      { name: "Módulo 04", subjects: [{ name: "Máquinas Elétricas", hours: 80 }, { name: "Normas e Legislação", hours: 60 }, { name: "Estágio Supervisionado", hours: 240 }] }
    ],
    access: [
      { title: "Video Aulas", description: "Estude onde e quando quiser." },
      { title: "Tutoria", description: "Tire suas dúvidas." },
      { title: "Diploma", description: "Autorizado pelo MEC." }
    ],
    faq: [
      { question: "Quais as formas de pagamento?", answer: "Aceitamos cartão de crédito em até 12x sem juros, boleto bancário e PIX." },
      { question: "O curso tem registro no CREA?", answer: "Sim, após a conclusão você pode solicitar registro no CREA como técnico." }
    ]
  },
  "mecanica": {
    title: "Curso Técnico em Mecânica EAD",
    subtitle: "Torne-se um profissional qualificado em mecânica com certificação reconhecida pelo MEC",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=600&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1920&h=400&fit=crop",
    description: "O Curso Técnico em Mecânica EAD forma profissionais para atuar em projetos, fabricação, montagem e manutenção de sistemas mecânicos. Com alta demanda no mercado industrial, este curso oferece formação completa e reconhecida nacionalmente.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "R$ 125,00",
    hours: 1200,
    durationRange: "6 a 12 meses",
    certification: "Registro no CREA",
    rating: 5.0,
    youtubeVideoId: "pn97Z1-ssFI",
    category: "Curso Técnico EAD",
    registration: {
      portaria: "SEE-PRC-2021/12172",
      parecer: "220/2021",
      approvedDate: "07/10/2021",
      registerWith: "Registro no CREA"
    },
    aboutCourse: "O Técnico em Mecânica é essencial para a indústria brasileira, atuando no desenvolvimento, fabricação e manutenção de máquinas e equipamentos mecânicos.",
    howItWorks: [
      "Formação completa em mecânica com foco em aplicações industriais.",
      "Metodologia EAD que permite estudar no seu ritmo com suporte completo."
    ],
    profession: "Atue em indústrias automobilísticas, metalúrgicas, petroquímicas e de manufatura em geral.",
    market: "O setor industrial brasileiro demanda constantemente técnicos em mecânica qualificados.",
    methodology: {
      materials: ["Video-aulas", "Apostilas", "Biblioteca digital"],
      services: ["Requerimento de declarações", "Histórico", "Estágio"],
      responseTime: "Chamados respondidos dentro de 48 horas."
    },
    requirements: ["Cópia do RG e do CPF", "Comprovante de Residência", "Certificado de Conclusão do Ensino Médio"],
    tutoring: "Acompanhamento do tutor pelo portal do aluno.",
    tutorAttributes: ["Apoiar os alunos na plataforma", "Orientar durante as atividades"],
    modules: [
      { name: "Módulo 01", subjects: [{ name: "Introdução ao EAD", hours: 80 }, { name: "Desenho Técnico Mecânico", hours: 80 }, { name: "Matemática Aplicada", hours: 60 }] },
      { name: "Módulo 02", subjects: [{ name: "Tecnologia dos Materiais", hours: 80 }, { name: "Metrologia", hours: 60 }, { name: "Resistência dos Materiais", hours: 80 }] },
      { name: "Módulo 03", subjects: [{ name: "Elementos de Máquinas", hours: 80 }, { name: "Usinagem", hours: 80 }, { name: "Manutenção Mecânica", hours: 80 }] },
      { name: "Módulo 04", subjects: [{ name: "Hidráulica e Pneumática", hours: 80 }, { name: "Gestão da Qualidade", hours: 60 }, { name: "Estágio Supervisionado", hours: 240 }] }
    ],
    access: [{ title: "Video Aulas", description: "Estude onde e quando quiser." }, { title: "Tutoria", description: "Tire suas dúvidas." }, { title: "Diploma", description: "Autorizado pelo MEC." }],
    faq: [{ question: "Quais as formas de pagamento?", answer: "Aceitamos cartão de crédito em até 12x sem juros, boleto bancário e PIX." }]
  },
  "administracao": {
    title: "Curso Técnico de Administração EAD",
    subtitle: "Desenvolva habilidades em gestão empresarial e destaque-se no mundo dos negócios",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=600&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&h=400&fit=crop",
    description: "O Curso Técnico de Administração EAD prepara você para atuar em todas as áreas administrativas de uma empresa, desde recursos humanos até finanças e logística. Formação completa para quem deseja construir uma carreira sólida no mundo corporativo.",
    originalPrice: "R$ 1.590,00",
    promoPrice: "R$ 900,00",
    installment: "R$ 75,00",
    hours: 1000,
    durationRange: "6 a 12 meses",
    certification: "Certificação válida",
    rating: 5.0,
    youtubeVideoId: "pn97Z1-ssFI",
    category: "Curso Técnico EAD",
    registration: {
      portaria: "SEE-PRC-2021/12173",
      parecer: "221/2021",
      approvedDate: "07/10/2021",
      registerWith: "Registro Profissional"
    },
    aboutCourse: "O Técnico em Administração é fundamental para o funcionamento de qualquer organização, atuando em planejamento, organização, direção e controle de processos empresariais.",
    howItWorks: ["Formação abrangente em gestão empresarial.", "Metodologia EAD flexível com suporte completo."],
    profession: "Atue em empresas de todos os portes e segmentos, em áreas como RH, finanças, marketing e operações.",
    market: "O mercado de trabalho para técnicos em administração é amplo e diversificado.",
    methodology: {
      materials: ["Video-aulas", "Apostilas", "Biblioteca digital"],
      services: ["Requerimento de declarações", "Histórico", "Matriz curricular"],
      responseTime: "Chamados respondidos dentro de 48 horas."
    },
    requirements: ["Cópia do RG e do CPF", "Comprovante de Residência", "Certificado de Conclusão do Ensino Médio"],
    tutoring: "Acompanhamento do tutor pelo portal do aluno.",
    tutorAttributes: ["Apoiar os alunos na plataforma", "Orientar durante as atividades"],
    modules: [
      { name: "Módulo 01", subjects: [{ name: "Introdução ao EAD", hours: 80 }, { name: "Fundamentos da Administração", hours: 80 }, { name: "Comunicação Empresarial", hours: 60 }] },
      { name: "Módulo 02", subjects: [{ name: "Gestão de Pessoas", hours: 80 }, { name: "Matemática Financeira", hours: 60 }, { name: "Contabilidade Básica", hours: 80 }] },
      { name: "Módulo 03", subjects: [{ name: "Marketing", hours: 60 }, { name: "Logística", hours: 80 }, { name: "Gestão da Qualidade", hours: 60 }] },
      { name: "Módulo 04", subjects: [{ name: "Empreendedorismo", hours: 60 }, { name: "Direito Empresarial", hours: 60 }, { name: "Estágio Supervisionado", hours: 200 }] }
    ],
    access: [{ title: "Video Aulas", description: "Estude onde e quando quiser." }, { title: "Tutoria", description: "Tire suas dúvidas." }, { title: "Diploma", description: "Autorizado pelo MEC." }],
    faq: [{ question: "Quais as formas de pagamento?", answer: "Aceitamos cartão de crédito em até 12x sem juros, boleto bancário e PIX." }]
  },
  "edificacoes": {
    title: "Curso Técnico de Edificações EAD",
    subtitle: "Ingresse na promissora indústria da construção civil com certificação reconhecida pelo MEC e CREA",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&h=600&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1920&h=400&fit=crop",
    description: "O Curso Técnico de Edificações EAD forma profissionais para atuar em projetos, execução e fiscalização de obras civis. Com registro no CREA, você poderá trabalhar em construtoras, escritórios de arquitetura e engenharia.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "R$ 125,00",
    hours: 1200,
    durationRange: "6 a 12 meses",
    certification: "Registro no CREA",
    rating: 5.0,
    youtubeVideoId: "pn97Z1-ssFI",
    category: "Curso Técnico EAD",
    registration: {
      portaria: "SEE-PRC-2021/12174",
      parecer: "222/2021",
      approvedDate: "07/10/2021",
      registerWith: "Registro no CREA"
    },
    aboutCourse: "O Técnico em Edificações é essencial para o setor da construção civil, atuando no planejamento, execução e controle de obras.",
    howItWorks: ["Formação completa em construção civil.", "Metodologia EAD com suporte de tutores especializados."],
    profession: "Atue em construtoras, escritórios de engenharia e arquitetura, órgãos públicos e como autônomo.",
    market: "A construção civil é um dos setores que mais emprega no Brasil, com demanda constante por profissionais qualificados.",
    methodology: {
      materials: ["Video-aulas", "Apostilas", "Biblioteca digital"],
      services: ["Requerimento de declarações", "Histórico", "Estágio"],
      responseTime: "Chamados respondidos dentro de 48 horas."
    },
    requirements: ["Cópia do RG e do CPF", "Comprovante de Residência", "Certificado de Conclusão do Ensino Médio"],
    tutoring: "Acompanhamento do tutor pelo portal do aluno.",
    tutorAttributes: ["Apoiar os alunos na plataforma", "Orientar durante as atividades"],
    modules: [
      { name: "Módulo 01", subjects: [{ name: "Introdução ao EAD", hours: 80 }, { name: "Desenho Técnico", hours: 80 }, { name: "Topografia", hours: 80 }] },
      { name: "Módulo 02", subjects: [{ name: "Materiais de Construção", hours: 80 }, { name: "Mecânica dos Solos", hours: 60 }, { name: "Estruturas", hours: 80 }] },
      { name: "Módulo 03", subjects: [{ name: "Instalações Hidráulicas", hours: 80 }, { name: "Instalações Elétricas", hours: 80 }, { name: "Orçamento de Obras", hours: 60 }] },
      { name: "Módulo 04", subjects: [{ name: "Planejamento de Obras", hours: 80 }, { name: "Segurança do Trabalho", hours: 60 }, { name: "Estágio Supervisionado", hours: 240 }] }
    ],
    access: [{ title: "Video Aulas", description: "Estude onde e quando quiser." }, { title: "Tutoria", description: "Tire suas dúvidas." }, { title: "Diploma", description: "Autorizado pelo MEC." }],
    faq: [{ question: "O curso tem registro no CREA?", answer: "Sim, após a conclusão você pode solicitar registro no CREA." }]
  },
  "eletromecanica": {
    title: "Curso Técnico em Eletromecânica EAD",
    subtitle: "Especialize-se em eletricidade e mecânica com formação reconhecida pelo MEC",
    image: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1200&h=600&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1920&h=400&fit=crop",
    description: "O Curso Técnico em Eletromecânica EAD combina conhecimentos de elétrica e mecânica, formando profissionais versáteis para atuar na manutenção e operação de equipamentos industriais.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "R$ 125,00",
    hours: 1200,
    durationRange: "6 a 12 meses",
    certification: "Registro no CREA",
    rating: 5.0,
    youtubeVideoId: "pn97Z1-ssFI",
    category: "Curso Técnico EAD",
    registration: {
      portaria: "SEE-PRC-2021/12175",
      parecer: "223/2021",
      approvedDate: "07/10/2021",
      registerWith: "Registro no CREA"
    },
    aboutCourse: "O Técnico em Eletromecânica é um profissional completo, capaz de atuar tanto em sistemas elétricos quanto mecânicos.",
    howItWorks: ["Formação integrada em elétrica e mecânica.", "Metodologia EAD flexível."],
    profession: "Atue em indústrias de diversos setores, empresas de manutenção e como autônomo.",
    market: "A demanda por profissionais com conhecimento integrado em elétrica e mecânica é crescente.",
    methodology: {
      materials: ["Video-aulas", "Apostilas", "Biblioteca digital"],
      services: ["Requerimento de declarações", "Histórico", "Estágio"],
      responseTime: "Chamados respondidos dentro de 48 horas."
    },
    requirements: ["Cópia do RG e do CPF", "Comprovante de Residência", "Certificado de Conclusão do Ensino Médio"],
    tutoring: "Acompanhamento do tutor pelo portal do aluno.",
    tutorAttributes: ["Apoiar os alunos na plataforma", "Orientar durante as atividades"],
    modules: [
      { name: "Módulo 01", subjects: [{ name: "Introdução ao EAD", hours: 80 }, { name: "Eletricidade Básica", hours: 80 }, { name: "Mecânica Básica", hours: 80 }] },
      { name: "Módulo 02", subjects: [{ name: "Circuitos Elétricos", hours: 80 }, { name: "Elementos de Máquinas", hours: 80 }, { name: "Metrologia", hours: 60 }] },
      { name: "Módulo 03", subjects: [{ name: "Comandos Elétricos", hours: 80 }, { name: "Manutenção Industrial", hours: 80 }, { name: "Automação", hours: 80 }] },
      { name: "Módulo 04", subjects: [{ name: "Hidráulica e Pneumática", hours: 80 }, { name: "Segurança do Trabalho", hours: 60 }, { name: "Estágio Supervisionado", hours: 240 }] }
    ],
    access: [{ title: "Video Aulas", description: "Estude onde e quando quiser." }, { title: "Tutoria", description: "Tire suas dúvidas." }, { title: "Diploma", description: "Autorizado pelo MEC." }],
    faq: [{ question: "Quais as formas de pagamento?", answer: "Aceitamos cartão de crédito em até 12x sem juros, boleto bancário e PIX." }]
  },
  "tti": {
    title: "Curso Técnico em Transações Imobiliárias (TTI) EAD",
    subtitle: "Torne-se corretor de imóveis com respaldo do CRECI",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=600&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&h=400&fit=crop",
    description: "O Curso Técnico em Transações Imobiliárias (TTI) EAD prepara você para atuar como corretor de imóveis, com registro no CRECI. Uma carreira com excelentes oportunidades de ganhos e flexibilidade.",
    originalPrice: "R$ 1.750,00",
    promoPrice: "R$ 900,00",
    installment: "R$ 75,00",
    hours: 800,
    durationRange: "4 a 8 meses",
    certification: "Registro no CRECI",
    rating: 5.0,
    youtubeVideoId: "pn97Z1-ssFI",
    category: "Curso Técnico EAD",
    registration: {
      portaria: "SEE-PRC-2021/12176",
      parecer: "224/2021",
      approvedDate: "07/10/2021",
      registerWith: "Registro no CRECI"
    },
    aboutCourse: "O corretor de imóveis é o profissional responsável por intermediar negócios imobiliários de compra, venda e locação.",
    howItWorks: ["Formação completa para atuar no mercado imobiliário.", "Metodologia EAD com suporte especializado."],
    profession: "Atue em imobiliárias, construtoras ou como corretor autônomo.",
    market: "O mercado imobiliário oferece excelentes oportunidades de ganhos para profissionais qualificados.",
    methodology: {
      materials: ["Video-aulas", "Apostilas", "Biblioteca digital"],
      services: ["Requerimento de declarações", "Histórico", "Estágio"],
      responseTime: "Chamados respondidos dentro de 48 horas."
    },
    requirements: ["Cópia do RG e do CPF", "Comprovante de Residência", "Certificado de Conclusão do Ensino Médio"],
    tutoring: "Acompanhamento do tutor pelo portal do aluno.",
    tutorAttributes: ["Apoiar os alunos na plataforma", "Orientar durante as atividades"],
    modules: [
      { name: "Módulo 01", subjects: [{ name: "Introdução ao EAD", hours: 60 }, { name: "Operações Imobiliárias", hours: 80 }, { name: "Direito Imobiliário", hours: 80 }] },
      { name: "Módulo 02", subjects: [{ name: "Economia e Mercado", hours: 60 }, { name: "Matemática Financeira", hours: 60 }, { name: "Marketing Imobiliário", hours: 60 }] },
      { name: "Módulo 03", subjects: [{ name: "Desenho Arquitetônico", hours: 60 }, { name: "Organização Técnica Comercial", hours: 60 }, { name: "Estágio Supervisionado", hours: 180 }] }
    ],
    access: [{ title: "Video Aulas", description: "Estude onde e quando quiser." }, { title: "Tutoria", description: "Tire suas dúvidas." }, { title: "Diploma", description: "Autorizado pelo MEC." }],
    faq: [{ question: "Posso atuar como corretor após o curso?", answer: "Sim, com o diploma você pode solicitar registro no CRECI e atuar legalmente." }]
  },
  "agropecuaria": {
    title: "Curso Técnico em Agropecuária EAD",
    subtitle: "Domine técnicas de produção agrícola e pecuária com certificação reconhecida pelo MEC",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=600&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&h=400&fit=crop",
    description: "O Curso Técnico em Agropecuária EAD forma profissionais para atuar na gestão de propriedades rurais, produção agrícola e criação de animais. O agronegócio é um dos setores mais fortes da economia brasileira.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "R$ 125,00",
    hours: 1200,
    durationRange: "6 a 12 meses",
    certification: "Certificação válida",
    rating: 5.0,
    youtubeVideoId: "pn97Z1-ssFI",
    category: "Curso Técnico EAD",
    registration: {
      portaria: "SEE-PRC-2021/12177",
      parecer: "225/2021",
      approvedDate: "07/10/2021",
      registerWith: "Registro Profissional"
    },
    aboutCourse: "O Técnico em Agropecuária é essencial para o desenvolvimento do agronegócio brasileiro.",
    howItWorks: ["Formação completa em agricultura e pecuária.", "Metodologia EAD com suporte especializado."],
    profession: "Atue em fazendas, cooperativas, empresas de insumos agrícolas e órgãos públicos.",
    market: "O agronegócio brasileiro é um dos mais importantes do mundo, com demanda constante por profissionais qualificados.",
    methodology: {
      materials: ["Video-aulas", "Apostilas", "Biblioteca digital"],
      services: ["Requerimento de declarações", "Histórico", "Estágio"],
      responseTime: "Chamados respondidos dentro de 48 horas."
    },
    requirements: ["Cópia do RG e do CPF", "Comprovante de Residência", "Certificado de Conclusão do Ensino Médio"],
    tutoring: "Acompanhamento do tutor pelo portal do aluno.",
    tutorAttributes: ["Apoiar os alunos na plataforma", "Orientar durante as atividades"],
    modules: [
      { name: "Módulo 01", subjects: [{ name: "Introdução ao EAD", hours: 80 }, { name: "Fundamentos da Agropecuária", hours: 80 }, { name: "Solos e Nutrição de Plantas", hours: 80 }] },
      { name: "Módulo 02", subjects: [{ name: "Culturas Anuais", hours: 80 }, { name: "Fruticultura", hours: 80 }, { name: "Olericultura", hours: 60 }] },
      { name: "Módulo 03", subjects: [{ name: "Zootecnia Geral", hours: 80 }, { name: "Bovinocultura", hours: 80 }, { name: "Avicultura e Suinocultura", hours: 60 }] },
      { name: "Módulo 04", subjects: [{ name: "Mecanização Agrícola", hours: 60 }, { name: "Gestão Rural", hours: 80 }, { name: "Estágio Supervisionado", hours: 240 }] }
    ],
    access: [{ title: "Video Aulas", description: "Estude onde e quando quiser." }, { title: "Tutoria", description: "Tire suas dúvidas." }, { title: "Diploma", description: "Autorizado pelo MEC." }],
    faq: [{ question: "Quais as formas de pagamento?", answer: "Aceitamos cartão de crédito em até 12x sem juros, boleto bancário e PIX." }]
  },
  "farmacia": {
    title: "Curso Técnico em Farmácia EAD",
    subtitle: "Mergulhe no mundo da saúde e faça a diferença com certificação reconhecida pelo MEC",
    image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=1200&h=600&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=1920&h=400&fit=crop",
    description: "O Curso Técnico em Farmácia EAD forma profissionais para atuar em farmácias, drogarias, hospitais e indústrias farmacêuticas. Uma área da saúde com amplo mercado de trabalho.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "R$ 125,00",
    hours: 1200,
    durationRange: "6 a 12 meses",
    certification: "Certificação válida",
    rating: 5.0,
    youtubeVideoId: "pn97Z1-ssFI",
    category: "Curso Técnico EAD",
    registration: {
      portaria: "SEE-PRC-2021/12178",
      parecer: "226/2021",
      approvedDate: "07/10/2021",
      registerWith: "Registro no CRF"
    },
    aboutCourse: "O Técnico em Farmácia auxilia na dispensação de medicamentos, manipulação farmacêutica e orientação ao paciente.",
    howItWorks: ["Formação completa na área farmacêutica.", "Metodologia EAD com suporte especializado."],
    profession: "Atue em farmácias, drogarias, hospitais, laboratórios e indústrias farmacêuticas.",
    market: "O setor farmacêutico está em constante crescimento, com demanda por profissionais qualificados.",
    methodology: {
      materials: ["Video-aulas", "Apostilas", "Biblioteca digital"],
      services: ["Requerimento de declarações", "Histórico", "Estágio"],
      responseTime: "Chamados respondidos dentro de 48 horas."
    },
    requirements: ["Cópia do RG e do CPF", "Comprovante de Residência", "Certificado de Conclusão do Ensino Médio"],
    tutoring: "Acompanhamento do tutor pelo portal do aluno.",
    tutorAttributes: ["Apoiar os alunos na plataforma", "Orientar durante as atividades"],
    modules: [
      { name: "Módulo 01", subjects: [{ name: "Introdução ao EAD", hours: 80 }, { name: "Anatomia e Fisiologia", hours: 80 }, { name: "Farmacologia Básica", hours: 80 }] },
      { name: "Módulo 02", subjects: [{ name: "Farmacotécnica", hours: 80 }, { name: "Dispensação de Medicamentos", hours: 80 }, { name: "Cosmetologia", hours: 60 }] },
      { name: "Módulo 03", subjects: [{ name: "Farmácia Hospitalar", hours: 80 }, { name: "Legislação Farmacêutica", hours: 60 }, { name: "Atenção Farmacêutica", hours: 80 }] },
      { name: "Módulo 04", subjects: [{ name: "Controle de Qualidade", hours: 60 }, { name: "Gestão em Farmácia", hours: 60 }, { name: "Estágio Supervisionado", hours: 240 }] }
    ],
    access: [{ title: "Video Aulas", description: "Estude onde e quando quiser." }, { title: "Tutoria", description: "Tire suas dúvidas." }, { title: "Diploma", description: "Autorizado pelo MEC." }],
    faq: [{ question: "Quais as formas de pagamento?", answer: "Aceitamos cartão de crédito em até 12x sem juros, boleto bancário e PIX." }]
  },
  "agricultura": {
    title: "Curso Técnico em Agricultura EAD",
    subtitle: "Transforme sua paixão pelo campo em carreira de sucesso",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=600&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&h=400&fit=crop",
    description: "O Curso Técnico em Agricultura EAD forma profissionais para atuar no planejamento, execução e acompanhamento da produção agrícola. O Brasil é uma potência agrícola mundial.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.500,00",
    installment: "R$ 125,00",
    hours: 1200,
    durationRange: "6 a 12 meses",
    certification: "Certificação válida",
    rating: 5.0,
    youtubeVideoId: "pn97Z1-ssFI",
    category: "Curso Técnico EAD",
    registration: {
      portaria: "SEE-PRC-2021/12179",
      parecer: "227/2021",
      approvedDate: "07/10/2021",
      registerWith: "Registro Profissional"
    },
    aboutCourse: "O Técnico em Agricultura é fundamental para o desenvolvimento do setor agrícola brasileiro.",
    howItWorks: ["Formação completa em produção agrícola.", "Metodologia EAD com suporte especializado."],
    profession: "Atue em propriedades rurais, cooperativas, empresas de insumos e assistência técnica.",
    market: "O setor agrícola brasileiro oferece inúmeras oportunidades para profissionais qualificados.",
    methodology: {
      materials: ["Video-aulas", "Apostilas", "Biblioteca digital"],
      services: ["Requerimento de declarações", "Histórico", "Estágio"],
      responseTime: "Chamados respondidos dentro de 48 horas."
    },
    requirements: ["Cópia do RG e do CPF", "Comprovante de Residência", "Certificado de Conclusão do Ensino Médio"],
    tutoring: "Acompanhamento do tutor pelo portal do aluno.",
    tutorAttributes: ["Apoiar os alunos na plataforma", "Orientar durante as atividades"],
    modules: [
      { name: "Módulo 01", subjects: [{ name: "Introdução ao EAD", hours: 80 }, { name: "Solos e Adubação", hours: 80 }, { name: "Irrigação e Drenagem", hours: 80 }] },
      { name: "Módulo 02", subjects: [{ name: "Grandes Culturas", hours: 80 }, { name: "Fruticultura", hours: 80 }, { name: "Olericultura", hours: 80 }] },
      { name: "Módulo 03", subjects: [{ name: "Fitossanidade", hours: 80 }, { name: "Mecanização Agrícola", hours: 80 }, { name: "Agricultura de Precisão", hours: 60 }] },
      { name: "Módulo 04", subjects: [{ name: "Administração Rural", hours: 80 }, { name: "Comercialização Agrícola", hours: 60 }, { name: "Estágio Supervisionado", hours: 240 }] }
    ],
    access: [{ title: "Video Aulas", description: "Estude onde e quando quiser." }, { title: "Tutoria", description: "Tire suas dúvidas." }, { title: "Diploma", description: "Autorizado pelo MEC." }],
    faq: [{ question: "Quais as formas de pagamento?", answer: "Aceitamos cartão de crédito em até 12x sem juros, boleto bancário e PIX." }]
  },
  // Cursos de Certificação por Competência
  "certificacao-administracao": {
    title: "Certificação Técnica por Competência em Administração",
    subtitle: "Valide sua experiência profissional e obtenha diploma técnico reconhecido pelo MEC",
    image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1200&h=600&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1920&h=400&fit=crop",
    description: "A Certificação Técnica por Competência em Administração é destinada a profissionais com experiência prática na área administrativa. Através da aferição de habilidades e competências, você pode obter seu diploma técnico e registro profissional.",
    originalPrice: "R$ 3.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "R$ 133,25",
    hours: 800,
    durationRange: "3 a 6 meses",
    certification: "Certificação válida",
    rating: 5.0,
    youtubeVideoId: "pn97Z1-ssFI",
    category: "Certificação por Competência",
    registration: {
      portaria: "SEE-PRC-2021/12180",
      parecer: "228/2021",
      approvedDate: "07/10/2021",
      registerWith: "Registro Profissional"
    },
    aboutCourse: "A certificação por competência reconhece formalmente os conhecimentos e habilidades adquiridos ao longo da sua trajetória profissional na área de administração.",
    howItWorks: ["Avaliação das competências técnicas através de provas e portfólio.", "Processo mais rápido para quem já possui experiência prática."],
    profession: "Atue formalmente em cargos administrativos com diploma técnico reconhecido.",
    market: "Obtenha reconhecimento formal para crescer na carreira administrativa.",
    methodology: {
      materials: ["Material de apoio", "Orientações para avaliação", "Biblioteca digital"],
      services: ["Requerimento de declarações", "Histórico", "Matriz curricular"],
      responseTime: "Chamados respondidos dentro de 48 horas."
    },
    requirements: ["Cópia do RG e do CPF", "Comprovante de Residência", "Comprovação de experiência profissional na área"],
    tutoring: "Acompanhamento durante todo o processo de certificação.",
    tutorAttributes: ["Orientar sobre o processo de avaliação", "Esclarecer dúvidas sobre competências"],
    modules: [
      { name: "Avaliação de Competências", subjects: [{ name: "Fundamentos da Administração", hours: 80 }, { name: "Gestão de Pessoas", hours: 80 }, { name: "Gestão Financeira", hours: 80 }, { name: "Processos Organizacionais", hours: 80 }] }
    ],
    access: [{ title: "Material de Apoio", description: "Prepare-se para as avaliações." }, { title: "Orientação", description: "Acompanhamento especializado." }, { title: "Diploma", description: "Autorizado pelo MEC." }],
    faq: [{ question: "Preciso de experiência prévia?", answer: "Sim, é necessário comprovar experiência profissional na área de administração." }]
  },
  "certificacao-automacao-industrial": {
    title: "Certificação Técnica por Competência em Automação Industrial",
    subtitle: "Valide suas habilidades em automação e obtenha registro no CREA",
    image: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1200&h=600&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1920&h=400&fit=crop",
    description: "A Certificação Técnica por Competência em Automação Industrial reconhece suas habilidades práticas em sistemas automatizados, CLPs, sensores e atuadores. Obtenha diploma técnico com registro no CREA.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "R$ 133,25",
    hours: 800,
    durationRange: "3 a 6 meses",
    certification: "Registro no CREA",
    rating: 5.0,
    youtubeVideoId: "pn97Z1-ssFI",
    category: "Certificação por Competência",
    registration: {
      portaria: "SEE-PRC-2021/12181",
      parecer: "229/2021",
      approvedDate: "07/10/2021",
      registerWith: "Registro no CREA"
    },
    aboutCourse: "Certificação destinada a profissionais com experiência em automação industrial que desejam formalizar seus conhecimentos.",
    howItWorks: ["Avaliação prática e teórica das competências.", "Processo otimizado para profissionais experientes."],
    profession: "Atue legalmente como técnico em automação industrial com registro no CREA.",
    market: "A Indústria 4.0 demanda profissionais qualificados e certificados em automação.",
    methodology: {
      materials: ["Material de apoio", "Orientações para avaliação", "Biblioteca digital"],
      services: ["Requerimento de declarações", "Histórico", "Matriz curricular"],
      responseTime: "Chamados respondidos dentro de 48 horas."
    },
    requirements: ["Cópia do RG e do CPF", "Comprovante de Residência", "Comprovação de experiência na área"],
    tutoring: "Orientação especializada durante o processo.",
    tutorAttributes: ["Apoiar na preparação para avaliação", "Esclarecer dúvidas técnicas"],
    modules: [
      { name: "Avaliação de Competências", subjects: [{ name: "CLPs e Programação", hours: 100 }, { name: "Sensores e Atuadores", hours: 80 }, { name: "Redes Industriais", hours: 80 }, { name: "Sistemas Supervisórios", hours: 80 }] }
    ],
    access: [{ title: "Material de Apoio", description: "Prepare-se para as avaliações." }, { title: "Orientação", description: "Acompanhamento especializado." }, { title: "Diploma", description: "Autorizado pelo MEC." }],
    faq: [{ question: "Posso me registrar no CREA?", answer: "Sim, após a certificação você pode solicitar registro no CREA." }]
  },
  "certificacao-edificacoes": {
    title: "Certificação Técnica por Competência em Edificações",
    subtitle: "Formalize sua experiência na construção civil com registro no CREA",
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&h=600&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1920&h=400&fit=crop",
    description: "A Certificação por Competência em Edificações é ideal para profissionais da construção civil com experiência prática. Obtenha diploma técnico reconhecido e registro no CREA.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "R$ 133,25",
    hours: 800,
    durationRange: "3 a 6 meses",
    certification: "Registro no CREA",
    rating: 5.0,
    youtubeVideoId: "pn97Z1-ssFI",
    category: "Certificação por Competência",
    registration: {
      portaria: "SEE-PRC-2021/12182",
      parecer: "230/2021",
      approvedDate: "07/10/2021",
      registerWith: "Registro no CREA"
    },
    aboutCourse: "Reconheça formalmente sua experiência em obras e projetos de edificações.",
    howItWorks: ["Avaliação de competências técnicas em construção civil.", "Processo acelerado para profissionais experientes."],
    profession: "Atue legalmente como técnico em edificações com respaldo do CREA.",
    market: "A construção civil valoriza profissionais certificados e regularizados.",
    methodology: {
      materials: ["Material de apoio", "Orientações para avaliação", "Biblioteca digital"],
      services: ["Requerimento de declarações", "Histórico", "Matriz curricular"],
      responseTime: "Chamados respondidos dentro de 48 horas."
    },
    requirements: ["Cópia do RG e do CPF", "Comprovante de Residência", "Comprovação de experiência na construção civil"],
    tutoring: "Orientação durante todo o processo de certificação.",
    tutorAttributes: ["Apoiar na preparação", "Esclarecer dúvidas técnicas"],
    modules: [
      { name: "Avaliação de Competências", subjects: [{ name: "Projetos e Desenho Técnico", hours: 100 }, { name: "Materiais e Técnicas Construtivas", hours: 100 }, { name: "Orçamento e Planejamento", hours: 80 }, { name: "Normas e Segurança", hours: 80 }] }
    ],
    access: [{ title: "Material de Apoio", description: "Prepare-se para as avaliações." }, { title: "Orientação", description: "Acompanhamento especializado." }, { title: "Diploma", description: "Autorizado pelo MEC." }],
    faq: [{ question: "Posso me registrar no CREA?", answer: "Sim, após a certificação você pode solicitar registro no CREA." }]
  },
  "certificacao-eletrotecnica": {
    title: "Certificação Técnica por Competência em Eletrotécnica",
    subtitle: "Valide suas competências em sistemas elétricos com registro no CREA",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=600&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=400&fit=crop",
    description: "A Certificação por Competência em Eletrotécnica reconhece sua experiência prática em instalações e sistemas elétricos. Obtenha diploma técnico e registro no CREA.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "R$ 133,25",
    hours: 800,
    durationRange: "3 a 6 meses",
    certification: "Registro no CREA",
    rating: 5.0,
    youtubeVideoId: "pn97Z1-ssFI",
    category: "Certificação por Competência",
    registration: {
      portaria: "SEE-PRC-2021/12183",
      parecer: "231/2021",
      approvedDate: "07/10/2021",
      registerWith: "Registro no CREA"
    },
    aboutCourse: "Formalize seus conhecimentos em eletrotécnica através da aferição de competências.",
    howItWorks: ["Avaliação teórica e prática das competências elétricas.", "Processo direcionado para profissionais experientes."],
    profession: "Atue como técnico em eletrotécnica com registro profissional no CREA.",
    market: "O setor elétrico demanda profissionais certificados e habilitados.",
    methodology: {
      materials: ["Material de apoio", "Orientações para avaliação", "Biblioteca digital"],
      services: ["Requerimento de declarações", "Histórico", "Matriz curricular"],
      responseTime: "Chamados respondidos dentro de 48 horas."
    },
    requirements: ["Cópia do RG e do CPF", "Comprovante de Residência", "Comprovação de experiência na área elétrica"],
    tutoring: "Orientação especializada durante o processo.",
    tutorAttributes: ["Apoiar na preparação", "Esclarecer dúvidas técnicas"],
    modules: [
      { name: "Avaliação de Competências", subjects: [{ name: "Instalações Elétricas", hours: 100 }, { name: "Comandos Elétricos", hours: 80 }, { name: "Máquinas Elétricas", hours: 80 }, { name: "Normas e Segurança", hours: 80 }] }
    ],
    access: [{ title: "Material de Apoio", description: "Prepare-se para as avaliações." }, { title: "Orientação", description: "Acompanhamento especializado." }, { title: "Diploma", description: "Autorizado pelo MEC." }],
    faq: [{ question: "Posso me registrar no CREA?", answer: "Sim, após a certificação você pode solicitar registro no CREA." }]
  },
  "certificacao-seguranca-trabalho": {
    title: "Certificação Técnica por Competência em Segurança do Trabalho",
    subtitle: "Valide sua experiência em SST e obtenha registro no MTE",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&h=600&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1920&h=400&fit=crop",
    description: "A Certificação por Competência em Segurança do Trabalho reconhece sua experiência prática em SST. Obtenha diploma técnico e registro no MTE para atuar legalmente.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "R$ 133,25",
    hours: 800,
    durationRange: "3 a 6 meses",
    certification: "Registro no MTE",
    rating: 5.0,
    youtubeVideoId: "pn97Z1-ssFI",
    category: "Certificação por Competência",
    registration: {
      portaria: "SEE-PRC-2021/12184",
      parecer: "232/2021",
      approvedDate: "07/10/2021",
      registerWith: "Registro no MTE"
    },
    aboutCourse: "Formalize sua atuação em segurança do trabalho através da certificação por competência.",
    howItWorks: ["Avaliação das competências em prevenção e segurança.", "Processo otimizado para profissionais com experiência."],
    profession: "Atue como técnico em segurança do trabalho com registro no MTE.",
    market: "Empresas buscam profissionais certificados para suas equipes de SST.",
    methodology: {
      materials: ["Material de apoio", "Orientações para avaliação", "Biblioteca digital"],
      services: ["Requerimento de declarações", "Histórico", "Matriz curricular"],
      responseTime: "Chamados respondidos dentro de 48 horas."
    },
    requirements: ["Cópia do RG e do CPF", "Comprovante de Residência", "Comprovação de experiência em SST"],
    tutoring: "Orientação durante todo o processo.",
    tutorAttributes: ["Apoiar na preparação", "Esclarecer dúvidas sobre normas"],
    modules: [
      { name: "Avaliação de Competências", subjects: [{ name: "Normas Regulamentadoras", hours: 120 }, { name: "Prevenção de Acidentes", hours: 100 }, { name: "Higiene Ocupacional", hours: 80 }, { name: "Gestão de Riscos", hours: 80 }] }
    ],
    access: [{ title: "Material de Apoio", description: "Prepare-se para as avaliações." }, { title: "Orientação", description: "Acompanhamento especializado." }, { title: "Diploma", description: "Autorizado pelo MEC." }],
    faq: [{ question: "Posso me registrar no MTE?", answer: "Sim, após a certificação você pode solicitar registro no MTE." }]
  },
  "certificacao-agricultura": {
    title: "Certificação Técnica por Competência em Agricultura",
    subtitle: "Formalize sua experiência no campo com diploma técnico",
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1200&h=600&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1920&h=400&fit=crop",
    description: "A Certificação por Competência em Agricultura reconhece sua experiência prática no setor agrícola. Obtenha diploma técnico para atuar formalmente no agronegócio.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "R$ 133,25",
    hours: 800,
    durationRange: "3 a 6 meses",
    certification: "Certificação válida",
    rating: 5.0,
    youtubeVideoId: "pn97Z1-ssFI",
    category: "Certificação por Competência",
    registration: {
      portaria: "SEE-PRC-2021/12185",
      parecer: "233/2021",
      approvedDate: "07/10/2021",
      registerWith: "Registro Profissional"
    },
    aboutCourse: "Valide seus conhecimentos em produção agrícola através da aferição de competências.",
    howItWorks: ["Avaliação das competências técnicas em agricultura.", "Processo acelerado para profissionais experientes."],
    profession: "Atue formalmente como técnico em agricultura com diploma reconhecido.",
    market: "O agronegócio valoriza profissionais com formação técnica comprovada.",
    methodology: {
      materials: ["Material de apoio", "Orientações para avaliação", "Biblioteca digital"],
      services: ["Requerimento de declarações", "Histórico", "Matriz curricular"],
      responseTime: "Chamados respondidos dentro de 48 horas."
    },
    requirements: ["Cópia do RG e do CPF", "Comprovante de Residência", "Comprovação de experiência na agricultura"],
    tutoring: "Orientação durante o processo de certificação.",
    tutorAttributes: ["Apoiar na preparação", "Esclarecer dúvidas técnicas"],
    modules: [
      { name: "Avaliação de Competências", subjects: [{ name: "Culturas e Manejo", hours: 100 }, { name: "Solos e Nutrição", hours: 80 }, { name: "Fitossanidade", hours: 80 }, { name: "Mecanização Agrícola", hours: 80 }] }
    ],
    access: [{ title: "Material de Apoio", description: "Prepare-se para as avaliações." }, { title: "Orientação", description: "Acompanhamento especializado." }, { title: "Diploma", description: "Autorizado pelo MEC." }],
    faq: [{ question: "Preciso de experiência prévia?", answer: "Sim, é necessário comprovar experiência na área agrícola." }]
  },
  "certificacao-agropecuaria": {
    title: "Certificação Técnica por Competência em Agropecuária",
    subtitle: "Valide sua experiência em agricultura e pecuária",
    image: "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=1200&h=600&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=1920&h=400&fit=crop",
    description: "A Certificação por Competência em Agropecuária é destinada a profissionais com experiência prática em produção agrícola e pecuária. Obtenha diploma técnico reconhecido.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "R$ 133,25",
    hours: 800,
    durationRange: "3 a 6 meses",
    certification: "Certificação válida",
    rating: 5.0,
    youtubeVideoId: "pn97Z1-ssFI",
    category: "Certificação por Competência",
    registration: {
      portaria: "SEE-PRC-2021/12186",
      parecer: "234/2021",
      approvedDate: "07/10/2021",
      registerWith: "Registro Profissional"
    },
    aboutCourse: "Formalize seus conhecimentos em agropecuária através da certificação por competência.",
    howItWorks: ["Avaliação das competências em agricultura e pecuária.", "Processo direcionado para profissionais do campo."],
    profession: "Atue como técnico em agropecuária com diploma reconhecido pelo MEC.",
    market: "O setor agropecuário demanda profissionais qualificados e certificados.",
    methodology: {
      materials: ["Material de apoio", "Orientações para avaliação", "Biblioteca digital"],
      services: ["Requerimento de declarações", "Histórico", "Matriz curricular"],
      responseTime: "Chamados respondidos dentro de 48 horas."
    },
    requirements: ["Cópia do RG e do CPF", "Comprovante de Residência", "Comprovação de experiência em agropecuária"],
    tutoring: "Orientação durante todo o processo.",
    tutorAttributes: ["Apoiar na preparação", "Esclarecer dúvidas técnicas"],
    modules: [
      { name: "Avaliação de Competências", subjects: [{ name: "Produção Agrícola", hours: 100 }, { name: "Produção Pecuária", hours: 100 }, { name: "Gestão Rural", hours: 80 }, { name: "Sustentabilidade", hours: 60 }] }
    ],
    access: [{ title: "Material de Apoio", description: "Prepare-se para as avaliações." }, { title: "Orientação", description: "Acompanhamento especializado." }, { title: "Diploma", description: "Autorizado pelo MEC." }],
    faq: [{ question: "Preciso de experiência prévia?", answer: "Sim, é necessário comprovar experiência na área agropecuária." }]
  },
  "certificacao-analises-clinicas": {
    title: "Certificação Técnica por Competência em Análises Clínicas",
    subtitle: "Valide sua experiência em laboratório com diploma técnico",
    image: "https://images.unsplash.com/photo-1579165466949-3180a3d056d5?w=1200&h=600&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1579165466949-3180a3d056d5?w=1920&h=400&fit=crop",
    description: "A Certificação por Competência em Análises Clínicas reconhece sua experiência prática em laboratórios. Obtenha diploma técnico reconhecido pelo MEC.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "R$ 133,25",
    hours: 800,
    durationRange: "3 a 6 meses",
    certification: "Certificação válida",
    rating: 5.0,
    youtubeVideoId: "pn97Z1-ssFI",
    category: "Certificação por Competência",
    registration: {
      portaria: "SEE-PRC-2021/12187",
      parecer: "235/2021",
      approvedDate: "07/10/2021",
      registerWith: "Registro Profissional"
    },
    aboutCourse: "Formalize sua experiência em análises laboratoriais através da certificação por competência.",
    howItWorks: ["Avaliação das competências em técnicas laboratoriais.", "Processo otimizado para profissionais experientes."],
    profession: "Atue formalmente como técnico em análises clínicas.",
    market: "Laboratórios e hospitais valorizam profissionais com formação técnica comprovada.",
    methodology: {
      materials: ["Material de apoio", "Orientações para avaliação", "Biblioteca digital"],
      services: ["Requerimento de declarações", "Histórico", "Matriz curricular"],
      responseTime: "Chamados respondidos dentro de 48 horas."
    },
    requirements: ["Cópia do RG e do CPF", "Comprovante de Residência", "Comprovação de experiência em laboratório"],
    tutoring: "Orientação durante o processo de certificação.",
    tutorAttributes: ["Apoiar na preparação", "Esclarecer dúvidas técnicas"],
    modules: [
      { name: "Avaliação de Competências", subjects: [{ name: "Bioquímica Clínica", hours: 100 }, { name: "Hematologia", hours: 100 }, { name: "Microbiologia", hours: 80 }, { name: "Biossegurança", hours: 60 }] }
    ],
    access: [{ title: "Material de Apoio", description: "Prepare-se para as avaliações." }, { title: "Orientação", description: "Acompanhamento especializado." }, { title: "Diploma", description: "Autorizado pelo MEC." }],
    faq: [{ question: "Preciso de experiência prévia?", answer: "Sim, é necessário comprovar experiência em laboratório de análises clínicas." }]
  },
  "certificacao-eletroeletronica": {
    title: "Certificação Técnica por Competência em Eletroeletrônica",
    subtitle: "Valide suas habilidades em eletroeletrônica com registro no CREA",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=600&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&h=400&fit=crop",
    description: "A Certificação por Competência em Eletroeletrônica reconhece sua experiência em sistemas eletrônicos e elétricos. Obtenha diploma técnico com registro no CREA.",
    originalPrice: "R$ 3.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "R$ 133,25",
    hours: 800,
    durationRange: "3 a 6 meses",
    certification: "Registro no CREA",
    rating: 5.0,
    youtubeVideoId: "pn97Z1-ssFI",
    category: "Certificação por Competência",
    registration: {
      portaria: "SEE-PRC-2021/12188",
      parecer: "236/2021",
      approvedDate: "07/10/2021",
      registerWith: "Registro no CREA"
    },
    aboutCourse: "Formalize seus conhecimentos em eletroeletrônica através da aferição de competências.",
    howItWorks: ["Avaliação teórica e prática das competências.", "Processo direcionado para profissionais experientes."],
    profession: "Atue como técnico em eletroeletrônica com registro no CREA.",
    market: "O setor de eletrônica demanda profissionais certificados e habilitados.",
    methodology: {
      materials: ["Material de apoio", "Orientações para avaliação", "Biblioteca digital"],
      services: ["Requerimento de declarações", "Histórico", "Matriz curricular"],
      responseTime: "Chamados respondidos dentro de 48 horas."
    },
    requirements: ["Cópia do RG e do CPF", "Comprovante de Residência", "Comprovação de experiência na área"],
    tutoring: "Orientação especializada durante o processo.",
    tutorAttributes: ["Apoiar na preparação", "Esclarecer dúvidas técnicas"],
    modules: [
      { name: "Avaliação de Competências", subjects: [{ name: "Eletrônica Analógica e Digital", hours: 120 }, { name: "Sistemas de Potência", hours: 80 }, { name: "Microcontroladores", hours: 80 }, { name: "Instrumentação", hours: 80 }] }
    ],
    access: [{ title: "Material de Apoio", description: "Prepare-se para as avaliações." }, { title: "Orientação", description: "Acompanhamento especializado." }, { title: "Diploma", description: "Autorizado pelo MEC." }],
    faq: [{ question: "Posso me registrar no CREA?", answer: "Sim, após a certificação você pode solicitar registro no CREA." }]
  },
  "certificacao-mecanica": {
    title: "Certificação Técnica por Competência em Mecânica",
    subtitle: "Formalize sua experiência em mecânica com registro no CREA",
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200&h=600&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1920&h=400&fit=crop",
    description: "A Certificação por Competência em Mecânica é destinada a profissionais com experiência prática em sistemas mecânicos. Obtenha diploma técnico com registro no CREA.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "R$ 133,25",
    hours: 800,
    durationRange: "3 a 6 meses",
    certification: "Registro no CREA",
    rating: 5.0,
    youtubeVideoId: "pn97Z1-ssFI",
    category: "Certificação por Competência",
    registration: {
      portaria: "SEE-PRC-2021/12189",
      parecer: "237/2021",
      approvedDate: "07/10/2021",
      registerWith: "Registro no CREA"
    },
    aboutCourse: "Valide sua experiência em mecânica através da certificação por competência.",
    howItWorks: ["Avaliação das competências técnicas em mecânica.", "Processo acelerado para profissionais experientes."],
    profession: "Atue como técnico em mecânica com registro profissional no CREA.",
    market: "A indústria valoriza profissionais certificados e habilitados.",
    methodology: {
      materials: ["Material de apoio", "Orientações para avaliação", "Biblioteca digital"],
      services: ["Requerimento de declarações", "Histórico", "Matriz curricular"],
      responseTime: "Chamados respondidos dentro de 48 horas."
    },
    requirements: ["Cópia do RG e do CPF", "Comprovante de Residência", "Comprovação de experiência em mecânica"],
    tutoring: "Orientação durante todo o processo.",
    tutorAttributes: ["Apoiar na preparação", "Esclarecer dúvidas técnicas"],
    modules: [
      { name: "Avaliação de Competências", subjects: [{ name: "Elementos de Máquinas", hours: 100 }, { name: "Manutenção Mecânica", hours: 100 }, { name: "Processos de Fabricação", hours: 80 }, { name: "Metrologia", hours: 60 }] }
    ],
    access: [{ title: "Material de Apoio", description: "Prepare-se para as avaliações." }, { title: "Orientação", description: "Acompanhamento especializado." }, { title: "Diploma", description: "Autorizado pelo MEC." }],
    faq: [{ question: "Posso me registrar no CREA?", answer: "Sim, após a certificação você pode solicitar registro no CREA." }]
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
  
  // Form state for enrollment
  const [formData, setFormData] = useState({
    email: "",
    nome_completo: "",
    curso_de_interesse: course.title,
    telefone1: "",
    mensagem: `Olá! Gostaria de me matricular no curso: ${course.title}`,
  });
  const [errors, setErrors] = useState({
    email: "",
    nome_completo: "",
    telefone1: "",
  });

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    if (numbers.length === 0) return "";
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  const validateName = (name: string) => name.trim().split(/\s+/).filter(word => word.length > 0).length >= 2;
  const validatePhone = (phone: string) => phone.replace(/\D/g, "").length === 11;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, telefone1: formatted }));
    setErrors(prev => ({ ...prev, telefone1: formatted && !validatePhone(formatted) ? "Telefone deve ter 11 dígitos" : "" }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, email: value }));
    setErrors(prev => ({ ...prev, email: value && !validateEmail(value) ? "Email inválido" : "" }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, nome_completo: value }));
    setErrors(prev => ({ ...prev, nome_completo: value && !validateName(value) ? "Informe nome e sobrenome" : "" }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const emailValid = validateEmail(formData.email);
    const nameValid = validateName(formData.nome_completo);
    const phoneValid = !formData.telefone1 || validatePhone(formData.telefone1);
    
    setErrors({
      email: emailValid ? "" : "Email inválido",
      nome_completo: nameValid ? "" : "Informe nome e sobrenome",
      telefone1: phoneValid ? "" : "Telefone deve ter 11 dígitos",
    });
    
    if (!emailValid || !nameValid || !phoneValid) {
      e.preventDefault();
    }
  };

  const scrollToForm = () => {
    document.getElementById("matricula-form")?.scrollIntoView({ behavior: "smooth" });
  };

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
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Left Content */}
            <div className="flex-1">
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
            
            {/* Sticky Price Card - Right Side */}
            <div className="hidden lg:block lg:w-96">
              <div className="sticky top-24">
                {/* YouTube Video Thumbnail */}
                <div 
                  className="relative mb-4 cursor-pointer overflow-hidden rounded-xl"
                  onClick={() => setShowVideo(true)}
                >
                  <img 
                    src={`https://img.youtube.com/vi/${course.youtubeVideoId}/maxresdefault.jpg`}
                    alt={course.title}
                    className="aspect-video w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ecid-red">
                      <Play className="h-8 w-8 fill-white text-white" />
                    </div>
                  </div>
                  
                  {/* Course Badge */}
                  <div className="absolute right-3 top-3">
                    <span className="rounded bg-ecid-blue-accent px-2 py-1 text-xs font-bold text-white">
                      {course.category}
                    </span>
                  </div>
                  
                  {/* Course Title Overlay */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h4 className="text-lg font-bold text-white">{course.title.split(' ').slice(2).join(' ')}</h4>
                    <span className="mt-1 inline-block rounded border border-white/50 px-2 py-0.5 text-xs text-white">
                      Autorizado pelo MEC
                    </span>
                  </div>
                </div>
                
                {/* Price Card */}
                <div className="rounded-2xl bg-card p-6 shadow-xl">
                  <div className="mb-4 inline-block rounded-lg bg-ecid-blue-accent px-4 py-2">
                    <span className="text-sm font-bold text-white">40% de desconto</span>
                  </div>
                  
                  <h3 className="mb-4 text-lg font-bold text-foreground">{course.title}</h3>
                  
                  <div className="mb-4 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      De <span className="line-through">{course.originalPrice}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">Por {course.promoPrice}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-muted-foreground">12x</span>
                      <span className="text-3xl font-bold text-foreground">{course.installment}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">s/ juros no cartão de crédito</p>
                  </div>
                  
                  <Button 
                    onClick={scrollToForm}
                    className="w-full gap-2 rounded-lg bg-ecid-blue-accent py-6 text-lg font-semibold text-white hover:bg-ecid-navy"
                  >
                    <BookOpen className="h-5 w-5" />
                    Matricule-se já
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enrollment Form Section */}
      <section id="matricula-form" className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center">
              <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
                Matricule-se agora <span className="text-ecid-red">_</span>
              </h2>
              <p className="text-muted-foreground">
                Preencha o formulário abaixo e nossa equipe entrará em contato para finalizar sua matrícula.
              </p>
            </div>

            <div className="rounded-2xl bg-card p-6 shadow-card md:p-8">
              <div className="mb-6 rounded-lg bg-ecid-blue-accent/10 p-4">
                <p className="text-sm font-medium text-ecid-blue-accent">
                  Curso selecionado: <span className="font-bold">{course.title}</span>
                </p>
              </div>

              <form
                autoComplete="off"
                role="form"
                method="post"
                action="https://mautic.faesde.com.br/form/submit?formId=2"
                id="mauticform_matricula"
                data-mautic-form="faesdecombr"
                encType="multipart/form-data"
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <input type="hidden" name="mauticform[formId]" value="2" />
                <input type="hidden" name="mauticform[return]" value="https://mensagem.faesde.com.br/" />
                <input type="hidden" name="mauticform[formName]" value="faesdecombr" />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Nome completo *
                    </label>
                    <Input
                      type="text"
                      name="mauticform[nome_completo]"
                      value={formData.nome_completo}
                      onChange={handleNameChange}
                      placeholder="Seu nome completo"
                      className={`h-11 ${errors.nome_completo ? "border-destructive" : ""}`}
                      required
                    />
                    {errors.nome_completo && (
                      <p className="mt-1 text-sm text-destructive">{errors.nome_completo}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Email *
                    </label>
                    <Input
                      type="email"
                      name="mauticform[email]"
                      value={formData.email}
                      onChange={handleEmailChange}
                      placeholder="seu@email.com"
                      className={`h-11 ${errors.email ? "border-destructive" : ""}`}
                      required
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Telefone
                    </label>
                    <Input
                      type="tel"
                      name="mauticform[telefone1]"
                      value={formData.telefone1}
                      onChange={handlePhoneChange}
                      placeholder="(00) 00000-0000"
                      className={`h-11 ${errors.telefone1 ? "border-destructive" : ""}`}
                    />
                    {errors.telefone1 && (
                      <p className="mt-1 text-sm text-destructive">{errors.telefone1}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Curso de interesse
                    </label>
                    <Input
                      type="text"
                      name="mauticform[curso_de_interesse]"
                      value={formData.curso_de_interesse}
                      readOnly
                      className="h-11 bg-muted"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Mensagem
                  </label>
                  <Textarea
                    name="mauticform[mensagem]"
                    value={formData.mensagem}
                    onChange={(e) => setFormData(prev => ({ ...prev, mensagem: e.target.value }))}
                    placeholder="Escreva uma mensagem..."
                    className="min-h-[100px]"
                  />
                </div>

                <Button
                  type="submit"
                  name="mauticform[submit]"
                  value="1"
                  className="h-12 w-full rounded-lg bg-ecid-red font-semibold text-primary-foreground hover:bg-ecid-red-light"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Quero me matricular
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Ao enviar, você concorda com nossa política de privacidade.
                </p>
              </form>
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