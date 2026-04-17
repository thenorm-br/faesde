import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { LogOut, Plus, Pencil, Trash2, Search } from "lucide-react";

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

const AdminDashboard = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchCourses();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/faesde-administration");
      return;
    }
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin");

    if (!roles || roles.length === 0) {
      await supabase.auth.signOut();
      navigate("/faesde-administration");
    }
  };

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("title");

    if (error) {
      toast({ title: "Erro ao carregar cursos", description: error.message, variant: "destructive" });
    } else {
      setCourses(data || []);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingCourse.id) {
        const { id, created_at, ...updateData } = editingCourse;
        const { error } = await supabase.from("courses").update(updateData).eq("id", id);
        if (error) throw error;
        toast({ title: "Curso atualizado!" });
      } else {
        const { error } = await supabase.from("courses").insert(editingCourse);
        if (error) throw error;
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
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Curso excluído!" });
      fetchCourses();
    }
  };

  const handleToggleActive = async (id: string, currentValue: boolean) => {
    const { error } = await supabase.from("courses").update({ is_active: !currentValue }).eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      fetchCourses();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/faesde-administration");
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openEdit = (course: Course) => {
    setEditingCourse({ ...course });
    setIsDialogOpen(true);
  };

  const openNew = () => {
    setEditingCourse({ ...emptyCourse });
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-foreground">FAESDE Admin</h1>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Actions bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar cursos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={openNew}>
            <Plus className="mr-2 h-4 w-4" /> Novo Curso
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Total de Cursos</p>
            <p className="text-3xl font-bold text-foreground">{courses.length}</p>
          </div>
          <div className="rounded-xl bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Ativos</p>
            <p className="text-3xl font-bold text-foreground">
              {courses.filter((c) => c.is_active).length}
            </p>
          </div>
          <div className="rounded-xl bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Inativos</p>
            <p className="text-3xl font-bold text-foreground">
              {courses.filter((c) => !c.is_active).length}
            </p>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-center text-muted-foreground">Carregando...</p>
        ) : (
          <div className="rounded-xl bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Curso</TableHead>
                  <TableHead className="hidden md:table-cell">Categoria</TableHead>
                  <TableHead className="hidden md:table-cell">Preço</TableHead>
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
                          <img
                            src={course.image_url}
                            alt=""
                            className="hidden h-10 w-16 rounded object-cover sm:block"
                          />
                        )}
                        <div>
                          <p className="font-medium text-foreground line-clamp-1">{course.title}</p>
                          <p className="text-xs text-muted-foreground">{course.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                        {course.category}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{course.promo_price || "—"}</TableCell>
                    <TableCell>
                      <Switch
                        checked={course.is_active}
                        onCheckedChange={() => handleToggleActive(course.id, course.is_active)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(course)}>
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
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      Nenhum curso encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCourse?.id ? "Editar Curso" : "Novo Curso"}</DialogTitle>
          </DialogHeader>
          {editingCourse && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={editingCourse.title}
                    onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug (URL)</Label>
                  <Input
                    value={editingCourse.slug}
                    onChange={(e) => setEditingCourse({ ...editingCourse, slug: e.target.value })}
                  />
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
                    <option value="encceja">ENCCEJA - Ensino Médio</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Subtítulo</Label>
                <Input
                  value={editingCourse.subtitle || ""}
                  onChange={(e) => setEditingCourse({ ...editingCourse, subtitle: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={editingCourse.description || ""}
                  onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Preço Original</Label>
                  <Input
                    value={editingCourse.original_price || ""}
                    onChange={(e) => setEditingCourse({ ...editingCourse, original_price: e.target.value })}
                    placeholder="R$ 2.500,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preço Promo</Label>
                  <Input
                    value={editingCourse.promo_price || ""}
                    onChange={(e) => setEditingCourse({ ...editingCourse, promo_price: e.target.value })}
                    placeholder="R$ 1.500,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Parcela</Label>
                  <Input
                    value={editingCourse.installment || ""}
                    onChange={(e) => setEditingCourse({ ...editingCourse, installment: e.target.value })}
                    placeholder="12x R$ 125,00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Carga Horária</Label>
                  <Input
                    type="number"
                    value={editingCourse.hours || ""}
                    onChange={(e) => setEditingCourse({ ...editingCourse, hours: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duração</Label>
                  <Input
                    value={editingCourse.duration_range || ""}
                    onChange={(e) => setEditingCourse({ ...editingCourse, duration_range: e.target.value })}
                    placeholder="6 a 12 meses"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Certificação</Label>
                  <Input
                    value={editingCourse.certification || ""}
                    onChange={(e) => setEditingCourse({ ...editingCourse, certification: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>URL da Imagem</Label>
                  <Input
                    value={editingCourse.image_url || ""}
                    onChange={(e) => setEditingCourse({ ...editingCourse, image_url: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL do Banner</Label>
                  <Input
                    value={editingCourse.banner_image_url || ""}
                    onChange={(e) => setEditingCourse({ ...editingCourse, banner_image_url: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>YouTube Video ID</Label>
                <Input
                  value={editingCourse.youtube_video_id || ""}
                  onChange={(e) => setEditingCourse({ ...editingCourse, youtube_video_id: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={editingCourse.is_active}
                  onCheckedChange={(checked) => setEditingCourse({ ...editingCourse, is_active: checked })}
                />
                <Label>Curso ativo</Label>
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
