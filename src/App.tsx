import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import FAQ from "./pages/FAQ";
import Cursos from "./pages/Cursos";
import CursoDetalhe from "./pages/CursoDetalhe";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import CoursesManager from "./pages/admin/CoursesManager";
import CategoriesManager from "./pages/admin/CategoriesManager";
import ThemesManager from "./pages/admin/ThemesManager";
import FilesManager from "./pages/admin/FilesManager";
import SettingsPage from "./pages/admin/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/cursos" element={<Cursos />} />
          <Route path="/curso/:id" element={<CursoDetalhe />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="cursos" element={<CoursesManager />} />
            <Route path="categorias" element={<CategoriesManager />} />
            <Route path="temas" element={<ThemesManager />} />
            <Route path="arquivos" element={<FilesManager />} />
            <Route path="configuracoes" element={<SettingsPage />} />
          </Route>
          {/* Redirect old admin routes */}
          <Route path="/faesde-administration" element={<Navigate to="/admin/login" replace />} />
          <Route path="/faesde-administration/dashboard" element={<Navigate to="/admin" replace />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
