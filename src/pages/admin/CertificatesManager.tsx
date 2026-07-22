import { ChangeEvent, useEffect, useState } from "react";
import QRCode from "qrcode";
import { supabase } from "@/integrations/supabase/client.ts";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { toast } from "sonner";
import {
  Plus,
  Copy,
  QrCode,
  Pencil,
  Trash2,
  ExternalLink,
  Download,
  RefreshCw,
  FileDown,
  Upload,
  FileText,
  School,
  Loader2,
} from "lucide-react";
import { emitCertificatePdf, resolveRegistryNumbers } from "@/lib/certificatePdf.ts";
import {
  buildCertificateStoragePath,
  CERTIFICATE_FILES_BUCKET,
  formatFileSize,
  getCertificateFilePublicUrl,
  isPdfFile,
  MAX_CERTIFICATE_FILE_SIZE_BYTES,
} from "@/lib/certificateFiles.ts";

type CertificateSourceType = "generated" | "external_pdf";

interface Certificate {
  id: string;
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
  is_active: boolean;
  content: string | null;
  source_type: CertificateSourceType | null;
  external_file_path: string | null;
  external_file_name: string | null;
  external_file_size: number | null;
  external_file_mime_type: string | null;
}

interface CertificateForm {
  code: string;
  student_name: string;
  cpf: string;
  course_name: string;
  course_slug: string;
  hours: number;
  completion_date: string;
  book_number: string;
  page_number: string;
  content: string;
  institution: string;
  is_active: boolean;
  source_type: CertificateSourceType;
  external_file_path: string;
  external_file_name: string;
  external_file_size: number | null;
  external_file_mime_type: string;
}

const emptyForm: CertificateForm = {
  code: "",
  student_name: "",
  cpf: "",
  course_name: "",
  course_slug: "",
  hours: 60,
  completion_date: new Date().toISOString().slice(0, 10),
  book_number: "",
  page_number: "",
  content: "",
  institution: "FAESDE",
  is_active: true,
  source_type: "generated",
  external_file_path: "",
  external_file_name: "",
  external_file_size: null,
  external_file_mime_type: "",
};

const generateCode = () => {
  let code = "";
  for (let i = 0; i < 24; i++) code += Math.floor(Math.random() * 10).toString();
  return code;
};

const buildCertUrl = (code: string) => `https://faesde.com.br/certificados/${code}`;

const getSourceType = (certificate: Certificate): CertificateSourceType =>
  certificate.source_type === "external_pdf" ? "external_pdf" : "generated";

