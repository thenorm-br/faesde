import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Pencil, Trash2, Search, History } from "lucide-react";

interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  category: string;
  original_price: string | null;
  promo_price: string | null;
  installment: string | null;
  hours: number | null;
  duration_range: string | null;
  certification: string | null;
  image_url: string | null;
  banner_image_url: string | null;
  youtube_video_id: string | null;
  is_active: boolean;
  created_at: string;
}

interface AuditEntry {
  id: string;
  action: string;
  user_email: string | null;
  changed_fields: any;
  old_values: any;
  new_values: any;
  created_at: string;
}

const emptyCourse = {
  slug: "",
  title: "",
  subtitle: "",
  description: "",
  category: "extensao",
  original_price: "",
  promo_price: "",
  installment: "",
  hours: 0,
  duration_range: "",
  certification: "",
  image_url: "",
  banner_image_url: "",
  youtube_video_id: "",
  is_active: true,
};

const FIELD_LABELS: Record<string, string> = {
  title: "Título", slug: "Slug", subtitle: "Subtítulo", description: "Descrição",
  category: "Categoria", original_price: "Preço Original", promo_price: "Preço Promo",
  installment: "Parcela", hours: "Carga Horária", duration_range: "Duração",
  certification: "Certificação", image_url: "Imagem", banner_image_url: "Banner",
  youtube_video_id: "YouTube ID", is_active: "Ativo", about_course: "Sobre o curso",
};

