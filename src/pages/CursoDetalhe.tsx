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
  "certificacao-tecnica-competencia-administracao-empresarial": {
    title: "Certificação Técnica por Competência em Administração",
    subtitle: "Transforme sua experiência em gestão empresarial em diploma técnico reconhecido pelo MEC",
    image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1200&h=600&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1920&h=400&fit=crop",
    description: "A Certificação Técnica por Competência em Administração é a oportunidade ideal para profissionais que já atuam na área administrativa e desejam formalizar seus conhecimentos com um diploma técnico. Através de um processo de avaliação que reconhece sua experiência prática em gestão de empresas, recursos humanos, finanças e processos organizacionais, você pode obter seu diploma técnico em Administração reconhecido pelo MEC.",
    originalPrice: "R$ 3.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "R$ 133,25",
    hours: 800,
    durationRange: "3 a 6 meses",
    certification: "Registro no CRA",
    rating: 5.0,
    youtubeVideoId: "pn97Z1-ssFI",
    category: "Certificação por Competência",
    registration: {
      portaria: "SEE-PRC-2021/12180",
      parecer: "228/2021",
      approvedDate: "07/10/2021",
      registerWith: "Registro no CRA"
    },
    aboutCourse: "O Curso de Certificação Técnica por Competência em Administração foi desenvolvido para profissionais que já possuem experiência prática na área administrativa e desejam obter reconhecimento formal de suas habilidades. Este programa avalia suas competências em gestão empresarial, planejamento estratégico, gestão de pessoas, finanças corporativas, marketing e processos organizacionais. Ideal para assistentes administrativos, secretários executivos, auxiliares de escritório, supervisores e coordenadores que atuam há anos na área mas não possuem formação técnica oficial.",
    howItWorks: [
      "A certificação por competência é um processo que reconhece formalmente os conhecimentos adquiridos através da experiência profissional. Você passará por avaliações teóricas e práticas que verificarão suas habilidades em gestão, finanças, recursos humanos e processos administrativos.",
      "O processo inclui análise de portfólio profissional, provas de conhecimentos específicos e avaliação de competências práticas. Nossa equipe pedagógica acompanha você em cada etapa, garantindo suporte completo para sua certificação.",
      "Ao final do processo, você receberá seu diploma técnico em Administração, reconhecido pelo MEC, que possibilita registro no Conselho Regional de Administração (CRA) e amplia suas oportunidades no mercado de trabalho."
    ],
    profession: "O Técnico em Administração certificado pode atuar em empresas de todos os portes e segmentos, ocupando cargos como assistente administrativo, auxiliar de recursos humanos, auxiliar financeiro, secretário executivo, supervisor administrativo e coordenador de departamentos. Com o diploma técnico, você terá reconhecimento formal para crescer na carreira e assumir posições de maior responsabilidade.",
    market: "O mercado de trabalho para técnicos em administração é amplo e diversificado. Com a formalização do diploma técnico, você terá acesso a melhores oportunidades de emprego, promoções e aumentos salariais. Empresas valorizam profissionais com formação reconhecida pelo MEC, especialmente aqueles que comprovam experiência prática aliada ao conhecimento teórico.",
    methodology: {
      materials: ["Material de apoio para estudo", "Guia de competências técnicas", "Simulados de avaliação", "Biblioteca digital", "Orientações para portfólio"],
      services: ["Requerimento de declarações", "Histórico escolar", "Matriz curricular", "Suporte pedagógico especializado"],
      responseTime: "Chamados respondidos dentro de 48 horas por nossa equipe de suporte."
    },
    requirements: ["Cópia do RG e do CPF", "Comprovante de Residência", "Certificado de Conclusão do Ensino Médio", "Comprovação de experiência profissional na área administrativa (mínimo 2 anos)", "Carteira de trabalho ou declaração de empregador"],
    tutoring: "Durante todo o processo de certificação, você terá acompanhamento de tutores especializados em administração. Eles irão orientá-lo sobre os conteúdos avaliados, ajudar na preparação do portfólio profissional e esclarecer todas as suas dúvidas sobre o processo de certificação.",
    tutorAttributes: ["Orientar sobre competências avaliadas", "Auxiliar na preparação do portfólio profissional", "Esclarecer dúvidas sobre gestão empresarial", "Fornecer feedback sobre simulados"],
    modules: [
      { name: "Competências em Gestão", subjects: [{ name: "Fundamentos da Administração", hours: 100 }, { name: "Planejamento Estratégico", hours: 80 }, { name: "Gestão de Processos Organizacionais", hours: 80 }] },
      { name: "Competências em Pessoas e Finanças", subjects: [{ name: "Gestão de Recursos Humanos", hours: 100 }, { name: "Gestão Financeira e Orçamentária", hours: 100 }, { name: "Contabilidade Básica", hours: 80 }] },
      { name: "Competências Complementares", subjects: [{ name: "Marketing e Vendas", hours: 80 }, { name: "Legislação Empresarial", hours: 60 }, { name: "Empreendedorismo", hours: 60 }, { name: "Informática Aplicada", hours: 60 }] }
    ],
    access: [{ title: "Material de Apoio", description: "Conteúdos preparatórios para as avaliações de competências." }, { title: "Orientação Pedagógica", description: "Acompanhamento especializado durante todo o processo." }, { title: "Diploma Técnico", description: "Certificação reconhecida pelo MEC com possibilidade de registro no CRA." }],
    faq: [{ question: "Preciso de experiência prévia?", answer: "Sim, é necessário comprovar no mínimo 2 anos de experiência profissional na área administrativa através de carteira de trabalho ou declaração de empregador." }, { question: "Posso me registrar no CRA?", answer: "Sim, após obter o diploma técnico você pode solicitar registro no Conselho Regional de Administração." }, { question: "Quanto tempo leva o processo?", answer: "O processo de certificação leva em média 3 a 6 meses, dependendo do seu desempenho nas avaliações." }]
  },
  "certificacao-tecnica-competencia-automacao-industrial-clp-sensores": {
    title: "Certificação Técnica por Competência em Automação Industrial",
    subtitle: "Formalize sua experiência com CLPs, sensores e sistemas automatizados com registro no CREA",
    image: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1200&h=600&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1920&h=400&fit=crop",
    description: "A Certificação Técnica por Competência em Automação Industrial é destinada a profissionais que já atuam com sistemas automatizados, CLPs (Controladores Lógicos Programáveis), sensores, atuadores, redes industriais e sistemas supervisórios. Se você trabalha na indústria há anos programando CLPs, configurando sistemas de automação e mantendo linhas de produção automatizadas, esta certificação reconhece formalmente sua expertise e permite registro no CREA.",
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
    aboutCourse: "O programa de Certificação por Competência em Automação Industrial avalia e reconhece suas habilidades práticas em programação de CLPs (Siemens, Allen-Bradley, WEG, Schneider), configuração de sensores e atuadores, implementação de redes industriais (Profibus, Profinet, Modbus, Ethernet/IP), desenvolvimento de sistemas supervisórios (SCADA) e manutenção de sistemas automatizados. É a oportunidade perfeita para técnicos de manutenção industrial, programadores de CLP, integradores de sistemas e operadores de automação que desejam obter diploma técnico oficial.",
    howItWorks: [
      "O processo de certificação avalia suas competências em automação industrial através de provas teóricas sobre conceitos de automação, redes industriais e normas técnicas, além de avaliações práticas de programação de CLPs e configuração de sistemas.",
      "Você poderá apresentar seu portfólio de projetos de automação realizados, certificações de fabricantes (Siemens, Rockwell, WEG, etc.) e comprovantes de experiência profissional para complementar sua avaliação.",
      "Com a aprovação, você receberá o diploma técnico em Automação Industrial reconhecido pelo MEC, que permite solicitar registro no CREA como técnico de nível médio, habilitando-se a assinar projetos e laudos técnicos."
    ],
    profession: "O Técnico em Automação Industrial certificado pode atuar como programador de CLP, técnico de automação, integrador de sistemas industriais, técnico de manutenção em automação, supervisor de produção automatizada e consultor em automação industrial. Com registro no CREA, você poderá assinar projetos de automação e assumir responsabilidade técnica por sistemas industriais.",
    market: "A Indústria 4.0 está transformando o setor produtivo brasileiro, gerando altíssima demanda por profissionais qualificados em automação industrial. Empresas dos setores automotivo, alimentício, farmacêutico, petroquímico e de manufatura em geral buscam técnicos certificados e registrados no CREA para suas equipes de automação e manutenção industrial.",
    methodology: {
      materials: ["Material de apoio técnico em automação", "Guia de programação de CLPs", "Documentação sobre redes industriais", "Biblioteca digital especializada", "Simulados de avaliação"],
      services: ["Requerimento de declarações", "Histórico escolar", "Matriz curricular", "Orientação para registro no CREA"],
      responseTime: "Chamados respondidos dentro de 48 horas por nossa equipe técnica especializada."
    },
    requirements: ["Cópia do RG e do CPF", "Comprovante de Residência", "Certificado de Conclusão do Ensino Médio", "Comprovação de experiência profissional em automação industrial (mínimo 2 anos)", "Portfólio de projetos ou certificações de fabricantes (desejável)"],
    tutoring: "Tutores com experiência prática em automação industrial acompanham você durante todo o processo, orientando sobre programação de CLPs, redes industriais e preparação para as avaliações técnicas.",
    tutorAttributes: ["Orientar sobre programação de CLPs de diferentes fabricantes", "Esclarecer dúvidas sobre redes industriais e protocolos", "Auxiliar na preparação do portfólio técnico", "Fornecer feedback sobre conhecimentos em automação"],
    modules: [
      { name: "Sistemas de Controle", subjects: [{ name: "Programação de CLPs (Ladder, FBD, ST)", hours: 120 }, { name: "Controladores e Interfaces HMI", hours: 80 }, { name: "Instrumentação Industrial", hours: 80 }] },
      { name: "Redes e Integração", subjects: [{ name: "Redes Industriais (Profibus, Profinet, Modbus)", hours: 100 }, { name: "Sistemas Supervisórios SCADA", hours: 80 }, { name: "Integração de Sistemas", hours: 80 }] },
      { name: "Aplicações e Normas", subjects: [{ name: "Sensores, Transdutores e Atuadores", hours: 80 }, { name: "Robótica Industrial Básica", hours: 60 }, { name: "Normas NR-12 e Segurança em Automação", hours: 60 }, { name: "Manutenção de Sistemas Automatizados", hours: 60 }] }
    ],
    access: [{ title: "Material Técnico", description: "Conteúdos especializados em CLPs, redes e sistemas de automação." }, { title: "Orientação Técnica", description: "Acompanhamento por profissionais experientes em automação industrial." }, { title: "Diploma + CREA", description: "Certificação pelo MEC com direito a registro no CREA." }],
    faq: [{ question: "Posso me registrar no CREA?", answer: "Sim, após a certificação você pode solicitar registro no CREA como técnico em Automação Industrial." }, { question: "Preciso saber programar CLP?", answer: "Sim, é esperado que você tenha experiência prática com programação de CLPs em pelo menos uma linguagem (Ladder, FBD ou Texto Estruturado)." }, { question: "Certificações de fabricantes são consideradas?", answer: "Sim, certificações Siemens, Rockwell, WEG e outros fabricantes podem complementar sua avaliação de competências." }]
  },
  "certificacao-tecnica-competencia-edificacoes-construcao-civil": {
    title: "Certificação Técnica por Competência em Edificações",
    subtitle: "Transforme sua experiência em obras e projetos de construção civil em diploma técnico com registro no CREA",
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&h=600&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1920&h=400&fit=crop",
    description: "A Certificação Técnica por Competência em Edificações é o caminho para profissionais da construção civil que já atuam em obras, projetos, orçamentos e fiscalização e desejam formalizar sua experiência com diploma técnico. Se você trabalha como mestre de obras, encarregado de construção, desenhista projetista, orçamentista ou auxiliar de engenharia, esta certificação reconhece seus conhecimentos práticos e permite registro no CREA para assinar projetos e laudos técnicos.",
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
    aboutCourse: "O programa de Certificação por Competência em Edificações avalia suas habilidades em leitura e interpretação de projetos arquitetônicos e estruturais, técnicas construtivas, orçamento de obras, planejamento de cronogramas, fiscalização de serviços, conhecimento de materiais de construção e aplicação de normas técnicas da ABNT. É ideal para mestres de obras, encarregados, desenhistas, orçamentistas e profissionais que atuam há anos na construção civil mas não possuem diploma técnico formal.",
    howItWorks: [
      "O processo de certificação avalia suas competências através de provas teóricas sobre técnicas construtivas, materiais de construção, leitura de projetos e normas técnicas, além de análise prática de orçamentos e planejamento de obras.",
      "Você apresentará seu portfólio de obras e projetos realizados, comprovantes de experiência profissional e eventuais cursos complementares na área de construção civil.",
      "Após aprovação, você receberá o diploma técnico em Edificações reconhecido pelo MEC, que permite solicitar registro no CREA como técnico de nível médio, habilitando-se a assinar projetos residenciais, laudos de vistoria e assumir responsabilidade técnica em obras."
    ],
    profession: "O Técnico em Edificações certificado pode atuar como desenhista projetista, orçamentista de obras, fiscal de obras, auxiliar de engenharia, supervisor de construção, mestre de obras com registro profissional, e em cargos de coordenação em construtoras e incorporadoras. Com registro no CREA, você terá autonomia para assinar projetos de edificações de até determinadas dimensões conforme regulamentação.",
    market: "A construção civil brasileira é um dos maiores empregadores do país e valoriza profissionais com formação técnica comprovada. Com o diploma técnico e registro no CREA, você terá acesso a melhores oportunidades em construtoras, incorporadoras, órgãos públicos, empresas de projetos e poderá atuar como profissional autônomo com responsabilidade técnica.",
    methodology: {
      materials: ["Material de apoio em técnicas construtivas", "Guia de leitura de projetos", "Modelos de orçamento e cronograma", "Biblioteca digital com normas ABNT", "Simulados de avaliação"],
      services: ["Requerimento de declarações", "Histórico escolar", "Matriz curricular", "Orientação para registro no CREA"],
      responseTime: "Chamados respondidos dentro de 48 horas por nossa equipe técnica."
    },
    requirements: ["Cópia do RG e do CPF", "Comprovante de Residência", "Certificado de Conclusão do Ensino Médio", "Comprovação de experiência profissional na construção civil (mínimo 2 anos)", "Portfólio de obras ou projetos realizados (desejável)"],
    tutoring: "Tutores com experiência em construção civil acompanham você durante todo o processo, orientando sobre técnicas construtivas, leitura de projetos, orçamentação e preparação para as avaliações.",
    tutorAttributes: ["Orientar sobre leitura e interpretação de projetos", "Esclarecer dúvidas sobre técnicas construtivas e materiais", "Auxiliar na elaboração do portfólio profissional", "Fornecer feedback sobre orçamentos e planejamento"],
    modules: [
      { name: "Projetos e Desenho Técnico", subjects: [{ name: "Leitura e Interpretação de Projetos", hours: 100 }, { name: "Desenho Técnico e CAD", hours: 80 }, { name: "Projetos Arquitetônicos e Complementares", hours: 80 }] },
      { name: "Técnicas Construtivas", subjects: [{ name: "Materiais de Construção", hours: 100 }, { name: "Técnicas de Fundação e Estruturas", hours: 80 }, { name: "Instalações Hidrossanitárias e Elétricas", hours: 80 }] },
      { name: "Gestão de Obras", subjects: [{ name: "Orçamento e Planejamento de Obras", hours: 100 }, { name: "Fiscalização e Controle de Qualidade", hours: 60 }, { name: "Segurança do Trabalho na Construção (NR-18)", hours: 60 }, { name: "Normas Técnicas ABNT", hours: 60 }] }
    ],
    access: [{ title: "Material Técnico", description: "Conteúdos especializados em construção civil e edificações." }, { title: "Orientação Técnica", description: "Acompanhamento por profissionais experientes em obras." }, { title: "Diploma + CREA", description: "Certificação pelo MEC com direito a registro no CREA." }],
    faq: [{ question: "Posso me registrar no CREA?", answer: "Sim, após a certificação você pode solicitar registro no CREA como técnico em Edificações." }, { question: "Que tipo de obras posso assinar?", answer: "Com registro no CREA, você pode assumir responsabilidade técnica por edificações residenciais de acordo com as atribuições definidas pelo conselho." }, { question: "Preciso saber usar AutoCAD?", answer: "Conhecimento em CAD é desejável, mas não obrigatório. A avaliação foca em leitura e interpretação de projetos e conhecimentos práticos de construção." }]
  },
  "certificacao-tecnica-competencia-eletrotecnica-instalacoes-eletricas": {
    title: "Certificação Técnica por Competência em Eletrotécnica",
    subtitle: "Formalize sua experiência em instalações elétricas, comandos e máquinas elétricas com registro no CREA",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=600&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=400&fit=crop",
    description: "A Certificação Técnica por Competência em Eletrotécnica é destinada a eletricistas, instaladores, mantenedores e técnicos que já atuam com sistemas elétricos industriais e prediais. Se você trabalha há anos com instalações elétricas, comandos elétricos, quadros de distribuição, máquinas elétricas e manutenção elétrica, esta certificação reconhece formalmente sua expertise e permite registro no CREA para assinar projetos elétricos e laudos técnicos.",
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
    aboutCourse: "O programa de Certificação por Competência em Eletrotécnica avalia suas habilidades em instalações elétricas de baixa e média tensão, dimensionamento de circuitos, montagem de quadros de distribuição, comandos elétricos, partida de motores, manutenção de máquinas elétricas, leitura de diagramas unifilares e aplicação das normas NR-10 e NBR 5410. É ideal para eletricistas industriais e prediais, técnicos de manutenção elétrica, instaladores e profissionais que atuam há anos na área mas não possuem diploma técnico formal.",
    howItWorks: [
      "O processo de certificação avalia suas competências através de provas teóricas sobre eletricidade, instalações elétricas, comandos e normas técnicas, além de avaliações práticas sobre dimensionamento de circuitos e análise de diagramas.",
      "Você apresentará seu portfólio de trabalhos realizados, certificados de cursos NR-10, SEP e outros complementares, além de comprovantes de experiência profissional na área elétrica.",
      "Após aprovação, você receberá o diploma técnico em Eletrotécnica reconhecido pelo MEC, que permite solicitar registro no CREA como técnico de nível médio, habilitando-se a assinar projetos elétricos e laudos técnicos."
    ],
    profession: "O Técnico em Eletrotécnica certificado pode atuar como eletricista industrial, técnico de manutenção elétrica, projetista de instalações elétricas, supervisor de equipes elétricas, técnico em subestações e em cargos de coordenação em empresas de energia, indústrias e construtoras. Com registro no CREA, você terá autonomia para assinar projetos elétricos e assumir responsabilidade técnica.",
    market: "O setor elétrico brasileiro está em constante crescimento com a expansão da infraestrutura e investimentos em energias renováveis. Profissionais com diploma técnico e registro no CREA são altamente valorizados em concessionárias de energia, indústrias, construtoras, empresas de manutenção e no mercado de trabalho autônomo para projetos elétricos residenciais e comerciais.",
    methodology: {
      materials: ["Material de apoio em instalações elétricas", "Guia de normas NR-10 e NBR 5410", "Exemplos de diagramas e projetos", "Biblioteca digital especializada", "Simulados de avaliação"],
      services: ["Requerimento de declarações", "Histórico escolar", "Matriz curricular", "Orientação para registro no CREA"],
      responseTime: "Chamados respondidos dentro de 48 horas por nossa equipe técnica especializada."
    },
    requirements: ["Cópia do RG e do CPF", "Comprovante de Residência", "Certificado de Conclusão do Ensino Médio", "Comprovação de experiência profissional na área elétrica (mínimo 2 anos)", "Certificado NR-10 atualizado (desejável)", "Portfólio de trabalhos realizados (desejável)"],
    tutoring: "Tutores com experiência prática em sistemas elétricos acompanham você durante todo o processo, orientando sobre instalações, comandos, normas técnicas e preparação para as avaliações.",
    tutorAttributes: ["Orientar sobre instalações elétricas e comandos", "Esclarecer dúvidas sobre normas NR-10 e NBR 5410", "Auxiliar na análise de diagramas e projetos", "Fornecer feedback sobre dimensionamento de circuitos"],
    modules: [
      { name: "Instalações Elétricas", subjects: [{ name: "Instalações Elétricas de Baixa Tensão", hours: 120 }, { name: "Dimensionamento de Circuitos e Proteções", hours: 80 }, { name: "Quadros de Distribuição e Subestações", hours: 80 }] },
      { name: "Comandos e Máquinas", subjects: [{ name: "Comandos Elétricos e Partida de Motores", hours: 100 }, { name: "Máquinas Elétricas (Motores e Transformadores)", hours: 80 }, { name: "Acionamentos Elétricos", hours: 80 }] },
      { name: "Normas e Segurança", subjects: [{ name: "NR-10 - Segurança em Instalações Elétricas", hours: 60 }, { name: "NBR 5410 e Normas Técnicas", hours: 60 }, { name: "Leitura de Diagramas e Projetos Elétricos", hours: 60 }, { name: "Manutenção Elétrica Preventiva e Corretiva", hours: 80 }] }
    ],
    access: [{ title: "Material Técnico", description: "Conteúdos especializados em instalações e sistemas elétricos." }, { title: "Orientação Técnica", description: "Acompanhamento por profissionais experientes em eletrotécnica." }, { title: "Diploma + CREA", description: "Certificação pelo MEC com direito a registro no CREA." }],
    faq: [{ question: "Posso me registrar no CREA?", answer: "Sim, após a certificação você pode solicitar registro no CREA como técnico em Eletrotécnica." }, { question: "Preciso ter certificado NR-10?", answer: "O certificado NR-10 não é obrigatório para a certificação, mas é desejável e será considerado na avaliação de competências." }, { question: "Que tipo de projetos posso assinar?", answer: "Com registro no CREA, você pode assinar projetos de instalações elétricas de acordo com as atribuições definidas pelo conselho para técnicos de nível médio." }]
  },
  "certificacao-tecnica-competencia-seguranca-trabalho-sst-nr": {
    title: "Certificação Técnica por Competência em Segurança do Trabalho",
    subtitle: "Formalize sua experiência em SST, Normas Regulamentadoras e prevenção de acidentes com registro no MTE",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&h=600&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1920&h=400&fit=crop",
    description: "A Certificação Técnica por Competência em Segurança do Trabalho é destinada a profissionais que já atuam na área de SST (Saúde e Segurança do Trabalho) e desejam formalizar sua experiência com diploma técnico reconhecido pelo MEC. Se você trabalha há anos com prevenção de acidentes, análise de riscos, treinamentos de NRs, inspeções de segurança e elaboração de documentos como PPRA, PCMSO e AET, esta certificação reconhece formalmente sua expertise e permite registro no MTE.",
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
    aboutCourse: "O programa de Certificação por Competência em Segurança do Trabalho avalia suas habilidades em aplicação das Normas Regulamentadoras (NRs), identificação e análise de riscos ocupacionais, elaboração de programas de segurança (PGR, PCMSO, AET), realização de inspeções e auditorias de segurança, investigação de acidentes, treinamentos obrigatórios e gestão de EPIs. É ideal para auxiliares de segurança do trabalho, instrutores de treinamentos NR, membros de CIPA e profissionais que atuam na área há anos mas não possuem diploma técnico formal.",
    howItWorks: [
      "O processo de certificação avalia suas competências através de provas teóricas sobre Normas Regulamentadoras, higiene ocupacional, ergonomia, prevenção de incêndios e gestão de riscos, além de análise prática de situações de trabalho.",
      "Você apresentará seu portfólio de trabalhos em SST, certificados de cursos de NRs, relatórios de inspeções realizadas e comprovantes de experiência profissional na área de segurança do trabalho.",
      "Após aprovação, você receberá o diploma técnico em Segurança do Trabalho reconhecido pelo MEC, que permite solicitar registro no MTE (Ministério do Trabalho e Emprego) para atuar legalmente como Técnico em Segurança do Trabalho."
    ],
    profession: "O Técnico em Segurança do Trabalho certificado pode atuar em empresas de todos os portes como responsável pela segurança ocupacional, realizando inspeções, treinamentos, elaborando programas de prevenção e representando a empresa junto aos órgãos fiscalizadores. Com registro no MTE, você terá todas as atribuições legais do técnico em segurança do trabalho conforme a CLT.",
    market: "A legislação brasileira exige que empresas de determinados portes e riscos mantenham profissionais de segurança do trabalho em seus quadros. Com o aumento da fiscalização e conscientização sobre a importância da SST, profissionais certificados e registrados no MTE são cada vez mais valorizados em indústrias, construção civil, hospitais, empresas de consultoria e em todos os setores econômicos.",
    methodology: {
      materials: ["Material de apoio em Normas Regulamentadoras", "Guia de elaboração de documentos SST", "Modelos de relatórios e programas", "Biblioteca digital especializada", "Simulados de avaliação"],
      services: ["Requerimento de declarações", "Histórico escolar", "Matriz curricular", "Orientação para registro no MTE"],
      responseTime: "Chamados respondidos dentro de 48 horas por nossa equipe especializada em SST."
    },
    requirements: ["Cópia do RG e do CPF", "Comprovante de Residência", "Certificado de Conclusão do Ensino Médio", "Comprovação de experiência profissional em SST (mínimo 2 anos)", "Certificados de cursos de NRs realizados (desejável)", "Portfólio de trabalhos em segurança do trabalho (desejável)"],
    tutoring: "Tutores especializados em segurança do trabalho acompanham você durante todo o processo, orientando sobre Normas Regulamentadoras, elaboração de documentos SST e preparação para as avaliações.",
    tutorAttributes: ["Orientar sobre aplicação das Normas Regulamentadoras", "Esclarecer dúvidas sobre elaboração de PGR, PCMSO e AET", "Auxiliar na análise de riscos ocupacionais", "Fornecer feedback sobre relatórios e programas de SST"],
    modules: [
      { name: "Normas e Legislação", subjects: [{ name: "Normas Regulamentadoras (NR-01 a NR-38)", hours: 140 }, { name: "Legislação Trabalhista e Previdenciária", hours: 60 }, { name: "Responsabilidades Legais em SST", hours: 60 }] },
      { name: "Programas e Documentos", subjects: [{ name: "PGR - Programa de Gerenciamento de Riscos", hours: 80 }, { name: "PCMSO e Saúde Ocupacional", hours: 60 }, { name: "AET - Análise Ergonômica do Trabalho", hours: 60 }, { name: "PPP e Documentos Previdenciários", hours: 60 }] },
      { name: "Práticas de Prevenção", subjects: [{ name: "Prevenção e Combate a Incêndios", hours: 80 }, { name: "Inspeções e Auditorias de Segurança", hours: 60 }, { name: "Investigação de Acidentes e Incidentes", hours: 60 }, { name: "Treinamentos Obrigatórios e CIPA", hours: 60 }] }
    ],
    access: [{ title: "Material Técnico", description: "Conteúdos especializados em SST e Normas Regulamentadoras." }, { title: "Orientação Técnica", description: "Acompanhamento por profissionais experientes em segurança do trabalho." }, { title: "Diploma + MTE", description: "Certificação pelo MEC com direito a registro no Ministério do Trabalho." }],
    faq: [{ question: "Posso me registrar no MTE?", answer: "Sim, após a certificação você pode solicitar registro no MTE como Técnico em Segurança do Trabalho." }, { question: "Preciso conhecer todas as NRs?", answer: "Você deve ter conhecimento sólido das principais NRs aplicáveis à sua área de atuação. O processo avalia sua capacidade de aplicá-las no ambiente de trabalho." }, { question: "Posso atuar em qualquer empresa?", answer: "Sim, com registro no MTE você pode atuar como Técnico em Segurança do Trabalho em empresas de qualquer porte e segmento." }]
  },
  "certificacao-tecnica-competencia-agricultura-producao-rural": {
    title: "Certificação Técnica por Competência em Agricultura",
    subtitle: "Transforme sua experiência no campo em diploma técnico reconhecido pelo MEC",
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1200&h=600&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1920&h=400&fit=crop",
    description: "A Certificação Técnica por Competência em Agricultura é destinada a profissionais que já atuam no setor agrícola e desejam formalizar sua experiência com diploma técnico. Se você trabalha há anos com cultivo de lavouras, manejo de solo, irrigação, aplicação de defensivos, operação de máquinas agrícolas ou gestão de propriedades rurais, esta certificação reconhece formalmente sua expertise e permite atuação profissional com registro.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "R$ 133,25",
    hours: 800,
    durationRange: "3 a 6 meses",
    certification: "Registro Profissional",
    rating: 5.0,
    youtubeVideoId: "pn97Z1-ssFI",
    category: "Certificação por Competência",
    registration: {
      portaria: "SEE-PRC-2021/12185",
      parecer: "233/2021",
      approvedDate: "07/10/2021",
      registerWith: "Registro Profissional"
    },
    aboutCourse: "O programa de Certificação por Competência em Agricultura avalia suas habilidades em planejamento e execução de culturas agrícolas, análise e correção de solos, sistemas de irrigação, controle fitossanitário, aplicação de defensivos e fertilizantes, operação e manutenção de máquinas agrícolas, colheita e pós-colheita, e gestão de propriedades rurais. É ideal para trabalhadores rurais, capatazes, encarregados de lavoura, operadores de máquinas agrícolas e produtores rurais que desejam obter diploma técnico oficial.",
    howItWorks: [
      "O processo de certificação avalia suas competências através de provas teóricas sobre culturas agrícolas, manejo de solo, fitossanidade, irrigação e gestão rural, além de análise prática de situações de campo.",
      "Você apresentará seu portfólio de experiência no campo, comprovantes de atuação em propriedades rurais, certificados de cursos como aplicação de defensivos (NR-31) e operação de máquinas agrícolas.",
      "Após aprovação, você receberá o diploma técnico em Agricultura reconhecido pelo MEC, que formaliza sua atuação profissional e amplia suas oportunidades no agronegócio."
    ],
    profession: "O Técnico em Agricultura certificado pode atuar como responsável técnico em propriedades rurais, supervisor de lavouras, consultor agrícola, vendedor técnico de insumos agrícolas, representante de empresas do agronegócio e em cargos de gestão em fazendas e cooperativas. Com o diploma técnico, você terá reconhecimento formal para crescer na carreira do agronegócio.",
    market: "O agronegócio brasileiro é um dos maiores do mundo e demanda constantemente profissionais qualificados com formação técnica comprovada. Com a modernização da agricultura e adoção de novas tecnologias (agricultura de precisão, drones, sensoriamento), técnicos certificados são cada vez mais valorizados em fazendas, cooperativas, empresas de insumos e consultorias agrícolas.",
    methodology: {
      materials: ["Material de apoio em culturas agrícolas", "Guia de manejo de solo e nutrição", "Documentação sobre fitossanidade", "Biblioteca digital especializada", "Simulados de avaliação"],
      services: ["Requerimento de declarações", "Histórico escolar", "Matriz curricular", "Orientação para registro profissional"],
      responseTime: "Chamados respondidos dentro de 48 horas por nossa equipe técnica."
    },
    requirements: ["Cópia do RG e do CPF", "Comprovante de Residência", "Certificado de Conclusão do Ensino Médio", "Comprovação de experiência profissional na agricultura (mínimo 2 anos)", "Certificados de cursos complementares como NR-31 (desejável)"],
    tutoring: "Tutores com experiência no agronegócio acompanham você durante todo o processo, orientando sobre culturas, manejo, fitossanidade e preparação para as avaliações.",
    tutorAttributes: ["Orientar sobre técnicas de cultivo e manejo", "Esclarecer dúvidas sobre fitossanidade e controle de pragas", "Auxiliar na elaboração do portfólio profissional", "Fornecer feedback sobre gestão agrícola"],
    modules: [
      { name: "Produção Vegetal", subjects: [{ name: "Culturas Anuais e Perenes", hours: 120 }, { name: "Manejo e Correção de Solos", hours: 80 }, { name: "Sistemas de Irrigação", hours: 60 }] },
      { name: "Proteção de Culturas", subjects: [{ name: "Fitossanidade e Controle de Pragas", hours: 100 }, { name: "Aplicação de Defensivos e NR-31", hours: 60 }, { name: "Nutrição e Adubação de Plantas", hours: 80 }] },
      { name: "Mecanização e Gestão", subjects: [{ name: "Máquinas e Implementos Agrícolas", hours: 80 }, { name: "Colheita e Pós-Colheita", hours: 60 }, { name: "Gestão de Propriedades Rurais", hours: 80 }, { name: "Agricultura de Precisão", hours: 60 }] }
    ],
    access: [{ title: "Material Técnico", description: "Conteúdos especializados em agricultura e produção vegetal." }, { title: "Orientação Técnica", description: "Acompanhamento por profissionais experientes do agronegócio." }, { title: "Diploma Técnico", description: "Certificação pelo MEC para atuação profissional formal." }],
    faq: [{ question: "Preciso de experiência prévia?", answer: "Sim, é necessário comprovar no mínimo 2 anos de experiência na área agrícola através de declaração de empregador ou comprovante de atuação em propriedade rural." }, { question: "Posso trabalhar em cooperativas?", answer: "Sim, com o diploma técnico você terá maior reconhecimento para atuar em cooperativas, empresas de insumos e consultorias agrícolas." }, { question: "O curso aborda agricultura de precisão?", answer: "Sim, o programa inclui conteúdos sobre tecnologias modernas como GPS, drones e sensoriamento remoto aplicados à agricultura." }]
  },
  "certificacao-tecnica-competencia-agropecuaria-producao-animal-vegetal": {
    title: "Certificação Técnica por Competência em Agropecuária",
    subtitle: "Formalize sua experiência em produção agrícola e pecuária com diploma técnico reconhecido pelo MEC",
    image: "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=1200&h=600&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=1920&h=400&fit=crop",
    description: "A Certificação Técnica por Competência em Agropecuária é destinada a profissionais que atuam tanto na produção agrícola quanto na pecuária. Se você trabalha há anos em propriedades rurais com cultivo de lavouras e criação de animais, gestão de fazendas, manejo de pastagens, nutrição animal e reprodução de rebanhos, esta certificação reconhece formalmente sua experiência completa no setor agropecuário brasileiro.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "R$ 133,25",
    hours: 800,
    durationRange: "3 a 6 meses",
    certification: "Registro Profissional",
    rating: 5.0,
    youtubeVideoId: "pn97Z1-ssFI",
    category: "Certificação por Competência",
    registration: {
      portaria: "SEE-PRC-2021/12186",
      parecer: "234/2021",
      approvedDate: "07/10/2021",
      registerWith: "Registro Profissional"
    },
    aboutCourse: "O programa de Certificação por Competência em Agropecuária avalia suas habilidades integradas em produção vegetal (culturas, pastagens, forragens) e produção animal (bovinos, suínos, aves, equinos), incluindo manejo de rebanhos, nutrição animal, sanidade, reprodução, gestão de propriedades rurais e sustentabilidade ambiental. É ideal para administradores de fazendas, capatazes, vaqueiros experientes, tratadores de animais e trabalhadores rurais que atuam de forma integrada na agricultura e pecuária.",
    howItWorks: [
      "O processo de certificação avalia suas competências através de provas teóricas sobre produção agrícola, criação de animais, manejo de pastagens, sanidade animal e gestão rural, além de análise prática de situações do campo.",
      "Você apresentará seu portfólio de experiência em propriedades agropecuárias, comprovantes de atuação com rebanhos e lavouras, e certificados de cursos complementares em sanidade animal e manejo de pastagens.",
      "Após aprovação, você receberá o diploma técnico em Agropecuária reconhecido pelo MEC, que formaliza sua atuação profissional integrada no setor agropecuário."
    ],
    profession: "O Técnico em Agropecuária certificado pode atuar como administrador de propriedades rurais, responsável técnico em fazendas mistas, supervisor de produção animal e vegetal, consultor agropecuário, representante de empresas de insumos agropecuários e em cargos de gestão em cooperativas e agroindústrias. É a formação ideal para quem atua de forma integrada no campo.",
    market: "O setor agropecuário brasileiro é referência mundial e demanda profissionais com visão integrada de produção animal e vegetal. Com a intensificação da produção e adoção de sistemas integrados (ILPF - Integração Lavoura-Pecuária-Floresta), técnicos com formação completa em agropecuária são cada vez mais valorizados em fazendas, cooperativas, empresas de insumos e órgãos de extensão rural.",
    methodology: {
      materials: ["Material de apoio em produção animal e vegetal", "Guia de manejo de pastagens e rebanhos", "Documentação sobre sanidade animal", "Biblioteca digital especializada", "Simulados de avaliação"],
      services: ["Requerimento de declarações", "Histórico escolar", "Matriz curricular", "Orientação para registro profissional"],
      responseTime: "Chamados respondidos dentro de 48 horas por nossa equipe técnica."
    },
    requirements: ["Cópia do RG e do CPF", "Comprovante de Residência", "Certificado de Conclusão do Ensino Médio", "Comprovação de experiência profissional em agropecuária (mínimo 2 anos)", "Experiência comprovada em produção animal e vegetal"],
    tutoring: "Tutores com experiência em fazendas mistas acompanham você durante todo o processo, orientando sobre produção animal, vegetal, gestão rural e preparação para as avaliações.",
    tutorAttributes: ["Orientar sobre manejo de rebanhos e culturas", "Esclarecer dúvidas sobre sanidade animal e vegetal", "Auxiliar na elaboração do portfólio profissional", "Fornecer feedback sobre gestão agropecuária integrada"],
    modules: [
      { name: "Produção Vegetal", subjects: [{ name: "Culturas Agrícolas e Forrageiras", hours: 100 }, { name: "Manejo de Pastagens", hours: 60 }, { name: "Solos e Nutrição de Plantas", hours: 60 }] },
      { name: "Produção Animal", subjects: [{ name: "Bovinocultura de Corte e Leite", hours: 100 }, { name: "Suinocultura e Avicultura", hours: 60 }, { name: "Nutrição e Reprodução Animal", hours: 80 }, { name: "Sanidade Animal", hours: 60 }] },
      { name: "Gestão e Sustentabilidade", subjects: [{ name: "Gestão de Propriedades Rurais", hours: 80 }, { name: "Sistemas Integrados (ILPF)", hours: 60 }, { name: "Legislação Ambiental e Sustentabilidade", hours: 60 }, { name: "Comercialização e Mercados Agropecuários", hours: 60 }] }
    ],
    access: [{ title: "Material Técnico", description: "Conteúdos especializados em produção animal e vegetal integrada." }, { title: "Orientação Técnica", description: "Acompanhamento por profissionais experientes em agropecuária." }, { title: "Diploma Técnico", description: "Certificação pelo MEC para atuação profissional formal." }],
    faq: [{ question: "Preciso ter experiência em agricultura E pecuária?", answer: "Sim, a certificação em agropecuária exige experiência comprovada em ambas as áreas, pois avalia competências integradas de produção animal e vegetal." }, { question: "Qual a diferença para a certificação em Agricultura?", answer: "A certificação em Agricultura foca apenas na produção vegetal, enquanto a Agropecuária abrange também a produção animal e sistemas integrados." }, { question: "Posso atuar como responsável técnico em fazendas?", answer: "Sim, com o diploma técnico você poderá atuar como responsável técnico em propriedades rurais que desenvolvem atividades agropecuárias." }]
  },
  "certificacao-tecnica-competencia-analises-clinicas-laboratorio": {
    title: "Certificação Técnica por Competência em Análises Clínicas",
    subtitle: "Formalize sua experiência em laboratório com diploma técnico reconhecido pelo MEC",
    image: "https://images.unsplash.com/photo-1579165466949-3180a3d056d5?w=1200&h=600&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1579165466949-3180a3d056d5?w=1920&h=400&fit=crop",
    description: "A Certificação Técnica por Competência em Análises Clínicas é destinada a profissionais que já atuam em laboratórios de análises clínicas, hospitais e clínicas. Se você trabalha há anos com coleta de amostras biológicas, processamento de exames, operação de equipamentos laboratoriais, técnicas de bioquímica, hematologia, microbiologia e biossegurança, esta certificação reconhece formalmente sua expertise e formaliza sua atuação profissional.",
    originalPrice: "R$ 2.500,00",
    promoPrice: "R$ 1.599,00",
    installment: "R$ 133,25",
    hours: 800,
    durationRange: "3 a 6 meses",
    certification: "Registro Profissional",
    rating: 5.0,
    youtubeVideoId: "pn97Z1-ssFI",
    category: "Certificação por Competência",
    registration: {
      portaria: "SEE-PRC-2021/12187",
      parecer: "235/2021",
      approvedDate: "07/10/2021",
      registerWith: "Registro Profissional"
    },
    aboutCourse: "O programa de Certificação por Competência em Análises Clínicas avalia suas habilidades em coleta e processamento de amostras biológicas (sangue, urina, fezes, secreções), técnicas de bioquímica clínica, hematologia, uroanálise, parasitologia, microbiologia, imunologia, controle de qualidade laboratorial e biossegurança. É ideal para auxiliares de laboratório, coletadores, técnicos de bancada e profissionais que atuam há anos na área laboratorial mas não possuem diploma técnico formal.",
    howItWorks: [
      "O processo de certificação avalia suas competências através de provas teóricas sobre técnicas laboratoriais, bioquímica, hematologia, microbiologia e biossegurança, além de análise prática de procedimentos de coleta e processamento.",
      "Você apresentará seu portfólio de experiência em laboratórios, comprovantes de atuação na área de análises clínicas, e certificados de cursos complementares em biossegurança e coleta de amostras.",
      "Após aprovação, você receberá o diploma técnico em Análises Clínicas reconhecido pelo MEC, que formaliza sua atuação profissional em laboratórios, hospitais e clínicas."
    ],
    profession: "O Técnico em Análises Clínicas certificado pode atuar em laboratórios de análises clínicas, hospitais, clínicas, bancos de sangue, indústrias farmacêuticas e em postos de coleta. As funções incluem coleta de amostras biológicas, processamento de exames, operação de equipamentos automatizados, controle de qualidade e liberação de resultados sob supervisão.",
    market: "O setor de saúde brasileiro está em constante expansão, com crescimento significativo de laboratórios de análises clínicas. A demanda por profissionais técnicos qualificados é alta, especialmente após a pandemia que evidenciou a importância dos diagnósticos laboratoriais. Profissionais com diploma técnico têm melhores oportunidades em redes de laboratórios, hospitais e clínicas particulares.",
    methodology: {
      materials: ["Material de apoio em técnicas laboratoriais", "Guia de biossegurança e NR-32", "Procedimentos de coleta e processamento", "Biblioteca digital especializada", "Simulados de avaliação"],
      services: ["Requerimento de declarações", "Histórico escolar", "Matriz curricular", "Orientação para registro profissional"],
      responseTime: "Chamados respondidos dentro de 48 horas por nossa equipe técnica."
    },
    requirements: ["Cópia do RG e do CPF", "Comprovante de Residência", "Certificado de Conclusão do Ensino Médio", "Comprovação de experiência profissional em laboratório (mínimo 2 anos)", "Certificados de cursos em biossegurança e coleta (desejável)"],
    tutoring: "Tutores com experiência em laboratórios de análises clínicas acompanham você durante todo o processo, orientando sobre técnicas laboratoriais, biossegurança e preparação para as avaliações.",
    tutorAttributes: ["Orientar sobre técnicas de bioquímica e hematologia", "Esclarecer dúvidas sobre biossegurança e NR-32", "Auxiliar na elaboração do portfólio profissional", "Fornecer feedback sobre procedimentos laboratoriais"],
    modules: [
      { name: "Técnicas Laboratoriais", subjects: [{ name: "Coleta e Processamento de Amostras", hours: 100 }, { name: "Bioquímica Clínica", hours: 100 }, { name: "Hematologia e Coagulação", hours: 80 }] },
      { name: "Diagnóstico Laboratorial", subjects: [{ name: "Uroanálise e Parasitologia", hours: 80 }, { name: "Microbiologia Clínica", hours: 80 }, { name: "Imunologia e Sorologia", hours: 60 }] },
      { name: "Qualidade e Segurança", subjects: [{ name: "Biossegurança e NR-32", hours: 80 }, { name: "Controle de Qualidade Laboratorial", hours: 60 }, { name: "Equipamentos e Automação Laboratorial", hours: 60 }, { name: "Ética e Legislação em Saúde", hours: 60 }] }
    ],
    access: [{ title: "Material Técnico", description: "Conteúdos especializados em análises clínicas e técnicas laboratoriais." }, { title: "Orientação Técnica", description: "Acompanhamento por profissionais experientes em laboratórios." }, { title: "Diploma Técnico", description: "Certificação pelo MEC para atuação profissional formal." }],
    faq: [{ question: "Preciso de experiência prévia?", answer: "Sim, é necessário comprovar no mínimo 2 anos de experiência em laboratório de análises clínicas através de carteira de trabalho ou declaração de empregador." }, { question: "Posso trabalhar em hospitais?", answer: "Sim, com o diploma técnico você poderá atuar em laboratórios de hospitais, clínicas, postos de coleta e laboratórios particulares." }, { question: "O curso aborda automação laboratorial?", answer: "Sim, o programa inclui conteúdos sobre operação de equipamentos automatizados utilizados em laboratórios modernos." }]
  },
  "certificacao-tecnica-competencia-eletroeletronica-circuitos-microcontroladores": {
    title: "Certificação Técnica por Competência em Eletroeletrônica",
    subtitle: "Formalize sua experiência em eletrônica analógica, digital e microcontroladores com registro no CREA",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=600&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&h=400&fit=crop",
    description: "A Certificação Técnica por Competência em Eletroeletrônica é destinada a profissionais que já atuam com circuitos eletrônicos analógicos e digitais, sistemas de potência, microcontroladores, instrumentação e manutenção de equipamentos eletroeletrônicos. Se você trabalha há anos com reparo de placas, soldagem SMD, programação de microcontroladores ou manutenção de equipamentos industriais, esta certificação reconhece sua expertise e permite registro no CREA.",
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
    aboutCourse: "O programa de Certificação por Competência em Eletroeletrônica avalia suas habilidades em eletrônica analógica (amplificadores, fontes, osciladores), eletrônica digital (portas lógicas, flip-flops, contadores), sistemas de potência, microcontroladores (Arduino, PIC, ESP), instrumentação eletrônica, manutenção de equipamentos e técnicas de soldagem SMD. É ideal para técnicos de manutenção eletrônica, reparadores de equipamentos, montadores de placas e profissionais que atuam com desenvolvimento de projetos eletrônicos.",
    howItWorks: [
      "O processo de certificação avalia suas competências através de provas teóricas sobre eletrônica analógica e digital, sistemas de potência, microcontroladores e instrumentação, além de análise prática de circuitos e projetos eletrônicos.",
      "Você apresentará seu portfólio de trabalhos em eletrônica, projetos desenvolvidos, equipamentos reparados e certificados de cursos complementares em eletrônica e microcontroladores.",
      "Após aprovação, você receberá o diploma técnico em Eletroeletrônica reconhecido pelo MEC, que permite solicitar registro no CREA como técnico de nível médio, habilitando-se a assinar projetos e laudos técnicos."
    ],
    profession: "O Técnico em Eletroeletrônica certificado pode atuar como técnico de manutenção eletrônica, reparador de equipamentos eletroeletrônicos, projetista de circuitos, técnico em instrumentação, montador de placas eletrônicas, técnico de campo em telecomunicações e em cargos de supervisão em indústrias de eletrônicos. Com registro no CREA, você terá autonomia para assinar projetos e laudos técnicos.",
    market: "O mercado de eletroeletrônica está em constante evolução com a expansão da IoT (Internet das Coisas), automação residencial, veículos elétricos e equipamentos médicos. Profissionais com diploma técnico e registro no CREA são valorizados em indústrias de eletroeletrônicos, empresas de manutenção, telecomunicações, automação e no mercado de assistência técnica especializada.",
    methodology: {
      materials: ["Material de apoio em eletrônica", "Guia de microcontroladores e programação", "Documentação sobre instrumentação", "Biblioteca digital especializada", "Simulados de avaliação"],
      services: ["Requerimento de declarações", "Histórico escolar", "Matriz curricular", "Orientação para registro no CREA"],
      responseTime: "Chamados respondidos dentro de 48 horas por nossa equipe técnica."
    },
    requirements: ["Cópia do RG e do CPF", "Comprovante de Residência", "Certificado de Conclusão do Ensino Médio", "Comprovação de experiência profissional em eletroeletrônica (mínimo 2 anos)", "Portfólio de projetos e trabalhos realizados (desejável)"],
    tutoring: "Tutores com experiência em eletrônica acompanham você durante todo o processo, orientando sobre circuitos, microcontroladores, instrumentação e preparação para as avaliações.",
    tutorAttributes: ["Orientar sobre eletrônica analógica e digital", "Esclarecer dúvidas sobre microcontroladores e programação", "Auxiliar na elaboração do portfólio técnico", "Fornecer feedback sobre projetos eletrônicos"],
    modules: [
      { name: "Eletrônica Fundamental", subjects: [{ name: "Eletrônica Analógica (Amplificadores, Fontes)", hours: 120 }, { name: "Eletrônica Digital (Lógica, Contadores)", hours: 80 }, { name: "Componentes e Dispositivos Eletrônicos", hours: 60 }] },
      { name: "Sistemas e Controle", subjects: [{ name: "Sistemas de Potência e Conversores", hours: 100 }, { name: "Microcontroladores e Programação", hours: 100 }, { name: "Instrumentação e Medidas Eletrônicas", hours: 60 }] },
      { name: "Aplicações Práticas", subjects: [{ name: "Técnicas de Soldagem e Montagem SMD", hours: 60 }, { name: "Manutenção de Equipamentos Eletrônicos", hours: 80 }, { name: "Projetos e Prototipagem", hours: 60 }, { name: "Normas Técnicas e Segurança", hours: 60 }] }
    ],
    access: [{ title: "Material Técnico", description: "Conteúdos especializados em eletrônica analógica, digital e microcontroladores." }, { title: "Orientação Técnica", description: "Acompanhamento por profissionais experientes em eletroeletrônica." }, { title: "Diploma + CREA", description: "Certificação pelo MEC com direito a registro no CREA." }],
    faq: [{ question: "Posso me registrar no CREA?", answer: "Sim, após a certificação você pode solicitar registro no CREA como técnico em Eletroeletrônica." }, { question: "Preciso saber programar microcontroladores?", answer: "Conhecimento em programação de microcontroladores (Arduino, PIC, etc.) é valorizado, mas não obrigatório. A avaliação considera seu perfil profissional completo." }, { question: "Qual a diferença para Eletrotécnica?", answer: "Eletroeletrônica foca em circuitos eletrônicos, componentes e microcontroladores. Eletrotécnica foca em instalações elétricas, máquinas elétricas e sistemas de potência em alta escala." }]
  },
  "certificacao-tecnica-competencia-mecanica-industrial-manutencao": {
    title: "Certificação Técnica por Competência em Mecânica",
    subtitle: "Formalize sua experiência em mecânica industrial, manutenção e processos de fabricação com registro no CREA",
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200&h=600&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1920&h=400&fit=crop",
    description: "A Certificação Técnica por Competência em Mecânica é destinada a profissionais que já atuam com manutenção mecânica industrial, processos de fabricação, usinagem, montagem de máquinas e equipamentos. Se você trabalha há anos como mecânico industrial, torneiro, fresador, ajustador, montador ou supervisor de manutenção mecânica, esta certificação reconhece formalmente sua expertise e permite registro no CREA para assinar laudos e projetos técnicos.",
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
    aboutCourse: "O programa de Certificação por Competência em Mecânica avalia suas habilidades em elementos de máquinas (engrenagens, rolamentos, correias, correntes), manutenção mecânica preventiva e corretiva, processos de fabricação (usinagem, soldagem, conformação), metrologia e instrumentos de medição, desenho técnico mecânico, hidráulica e pneumática industrial. É ideal para mecânicos industriais, torneiros mecânicos, fresadores, ajustadores, montadores de máquinas e supervisores de manutenção que desejam obter diploma técnico oficial.",
    howItWorks: [
      "O processo de certificação avalia suas competências através de provas teóricas sobre elementos de máquinas, processos de fabricação, manutenção e metrologia, além de análise prática de situações de manutenção e fabricação.",
      "Você apresentará seu portfólio de trabalhos em mecânica, comprovantes de experiência em indústrias, certificados de cursos complementares em soldagem, NR-12 e operação de máquinas.",
      "Após aprovação, você receberá o diploma técnico em Mecânica reconhecido pelo MEC, que permite solicitar registro no CREA como técnico de nível médio, habilitando-se a assinar laudos de máquinas e projetos mecânicos."
    ],
    profession: "O Técnico em Mecânica certificado pode atuar como mecânico industrial, técnico de manutenção, supervisor de produção mecânica, projetista mecânico, torneiro, fresador, retificador, ajustador mecânico e em cargos de coordenação em indústrias de manufatura. Com registro no CREA, você terá autonomia para assinar laudos técnicos de máquinas e equipamentos conforme NR-12.",
    market: "A indústria brasileira demanda constantemente técnicos em mecânica qualificados para manutenção e operação de máquinas e equipamentos. Com a Indústria 4.0 e a necessidade de manutenção preditiva, profissionais com diploma técnico e registro no CREA são cada vez mais valorizados em indústrias automobilísticas, metalúrgicas, petroquímicas, alimentícias e de manufatura em geral.",
    methodology: {
      materials: ["Material de apoio em mecânica industrial", "Guia de elementos de máquinas", "Documentação sobre processos de fabricação", "Biblioteca digital especializada", "Simulados de avaliação"],
      services: ["Requerimento de declarações", "Histórico escolar", "Matriz curricular", "Orientação para registro no CREA"],
      responseTime: "Chamados respondidos dentro de 48 horas por nossa equipe técnica."
    },
    requirements: ["Cópia do RG e do CPF", "Comprovante de Residência", "Certificado de Conclusão do Ensino Médio", "Comprovação de experiência profissional em mecânica (mínimo 2 anos)", "Certificados de cursos NR-12, soldagem ou operação de máquinas (desejável)"],
    tutoring: "Tutores com experiência em mecânica industrial acompanham você durante todo o processo, orientando sobre elementos de máquinas, processos de fabricação, manutenção e preparação para as avaliações.",
    tutorAttributes: ["Orientar sobre elementos de máquinas e manutenção", "Esclarecer dúvidas sobre processos de fabricação", "Auxiliar na elaboração do portfólio profissional", "Fornecer feedback sobre metrologia e instrumentação"],
    modules: [
      { name: "Elementos de Máquinas", subjects: [{ name: "Engrenagens, Rolamentos e Mancais", hours: 100 }, { name: "Transmissões Mecânicas", hours: 60 }, { name: "Desenho Técnico Mecânico", hours: 80 }] },
      { name: "Processos e Fabricação", subjects: [{ name: "Usinagem (Torno, Fresa, Retífica)", hours: 120 }, { name: "Soldagem e Processos de União", hours: 60 }, { name: "Metrologia e Instrumentos de Medição", hours: 80 }] },
      { name: "Manutenção e Segurança", subjects: [{ name: "Manutenção Mecânica Industrial", hours: 100 }, { name: "Hidráulica e Pneumática", hours: 80 }, { name: "NR-12 - Segurança em Máquinas", hours: 60 }, { name: "Lubrificação Industrial", hours: 40 }] }
    ],
    access: [{ title: "Material Técnico", description: "Conteúdos especializados em mecânica industrial e processos de fabricação." }, { title: "Orientação Técnica", description: "Acompanhamento por profissionais experientes em mecânica." }, { title: "Diploma + CREA", description: "Certificação pelo MEC com direito a registro no CREA." }],
    faq: [{ question: "Posso me registrar no CREA?", answer: "Sim, após a certificação você pode solicitar registro no CREA como técnico em Mecânica." }, { question: "Posso assinar laudos de máquinas NR-12?", answer: "Sim, com registro no CREA você pode elaborar e assinar laudos técnicos de máquinas e equipamentos conforme as atribuições definidas pelo conselho." }, { question: "Preciso saber operar torno e fresa?", answer: "Experiência em usinagem é valorizada, mas não obrigatória. A avaliação considera seu perfil profissional completo em mecânica." }]
  },
  // Cursos Pós-Técnicos (Especializações)
  "pos-administracao-producao": {
    title: "Especialização Técnica em Administração da Produção EAD",
    subtitle: "Aprofunde seus conhecimentos em gestão de processos produtivos",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=600&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1920&h=400&fit=crop",
    description: "A Especialização Técnica em Administração da Produção EAD é voltada para profissionais técnicos que desejam aprofundar conhecimentos em gestão de processos produtivos, planejamento, controle da produção, qualidade e melhoria contínua. Ideal para quem busca crescimento na carreira industrial.",
    originalPrice: "R$ 1.500,00",
    promoPrice: "R$ 850,00",
    installment: "R$ 70,83",
    hours: 400,
    durationRange: "4 a 8 meses",
    certification: "Certificação válida",
    rating: 5.0,
    youtubeVideoId: "pn97Z1-ssFI",
    category: "Pós-Técnico EAD",
    registration: {
      portaria: "SEE-PRC-2021/12190",
      parecer: "238/2021",
      approvedDate: "07/10/2021",
      registerWith: "Certificado de Especialização"
    },
    aboutCourse: "A Especialização em Administração da Produção capacita profissionais técnicos para atuar na gestão de processos produtivos, aplicando conceitos de lean manufacturing, gestão da qualidade, planejamento e controle da produção. Um diferencial competitivo para sua carreira na indústria.",
    howItWorks: [
      "Curso 100% EAD com videoaulas, materiais complementares e avaliações online.",
      "Focado em aplicação prática dos conceitos de gestão da produção.",
      "Ideal para técnicos que desejam assumir cargos de liderança na indústria."
    ],
    profession: "Atue como supervisor de produção, analista de processos, coordenador de qualidade ou gestor industrial.",
    market: "A indústria brasileira valoriza profissionais com especialização em gestão da produção. Com a Indústria 4.0, a demanda por profissionais qualificados aumenta constantemente.",
    methodology: {
      materials: ["Video-aulas", "Apostilas", "Estudos de caso", "Biblioteca digital"],
      services: ["Requerimento de declarações", "Histórico", "Certificado"],
      responseTime: "Chamados respondidos dentro de 48 horas."
    },
    requirements: ["Diploma de Curso Técnico na área ou áreas correlatas", "Cópia do RG e CPF", "Comprovante de Residência"],
    tutoring: "Acompanhamento do tutor especializado em gestão industrial.",
    tutorAttributes: ["Apoiar nos estudos de caso", "Orientar aplicações práticas", "Esclarecer dúvidas técnicas"],
    modules: [
      { name: "Módulo 01 - Fundamentos", subjects: [{ name: "Introdução à Gestão da Produção", hours: 40 }, { name: "Planejamento e Controle da Produção (PCP)", hours: 60 }, { name: "Layout Industrial", hours: 40 }] },
      { name: "Módulo 02 - Qualidade", subjects: [{ name: "Gestão da Qualidade Total", hours: 60 }, { name: "Ferramentas da Qualidade", hours: 40 }, { name: "Indicadores de Desempenho", hours: 40 }] },
      { name: "Módulo 03 - Melhoria Contínua", subjects: [{ name: "Lean Manufacturing", hours: 60 }, { name: "Kaizen e 5S", hours: 40 }, { name: "Six Sigma", hours: 60 }] }
    ],
    access: [{ title: "Video Aulas", description: "Conteúdo atualizado e prático." }, { title: "Tutoria", description: "Suporte especializado." }, { title: "Certificado", description: "Especialização reconhecida." }],
    faq: [{ question: "Preciso ter curso técnico?", answer: "Sim, é necessário ter diploma de curso técnico para ingressar na especialização." }]
  },
  "pos-materiais": {
    title: "Especialização Técnica em Administração de Materiais EAD",
    subtitle: "Domine a gestão de estoques, compras e logística",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=600&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&h=400&fit=crop",
    description: "A Especialização Técnica em Administração de Materiais EAD forma profissionais para atuar na gestão de estoques, compras, almoxarifado, logística e controle de suprimentos. Essencial para quem deseja se destacar na área de supply chain.",
    originalPrice: "R$ 1.500,00",
    promoPrice: "R$ 850,00",
    installment: "R$ 70,83",
    hours: 400,
    durationRange: "4 a 8 meses",
    certification: "Certificação válida",
    rating: 5.0,
    youtubeVideoId: "pn97Z1-ssFI",
    category: "Pós-Técnico EAD",
    registration: {
      portaria: "SEE-PRC-2021/12191",
      parecer: "239/2021",
      approvedDate: "07/10/2021",
      registerWith: "Certificado de Especialização"
    },
    aboutCourse: "A especialização em Administração de Materiais prepara você para gerenciar toda a cadeia de suprimentos, desde a aquisição até a distribuição. Aprenda técnicas modernas de gestão de estoques, negociação com fornecedores e logística integrada.",
    howItWorks: [
      "Metodologia EAD com foco em casos práticos de gestão de materiais.",
      "Conteúdo alinhado com as melhores práticas do mercado.",
      "Flexibilidade para estudar no seu ritmo."
    ],
    profession: "Atue como gestor de estoques, comprador, analista de supply chain, coordenador de almoxarifado ou gerente de logística.",
    market: "A gestão eficiente de materiais é crucial para a competitividade das empresas. Profissionais especializados são muito valorizados em todos os setores.",
    methodology: {
      materials: ["Video-aulas", "Apostilas", "Simulações", "Biblioteca digital"],
      services: ["Requerimento de declarações", "Histórico", "Certificado"],
      responseTime: "Chamados respondidos dentro de 48 horas."
    },
    requirements: ["Diploma de Curso Técnico na área ou áreas correlatas", "Cópia do RG e CPF", "Comprovante de Residência"],
    tutoring: "Acompanhamento de tutor especializado em logística e supply chain.",
    tutorAttributes: ["Orientar sobre gestão de estoques", "Apoiar em estudos de caso", "Esclarecer dúvidas"],
    modules: [
      { name: "Módulo 01 - Gestão de Estoques", subjects: [{ name: "Fundamentos de Administração de Materiais", hours: 40 }, { name: "Gestão de Estoques", hours: 60 }, { name: "Curva ABC e Classificação", hours: 40 }] },
      { name: "Módulo 02 - Compras e Fornecedores", subjects: [{ name: "Gestão de Compras", hours: 60 }, { name: "Negociação com Fornecedores", hours: 40 }, { name: "Contratos e Parcerias", hours: 40 }] },
      { name: "Módulo 03 - Logística", subjects: [{ name: "Logística e Distribuição", hours: 60 }, { name: "Armazenagem e Movimentação", hours: 40 }, { name: "Sistemas de Gestão (WMS/ERP)", hours: 60 }] }
    ],
    access: [{ title: "Video Aulas", description: "Conteúdo atualizado." }, { title: "Tutoria", description: "Suporte especializado." }, { title: "Certificado", description: "Especialização reconhecida." }],
    faq: [{ question: "Preciso ter experiência na área?", answer: "Não é obrigatório, mas é recomendável ter conhecimentos básicos em administração." }]
  },
  "pos-farmacia-hospitalar": {
    title: "Especialização Técnica em Farmácia Hospitalar EAD",
    subtitle: "Especialize-se na gestão de medicamentos em ambiente hospitalar",
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1200&h=600&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1920&h=400&fit=crop",
    description: "A Especialização Técnica em Farmácia Hospitalar EAD capacita profissionais para atuar na gestão e controle de medicamentos, materiais e insumos em ambientes hospitalares e clínicos. Uma formação essencial para técnicos em farmácia que desejam atuar em hospitais.",
    originalPrice: "R$ 1.500,00",
    promoPrice: "R$ 850,00",
    installment: "R$ 70,83",
    hours: 400,
    durationRange: "4 a 8 meses",
    certification: "Certificação válida",
    rating: 5.0,
    youtubeVideoId: "pn97Z1-ssFI",
    category: "Pós-Técnico EAD",
    registration: {
      portaria: "SEE-PRC-2021/12192",
      parecer: "240/2021",
      approvedDate: "07/10/2021",
      registerWith: "Certificado de Especialização"
    },
    aboutCourse: "A farmácia hospitalar é uma área estratégica dentro das instituições de saúde. Esta especialização prepara você para gerenciar medicamentos, garantir a qualidade e segurança no uso de fármacos e atuar em equipes multiprofissionais.",
    howItWorks: [
      "Curso EAD focado nas especificidades da farmácia hospitalar.",
      "Conteúdo baseado em protocolos e normas vigentes.",
      "Estudos de caso de situações reais em hospitais."
    ],
    profession: "Atue em farmácias hospitalares, clínicas, unidades de pronto atendimento e centros de distribuição de medicamentos.",
    market: "O setor de saúde demanda profissionais especializados em farmácia hospitalar. A segurança do paciente depende de uma gestão farmacêutica qualificada.",
    methodology: {
      materials: ["Video-aulas", "Apostilas", "Protocolos", "Biblioteca digital"],
      services: ["Requerimento de declarações", "Histórico", "Certificado"],
      responseTime: "Chamados respondidos dentro de 48 horas."
    },
    requirements: ["Diploma de Técnico em Farmácia", "Cópia do RG e CPF", "Comprovante de Residência"],
    tutoring: "Acompanhamento de tutor especializado em farmácia hospitalar.",
    tutorAttributes: ["Orientar sobre protocolos hospitalares", "Apoiar em estudos de caso", "Esclarecer dúvidas técnicas"],
    modules: [
      { name: "Módulo 01 - Farmácia Hospitalar", subjects: [{ name: "Introdução à Farmácia Hospitalar", hours: 40 }, { name: "Legislação e Normas", hours: 40 }, { name: "Estrutura e Organização", hours: 40 }] },
      { name: "Módulo 02 - Gestão de Medicamentos", subjects: [{ name: "Seleção e Padronização", hours: 60 }, { name: "Armazenamento e Distribuição", hours: 60 }, { name: "Controle de Estoque", hours: 40 }] },
      { name: "Módulo 03 - Segurança do Paciente", subjects: [{ name: "Farmacovigilância", hours: 60 }, { name: "Interações Medicamentosas", hours: 40 }, { name: "Rastreabilidade", hours: 40 }] }
    ],
    access: [{ title: "Video Aulas", description: "Conteúdo especializado." }, { title: "Tutoria", description: "Suporte de especialistas." }, { title: "Certificado", description: "Especialização reconhecida." }],
    faq: [{ question: "Preciso ser técnico em farmácia?", answer: "Sim, é necessário ter diploma de técnico em farmácia ou área correlata da saúde." }]
  },
  "pos-saude-publica": {
    title: "Especialização Técnica em Saúde Pública EAD",
    subtitle: "Atue na promoção da saúde coletiva e vigilância sanitária",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=600&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1920&h=400&fit=crop",
    description: "A Especialização Técnica em Saúde Pública EAD forma profissionais para atuar em políticas públicas, vigilância em saúde, prevenção de doenças e promoção da saúde coletiva no Sistema Único de Saúde (SUS). Essencial para técnicos da área da saúde.",
    originalPrice: "R$ 1.500,00",
    promoPrice: "R$ 850,00",
    installment: "R$ 70,83",
    hours: 400,
    durationRange: "4 a 8 meses",
    certification: "Certificação válida",
    rating: 5.0,
    youtubeVideoId: "pn97Z1-ssFI",
    category: "Pós-Técnico EAD",
    registration: {
      portaria: "SEE-PRC-2021/12193",
      parecer: "241/2021",
      approvedDate: "07/10/2021",
      registerWith: "Certificado de Especialização"
    },
    aboutCourse: "A saúde pública é fundamental para o bem-estar da população. Esta especialização prepara você para atuar em unidades básicas de saúde, vigilância sanitária e epidemiológica, e programas de promoção da saúde.",
    howItWorks: [
      "Curso EAD com foco nas políticas de saúde do SUS.",
      "Conteúdo atualizado com as diretrizes do Ministério da Saúde.",
      "Estudos de caso e situações práticas de saúde coletiva."
    ],
    profession: "Atue em unidades básicas de saúde, secretarias de saúde, vigilância sanitária, epidemiológica e ambiental.",
    market: "O SUS é o maior sistema público de saúde do mundo e demanda constantemente profissionais qualificados em saúde pública.",
    methodology: {
      materials: ["Video-aulas", "Apostilas", "Diretrizes do SUS", "Biblioteca digital"],
      services: ["Requerimento de declarações", "Histórico", "Certificado"],
      responseTime: "Chamados respondidos dentro de 48 horas."
    },
    requirements: ["Diploma de Curso Técnico na área da saúde", "Cópia do RG e CPF", "Comprovante de Residência"],
    tutoring: "Acompanhamento de tutor especializado em saúde pública.",
    tutorAttributes: ["Orientar sobre políticas do SUS", "Apoiar em estudos de caso", "Esclarecer dúvidas"],
    modules: [
      { name: "Módulo 01 - Sistema de Saúde", subjects: [{ name: "História e Organização do SUS", hours: 60 }, { name: "Políticas Públicas de Saúde", hours: 60 }, { name: "Gestão em Saúde", hours: 40 }] },
      { name: "Módulo 02 - Vigilância em Saúde", subjects: [{ name: "Vigilância Epidemiológica", hours: 60 }, { name: "Vigilância Sanitária", hours: 40 }, { name: "Vigilância Ambiental", hours: 40 }] },
      { name: "Módulo 03 - Promoção da Saúde", subjects: [{ name: "Educação em Saúde", hours: 40 }, { name: "Programas de Prevenção", hours: 40 }, { name: "Saúde da Família", hours: 60 }] }
    ],
    access: [{ title: "Video Aulas", description: "Conteúdo do SUS." }, { title: "Tutoria", description: "Suporte especializado." }, { title: "Certificado", description: "Especialização reconhecida." }],
    faq: [{ question: "Posso atuar em concursos públicos?", answer: "Sim, a especialização pode ser um diferencial em concursos na área da saúde." }]
  },
  "pos-oncologia": {
    title: "Especialização Técnica em Oncologia EAD",
    subtitle: "Especialize-se no cuidado de pacientes oncológicos",
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1200&h=600&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1920&h=400&fit=crop",
    description: "A Especialização Técnica em Oncologia EAD capacita profissionais para atuar no cuidado e tratamento de pacientes com câncer. Aprenda a trabalhar de forma qualificada e humanizada em equipes multiprofissionais de oncologia.",
    originalPrice: "R$ 1.500,00",
    promoPrice: "R$ 850,00",
    installment: "R$ 70,83",
    hours: 400,
    durationRange: "4 a 8 meses",
    certification: "Certificação válida",
    rating: 5.0,
    youtubeVideoId: "pn97Z1-ssFI",
    category: "Pós-Técnico EAD",
    registration: {
      portaria: "SEE-PRC-2021/12194",
      parecer: "242/2021",
      approvedDate: "07/10/2021",
      registerWith: "Certificado de Especialização"
    },
    aboutCourse: "A oncologia é uma área que exige conhecimento técnico e sensibilidade no cuidado ao paciente. Esta especialização prepara você para atuar em hospitais oncológicos, clínicas e centros de tratamento do câncer.",
    howItWorks: [
      "Curso EAD com foco no cuidado integral ao paciente oncológico.",
      "Conteúdo baseado em protocolos nacionais e internacionais.",
      "Abordagem humanizada e centrada no paciente."
    ],
    profession: "Atue em hospitais oncológicos, clínicas de quimioterapia, centros de radioterapia e unidades de cuidados paliativos.",
    market: "A oncologia é uma das áreas da saúde que mais cresce. Profissionais especializados são essenciais para o tratamento adequado dos pacientes.",
    methodology: {
      materials: ["Video-aulas", "Apostilas", "Protocolos", "Biblioteca digital"],
      services: ["Requerimento de declarações", "Histórico", "Certificado"],
      responseTime: "Chamados respondidos dentro de 48 horas."
    },
    requirements: ["Diploma de Curso Técnico na área da saúde", "Cópia do RG e CPF", "Comprovante de Residência"],
    tutoring: "Acompanhamento de tutor especializado em oncologia.",
    tutorAttributes: ["Orientar sobre protocolos oncológicos", "Apoiar em estudos de caso", "Esclarecer dúvidas"],
    modules: [
      { name: "Módulo 01 - Fundamentos", subjects: [{ name: "Introdução à Oncologia", hours: 60 }, { name: "Biologia do Câncer", hours: 40 }, { name: "Tipos de Câncer", hours: 60 }] },
      { name: "Módulo 02 - Tratamentos", subjects: [{ name: "Quimioterapia", hours: 60 }, { name: "Radioterapia", hours: 40 }, { name: "Imunoterapia e Novas Terapias", hours: 40 }] },
      { name: "Módulo 03 - Cuidado ao Paciente", subjects: [{ name: "Cuidados de Enfermagem em Oncologia", hours: 60 }, { name: "Cuidados Paliativos", hours: 40 }, { name: "Aspectos Psicológicos", hours: 40 }] }
    ],
    access: [{ title: "Video Aulas", description: "Conteúdo especializado." }, { title: "Tutoria", description: "Suporte de especialistas." }, { title: "Certificado", description: "Especialização reconhecida." }],
    faq: [{ question: "Preciso ser técnico de enfermagem?", answer: "É recomendável ser técnico de enfermagem ou outra área da saúde, mas técnicos de outras áreas também podem se inscrever." }]
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