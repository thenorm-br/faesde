import { Toaster } from "@/components/ui/toaster.tsx";
import { Toaster as Sonner } from "@/components/ui/sonner.tsx";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index.tsx";
import FAQ from "./pages/FAQ.tsx";
import Cursos from "./pages/Cursos.tsx";
import CursoDetalhe from "./pages/CursoDetalhe.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import AdminLayout from "./components/admin/AdminLayout.tsx";
import Dashboard from "./pages/admin/Dashboard.tsx";
import CoursesHubPage from "./pages/admin/CoursesHubPage.tsx";
import SettingsHubPage from "./pages/admin/SettingsHubPage.tsx";
import FilesManager from "./pages/admin/FilesManager.tsx";
import ConnectionsManager from "./pages/admin/ConnectionsManager.tsx";
import CertificatesManager from "./pages/admin/CertificatesManager.tsx";
import CertificadoPublico from "./pages/CertificadoPublico.tsx";
import NotFound from "./pages/NotFound.tsx";

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
          <Route path="/certificados/:code" element={<CertificadoPublico />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="cursos" element={<CoursesHubPage />} />
            <Route path="categorias" element={<Navigate to="/admin/cursos?tab=categorias" replace />} />
            <Route path="temas" element={<Navigate to="/admin/configuracoes?tab=temas" replace />} />
            <Route path="arquivos" element={<FilesManager />} />
            <Route path="conexoes" element={<Navigate to="/admin/configuracoes?tab=conexoes" replace />} />
            <Route path="conexoes/oauth/callback" element={<ConnectionsManager />} />
            <Route path="configuracoes" element={<SettingsHubPage />} />
            <Route path="certificados" element={<CertificatesManager />} />
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
