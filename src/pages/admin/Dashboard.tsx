import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, CheckCircle, XCircle, FolderOpen, Palette, ArrowRight } from "lucide-react";

interface Stats {
  total: number;
  active: number;
  inactive: number;
  categories: string[];
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, inactive: 0, categories: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase.from("courses").select("is_active, category");
      if (data) {
        const categories = [...new Set(data.map((c) => c.category))];
        setStats({
          total: data.length,
          active: data.filter((c) => c.is_active).length,
          inactive: data.filter((c) => !c.is_active).length,
          categories,
        });
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: "Total de Cursos", value: stats.total, icon: GraduationCap, color: "text-primary" },
    { label: "Cursos Ativos", value: stats.active, icon: CheckCircle, color: "text-green-600" },
    { label: "Cursos Inativos", value: stats.inactive, icon: XCircle, color: "text-destructive" },
    { label: "Categorias", value: stats.categories.length, icon: FolderOpen, color: "text-accent" },
  ];

  const quickLinks = [
    { label: "Gerenciar Cursos", to: "/admin/cursos", icon: GraduationCap },
    { label: "Categorias", to: "/admin/categorias", icon: FolderOpen },
    { label: "Temas Promocionais", to: "/admin/temas", icon: Palette },
  ];

  if (loading) {
    return <p className="text-center text-muted-foreground py-8">Carregando...</p>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-xl bg-card p-5 shadow-sm border border-border">
            <div className="flex items-center gap-3">
              <card.icon className={`h-8 w-8 ${card.color}`} />
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="text-3xl font-bold text-foreground">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="mb-3 text-lg font-semibold text-foreground">Acesso Rápido</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center justify-between rounded-xl bg-card p-4 shadow-sm border border-border transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <link.icon className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground">{link.label}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>

      {/* Categories Overview */}
      <div>
        <h3 className="mb-3 text-lg font-semibold text-foreground">Categorias Ativas</h3>
        <div className="flex flex-wrap gap-2">
          {stats.categories.map((cat) => (
            <span
              key={cat}
              className="rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground"
            >
              {cat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