const CoursesManager = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [originalCourse, setOriginalCourse] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [inlineEdit, setInlineEdit] = useState<{ id: string; field: string; value: string } | null>(null);
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    const { data, error } = await supabase.from("courses").select("*").order("title");
    if (error) {
      toast({ title: "Erro ao carregar cursos", description: error.message, variant: "destructive" });
    } else {
      setCourses(data || []);
    }
    setLoading(false);
  };

  const logAudit = async (courseId: string, action: string, oldVals: any, newVals: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    const changed: string[] = [];
    if (oldVals && newVals) {
      Object.keys(newVals).forEach((k) => {
        if (JSON.stringify(oldVals[k]) !== JSON.stringify(newVals[k])) changed.push(k);
      });
    }
    await supabase.from("course_audit_log").insert({
      course_id: courseId,
      user_id: user?.id,
      user_email: user?.email,
      action,
      changed_fields: changed,
      old_values: oldVals,
      new_values: newVals,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingCourse.id) {
        const { id, created_at, updated_at, ...updateData } = editingCourse;
        const { error } = await supabase.from("courses").update(updateData).eq("id", id);
        if (error) throw error;
        await logAudit(id, "update", originalCourse, updateData);
        toast({ title: "Curso atualizado!" });
      } else {
        const { data, error } = await supabase.from("courses").insert(editingCourse).select().single();
        if (error) throw error;
        if (data) await logAudit(data.id, "create", null, editingCourse);
        toast({ title: "Curso criado!" });
      }
      setIsDialogOpen(false);
      fetchCourses();
    } catch (error: any) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este curso?")) return;
    const courseToDelete = courses.find((c) => c.id === id);
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      await logAudit(id, "delete", courseToDelete, null);
      toast({ title: "Curso excluído!" });
      fetchCourses();
    }
  };

  const handleToggleActive = async (id: string, currentValue: boolean) => {
    const { error } = await supabase.from("courses").update({ is_active: !currentValue }).eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      await logAudit(id, "update", { is_active: currentValue }, { is_active: !currentValue });
      fetchCourses();
    }
  };

  const handleInlineSave = async () => {
    if (!inlineEdit) return;
    const course = courses.find((c) => c.id === inlineEdit.id);
    if (!course) return;
    const oldVal = (course as any)[inlineEdit.field];
    if (oldVal === inlineEdit.value) { setInlineEdit(null); return; }
    const { error } = await supabase
      .from("courses")
      .update({ [inlineEdit.field]: inlineEdit.value })
      .eq("id", inlineEdit.id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      await logAudit(inlineEdit.id, "quick_edit", { [inlineEdit.field]: oldVal }, { [inlineEdit.field]: inlineEdit.value });
      toast({ title: "Atualizado!" });
      fetchCourses();
    }
    setInlineEdit(null);
  };

  const openAudit = async (courseId: string) => {
    setAuditOpen(true);
    setAuditLoading(true);
    const { data, error } = await supabase
      .from("course_audit_log")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (!error) setAuditEntries(data || []);
    setAuditLoading(false);
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderInlineCell = (course: Course, field: "promo_price" | "installment" | "original_price") => {
    const isEditing = inlineEdit?.id === course.id && inlineEdit?.field === field;
    if (isEditing) {
      return (
        <Input
          autoFocus
          value={inlineEdit!.value}
          onChange={(e) => setInlineEdit({ ...inlineEdit!, value: e.target.value })}
          onBlur={handleInlineSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleInlineSave();
            if (e.key === "Escape") setInlineEdit(null);
          }}
          className="h-8 text-sm"
        />
      );
    }
    return (
      <span
        onDoubleClick={() => setInlineEdit({ id: course.id, field, value: (course as any)[field] || "" })}
        className="cursor-pointer rounded px-2 py-1 hover:bg-muted/50"
        title="Duplo clique para editar"
      >
        {(course as any)[field] || "—"}
      </span>
    );
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Gerenciar Cursos</h2>

        {/* Actions bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar cursos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => { setEditingCourse({ ...emptyCourse }); setOriginalCourse(null); setIsDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Novo Curso
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-card p-4 shadow-sm border border-border">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-3xl font-bold text-foreground">{courses.length}</p>
          </div>
          <div className="rounded-xl bg-card p-4 shadow-sm border border-border">
            <p className="text-sm text-muted-foreground">Ativos</p>
            <p className="text-3xl font-bold text-foreground">{courses.filter((c) => c.is_active).length}</p>
          </div>
          <div className="rounded-xl bg-card p-4 shadow-sm border border-border">
            <p className="text-sm text-muted-foreground">Inativos</p>
            <p className="text-3xl font-bold text-foreground">{courses.filter((c) => !c.is_active).length}</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">💡 Dica: dê duplo clique nos campos de preço ou parcela para editar rapidamente.</p>

        {/* Table */}
        {loading ? (
          <p className="text-center text-muted-foreground">Carregando...</p>
        ) : (
          <div className="rounded-xl bg-card shadow-sm border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Curso</TableHead>
                  <TableHead className="hidden md:table-cell">Categoria</TableHead>
                  <TableHead className="hidden md:table-cell">Preço Promo</TableHead>
                  <TableHead className="hidden md:table-cell">Parcela</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {course.image_url && (
                          <img src={course.image_url} alt="" className="hidden h-10 w-16 rounded object-cover sm:block" />
                        )}
                        <div>
                          <p className="font-medium text-foreground line-clamp-1">{course.title}</p>
                          <p className="text-xs text-muted-foreground">{course.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{course.category}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{renderInlineCell(course, "promo_price")}</TableCell>
                    <TableCell className="hidden md:table-cell">{renderInlineCell(course, "installment")}</TableCell>
                    <TableCell>
                      <Switch checked={course.is_active} onCheckedChange={() => handleToggleActive(course.id, course.is_active)} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingCourse({ ...course }); setOriginalCourse({ ...course }); setIsDialogOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(course.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCourses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      Nenhum curso encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Edit/Create Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between pr-8">
                <DialogTitle>{editingCourse?.id ? "Editar Curso" : "Novo Curso"}</DialogTitle>
                {editingCourse?.id && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={() => openAudit(editingCourse.id)}>
                        <History className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Auditar</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </DialogHeader>
            {editingCourse && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label>Título</Label>
                    <Input value={editingCourse.title} onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug (URL)</Label>
                    <Input value={editingCourse.slug} onChange={(e) => setEditingCourse({ ...editingCourse, slug: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={editingCourse.category}
                      onChange={(e) => setEditingCourse({ ...editingCourse, category: e.target.value })}
                    >
                      <option value="extensao">Curso por Extensão</option>
                      <option value="competencia">Certificação por Competência</option>
                      <option value="pos-tecnico">Pós-Técnico</option>
                      <option value="segundo-grau">Segundo Grau (EJA)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Subtítulo</Label>
                  <Input value={editingCourse.subtitle || ""} onChange={(e) => setEditingCourse({ ...editingCourse, subtitle: e.target.value })} />
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea value={editingCourse.description || ""} onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })} rows={3} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Preço Original</Label>
                    <Input value={editingCourse.original_price || ""} onChange={(e) => setEditingCourse({ ...editingCourse, original_price: e.target.value })} placeholder="R$ 2.500,00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Preço Promo</Label>
                    <Input value={editingCourse.promo_price || ""} onChange={(e) => setEditingCourse({ ...editingCourse, promo_price: e.target.value })} placeholder="R$ 1.500,00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Parcela</Label>
                    <Input value={editingCourse.installment || ""} onChange={(e) => setEditingCourse({ ...editingCourse, installment: e.target.value })} placeholder="12x R$ 125,00" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Carga Horária</Label>
                    <Input type="number" value={editingCourse.hours || ""} onChange={(e) => setEditingCourse({ ...editingCourse, hours: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Duração</Label>
                    <Input value={editingCourse.duration_range || ""} onChange={(e) => setEditingCourse({ ...editingCourse, duration_range: e.target.value })} placeholder="6 a 12 meses" />
                  </div>
                  <div className="space-y-2">
                    <Label>Certificação</Label>
                    <Input value={editingCourse.certification || ""} onChange={(e) => setEditingCourse({ ...editingCourse, certification: e.target.value })} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>URL da Imagem</Label>
                    <Input value={editingCourse.image_url || ""} onChange={(e) => setEditingCourse({ ...editingCourse, image_url: e.target.value })} />
                    {editingCourse.image_url && (
                      <img src={editingCourse.image_url} alt="Preview" className="mt-2 h-20 w-32 rounded object-cover" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>URL do Banner</Label>
                    <Input value={editingCourse.banner_image_url || ""} onChange={(e) => setEditingCourse({ ...editingCourse, banner_image_url: e.target.value })} />
                    {editingCourse.banner_image_url && (
                      <img src={editingCourse.banner_image_url} alt="Preview" className="mt-2 h-20 w-32 rounded object-cover" />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>YouTube Video ID</Label>
                  <Input value={editingCourse.youtube_video_id || ""} onChange={(e) => setEditingCourse({ ...editingCourse, youtube_video_id: e.target.value })} />
                </div>

                <div className="flex items-center gap-2">
                  <Switch checked={editingCourse.is_active} onCheckedChange={(checked) => setEditingCourse({ ...editingCourse, is_active: checked })} />
                  <Label>Curso ativo</Label>
                </div>

                <Button onClick={handleSave} disabled={saving} className="w-full">
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Audit Dialog */}
        <Dialog open={auditOpen} onOpenChange={setAuditOpen}>
          <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History className="h-5 w-5" /> Histórico de Edições
              </DialogTitle>
            </DialogHeader>
            {auditLoading ? (
              <p className="text-center text-muted-foreground py-8">Carregando histórico...</p>
            ) : auditEntries.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhuma alteração registrada ainda.</p>
            ) : (
              <div className="space-y-3">
                {auditEntries.map((entry) => {
                  const date = new Date(entry.created_at);
                  const fields: string[] = Array.isArray(entry.changed_fields) ? entry.changed_fields : [];
                  return (
                    <div key={entry.id} className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium capitalize">
                          {entry.action === "create" ? "Criação" : entry.action === "delete" ? "Exclusão" : entry.action === "quick_edit" ? "Edição rápida" : "Edição"}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {date.toLocaleDateString("pt-BR")} {date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </span>
                      </div>
                      {entry.user_email && (
                        <p className="text-xs text-muted-foreground mb-2">por {entry.user_email}</p>
                      )}
                      {fields.length > 0 && (
                        <div className="space-y-1">
                          {fields.map((f) => (
                            <div key={f} className="text-xs">
                              <span className="font-medium text-foreground">{FIELD_LABELS[f] || f}:</span>{" "}
                              <span className="text-destructive line-through">{String(entry.old_values?.[f] ?? "—").slice(0, 60)}</span>
                              {" → "}
                              <span className="text-primary">{String(entry.new_values?.[f] ?? "—").slice(0, 60)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default CoursesManager;
