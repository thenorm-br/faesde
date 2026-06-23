import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GraduationCap, Monitor, Barcode, Loader2 } from "lucide-react";

interface Certificate {
  code: string;
  student_name: string;
  cpf: string | null;
  course_name: string;
  course_slug: string | null;
  hours: number;
  completion_date: string;
  book_number: string | null;
  page_number: string | null;
  institution: string | null;
}

const formatDate = (d: string) => {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
};

const CertificadoPublico = () => {
  const { code } = useParams<{ code: string }>();
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const consultaDate = new Date();
  const consultaStr = `${consultaDate.toLocaleDateString("pt-BR")} ${consultaDate
    .toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    .replace(":", "h")}`;

  useEffect(() => {
    const load = async () => {
      if (!code) return;
      const { data } = await supabase
        .from("certificates")
        .select("*")
        .eq("code", code)
        .eq("is_active", true)
        .maybeSingle();
      setCert(data as Certificate | null);
      setLoading(false);
    };
    load();
  }, [code]);

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-5xl">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !cert ? (
          <div className="bg-card rounded-lg p-10 text-center border">
            <h1 className="text-2xl font-bold mb-2">Certificado não encontrado</h1>
            <p className="text-muted-foreground">
              O código informado não corresponde a nenhum certificado emitido.
            </p>
          </div>
        ) : (
          <div className="bg-card rounded-lg p-8 md:p-10 border shadow-sm">
            <h1 className="text-3xl md:text-4xl font-extrabold uppercase">
              Certificado de {cert.student_name}
            </h1>
            <p className="text-muted-foreground mt-2">
              Consulta realizada em {consultaStr}
            </p>

            <div className="my-6 space-y-2 text-base">
              <p className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Carga horária: <strong>{cert.hours} horas</strong>
              </p>
              <p className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Curso:{" "}
                {cert.course_slug ? (
                  <Link to={`/curso/${cert.course_slug}`} className="text-primary hover:underline">
                    {cert.course_name}
                  </Link>
                ) : (
                  <span>{cert.course_name}</span>
                )}
              </p>
              <p className="flex items-center gap-2">
                <Barcode className="h-5 w-5" />
                Número de identificação: {cert.code}
              </p>
            </div>

            <p className="mt-6 leading-relaxed">
              Certificamos para os devidos fins, que{" "}
              <strong className="uppercase">{cert.student_name}</strong>
              {cert.cpf && (
                <>
                  {" "}portador do CPF <strong>{cert.cpf}</strong>
                </>
              )}{" "}
              concluiu com êxito o curso livre de aperfeiçoamento:
            </p>

            <h2 className="text-2xl font-bold mt-4">{cert.course_name}</h2>

            <p className="mt-3 leading-relaxed">
              Com carga horária de <strong>{cert.hours} horas</strong>, em{" "}
              {formatDate(cert.completion_date)}, nos termos do Decreto Presidencial nº 5.154,
              de 23 de julho de 2004, Art 1º e 3º e de acordo com as normas do Ministério da
              Educação (MEC) pela resolução CNE nº 04/99, Art 11.
            </p>

            <p className="mt-3 leading-relaxed uppercase text-sm">
              O presente documento foi registrado sob o número{" "}
              <strong>{cert.code}</strong>
              {cert.page_number && (
                <>
                  , em folha <strong>{cert.page_number}</strong>
                </>
              )}
              {cert.book_number && (
                <> do livro nº {cert.book_number}</>
              )}{" "}
              desta instituição de ensino conforme listagem publicada no diário eletrônico no{" "}
              {cert.institution || "FAESDE"}.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CertificadoPublico;
