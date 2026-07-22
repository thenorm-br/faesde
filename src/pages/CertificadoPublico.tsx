import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client.ts";
import Header from "@/components/Header.tsx";
import Footer from "@/components/Footer.tsx";
import {
  Award,
  Barcode,
  Building2,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Loader2,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { emitCertificatePdf } from "@/lib/certificatePdf.ts";
import { formatFileSize, getCertificateFilePublicUrl } from "@/lib/certificateFiles.ts";
import { toast } from "sonner";

type CertificateSourceType = "generated" | "external_pdf";

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
  content: string | null;
  source_type: CertificateSourceType | null;
  external_file_path: string | null;
  external_file_name: string | null;
  external_file_size: number | null;
  external_file_mime_type: string | null;
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

  const isExternal = cert?.source_type === "external_pdf";
  const externalUrl = cert ? getCertificateFilePublicUrl(cert.external_file_path) : "";

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
            <h1 className="text-2xl font-bold mb-2">Certificado nao encontrado</h1>
            <p className="text-muted-foreground">
              O codigo informado nao corresponde a nenhum certificado ativo.
            </p>
            <Button asChild className="mt-6">
              <Link to="/certificados">Fazer nova consulta</Link>
            </Button>
          </div>
        ) : (
          <div className="bg-card rounded-lg p-8 md:p-10 border shadow-sm">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <Badge variant={isExternal ? "outline" : "secondary"}>
                    {isExternal ? "Documento externo" : "Certificado FAESDE"}
                  </Badge>
                  <Badge variant="outline">Consulta publica</Badge>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold uppercase">
                  Certificado de {cert.student_name}
                </h1>
                <p className="text-muted-foreground mt-2">
                  Consulta realizada em {consultaStr}
                </p>
              </div>

              {isExternal ? (
                externalUrl ? (
                  <div className="flex flex-wrap gap-2">
                    <Button asChild>
                      <a href={externalUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" /> Abrir PDF
                      </a>
                    </Button>
                    <Button asChild variant="outline">
                      <a href={externalUrl} target="_blank" rel="noopener noreferrer" download={cert.external_file_name || true}>
                        <Download className="mr-2 h-4 w-4" /> Baixar PDF
                      </a>
                    </Button>
                  </div>
                ) : (
                  <Badge variant="destructive">PDF indisponivel</Badge>
                )
              ) : (
                <Button
                  onClick={async () => {
                    try { await emitCertificatePdf(cert); toast.success("PDF gerado"); }
                    catch (error) { toast.error(error instanceof Error ? error.message : "Erro ao gerar PDF"); }
                  }}
                >
                  <Download className="mr-2 h-4 w-4" /> Baixar PDF
                </Button>
              )}
            </div>

            <div className="my-6 grid gap-3 text-base md:grid-cols-2">
              <p className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Carga horaria: <strong>{cert.hours > 0 ? `${cert.hours} horas` : "Nao informada"}</strong>
              </p>
              <p className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Instituicao: <strong>{cert.institution || "FAESDE"}</strong>
              </p>
              <p className="flex items-center gap-2 md:col-span-2">
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
              <p className="flex items-center gap-2 md:col-span-2">
                <Barcode className="h-5 w-5" />
                Numero de identificacao: <span className="font-mono">{cert.code}</span>
              </p>
            </div>

            {isExternal ? (
              <div className="rounded-lg border bg-muted/40 p-5">
                <h2 className="flex items-center gap-2 text-xl font-bold">
                  <FileText className="h-5 w-5" />
                  Documento disponibilizado
                </h2>
                <p className="mt-3 leading-relaxed">
                  Este documento foi emitido por <strong>{cert.institution || "outra instituicao de ensino"}</strong>.
                  A FAESDE esta disponibilizando a consulta publica e o arquivo PDF associado ao codigo informado.
                </p>
                <p className="mt-3 leading-relaxed">
                  Aluno: <strong className="uppercase">{cert.student_name}</strong>
                  {cert.cpf && (
                    <>
                      {" "}CPF: <strong>{cert.cpf}</strong>
                    </>
                  )}{" "}
                  Curso/documento: <strong>{cert.course_name}</strong>. Data de conclusao/emissao:{" "}
                  <strong>{formatDate(cert.completion_date)}</strong>.
                </p>
                {cert.external_file_name && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Arquivo: <strong>{cert.external_file_name}</strong>
                    {formatFileSize(cert.external_file_size) && ` (${formatFileSize(cert.external_file_size)})`}
                  </p>
                )}
              </div>
            ) : (
              <>
                <p className="mt-6 leading-relaxed">
                  Certificamos para os devidos fins, que{" "}
                  <strong className="uppercase">{cert.student_name}</strong>
                  {cert.cpf && (
                    <>
                      {" "}portador do CPF <strong>{cert.cpf}</strong>
                    </>
                  )}{" "}
                  concluiu com exito o curso livre de aperfeicoamento:
                </p>

                <h2 className="text-2xl font-bold mt-4">{cert.course_name}</h2>

                <p className="mt-3 leading-relaxed">
                  Com carga horaria de <strong>{cert.hours} horas</strong>, em{" "}
                  {formatDate(cert.completion_date)}, nos termos do Decreto Presidencial no 5.154,
                  de 23 de julho de 2004, Art 1o e 3o e de acordo com as normas do Ministerio da
                  Educacao (MEC) pela resolucao CNE no 04/99, Art 11.
                </p>

                <p className="mt-3 leading-relaxed uppercase text-sm">
                  O presente documento foi registrado sob o numero{" "}
                  <strong>{cert.code}</strong>
                  {cert.page_number && (
                    <>
                      , em folha <strong>{cert.page_number}</strong>
                    </>
                  )}
                  {cert.book_number && (
                    <> do livro no {cert.book_number}</>
                  )}{" "}
                  desta instituicao de ensino conforme listagem publicada no diario eletronico no{" "}
                  {cert.institution || "FAESDE"}.
                </p>
              </>
            )}

            <div className="mt-8 flex flex-wrap gap-2 border-t pt-5">
              <Button asChild variant="outline">
                <Link to="/certificados">
                  <Award className="mr-2 h-4 w-4" />
                  Nova consulta
                </Link>
              </Button>
              {cert.course_slug && (
                <Button asChild variant="ghost">
                  <Link to={`/curso/${cert.course_slug}`}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Ver pagina do curso
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CertificadoPublico;
