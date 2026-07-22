import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Cloud, Palette, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import SettingsPage from "./SettingsPage.tsx";
import ConnectionsManager from "./ConnectionsManager.tsx";
import ThemesManager from "./ThemesManager.tsx";

type SettingsTab = "geral" | "conexoes" | "temas";

const VALID_TABS: SettingsTab[] = ["geral", "conexoes", "temas"];

const SettingsHubPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = useMemo<SettingsTab>(() => {
    const tab = searchParams.get("tab") as SettingsTab | null;
    return tab && VALID_TABS.includes(tab) ? tab : "geral";
  }, [searchParams]);

  useEffect(() => {
    if (!searchParams.get("tab")) {
      const next = new URLSearchParams(searchParams);
      next.set("tab", activeTab);
      setSearchParams(next, { replace: true });
    }
  }, [activeTab, searchParams, setSearchParams]);

  const changeTab = (value: string) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", value);
    setSearchParams(next);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Configurações</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ajustes gerais, conexões externas e temas promocionais em um só lugar.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={changeTab} className="space-y-6">
        <TabsList className="flex h-auto flex-wrap justify-start gap-1 rounded-xl bg-muted/60 p-1">
          <TabsTrigger value="geral" className="gap-2">
            <Settings className="h-4 w-4" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="conexoes" className="gap-2">
            <Cloud className="h-4 w-4" />
            Conexões
          </TabsTrigger>
          <TabsTrigger value="temas" className="gap-2">
            <Palette className="h-4 w-4" />
            Temas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="mt-0">
          <SettingsPage embedded />
        </TabsContent>

        <TabsContent value="conexoes" className="mt-0">
          <ConnectionsManager embedded />
        </TabsContent>

        <TabsContent value="temas" className="mt-0">
          <ThemesManager embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsHubPage;
