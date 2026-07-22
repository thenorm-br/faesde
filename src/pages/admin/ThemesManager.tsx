import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle,
  Copy,
  Loader2,
  Palette,
  Percent,
  Plus,
  RefreshCw,
  Save,
  Tag,
  Trash2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client.ts";
import type { Database } from "@/integrations/supabase/types.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { useToast } from "@/hooks/use-toast.ts";
import type { PromotionalTheme } from "@/hooks/useActiveTheme.ts";
import { slugifyCategory } from "@/lib/courseCategories.ts";

type PromotionalThemeRow = Database["public"]["Tables"]["promotional_themes"]["Row"];
type PromotionalThemeInsert = Database["public"]["Tables"]["promotional_themes"]["Insert"];
type PromotionalThemeUpdate = Database["public"]["Tables"]["promotional_themes"]["Update"];

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const STYLE_OPTIONS = [
  { value: "padrao", label: "Padrao", previewClass: "from-ecid-red via-ecid-red to-ecid-red-light" },
  { value: "natal", label: "Natal", previewClass: "from-red-700 via-green-700 to-red-500" },
  { value: "carnaval", label: "Carnaval", previewClass: "from-fuchsia-600 via-amber-400 to-cyan-500" },
];

const normalizeTheme = (theme: PromotionalThemeRow): PromotionalTheme => ({
  ...theme,
  scheduled_months: theme.scheduled_months || [],
});

const buildUniqueSlug = (baseValue: string, themes: PromotionalTheme[], ignoreId?: string) => {
  const baseSlug = slugifyCategory(baseValue) || "tema";
  const usedSlugs = new Set(themes.filter((theme) => theme.id !== ignoreId).map((theme) => theme.slug));

  if (!usedSlugs.has(baseSlug)) return baseSlug;

  let index = 2;
  let nextSlug = `${baseSlug}-${index}`;
  while (usedSlugs.has(nextSlug)) {
    index += 1;
    nextSlug = `${baseSlug}-${index}`;
  }

  return nextSlug;
};

const buildThemePayload = (theme: PromotionalTheme, themes: PromotionalTheme[]): PromotionalThemeUpdate => {
  const slug = buildUniqueSlug(theme.slug || theme.name, themes, theme.id);

  return {
    name: theme.name.trim() || "Tema promocional",
    slug,
    theme_style: theme.theme_style || "padrao",
    discount_percentage: Math.min(100, Math.max(0, Number(theme.discount_percentage) || 0)),
    coupon_code: theme.coupon_code?.trim() || null,
    scheduled_months: theme.scheduled_months || [],
    banner_title: theme.banner_title?.trim() || null,
    banner_subtitle: theme.banner_subtitle?.trim() || null,
    banner_emoji: theme.banner_emoji?.trim() || null,
    banner_cta_text: theme.banner_cta_text?.trim() || null,
    banner_cta_emoji: theme.banner_cta_emoji?.trim() || null,
    exit_popup_title: theme.exit_popup_title?.trim() || null,
    exit_popup_subtitle: theme.exit_popup_subtitle?.trim() || null,
    banner_bottom_text: theme.banner_bottom_text?.trim() || null,
  };
};

const createBlankTheme = (themes: PromotionalTheme[]): PromotionalThemeInsert => {
  const slug = buildUniqueSlug("novo-tema-promocional", themes);

  return {
    name: "Novo Tema Promocional",
    slug,
    theme_style: "padrao",
    discount_percentage: 0,
    coupon_code: null,
    is_active: false,
    scheduled_months: [],
    banner_title: "CURSOS TECNICOS",
    banner_subtitle: "Invista no seu futuro",
    banner_emoji: null,
    banner_cta_text: "Quero me matricular",
    banner_cta_emoji: null,
    banner_bottom_text: "Em todos os cursos tecnicos EAD",
    exit_popup_title: null,
    exit_popup_subtitle: null,
  };
};

const getStyleLabel = (value: string) => STYLE_OPTIONS.find((style) => style.value === value)?.label || value;

