import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { FolderOpen, GraduationCap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import CoursesManager from "./CoursesManager.tsx";
import CategoriesManager from "./CategoriesManager.tsx";

type CoursesTab = "cursos" | "categorias";

const VALID_TABS: CoursesTab[] = ["cursos", "categorias"];

const CoursesHubPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = useMemo<CoursesTab>(() => {
    const tab = searchParams.get("tab") as CoursesTab | null;
    return tab && VALID_TABS.includes(tab) ? tab : "cursos";
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
    next.delete("edit");
    setSearchParams(next);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Cursos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Cadastre cursos e organize categorias no mesmo fluxo de trabalho.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={changeTab} className="space-y-6">
        <TabsList className="flex h-auto flex-wrap justify-start gap-1 rounded-xl bg-muted/60 p-1">
          <TabsTrigger value="cursos" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            Cursos
          </TabsTrigger>
          <TabsTrigger value="categorias" className="gap-2">
            <FolderOpen className="h-4 w-4" />
            Categorias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cursos" className="mt-0">
          <CoursesManager embedded />
        </TabsContent>

        <TabsContent value="categorias" className="mt-0">
          <CategoriesManager embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoursesHubPage;