const CertificatesManager = () => {
  const [list, setList] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [externalSchemaReady, setExternalSchemaReady] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState<Certificate | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [editing, setEditing] = useState<Certificate | null>(null);
  const [form, setForm] = useState<CertificateForm>(emptyForm);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Erro ao carregar certificados");
    setList((data as Certificate[]) || []);
    setLoading(false);
  };

  const checkExternalSchema = async () => {
    const { error } = await supabase
      .from("certificates")
      .select("source_type,external_file_path")
      .limit(1);

    setExternalSchemaReady(!error);
  };

  useEffect(() => {
    load();
    checkExternalSchema();
  }, []);

  useEffect(() => {
    if (qrOpen) {
      QRCode.toDataURL(buildCertUrl(qrOpen.code), { width: 400, margin: 2 }).then(
        setQrDataUrl
      );
    } else {
      setQrDataUrl("");
    }
  }, [qrOpen]);

  const openCreate = (sourceType: CertificateSourceType = "generated") => {
    const code = generateCode();
    const completion_date = new Date().toISOString().slice(0, 10);
    const registry = resolveRegistryNumbers({
      code,
      student_name: "",
      course_name: "",
      completion_date,
      book_number: "",
      page_number: "",
    });
    setEditing(null);
    setCertificateFile(null);
    setForm({
      ...emptyForm,
      code,
      completion_date,
      book_number: registry.book_number,
      page_number: registry.page_number,
      content: "",
      source_type: sourceType,
      institution: sourceType === "external_pdf" ? "" : "FAESDE",
    });
    setDialogOpen(true);
  };

  const openEdit = (c: Certificate) => {
    setEditing(c);
    setCertificateFile(null);
    setForm({
      code: c.code,
      student_name: c.student_name,
      cpf: c.cpf || "",
      course_name: c.course_name,
      course_slug: c.course_slug || "",
      hours: c.hours,
      completion_date: c.completion_date,
      book_number: c.book_number || "",
      page_number: c.page_number || "",
      content: c.content || "",
      institution: c.institution || (getSourceType(c) === "external_pdf" ? "" : "FAESDE"),
      is_active: c.is_active,
      source_type: getSourceType(c),
      external_file_path: c.external_file_path || "",
      external_file_name: c.external_file_name || "",
      external_file_size: c.external_file_size || null,
      external_file_mime_type: c.external_file_mime_type || "",
    });
    setDialogOpen(true);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setCertificateFile(null);
      return;
    }

    if (!isPdfFile(file)) {
      toast.error("Envie apenas arquivos PDF.");
      event.target.value = "";
      setCertificateFile(null);
      return;
    }

    if (file.size > MAX_CERTIFICATE_FILE_SIZE_BYTES) {
      toast.error("O PDF deve ter no maximo 20 MB.");
      event.target.value = "";
      setCertificateFile(null);
      return;
    }

    setCertificateFile(file);
  };

  const uploadExternalPdf = async () => {
    if (!certificateFile) {
      return {
        path: form.external_file_path || null,
        name: form.external_file_name || null,
        size: form.external_file_size || null,
        mimeType: form.external_file_mime_type || null,
        uploadedPath: null,
      };
    }

    const path = buildCertificateStoragePath(form.code, certificateFile.name);
    const { error } = await supabase.storage
      .from(CERTIFICATE_FILES_BUCKET)
      .upload(path, certificateFile, {
        upsert: false,
        contentType: certificateFile.type || "application/pdf",
      });

    if (error) {
      throw new Error(`Erro ao enviar PDF: ${error.message}`);
    }

    return {
      path,
      name: certificateFile.name,
      size: certificateFile.size,
      mimeType: certificateFile.type || "application/pdf",
      uploadedPath: path,
    };
  };

  const save = async () => {
    if (!/^[0-9]{24}$/.test(form.code)) {
      toast.error("O codigo deve conter exatamente 24 digitos numericos.");
      return;
    }
    if (!form.student_name || !form.course_name) {
      toast.error("Preencha nome do aluno e do curso.");
      return;
    }
    if (form.source_type === "external_pdf" && !certificateFile && !form.external_file_path) {
      toast.error("Envie o PDF do certificado externo.");
      return;
    }
    if (form.source_type === "external_pdf" && !externalSchemaReady) {
      toast.error("A migration de certificados externos ainda precisa ser aplicada no banco.");
      return;
    }

    setSaving(true);
    let uploadedPath: string | null = null;

    try {
      const registry = resolveRegistryNumbers({
        code: form.code,
        student_name: form.student_name,
        course_name: form.course_name,
        completion_date: form.completion_date,
        book_number: form.book_number,
        page_number: form.page_number,
      });

      const external =
        form.source_type === "external_pdf"
          ? await uploadExternalPdf()
          : { path: null, name: null, size: null, mimeType: null, uploadedPath: null };
      uploadedPath = external.uploadedPath;

      const legacyPayload = {
        code: form.code,
        student_name: form.student_name,
        cpf: form.cpf || null,
        course_name: form.course_name,
        course_slug: form.course_slug || null,
        content: form.source_type === "generated" ? form.content || null : form.content || null,
        hours: Number(form.hours) || 0,
        completion_date: form.completion_date,
        book_number: registry.book_number,
        page_number: registry.page_number,
        institution: form.institution || (form.source_type === "generated" ? "FAESDE" : null),
        is_active: form.is_active,
      };

      const payload = externalSchemaReady ? {
        ...legacyPayload,
        source_type: form.source_type,
        external_file_path: external.path,
        external_file_name: external.name,
        external_file_size: external.size,
        external_file_mime_type: external.mimeType,
      } : legacyPayload;

      const { error } = editing
        ? await supabase.from("certificates").update(payload).eq("id", editing.id)
        : await supabase.from("certificates").insert(payload);

      if (error) {
        if (uploadedPath) await supabase.storage.from(CERTIFICATE_FILES_BUCKET).remove([uploadedPath]);
        throw new Error(error.message);
      }

      if (uploadedPath && editing?.external_file_path && editing.external_file_path !== uploadedPath) {
        await supabase.storage.from(CERTIFICATE_FILES_BUCKET).remove([editing.external_file_path]);
      }

      toast.success(editing ? "Certificado atualizado" : "Certificado criado");
      setDialogOpen(false);
      setCertificateFile(null);
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar certificado");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: Certificate) => {
    if (!confirm(`Excluir o certificado de ${c.student_name}?`)) return;
    const { error } = await supabase.from("certificates").delete().eq("id", c.id);
    if (error) return toast.error(error.message);
    if (c.external_file_path) {
      await supabase.storage.from(CERTIFICATE_FILES_BUCKET).remove([c.external_file_path]);
    }
    toast.success("Certificado excluido");
    load();
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const downloadQr = () => {
    if (!qrDataUrl || !qrOpen) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `qrcode-${qrOpen.code}.png`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Certificados</h1>
          <p className="text-sm text-muted-foreground">
            Gere certificados FAESDE ou disponibilize PDFs emitidos por outras escolas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => openCreate("external_pdf")} disabled={!externalSchemaReady}>
            <Upload className="mr-2 h-4 w-4" /> Upload PDF externo
          </Button>
          <Button onClick={() => openCreate("generated")}>
            <Plus className="mr-2 h-4 w-4" /> Novo certificado FAESDE
          </Button>
        </div>
      </div>

      {!externalSchemaReady && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          A migration de certificados externos ainda nao foi aplicada no banco. Enquanto isso, certificados FAESDE
          continuam funcionando; o upload de PDF externo sera liberado assim que o SQL criar as colunas e o bucket
          <strong> certificate-files</strong>.
        </div>
      )}

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Codigo</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Aluno</TableHead>
              <TableHead>Curso</TableHead>
              <TableHead>Horas</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : list.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhum certificado cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              list.map((c) => {
                const sourceType = getSourceType(c);
                const externalUrl = getCertificateFilePublicUrl(c.external_file_path);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">{c.code}</TableCell>
                    <TableCell>
                      <Badge variant={sourceType === "external_pdf" ? "outline" : "secondary"}>
                        {sourceType === "external_pdf" ? "PDF externo" : "FAESDE"}
                      </Badge>
                    </TableCell>
                    <TableCell>{c.student_name}</TableCell>
                    <TableCell className="max-w-xs truncate">{c.course_name}</TableCell>
                    <TableCell>{c.hours > 0 ? `${c.hours}h` : "-"}</TableCell>
                    <TableCell>{c.completion_date.split("-").reverse().join("/")}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="icon" variant="ghost" title="Copiar codigo" onClick={() => copy(c.code, "Codigo")}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" title="QR Code" onClick={() => setQrOpen(c)}>
                        <QrCode className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" title="Abrir pagina" onClick={() => window.open(buildCertUrl(c.code), "_blank")}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      {sourceType === "external_pdf" && externalUrl ? (
                        <Button size="icon" variant="ghost" title="Abrir PDF externo" onClick={() => window.open(externalUrl, "_blank")}>
                          <FileText className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button size="icon" variant="ghost" title="Baixar PDF" onClick={async () => {
                          try { await emitCertificatePdf(c); toast.success("PDF gerado"); }
                          catch (error) { toast.error(error instanceof Error ? error.message : "Erro ao gerar PDF"); }
                        }}>
                          <FileDown className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" title="Editar" onClick={() => openEdit(c)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" title="Excluir" onClick={() => remove(c)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar certificado" : "Novo certificado"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label>Tipo de certificado</Label>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  variant={form.source_type === "generated" ? "default" : "outline"}
                  onClick={() => setForm({ ...form, source_type: "generated", institution: form.institution || "FAESDE" })}
                >
                  <School className="mr-2 h-4 w-4" />
                  Gerado pela FAESDE
                </Button>
                <Button
                  type="button"
                  variant={form.source_type === "external_pdf" ? "default" : "outline"}
                  onClick={() => setForm({ ...form, source_type: "external_pdf", institution: form.institution === "FAESDE" ? "" : form.institution })}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  PDF de outra escola
                </Button>
              </div>
            </div>

            <div>
              <Label>Codigo de consulta (24 digitos)</Label>
              <div className="flex gap-2">
                <Input
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.replace(/\D/g, "").slice(0, 24) })
                  }
                  maxLength={24}
                  className="font-mono"
                  disabled={!!editing}
                />
                {!editing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const code = generateCode();
                      const registry = resolveRegistryNumbers({
                        ...form,
                        code,
                      });
                      setForm({ ...form, code, book_number: registry.book_number, page_number: registry.page_number });
                    }}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={() => copy(form.code, "Codigo")}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome do aluno *</Label>
                <Input value={form.student_name} onChange={(e) => setForm({ ...form, student_name: e.target.value })} />
              </div>
              <div>
                <Label>CPF</Label>
                <Input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} placeholder="000.000.000-00" />
              </div>
            </div>

            <div>
              <Label>Nome do curso *</Label>
              <Input value={form.course_name} onChange={(e) => setForm({ ...form, course_name: e.target.value })} />
            </div>

            <div>
              <Label>Slug do curso (opcional, para link)</Label>
              <Input value={form.course_slug} onChange={(e) => setForm({ ...form, course_slug: e.target.value })} placeholder="ex: tecnico-em-radiologia" />
            </div>

            {form.source_type === "external_pdf" && (
              <div className="rounded-lg border bg-muted/30 p-4">
                <Label htmlFor="external-certificate-file">PDF do certificado externo *</Label>
                <Input
                  id="external-certificate-file"
                  type="file"
                  accept="application/pdf,.pdf"
                  className="mt-2"
                  onChange={handleFileChange}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  O arquivo sera salvo no bucket de certificados e disponibilizado no link publico de consulta. Limite: 20 MB.
                </p>
                {certificateFile && (
                  <p className="mt-2 text-sm">
                    Novo arquivo: <strong>{certificateFile.name}</strong> ({formatFileSize(certificateFile.size)})
                  </p>
                )}
                {!certificateFile && form.external_file_path && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                    <span>
                      Arquivo atual: <strong>{form.external_file_name || "PDF enviado"}</strong>
                      {formatFileSize(form.external_file_size) && ` (${formatFileSize(form.external_file_size)})`}
                    </span>
                    <Button asChild size="sm" variant="outline">
                      <a href={getCertificateFilePublicUrl(form.external_file_path)} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Abrir
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div>
              <Label>Conteudo programatico</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder={`13.1 Objetivo e Campo de Aplicacao\n13.2 Disposicoes Gerais\n13.3 Disposicoes Gerais para Caldeiras, Vasos de Pressao, Tubulacoes e Tanques`}
                rows={form.source_type === "external_pdf" ? 5 : 10}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Para PDF externo, este campo e opcional e serve apenas como resumo/observacao da consulta.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Carga horaria</Label>
                <Input type="number" value={form.hours} onChange={(e) => setForm({ ...form, hours: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <Label>Data de conclusao</Label>
                <Input type="date" value={form.completion_date} onChange={(e) => setForm({ ...form, completion_date: e.target.value })} />
              </div>
              <div>
                <Label>{form.source_type === "external_pdf" ? "Instituicao emissora" : "Instituicao"}</Label>
                <Input
                  value={form.institution}
                  onChange={(e) => setForm({ ...form, institution: e.target.value })}
                  placeholder={form.source_type === "external_pdf" ? "Ex: Sistema de Ensino Integrado" : "FAESDE"}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Livro no.</Label>
                <Input value={form.book_number} onChange={(e) => setForm({ ...form, book_number: e.target.value })} />
              </div>
              <div>
                <Label>Folha no.</Label>
                <Input value={form.page_number} onChange={(e) => setForm({ ...form, page_number: e.target.value })} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>Ativo (visivel publicamente)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancelar</Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!qrOpen} onOpenChange={(o) => !o && setQrOpen(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code do certificado</DialogTitle>
          </DialogHeader>
          {qrOpen && (
            <div className="space-y-4">
              <div className="flex justify-center bg-white p-4 rounded-lg">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code" className="w-64 h-64" />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center text-muted-foreground">
                    Gerando...
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Codigo</Label>
                <div className="flex gap-2">
                  <Input value={qrOpen.code} readOnly className="font-mono text-xs" />
                  <Button variant="outline" size="icon" onClick={() => copy(qrOpen.code, "Codigo")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Label className="text-xs">Link publico</Label>
                <div className="flex gap-2">
                  <Input value={buildCertUrl(qrOpen.code)} readOnly className="text-xs" />
                  <Button variant="outline" size="icon" onClick={() => copy(buildCertUrl(qrOpen.code), "Link")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={downloadQr} className="flex-1">
                  <Download className="mr-2 h-4 w-4" /> Baixar QR Code
                </Button>
                <Button variant="outline" onClick={() => window.open(buildCertUrl(qrOpen.code), "_blank")}>
                  <ExternalLink className="mr-2 h-4 w-4" /> Abrir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CertificatesManager;
