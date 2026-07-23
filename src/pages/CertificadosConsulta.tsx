import { ChangeEvent, FormEvent, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Award, Barcode, Download, ExternalLink, FileText, Loader2, Search, Send, ShieldCheck, Upload } from "lucide-react";
import Header from "@/components/Header.tsx";
import Footer from "@/components/Footer.tsx";
import { supabase } from "@/integrations/supabase/client.ts";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
  formatFileSize,
  getCertificateFilePublicUrl,
  isPdfFile,
  MAX_CERTIFICATE_FILE_SIZE_BYTES,
} from "@/lib/certificateFiles.ts";

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

interface CertificateRequestForm {
  studentName: string;
  cpf: string;
  certificateReceived: string;
  courseName: string;
  completionPeriod: string;
}

const normalizeCode = (value: string) => value.replace(/\D/g, "").slice(0, 24);
const normalizeCpf = (value: string) => value.replace(/\D/g, "").slice(0, 11);

const formatCpf = (value: string) => {
  const digits = normalizeCpf(value);
  if (digits.length !== 11) return digits;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

const formatDate = (date: string) => {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
};

const CERTIFICATE_RECEIVED_OPTIONS = [
  "Sim, certificado digital",
  "Sim, certificado fisico",
  "Sim, digital e fisico",
  "Ainda nao recebi",
  "Nao lembro",
];

const COMPLETION_PERIOD_OPTIONS = ["2026", "2025", "2024", "2023", "Mais de 3 anos", "Nao lembro"];

const EMPTY_REQUEST_FORM: CertificateRequestForm = {
  studentName: "",
  cpf: "",
  certificateReceived: "",
  courseName: "",
  completionPeriod: "",
};

const buildCertificateRequestMessage = (form: CertificateRequestForm) =>
  [
    "Ola, sou aluno(a) e gostaria de solicitar a inclusao do meu certificado no site faesde.com.br.",
    "",
    `Nome: ${form.studentName.trim()}`,
    `CPF: ${formatCpf(form.cpf)}`,
    `Ja recebeu o certificado digital ou fisico?: ${form.certificateReceived}`,
    `Curso concluido: ${form.courseName.trim()}`,
    `Data/periodo informado: ${form.completionPeriod}`,
    "",
    "Solicito a inclusao e validacao do certificado na area publica: https://faesde.com.br/certificados",
    "Link do painel para atendimento interno: https://faesde.com.br/admin",
  ].join("\n");

const buildFallbackRedirectUrl = (form: CertificateRequestForm) =>
  `https://mensagem.faesde.com.br/send?text=${encodeURIComponent(buildCertificateRequestMessage(form))}`;

const CertificadosConsulta = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [code, setCode] = useState(() => normalizeCode(searchParams.get("codigo") || ""));
  const [result, setResult] = useState<CertificateSearchResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestStep, setRequestStep] = useState(0);
  const [requestForm, setRequestForm] = useState<CertificateRequestForm>(EMPTY_REQUEST_FORM);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestFile, setRequestFile] = useState<File | null>(null);

  const updateRequestForm = (field: keyof CertificateRequestForm, value: string) => {
    setRequestForm((current) => ({
      ...current,
      [field]: field === "cpf" ? normalizeCpf(value) : value,
    }));
    setRequestError(null);
  };

  const currentStepIsValid = () => {
    if (requestStep === 0) return requestForm.studentName.trim().length >= 3;
    if (requestStep === 1) return requestForm.cpf.length === 11;
    if (requestStep === 2) return Boolean(requestForm.certificateReceived);
    if (requestStep === 3) return requestForm.courseName.trim().length >= 3;
    if (requestStep === 4) return Boolean(requestForm.completionPeriod);
    return true;
  };

  const openRequestDialog = () => {
    setRequestForm(EMPTY_REQUEST_FORM);
    setRequestStep(0);
    setRequestError(null);
    setRequestFile(null);
    setRequestOpen(true);
  };

  const handleRequestFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setRequestFile(null);
      return;
    }
    if (!isPdfFile(file)) {
      event.target.value = "";
      setRequestFile(null);
      setRequestError("Envie o certificado em formato PDF.");
      return;
    }
    if (file.size > MAX_CERTIFICATE_FILE_SIZE_BYTES) {
      event.target.value = "";
      setRequestFile(null);
      setRequestError("O PDF deve ter no maximo 20 MB.");
      return;
    }
    setRequestFile(file);
    setRequestError(null);
  };

  const goToNextRequestStep = () => {
    if (!currentStepIsValid()) {
      setRequestError("Preencha esta informacao para continuar.");
      return;
    }
    setRequestError(null);
    setRequestStep((step) => Math.min(step + 1, 4));
  };

  const submitCertificateRequest = async () => {
    if (!currentStepIsValid()) {
      setRequestError("Preencha esta informacao para continuar.");
      return;
    }

    setRequestSubmitting(true);
    setRequestError(null);

    try {
      const body = new FormData();
      Object.entries(requestForm).forEach(([key, value]) => body.append(key, value));
      if (requestFile) body.append("document", requestFile);
      const response = await fetch("/api/certificate-inclusion-request", {
        method: "POST",
        body,
      });
      const data = await response.json().catch(() => ({}));
      const redirectUrl = data.redirectUrl || buildFallbackRedirectUrl(requestForm);

      if (!response.ok) {
        throw new Error(data.message || "Nao foi possivel preparar a solicitacao.");
      }

      window.location.href = redirectUrl;
    } catch (error) {
      if (requestFile) {
        setRequestError(
          error instanceof Error
            ? error.message
            : "Nao foi possivel enviar o PDF. Tente novamente.",
        );
      } else {
        window.location.href = buildFallbackRedirectUrl(requestForm);
      }
    } finally {
      setRequestSubmitting(false);
    }
  };

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
                <div className="mt-5 rounded-xl border bg-muted/40 p-4">
                  <p className="text-sm font-semibold">Seu certificado ainda nao aparece?</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Solicite a inclusao no website. A secretaria recebe os dados e voce tambem envia a mensagem pronta.
                  </p>
                  <Button type="button" variant="outline" className="mt-3 w-full" onClick={openRequestDialog}>
                    <Send className="mr-2 h-4 w-4" />
                    Solicitar inclusao do certificado no website
                  </Button>
                </div>
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
      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Solicitar inclusao do certificado</DialogTitle>
            <DialogDescription>
              Responda as perguntas abaixo. No final vamos preparar a solicitacao para a secretaria.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3, 4].map((step) => (
                <span
                  key={step}
                  className={`h-2 flex-1 rounded-full ${step <= requestStep ? "bg-primary" : "bg-muted"}`}
                />
              ))}
            </div>

            {requestStep === 0 && (
              <div className="space-y-2">
                <Label htmlFor="request-student-name">Qual seu nome?</Label>
                <Input
                  id="request-student-name"
                  value={requestForm.studentName}
                  onChange={(event) => updateRequestForm("studentName", event.target.value)}
                  placeholder="Digite seu nome completo"
                  autoFocus
                />
              </div>
            )}

            {requestStep === 1 && (
              <div className="space-y-2">
                <Label htmlFor="request-cpf">CPF</Label>
                <Input
                  id="request-cpf"
                  value={formatCpf(requestForm.cpf)}
                  onChange={(event) => updateRequestForm("cpf", event.target.value)}
                  inputMode="numeric"
                  maxLength={14}
                  placeholder="000.000.000-00"
                  autoFocus
                />
              </div>
            )}

            {requestStep === 2 && (
              <div className="space-y-3">
                <Label>Voce ja recebeu o certificado digital ou fisico?</Label>
                <div className="grid gap-2">
                  {CERTIFICATE_RECEIVED_OPTIONS.map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant={requestForm.certificateReceived === option ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => updateRequestForm("certificateReceived", option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {requestStep === 3 && (
              <div className="space-y-2">
                <Label htmlFor="request-course">Nome do curso concluido</Label>
                <Input
                  id="request-course"
                  value={requestForm.courseName}
                  onChange={(event) => updateRequestForm("courseName", event.target.value)}
                  placeholder="Ex: Tecnico em Seguranca do Trabalho"
                  autoFocus
                />
              </div>
            )}

            {requestStep === 4 && (
              <div className="space-y-3">
                <Label>Data de conclusao</Label>
                <div className="grid grid-cols-2 gap-2">
                  {COMPLETION_PERIOD_OPTIONS.map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant={requestForm.completionPeriod === option ? "default" : "outline"}
                      onClick={() => updateRequestForm("completionPeriod", option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Se lembrar uma data exata, a secretaria pode ajustar depois no atendimento.
                </p>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <Label htmlFor="request-certificate-file" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Anexar certificado em PDF (opcional)
                  </Label>
                  <Input
                    id="request-certificate-file"
                    type="file"
                    accept="application/pdf,.pdf"
                    className="mt-2"
                    onChange={handleRequestFile}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Se voce ja tem o arquivo digital, envie-o para agilizar a validacao. Limite: 20 MB.
                  </p>
                  {requestFile && (
                    <p className="mt-2 text-sm">
                      <strong>{requestFile.name}</strong> ({formatFileSize(requestFile.size)})
                    </p>
                  )}
                </div>
              </div>
            )}

            {requestError && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{requestError}</p>}
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => (requestStep === 0 ? setRequestOpen(false) : setRequestStep((step) => step - 1))}
              disabled={requestSubmitting}
            >
              {requestStep === 0 ? "Cancelar" : "Voltar"}
            </Button>
            {requestStep < 4 ? (
              <Button type="button" onClick={goToNextRequestStep}>
                Continuar
              </Button>
            ) : (
              <Button type="button" onClick={submitCertificateRequest} disabled={requestSubmitting}>
                {requestSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Enviar solicitacao
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
};

export default CertificadosConsulta;
