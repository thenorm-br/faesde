import { FormEvent, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Award, Barcode, Download, ExternalLink, FileText, Loader2, Search, ShieldCheck } from "lucide-react";
import Header from "@/components/Header.tsx";
import Footer from "@/components/Footer.tsx";
import { supabase } from "@/integrations/supabase/client.ts";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { formatFileSize, getCertificateFilePublicUrl } from "@/lib/certificateFiles.ts";

type CertificateSourceType = "generated" | "external_pdf";

interface CertificateSearchResult {
  code: string;
  student_name: string;
  course_name: string;
  course_slug: string | null;
  hours: number;
  completion_date: string;
  institution: string | null;
  source_type: CertificateSourceType | null;
  external_file_path: string | null;
  external_file_name: string | null;
  external_file_size: number | null;
}

const normalizeCode = (value: string) => value.replace(/\D/g, "").slice(0, 24);

const formatDate = (date: string) => {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
};

const CertificadosConsulta = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [code, setCode] = useState(() => normalizeCode(searchParams.get("codigo") || ""));
  const [result, setResult] = useState<CertificateSearchResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const cleanCode = normalizeCode(code);
    setCode(cleanCode);
    setResult(null);
    setNotFound(false);

    if (cleanCode.length !== 24) {
      setNotFound(true);
      return;
    }

    setLoading(true);
    const { data } = await supabase
      .from("certificates")
      .select("*")
      .eq("code", cleanCode)
      .eq("is_active", true)
      .maybeSingle();
    setLoading(false);
    setSearchParams({ codigo: cleanCode });

    if (!data) {
      setNotFound(true);
      return;
    }

    setResult(data as CertificateSearchResult);
  };

  const isExternal = result?.source_type === "external_pdf";
  const externalUrl = result ? getCertificateFilePublicUrl(result.external_file_path) : "";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-muted/30 to-background">
      <Header />
      <main className="flex-1">
        <section className="bg-ecid-navy text-primary-foreground">
          <div className="container mx-auto grid gap-8 px-4 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="space-y-4">
              <Badge className="bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15">
                Consulta publica
              </Badge>
              <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight md:text-5xl">
                Consulte a autenticidade de certificados
              </h1>
              <p className="max-w-2xl text-base text-primary-foreground/75 md:text-lg">
                Digite o codigo impresso no certificado para verificar os dados do aluno, curso, instituicao emissora
                e, quando houver, acessar o PDF disponibilizado.
              </p>
            </div>
            <Card className="border-primary-foreground/15 bg-white text-foreground shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Barcode className="h-5 w-5 text-primary" />
                  Buscar certificado
                </CardTitle>
                <CardDescription>Use o codigo de 24 digitos do certificado.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    value={code}
                    onChange={(event) => setCode(normalizeCode(event.target.value))}
                    inputMode="numeric"
                    maxLength={24}
                    placeholder="Ex: 649499405062496827354396"
                    className="font-mono text-base"
                  />
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                    Consultar certificado
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10">
          {notFound && (
            <Alert className="mx-auto max-w-3xl">
              <FileText className="h-4 w-4" />
              <AlertTitle>Certificado nao encontrado</AlertTitle>
              <AlertDescription>
                Confira se o codigo foi digitado corretamente. Caso o documento tenha sido emitido recentemente, fale
                com a secretaria da FAESDE.
              </AlertDescription>
            </Alert>
          )}

          {result && (
            <Card className="mx-auto max-w-4xl overflow-hidden">
              <CardHeader className="border-b bg-muted/40">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <ShieldCheck className="h-6 w-6 text-primary" />
                      Certificado localizado
                    </CardTitle>
                    <CardDescription>Consulta feita pelo codigo {result.code}</CardDescription>
                  </div>
                  <Badge variant={isExternal ? "outline" : "secondary"}>
                    {isExternal ? "PDF externo" : "Certificado FAESDE"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-6 p-6 md:grid-cols-[1fr_auto]">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Aluno</p>
                    <p className="text-xl font-bold">{result.student_name}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Curso</p>
                    <p className="font-semibold">{result.course_name}</p>
                  </div>
                  <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                    <p>
                      <strong className="block text-foreground">Conclusao</strong>
                      {formatDate(result.completion_date)}
                    </p>
                    <p>
                      <strong className="block text-foreground">Carga horaria</strong>
                      {result.hours > 0 ? `${result.hours} horas` : "Nao informada"}
                    </p>
                    <p>
                      <strong className="block text-foreground">Instituicao</strong>
                      {result.institution || "FAESDE"}
                    </p>
                  </div>
                  {isExternal && result.external_file_name && (
                    <p className="text-sm text-muted-foreground">
                      Arquivo enviado: <strong>{result.external_file_name}</strong>
                      {formatFileSize(result.external_file_size) && ` (${formatFileSize(result.external_file_size)})`}
                    </p>
                  )}
                </div>
                <div className="flex min-w-52 flex-col gap-2">
                  <Button asChild>
                    <Link to={`/certificados/${result.code}`}>
                      <Award className="mr-2 h-4 w-4" />
                      Abrir validacao
                    </Link>
                  </Button>
                  {isExternal && externalUrl && (
                    <Button asChild variant="outline">
                      <a href={externalUrl} target="_blank" rel="noopener noreferrer" download={result.external_file_name || true}>
                        <Download className="mr-2 h-4 w-4" />
                        Baixar PDF
                      </a>
                    </Button>
                  )}
                  {result.course_slug && (
                    <Button asChild variant="ghost">
                      <Link to={`/curso/${result.course_slug}`}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ver curso
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CertificadosConsulta;
