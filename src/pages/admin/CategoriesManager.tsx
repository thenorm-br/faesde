import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, FolderOpen, Loader2, Plus, RefreshCw, Save, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import { useToast } from "@/hooks/use-toast.ts";
import {
  buildCategoryMetas,
  DEFAULT_COURSE_CATEGORIES,
  getCourseCategoryLabel,
  slugifyCategory,
  type CourseCategoryMeta,
} from "@/lib/courseCategories.ts";

interface CourseRow {
  id: string;
  title: string;
  slug: string;
  category: string;
  is_active: boolean;
}

interface CategorySummary {
  meta: CourseCategoryMeta;
  slug: string;
  total: number;
  active: number;
  inactive: number;
  courses: CourseRow[];
}

const defaultCategorySlugs = DEFAULT_COURSE_CATEGORIES.map((category) => category.slug);

const CategoriesManager = () => {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingAction, setSavingAction] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [renameLabel, setRenameLabel] = useState("");
  const [targetSlug, setTargetSlug] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const { toast } = useToast();

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("courses")
      .select("id, title, slug, category, is_active")
      .order("title");

    if (error) {
      toast({ title: "Erro ao carregar categorias", description: error.message, variant: "destructive" });
    } else {
      setCourses((data || []) as CourseRow[]);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const summaries = useMemo<CategorySummary[]>(() => {
    const metas = buildCategoryMetas([...defaultCategorySlugs, ...courses.map((course) => course.category)]);

    return metas.map((meta) => {
      const categoryCourses = courses.filter((course) => course.category === meta.slug);
      return {
        meta,
        slug: meta.slug,
        total: categoryCourses.length,
        active: categoryCourses.filter((course) => course.is_active).length,
        inactive: categoryCourses.filter((course) => !course.is_active).length,
        courses: categoryCourses,
      };
    });
  }, [courses]);

  const selectedSummary = summaries.find((summary) => summary.slug === selectedSlug) || summaries[0];

  const categoryOptions = useMemo(
    () => buildCategoryMetas([...summaries.map((summary) => summary.slug), targetSlug].filter(Boolean)),
    [summaries, targetSlug],
  );

  const selectableCourses = useMemo(() => {
    const normalizedSearch = courseSearch.trim().toLowerCase();
    if (!normalizedSearch) return courses;

    return courses.filter((course) => {
      const haystack = [course.title, course.slug, course.category, getCourseCategoryLabel(course.category)]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [courseSearch, courses]);

  useEffect(() => {
    if (!summaries.length) return;
    if (!selectedSlug || !summaries.some((summary) => summary.slug === selectedSlug)) {
      setSelectedSlug(summaries[0].slug);
    }
  }, [selectedSlug, summaries]);

  useEffect(() => {
    const summary = summaries.find((item) => item.slug === selectedSlug) || summaries[0];
    if (summary) {
      setRenameLabel(summary.meta.label);
      const fallbackTarget = summaries.find((item) => item.slug !== summary.slug)?.slug || "";
      setTargetSlug((current) => (current && current !== summary.slug ? current : fallbackTarget));
    }
  }, [selectedSlug, summaries]);

  const refreshAfterUpdate = async (message: string) => {
    toast({ title: message });
    await fetchCourses();
  };

  const updateCoursesCategory = async (courseIds: string[], nextSlug: string, successMessage: string) => {
    if (courseIds.length === 0) {
      toast({
        title: "Nenhum curso selecionado",
        description: "Escolha ao menos um curso para salvar a categoria.",
        variant: "destructive",
      });
      return;
    }

    setSavingAction("update-courses");
    const { error } = await supabase.from("courses").update({ category: nextSlug }).in("id", courseIds);

    if (error) {
      toast({ title: "Erro ao atualizar categoria", description: error.message, variant: "destructive" });
    } else {
      setSelectedCourseIds([]);
      setSelectedSlug(nextSlug);
      await refreshAfterUpdate(successMessage);
    }
    setSavingAction(null);
  };

  const handleRenameCategory = async () => {
    if (!selectedSummary) return;

    const nextSlug = slugifyCategory(renameLabel);
    if (!nextSlug) {
      toast({ title: "Nome invalido", description: "Informe um nome para a categoria.", variant: "destructive" });
      return;
    }

    if (nextSlug === selectedSummary.slug) {
      toast({ title: "Sem alteracoes", description: "O nome informado gera a mesma URL da categoria atual." });
      return;
    }

    if (selectedSummary.total === 0) {
      toast({
        title: "Categoria sem cursos",
        description: "A categoria so passa a existir no banco quando pelo menos um curso usa essa categoria.",
        variant: "destructive",
      });
      return;
    }

    const existing = summaries.find((summary) => summary.slug === nextSlug);
    const shouldContinue =
      !existing ||
      confirm(
        `Ja existe a categoria "${existing.meta.label}". Deseja fundir os ${selectedSummary.total} curso(s) nela?`,
      );
    if (!shouldContinue) return;

    setSavingAction("rename");
    const { error } = await supabase
      .from("courses")
      .update({ category: nextSlug })
      .eq("category", selectedSummary.slug);

    if (error) {
      toast({ title: "Erro ao renomear categoria", description: error.message, variant: "destructive" });
    } else {
      setSelectedSlug(nextSlug);
      await refreshAfterUpdate(existing ? "Categorias fundidas!" : "Categoria renomeada!");
    }
    setSavingAction(null);
  };

  const handleMoveAll = async () => {
    if (!selectedSummary || !targetSlug || targetSlug === selectedSummary.slug) return;
    if (selectedSummary.total === 0) {
      toast({ title: "Nada para mover", description: "Essa categoria ainda nao possui cursos." });
      return;
    }

    const targetLabel = getCourseCategoryLabel(targetSlug);
    const shouldContinue = confirm(
      `Mover ${selectedSummary.total} curso(s) de "${selectedSummary.meta.label}" para "${targetLabel}"?`,
    );
    if (!shouldContinue) return;

    setSavingAction("move-all");
    const { error } = await supabase
      .from("courses")
      .update({ category: targetSlug })
      .eq("category", selectedSummary.slug);

    if (error) {
      toast({ title: "Erro ao mover cursos", description: error.message, variant: "destructive" });
    } else {
      setSelectedSlug(targetSlug);
      await refreshAfterUpdate("Cursos movidos para a categoria escolhida!");
    }
    setSavingAction(null);
  };

  const handleCreateCategory = async () => {
    const nextSlug = slugifyCategory(newCategoryName);
    if (!nextSlug) {
      toast({ title: "Nome invalido", description: "Digite o nome da nova categoria.", variant: "destructive" });
      return;
    }

    await updateCoursesCategory(
      selectedCourseIds,
      nextSlug,
      `Categoria "${getCourseCategoryLabel(nextSlug)}" criada e aplicada aos cursos selecionados!`,
    );
    setNewCategoryName("");
  };

  const handleCourseCategoryChange = async (course: CourseRow, nextSlug: string) => {
    if (course.category === nextSlug) return;
    await updateCoursesCategory([course.id], nextSlug, "Categoria do curso atualizada!");
  };

  const toggleCourseSelection = (courseId: string, checked: boolean) => {
    setSelectedCourseIds((current) =>
      checked ? [...new Set([...current, courseId])] : current.filter((id) => id !== courseId),
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Carregando categorias...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Categorias</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize as abas e secoes do catalogo a partir das categorias salvas nos cursos.
          </p>
        </div>
        <Button variant="outline" onClick={fetchCourses} disabled={savingAction !== null}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Categorias visiveis</p>
            <p className="text-3xl font-bold text-foreground">{summaries.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Cursos cadastrados</p>
            <p className="text-3xl font-bold text-foreground">{courses.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Cursos ativos</p>
            <p className="text-3xl font-bold text-foreground">{courses.filter((course) => course.is_active).length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {summaries.map((summary) => {
              const isSelected = summary.slug === selectedSummary?.slug;
              return (
                <button
                  key={summary.slug}
                  type="button"
                  onClick={() => setSelectedSlug(summary.slug)}
                  className={`rounded-xl border bg-card p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                    isSelected ? "border-primary ring-2 ring-primary/20" : "border-border"
                  }`}
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FolderOpen className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="font-semibold text-foreground">{summary.meta.label}</h3>
                        <p className="text-xs text-muted-foreground">/{summary.slug}</p>
                      </div>
                    </div>
                    {summary.total === 0 && <Badge variant="outline">vazia</Badge>}
                  </div>
                  <p className="mb-4 text-sm text-muted-foreground">{summary.meta.description}</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge className="bg-primary text-primary-foreground">{summary.total} curso(s)</Badge>
                    <Badge variant="secondary">{summary.active} ativo(s)</Badge>
                    <Badge variant="outline">{summary.inactive} inativo(s)</Badge>
                  </div>
                </button>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cursos da categoria</CardTitle>
              <CardDescription>
                Ajuste rapidamente a categoria individual de cada curso selecionado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Curso</TableHead>
                      <TableHead className="hidden sm:table-cell">Status</TableHead>
                      <TableHead className="w-56">Categoria</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(selectedSummary?.courses || []).map((course) => (
                      <TableRow key={course.id}>
                        <TableCell>
                          <p className="font-medium text-foreground">{course.title}</p>
                          <p className="text-xs text-muted-foreground">{course.slug}</p>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant={course.is_active ? "default" : "outline"}>
                            {course.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <select
                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                            value={course.category}
                            disabled={savingAction !== null}
                            onChange={(event) => handleCourseCategoryChange(course, event.target.value)}
                          >
                            {categoryOptions.map((category) => (
                              <option key={category.slug} value={category.slug}>
                                {category.label}
                              </option>
                            ))}
                          </select>
                        </TableCell>
                      </TableRow>
                    ))}
                    {selectedSummary?.courses.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                          Nenhum curso usando esta categoria ainda.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Editar categoria</CardTitle>
              <CardDescription>
                Renomeie ou mova todos os cursos da categoria selecionada.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Categoria selecionada</Label>
                <Input value={selectedSummary?.meta.label || ""} readOnly />
              </div>

              <div className="space-y-2">
                <Label>Novo nome</Label>
                <Input
                  value={renameLabel}
                  onChange={(event) => setRenameLabel(event.target.value)}
                  placeholder="Ex: Cursos Profissionalizantes"
                />
                <p className="text-xs text-muted-foreground">
                  Slug gerado: {slugifyCategory(renameLabel) || "categoria"}
                </p>
              </div>

              <Button
                className="w-full"
                onClick={handleRenameCategory}
                disabled={!selectedSummary || savingAction !== null}
              >
                <Save className="mr-2 h-4 w-4" />
                Renomear / fundir categoria
              </Button>

              <div className="border-t border-border pt-5">
                <div className="space-y-2">
                  <Label>Mover todos os cursos para</Label>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={targetSlug}
                    disabled={savingAction !== null}
                    onChange={(event) => setTargetSlug(event.target.value)}
                  >
                    {categoryOptions
                      .filter((category) => category.slug !== selectedSummary?.slug)
                      .map((category) => (
                        <option key={category.slug} value={category.slug}>
                          {category.label}
                        </option>
                      ))}
                  </select>
                </div>
                <Button
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={handleMoveAll}
                  disabled={!selectedSummary || !targetSlug || savingAction !== null}
                >
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  Mover todos
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nova categoria</CardTitle>
              <CardDescription>
                Crie uma categoria aplicando-a a um ou mais cursos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nome da nova categoria</Label>
                <Input
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  placeholder="Ex: Normas Regulamentadoras"
                />
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={courseSearch}
                  onChange={(event) => setCourseSearch(event.target.value)}
                  placeholder="Buscar curso para atribuir..."
                  className="pl-10"
                />
              </div>

              <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
                {selectableCourses.map((course) => {
                  const checked = selectedCourseIds.includes(course.id);
                  return (
                    <label
                      key={course.id}
                      className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) => toggleCourseSelection(course.id, value === true)}
                      />
                      <span>
                        <span className="block text-sm font-medium text-foreground">{course.title}</span>
                        <span className="text-xs text-muted-foreground">
                          Atual: {getCourseCategoryLabel(course.category)}
                        </span>
                      </span>
                    </label>
                  );
                })}
                {selectableCourses.length === 0 && (
                  <p className="py-4 text-center text-sm text-muted-foreground">Nenhum curso encontrado.</p>
                )}
              </div>

              <Button className="w-full" onClick={handleCreateCategory} disabled={savingAction !== null}>
                <Plus className="mr-2 h-4 w-4" />
                Criar e aplicar em {selectedCourseIds.length} curso(s)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CategoriesManager;
