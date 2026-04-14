import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Award, Star, Play, CheckCircle, MessageCircle, BookOpen, Users, ChevronDown, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

interface CourseModule {
  name: string;
  subjects: { name: string; hours: number }[];
}

interface AccessItem {
  title: string;
  description: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-5 w-5 ${i <= rating ? "fill-ecid-yellow text-ecid-yellow" : "text-muted"}`}
        />
      ))}
      <span className="ml-2 text-lg font-bold text-primary-foreground">{rating.toFixed(1)}</span>
    </div>
  );
};

const CursoDetalhe = () => {
  const { id } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      const { data } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", id)
        .limit(1);
      if (data && data.length > 0) {
        setCourse(data[0]);
      }
      setLoading(false);
    };
    fetchCourse();
  }, [id]);

  const modules: CourseModule[] = course?.modules
    ? (course.modules as any[]).map((m: any) => ({
        name: m.name || "",
        subjects: Array.isArray(m.subjects) ? m.subjects : [],
      }))
    : [];

  const accessItems: AccessItem[] = course?.access_items
    ? (course.access_items as any[])
    : [];

  const faqItems: FaqItem[] = course?.faq
    ? (course.faq as any[])
    : [];

  const [formData, setFormData] = useState({
    email: "",
    nome_completo: "",
    curso_de_interesse: "",
    telefone1: "",
    mensagem: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    nome_completo: "",
    telefone1: "",
  });

  useEffect(() => {
    if (course) {
      setFormData(prev => ({
        ...prev,
        curso_de_interesse: course.title,
        mensagem: `Olá! Gostaria de me matricular no curso: ${course.title}`,
      }));
    }
  }, [course]);

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-foreground">Curso não encontrado</h1>
          <Link to="/cursos" className="mt-4 inline-block text-ecid-blue-accent hover:underline">
            Ver todos os cursos
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const rating = course.rating || 5;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Banner */}
      <section className="relative">
        <div 
          className="h-64 w-full bg-cover bg-center md:h-80"
          style={{ backgroundImage: `url(${course.banner_image_url || course.image_url || ""})` }}
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
            <div className="flex-1 pb-8">
              <StarRating rating={rating} />
              
              <h1 className="my-4 text-2xl font-bold text-primary-foreground md:text-4xl">
                {course.title}
              </h1>
              
              {course.subtitle && (
                <h2 className="mb-6 text-base text-primary-foreground/80 md:text-lg">
                  {course.subtitle}
                </h2>
              )}
              
              {course.description && (
                <p className="mb-6 text-sm leading-relaxed text-primary-foreground/70 md:text-base">
                  {course.description}
                </p>
              )}
              
              {/* Badges */}
              <div className="mb-6 flex flex-wrap gap-3">
                {course.hours && (
                  <div className="flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2">
                    <Clock className="h-4 w-4 text-ecid-yellow" />
                    <span className="text-sm font-medium text-primary-foreground">{course.hours}h</span>
                  </div>
                )}
                {course.duration_range && (
                  <div className="flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2">
                    <Calendar className="h-4 w-4 text-ecid-yellow" />
                    <span className="text-sm font-medium text-primary-foreground">{course.duration_range}</span>
                  </div>
                )}
                {course.certification && (
                  <div className="flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2">
                    <Award className="h-4 w-4 text-ecid-yellow" />
                    <span className="text-sm font-medium text-primary-foreground">{course.certification}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 rounded-md border border-primary-foreground/30 px-4 py-2 text-primary-foreground/60">
                <Play className="h-4 w-4" />
                <span className="text-sm font-medium">Vídeo em breve</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content Sections */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex-1">
              {/* Sobre o Curso */}
              <div className="mb-12">
                <h2 className="mb-2 text-2xl font-bold text-foreground">
                  Sobre o curso <span className="text-ecid-red">_</span>
                </h2>
                <h3 className="mb-6 text-xl text-muted-foreground">Conheça um pouco mais sobre o curso.</h3>
                <p className="leading-relaxed text-muted-foreground">
                  {course.about_course || `O ${course.title} é um programa de formação profissional autorizado pelo MEC, com carga horária de ${course.hours || 1440} horas e duração de ${course.duration_range || "6 a 18 meses"}. Este curso oferece uma formação completa e reconhecida nacionalmente, preparando o aluno para atuar com excelência no mercado de trabalho. Ao concluir o curso, o aluno receberá um diploma com validade nacional, podendo realizar o registro profissional no órgão competente.`}
                </p>
              </div>

              {/* Por que cursar */}
              <div className="mb-12">
                <h2 className="mb-2 text-2xl font-bold text-foreground">
                  Por que cursar? <span className="text-ecid-red">_</span>
                </h2>
                <h3 className="mb-6 text-xl text-muted-foreground">Veja os motivos para escolher este curso.</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { icon: "🎓", title: "Autorizado pelo MEC", desc: "Formação reconhecida em todo o território nacional com validade do diploma garantida." },
                    { icon: "⏰", title: `${course.hours || 1440}h de carga horária`, desc: `Conclua em ${course.duration_range || "6 a 18 meses"} estudando no seu próprio ritmo, 100% online.` },
                    { icon: "📋", title: course.certification || "Certificação válida", desc: "Ao concluir, registre-se no órgão competente e atue profissionalmente em todo o Brasil." },
                    { icon: "💻", title: "100% EAD", desc: "Estude de qualquer lugar, com acesso à plataforma digital, materiais interativos e suporte de tutores." },
                    { icon: "📈", title: "Alta empregabilidade", desc: "Área com grande demanda no mercado de trabalho e diversas oportunidades de carreira." },
                    { icon: "💰", title: "Investimento acessível", desc: course.installment ? `Parcelas a partir de ${course.installment} sem juros no cartão.` : "Condições facilitadas de pagamento com parcelas sem juros." },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3 rounded-xl bg-card p-4 shadow-card">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <h4 className="font-bold text-foreground">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* O que você terá acesso */}
              {accessItems.length > 0 && (
                <div className="mb-12">
                  <h2 className="mb-6 text-2xl font-bold text-foreground">
                    O que você terá acesso <span className="text-ecid-red">_</span>
                  </h2>
                  <div className="grid gap-6 md:grid-cols-3">
                    {accessItems.map((item, index) => (
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
              )}

              {/* Como vai funcionar */}
              {course.how_it_works && course.how_it_works.length > 0 && (
                <div className="mb-12">
                  <h2 className="mb-6 text-2xl font-bold text-foreground">
                    Entenda como vai funcionar o curso <span className="text-ecid-red">_</span>
                  </h2>
                  <div className="space-y-4">
                    {course.how_it_works.map((paragraph: string, index: number) => (
                      <p key={index} className="leading-relaxed text-muted-foreground">{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Registro do Curso */}
              {course.registration_portaria && (
                <div className="mb-12 rounded-xl bg-ecid-navy p-6">
                  <h2 className="mb-4 text-xl font-bold text-primary-foreground">Registro do Curso</h2>
                  <p className="mb-4 text-primary-foreground/80">
                    Este curso foi autorizado, a nível nacional. Sendo assim, ao concluir o curso e ser aprovado, o aluno receberá um certificado com validade nacional e poderá se registrar no órgão responsável.
                  </p>
                  <div className="grid gap-4 text-sm md:grid-cols-2">
                    <div>
                      <span className="text-primary-foreground/60">Portaria Curso:</span>
                      <span className="ml-2 font-medium text-primary-foreground">{course.registration_portaria}</span>
                    </div>
                    {course.registration_parecer && (
                      <div>
                        <span className="text-primary-foreground/60">Ato Autorizatório Parecer:</span>
                        <span className="ml-2 font-medium text-primary-foreground">{course.registration_parecer}</span>
                      </div>
                    )}
                    {course.registration_approved_date && (
                      <div>
                        <span className="text-primary-foreground/60">Aprovado em:</span>
                        <span className="ml-2 font-medium text-primary-foreground">{course.registration_approved_date}</span>
                      </div>
                    )}
                    {course.registration_register_with && (
                      <div>
                        <span className="font-medium text-ecid-yellow">{course.registration_register_with}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Duração */}
              {course.hours && (
                <div className="mb-12">
                  <h2 className="mb-4 text-xl font-bold text-foreground">Duração</h2>
                  <p className="leading-relaxed text-muted-foreground">
                    O curso possui uma carga horária total de {course.hours} horas{course.duration_range ? `, podendo ser concluído em ${course.duration_range}` : ""}.
                  </p>
                </div>
              )}

              {/* Profissão */}
              {course.profession && (
                <div className="mb-12">
                  <h2 className="mb-4 text-xl font-bold text-foreground">Profissão</h2>
                  <p className="leading-relaxed text-muted-foreground">{course.profession}</p>
                </div>
              )}

              {/* Mercado */}
              {course.market && (
                <div className="mb-12">
                  <h2 className="mb-4 text-xl font-bold text-foreground">Mercado</h2>
                  <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{course.market}</p>
                </div>
              )}

              {/* Metodologia de Ensino */}
              {(course.methodology_materials?.length > 0 || course.methodology_services?.length > 0) && (
                <div className="mb-12">
                  <h2 className="mb-4 text-xl font-bold text-foreground">Metodologia de Ensino</h2>
                  {course.methodology_materials?.length > 0 && (
                    <>
                      <p className="mb-4 text-muted-foreground">O aluno estudará pela plataforma de estudos, sendo disponibilizados materiais acadêmicos como:</p>
                      <ul className="mb-4 space-y-2">
                        {course.methodology_materials.map((material: string, index: number) => (
                          <li key={index} className="flex items-center gap-2 text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {material}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {course.methodology_services?.length > 0 && (
                    <>
                      <p className="mb-4 text-muted-foreground">O aluno também contará com atendimento para solicitação de serviços como:</p>
                      <ul className="mb-4 space-y-2">
                        {course.methodology_services.map((service: string, index: number) => (
                          <li key={index} className="flex items-center gap-2 text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {service}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {course.methodology_response_time && (
                    <p className="text-muted-foreground">{course.methodology_response_time}</p>
                  )}
                </div>
              )}

              {/* Requisitos para Matrícula */}
              {course.requirements?.length > 0 && (
                <div className="mb-12">
                  <h2 className="mb-4 text-xl font-bold text-foreground">Requisitos para Matrícula</h2>
                  <ul className="space-y-2">
                    {course.requirements.map((req: string, index: number) => (
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
              )}

              {/* Tutoria */}
              {course.tutoring && (
                <div className="mb-12">
                  <h2 className="mb-4 text-xl font-bold text-foreground">Tutoria</h2>
                  <p className="mb-4 leading-relaxed text-muted-foreground">{course.tutoring}</p>
                  {course.tutor_attributes?.length > 0 && (
                    <>
                      <p className="mb-4 text-muted-foreground">Dentre suas atribuições, destacam-se:</p>
                      <ul className="space-y-2">
                        {course.tutor_attributes.map((attr: string, index: number) => (
                          <li key={index} className="flex items-center gap-2 text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {attr}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}

              {/* Grade Curricular */}
              {modules.length > 0 && (
                <div className="mb-12">
                  <h2 className="mb-6 text-2xl font-bold text-foreground">
                    Conteúdo <span className="text-ecid-red">_</span>
                  </h2>
                  <Accordion type="multiple" className="space-y-4">
                    {modules.map((module, moduleIndex) => (
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
              {faqItems.length > 0 && (
                <div className="mb-12">
                  <h2 className="mb-6 text-2xl font-bold text-foreground">
                    Dúvidas Frequentes <span className="text-ecid-red">_</span>
                  </h2>
                  <Accordion type="single" collapsible className="space-y-4">
                    {faqItems.map((item, index) => (
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
                <div className="relative mb-4 overflow-hidden rounded-xl bg-muted">
                  <div className="flex aspect-video w-full flex-col items-center justify-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted-foreground/20">
                      <Play className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Vídeo em breve</span>
                  </div>
                  <div className="absolute right-3 top-3">
                    <span className="rounded bg-ecid-blue-accent px-2 py-1 text-xs font-bold text-white">
                      {course.category}
                    </span>
                  </div>
                </div>
                
                <div className="rounded-2xl bg-card p-6 shadow-xl">
                  <div className="mb-4 inline-block rounded-lg bg-ecid-blue-accent px-4 py-2">
                    <span className="text-sm font-bold text-white">Desconto especial</span>
                  </div>
                  
                  <h3 className="mb-4 text-lg font-bold text-foreground">{course.title}</h3>
                  
                  <div className="mb-4 space-y-1">
                    {course.original_price && (
                      <p className="text-sm text-muted-foreground">
                        De <span className="line-through">{course.original_price}</span>
                      </p>
                    )}
                    {course.promo_price && (
                      <p className="text-sm text-muted-foreground">Por {course.promo_price}</p>
                    )}
                    {course.installment && (
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-foreground">{course.installment}</span>
                      </div>
                    )}
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
