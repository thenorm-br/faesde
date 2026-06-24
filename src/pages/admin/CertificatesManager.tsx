import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Copy, QrCode, Pencil, Trash2, ExternalLink, Download, RefreshCw, FileDown } from "lucide-react";
import { emitCertificateDocx } from "@/lib/certificateEmitter";

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
}

const emptyForm = {
  code: "",
  student_name: "",
  cpf: "",
  course_name: "",
  course_slug: "",
  hours: 60,
  completion_date: new Date().toISOString().slice(0, 10),
  book_number: "",
  page_number: "",
  institution: "FAESDE",
  is_active: true,
};

const generateCode = () => {
  let code = "";
  for (let i = 0; i < 24; i++) code += Math.floor(Math.random() * 10).toString();
  return code;
};

const buildCertUrl = (code: string) =>
  `https://www.faesde.com.br/certificados/${code}`;

const CertificatesManager = () => {
  const [list, setList] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState<Certificate | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [editing, setEditing] = useState<Certificate | null>(null);
  const [form, setForm] = useState(emptyForm);

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

  useEffect(() => {
    load();
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

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, code: generateCode() });
    setDialogOpen(true);
  };

  const openEdit = (c: Certificate) => {
    setEditing(c);
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
      institution: c.institution || "FAESDE",
      is_active: c.is_active,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!/^[0-9]{24}$/.test(form.code)) {
      toast.error("O código deve conter exatamente 24 dígitos numéricos.");
      return;
    }
    if (!form.student_name || !form.course_name) {
      toast.error("Preencha nome do aluno e do curso.");
      return;
    }
    const payload = {
      ...form,
      cpf: form.cpf || null,
      course_slug: form.course_slug || null,
      book_number: form.book_number || null,
      page_number: form.page_number || null,
    };
    const { error } = editing
      ? await supabase.from("certificates").update(payload).eq("id", editing.id)
      : await supabase.from("certificates").insert(payload);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editing ? "Certificado atualizado" : "Certificado criado");
    setDialogOpen(false);
    load();
  };

  const remove = async (c: Certificate) => {
    if (!confirm(`Excluir o certificado de ${c.student_name}?`)) return;
    const { error } = await supabase.from("certificates").delete().eq("id", c.id);
    if (error) return toast.error(error.message);
    toast.success("Certificado excluído");
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Certificados</h1>
          <p className="text-sm text-muted-foreground">
            Gere páginas públicas de validação de certificado.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Novo certificado
        </Button>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Aluno</TableHead>
              <TableHead>Curso</TableHead>
              <TableHead>Horas</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : list.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum certificado cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              list.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs">{c.code}</TableCell>
                  <TableCell>{c.student_name}</TableCell>
                  <TableCell className="max-w-xs truncate">{c.course_name}</TableCell>
                  <TableCell>{c.hours}h</TableCell>
                  <TableCell>{c.completion_date.split("-").reverse().join("/")}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="icon" variant="ghost" title="Copiar código" onClick={() => copy(c.code, "Código")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" title="QR Code" onClick={() => setQrOpen(c)}>
                      <QrCode className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" title="Abrir página" onClick={() => window.open(buildCertUrl(c.code), "_blank")}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" title="Baixar .docx" onClick={async () => {
                      try { await emitCertificateDocx(c); toast.success("Certificado gerado"); }
                      catch (e: any) { toast.error(e?.message || "Erro ao gerar"); }
                    }}>
                      <FileDown className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" title="Editar" onClick={() => openEdit(c)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" title="Excluir" onClick={() => remove(c)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar certificado" : "Novo certificado"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label>Código (24 dígitos)</Label>
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
                  <Button type="button" variant="outline" onClick={() => setForm({ ...form, code: generateCode() })}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={() => copy(form.code, "Código")}>
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
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Carga horária</Label>
                <Input type="number" value={form.hours} onChange={(e) => setForm({ ...form, hours: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <Label>Data de conclusão</Label>
                <Input type="date" value={form.completion_date} onChange={(e) => setForm({ ...form, completion_date: e.target.value })} />
              </div>
              <div>
                <Label>Instituição</Label>
                <Input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Livro nº</Label>
                <Input value={form.book_number} onChange={(e) => setForm({ ...form, book_number: e.target.value })} />
              </div>
              <div>
                <Label>Folha nº</Label>
                <Input value={form.page_number} onChange={(e) => setForm({ ...form, page_number: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>Ativo (visível publicamente)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={save}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Dialog */}
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
                <Label className="text-xs">Código</Label>
                <div className="flex gap-2">
                  <Input value={qrOpen.code} readOnly className="font-mono text-xs" />
                  <Button variant="outline" size="icon" onClick={() => copy(qrOpen.code, "Código")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Label className="text-xs">Link público</Label>
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
