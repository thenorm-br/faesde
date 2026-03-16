import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Percent, Tag, Calendar, Save, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PromotionalTheme } from "@/hooks/useActiveTheme";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const STYLE_LABELS: Record<string, string> = {
  padrao: "🏫 Padrão",
  natal: "🎄 Natal",
  carnaval: "🎭 Carnaval",
};

const ThemesManager = () => {
  const [themes, setThemes] = useState<PromotionalTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchThemes = async () => {
    const { data, error } = await supabase
      .from("promotional_themes")
      .select("*")
      .order("created_at");
    if (!error && data) {
      setThemes(data as PromotionalTheme[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchThemes(); }, []);

  const activateTheme = async (themeId: string) => {
    setSaving(themeId);
    // Deactivate all first
    await supabase.from("promotional_themes").update({ is_active: false }).neq("id", "");
    // Activate selected
    const { error } = await supabase
      .from("promotional_themes")
      .update({ is_active: true })
      .eq("id", themeId);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Tema ativado com sucesso!" });
    }
    await fetchThemes();
    setSaving(null);
  };

  const updateField = (id: string, field: keyof PromotionalTheme, value: any) => {
    setThemes(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const toggleMonth = (id: string, month: number) => {
    const theme = themes.find(t => t.id === id);
    if (!theme) return;
    const months = theme.scheduled_months || [];
    const updated = months.includes(month)
      ? months.filter(m => m !== month)
      : [...months, month].sort((a, b) => a - b);
    updateField(id, "scheduled_months", updated);
  };

  const saveTheme = async (theme: PromotionalTheme) => {
    setSaving(theme.id);
    const { error } = await supabase
      .from("promotional_themes")
      .update({
        name: theme.name,
        discount_percentage: theme.discount_percentage,
        coupon_code: theme.coupon_code,
        scheduled_months: theme.scheduled_months,
        banner_title: theme.banner_title,
        banner_subtitle: theme.banner_subtitle,
        banner_emoji: theme.banner_emoji,
        banner_cta_text: theme.banner_cta_text,
        banner_cta_emoji: theme.banner_cta_emoji,
        exit_popup_title: theme.exit_popup_title,
        exit_popup_subtitle: theme.exit_popup_subtitle,
      })
      .eq("id", theme.id);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Tema salvo com sucesso!" });
    }
    setSaving(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center p-12 text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Temas Promocionais</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie os temas visuais e descontos do site. Apenas um tema pode estar ativo por vez.
        </p>
      </div>

      <div className="grid gap-6">
        {themes.map(theme => (
          <Card key={theme.id} className={`transition-all ${theme.is_active ? "ring-2 ring-primary border-primary" : ""}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">{STYLE_LABELS[theme.theme_style] || theme.name}</CardTitle>
                  {theme.is_active && (
                    <Badge className="bg-green-600 text-white">
                      <CheckCircle className="mr-1 h-3 w-3" /> Ativo
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!theme.is_active && (
                    <Button
                      size="sm"
                      onClick={() => activateTheme(theme.id)}
                      disabled={saving === theme.id}
                    >
                      Ativar tema
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => saveTheme(theme)}
                    disabled={saving === theme.id}
                  >
                    <Save className="mr-1 h-3 w-3" />
                    Salvar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Discount & Coupon Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="flex items-center gap-1 mb-1.5">
                    <Percent className="h-3.5 w-3.5" /> Desconto (%)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={theme.discount_percentage}
                    onChange={e => updateField(theme.id, "discount_percentage", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-1 mb-1.5">
                    <Tag className="h-3.5 w-3.5" /> Código do Cupom
                  </Label>
                  <Input
                    value={theme.coupon_code || ""}
                    onChange={e => updateField(theme.id, "coupon_code", e.target.value || null)}
                    placeholder="Ex: FAESDE30"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-1 mb-1.5">
                    <Palette className="h-3.5 w-3.5" /> Nome do Tema
                  </Label>
                  <Input
                    value={theme.name}
                    onChange={e => updateField(theme.id, "name", e.target.value)}
                  />
                </div>
              </div>

              {/* Banner Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5 block">Título do Banner</Label>
                  <Input
                    value={theme.banner_title || ""}
                    onChange={e => updateField(theme.id, "banner_title", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block">Subtítulo do Banner</Label>
                  <Input
                    value={theme.banner_subtitle || ""}
                    onChange={e => updateField(theme.id, "banner_subtitle", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block">Emoji do Banner</Label>
                  <Input
                    value={theme.banner_emoji || ""}
                    onChange={e => updateField(theme.id, "banner_emoji", e.target.value)}
                    placeholder="Ex: 🎭"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block">Emoji do CTA</Label>
                  <Input
                    value={theme.banner_cta_emoji || ""}
                    onChange={e => updateField(theme.id, "banner_cta_emoji", e.target.value)}
                    placeholder="Ex: 🎉"
                  />
                </div>
              </div>

              {/* Exit Popup Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5 block">Título Popup de Saída</Label>
                  <Input
                    value={theme.exit_popup_title || ""}
                    onChange={e => updateField(theme.id, "exit_popup_title", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block">Subtítulo Popup de Saída</Label>
                  <Input
                    value={theme.exit_popup_subtitle || ""}
                    onChange={e => updateField(theme.id, "exit_popup_subtitle", e.target.value)}
                  />
                </div>
              </div>

              {/* Scheduled Months */}
              <div>
                <Label className="flex items-center gap-1 mb-2">
                  <Calendar className="h-3.5 w-3.5" /> Agendamento Mensal (meses em que este tema fica ativo automaticamente)
                </Label>
                <div className="flex flex-wrap gap-2">
                  {MONTH_NAMES.map((month, idx) => {
                    const monthNum = idx + 1;
                    const selected = (theme.scheduled_months || []).includes(monthNum);
                    return (
                      <button
                        key={monthNum}
                        onClick={() => toggleMonth(theme.id, monthNum)}
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
        ))}
      </div>
    </div>
  );
};

export default ThemesManager;