const getPreviewClass = (value: string) =>
  STYLE_OPTIONS.find((style) => style.value === value)?.previewClass || STYLE_OPTIONS[0].previewClass;

interface ThemesManagerProps {
  embedded?: boolean;
}

const ThemesManager = ({ embedded = false }: ThemesManagerProps) => {
  const [themes, setThemes] = useState<PromotionalTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingAction, setSavingAction] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchThemes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("promotional_themes")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      toast({ title: "Erro ao carregar temas", description: error.message, variant: "destructive" });
    } else {
      setThemes(((data || []) as PromotionalThemeRow[]).map(normalizeTheme));
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  const activeTheme = useMemo(() => themes.find((theme) => theme.is_active), [themes]);
  const scheduledThemes = useMemo(
    () => themes.filter((theme) => (theme.scheduled_months || []).length > 0).length,
    [themes],
  );

  const updateField = <K extends keyof PromotionalTheme>(
    id: string,
    field: K,
    value: PromotionalTheme[K],
  ) => {
    setThemes((current) => current.map((theme) => (theme.id === id ? { ...theme, [field]: value } : theme)));
  };

  const toggleMonth = (id: string, month: number) => {
    const theme = themes.find((item) => item.id === id);
    if (!theme) return;

    const months = theme.scheduled_months || [];
    const updatedMonths = months.includes(month)
      ? months.filter((item) => item !== month)
      : [...months, month].sort((a, b) => a - b);

    updateField(id, "scheduled_months", updatedMonths);
  };

  const activateTheme = async (themeId: string) => {
    setSavingAction(`activate-${themeId}`);

    const { error: deactivateError } = await supabase
      .from("promotional_themes")
      .update({ is_active: false })
      .neq("id", themeId);

    if (deactivateError) {
      toast({ title: "Erro ao desativar outros temas", description: deactivateError.message, variant: "destructive" });
      setSavingAction(null);
      return;
    }

    const { error } = await supabase.from("promotional_themes").update({ is_active: true }).eq("id", themeId);

    if (error) {
      toast({ title: "Erro ao ativar tema", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Tema ativado!" });
      await fetchThemes();
    }

    setSavingAction(null);
  };

  const deactivateTheme = async (themeId: string) => {
    setSavingAction(`deactivate-${themeId}`);
    const { error } = await supabase.from("promotional_themes").update({ is_active: false }).eq("id", themeId);

    if (error) {
      toast({ title: "Erro ao desativar tema", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Tema desativado!" });
      await fetchThemes();
    }

    setSavingAction(null);
  };

  const saveTheme = async (theme: PromotionalTheme) => {
    setSavingAction(`save-${theme.id}`);
    const payload = buildThemePayload(theme, themes);
    const { error } = await supabase.from("promotional_themes").update(payload).eq("id", theme.id);

    if (error) {
      toast({ title: "Erro ao salvar tema", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Tema salvo!" });
      await fetchThemes();
    }

    setSavingAction(null);
  };

  const createTheme = async () => {
    setSavingAction("create");
    const { error } = await supabase.from("promotional_themes").insert(createBlankTheme(themes));

    if (error) {
      toast({ title: "Erro ao criar tema", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Tema criado!" });
      await fetchThemes();
    }

    setSavingAction(null);
  };

  const duplicateTheme = async (theme: PromotionalTheme) => {
    setSavingAction(`duplicate-${theme.id}`);
    const duplicatedTheme: PromotionalThemeInsert = {
      name: `${theme.name} - copia`,
      slug: buildUniqueSlug(`${theme.slug}-copia`, themes),
      theme_style: theme.theme_style,
      discount_percentage: theme.discount_percentage,
      coupon_code: theme.coupon_code,
      is_active: false,
      scheduled_months: theme.scheduled_months || [],
      banner_title: theme.banner_title,
      banner_subtitle: theme.banner_subtitle,
      banner_emoji: theme.banner_emoji,
      banner_cta_text: theme.banner_cta_text,
      banner_cta_emoji: theme.banner_cta_emoji,
      banner_bottom_text: theme.banner_bottom_text,
      exit_popup_title: theme.exit_popup_title,
      exit_popup_subtitle: theme.exit_popup_subtitle,
    };

    const { error } = await supabase.from("promotional_themes").insert(duplicatedTheme);

    if (error) {
      toast({ title: "Erro ao duplicar tema", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Tema duplicado!" });
      await fetchThemes();
    }

    setSavingAction(null);
  };

  const deleteTheme = async (theme: PromotionalTheme) => {
    const shouldContinue = confirm(
      `Excluir o tema "${theme.name}"? Essa acao nao remove cursos, apenas o tema promocional.`,
    );
    if (!shouldContinue) return;

    setSavingAction(`delete-${theme.id}`);
    const { error } = await supabase.from("promotional_themes").delete().eq("id", theme.id);

    if (error) {
      toast({ title: "Erro ao excluir tema", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Tema excluido!" });
      await fetchThemes();
    }

    setSavingAction(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Carregando temas...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {!embedded && <h2 className="text-2xl font-bold text-foreground">Temas Promocionais</h2>}
          <p className="mt-1 text-sm text-muted-foreground">
            Configure banners, cupons, descontos e agendamentos mensais do site.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={fetchThemes} disabled={savingAction !== null}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button onClick={createTheme} disabled={savingAction !== null}>
            <Plus className="mr-2 h-4 w-4" />
            Novo tema
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Temas cadastrados</p>
            <p className="text-3xl font-bold text-foreground">{themes.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Tema ativo</p>
            <p className="truncate text-2xl font-bold text-foreground">{activeTheme?.name || "Nenhum"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Temas agendados</p>
            <p className="text-3xl font-bold text-foreground">{scheduledThemes}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        {themes.map((theme) => {
          const hasDiscount = theme.discount_percentage > 0 && theme.coupon_code;
          const isSaving = savingAction?.endsWith(theme.id) || false;

          return (
            <Card
              key={theme.id}
              className={`overflow-hidden transition-all ${
                theme.is_active ? "border-primary ring-2 ring-primary/20" : ""
              }`}
            >
              <div className={`bg-gradient-to-r ${getPreviewClass(theme.theme_style)} p-5 text-white`}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge className="bg-white/20 text-white hover:bg-white/20">{getStyleLabel(theme.theme_style)}</Badge>
                      {theme.is_active && (
                        <Badge className="bg-green-600 text-white">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Ativo
                        </Badge>
                      )}
                      {(theme.scheduled_months || []).length > 0 && (
                        <Badge className="bg-white/20 text-white hover:bg-white/20">
                          {theme.scheduled_months.length} mes(es)
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm uppercase tracking-wider text-white/80">
                      {theme.banner_subtitle || "Invista no seu futuro"}
                    </p>
                    <h3 className="mt-1 text-3xl font-extrabold text-ecid-yellow">
                      {theme.banner_title || "CURSOS TECNICOS"}
                    </h3>
                    <p className="mt-1 text-sm font-semibold uppercase text-white/90">
                      {theme.banner_bottom_text || "Em todos os cursos tecnicos EAD"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/15 p-4 text-center backdrop-blur-sm">
                    {hasDiscount ? (
                      <>
                        <p className="text-5xl font-extrabold text-ecid-yellow">{theme.discount_percentage}%</p>
                        <p className="text-xs uppercase tracking-wider text-white/80">de desconto</p>
                        <p className="mt-2 rounded-lg bg-ecid-yellow px-3 py-1 text-sm font-bold text-ecid-navy">
                          {theme.coupon_code}
                        </p>
                      </>
                    ) : (
                      <p className="max-w-40 text-sm font-medium text-white/80">Sem cupom ativo neste tema</p>
                    )}
                  </div>
                </div>
              </div>

              <CardHeader>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5 text-primary" />
                      {theme.name}
                    </CardTitle>
                    <CardDescription>Slug: {theme.slug}</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {theme.is_active ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deactivateTheme(theme.id)}
                        disabled={savingAction !== null}
                      >
                        Desativar
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => activateTheme(theme.id)} disabled={savingAction !== null}>
                        Ativar
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => duplicateTheme(theme)}
                      disabled={savingAction !== null}
                    >
                      <Copy className="mr-1 h-3.5 w-3.5" />
                      Duplicar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => saveTheme(theme)}
                      disabled={savingAction !== null}
                    >
                      <Save className="mr-1 h-3.5 w-3.5" />
                      {isSaving ? "Salvando..." : "Salvar"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteTheme(theme)}
                      disabled={savingAction !== null}
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Nome interno</Label>
                    <Input value={theme.name} onChange={(event) => updateField(theme.id, "name", event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input value={theme.slug} onChange={(event) => updateField(theme.id, "slug", event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Palette className="h-3.5 w-3.5" />
                      Estilo visual
                    </Label>
                    <select
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={theme.theme_style}
                      onChange={(event) => updateField(theme.id, "theme_style", event.target.value)}
                    >
                      {STYLE_OPTIONS.map((style) => (
                        <option key={style.value} value={style.value}>
                          {style.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Percent className="h-3.5 w-3.5" />
                      Desconto (%)
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={theme.discount_percentage}
                      onChange={(event) =>
                        updateField(theme.id, "discount_percentage", Number(event.target.value) || 0)
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5" />
                      Codigo do cupom
                    </Label>
                    <Input
                      value={theme.coupon_code || ""}
                      onChange={(event) => updateField(theme.id, "coupon_code", event.target.value || null)}
                      placeholder="Ex: FAESDE30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Texto do botao</Label>
                    <Input
                      value={theme.banner_cta_text || ""}
                      onChange={(event) => updateField(theme.id, "banner_cta_text", event.target.value || null)}
                      placeholder="Quero me matricular"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Titulo do banner</Label>
                    <Input
                      value={theme.banner_title || ""}
                      onChange={(event) => updateField(theme.id, "banner_title", event.target.value || null)}
                      placeholder="CURSOS TECNICOS"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtitulo do banner</Label>
                    <Input
                      value={theme.banner_subtitle || ""}
                      onChange={(event) => updateField(theme.id, "banner_subtitle", event.target.value || null)}
                      placeholder="Invista no seu futuro"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Texto inferior do banner</Label>
                    <Input
                      value={theme.banner_bottom_text || ""}
                      onChange={(event) => updateField(theme.id, "banner_bottom_text", event.target.value || null)}
                      placeholder="Em todos os cursos tecnicos EAD"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Emoji banner</Label>
                      <Input
                        value={theme.banner_emoji || ""}
                        onChange={(event) => updateField(theme.id, "banner_emoji", event.target.value || null)}
                        placeholder="Opcional"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Emoji botao</Label>
                      <Input
                        value={theme.banner_cta_emoji || ""}
                        onChange={(event) => updateField(theme.id, "banner_cta_emoji", event.target.value || null)}
                        placeholder="Opcional"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Titulo do popup de saida</Label>
                    <Input
                      value={theme.exit_popup_title || ""}
                      onChange={(event) => updateField(theme.id, "exit_popup_title", event.target.value || null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtitulo do popup de saida</Label>
                    <Textarea
                      value={theme.exit_popup_subtitle || ""}
                      onChange={(event) => updateField(theme.id, "exit_popup_subtitle", event.target.value || null)}
                      rows={3}
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-2 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Agendamento mensal
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {MONTH_NAMES.map((month, index) => {
                      const monthNumber = index + 1;
                      const selected = (theme.scheduled_months || []).includes(monthNumber);
                      return (
                        <button
                          key={monthNumber}
                          type="button"
                          onClick={() => toggleMonth(theme.id, monthNumber)}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                            selected
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {month}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {themes.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="mb-4 text-muted-foreground">Nenhum tema promocional cadastrado ainda.</p>
            <Button onClick={createTheme} disabled={savingAction !== null}>
              <Plus className="mr-2 h-4 w-4" />
              Criar primeiro tema
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ThemesManager;
