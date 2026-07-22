import { Toaster } from "@/components/ui/toaster.tsx";
import { Toaster as Sonner } from "@/components/ui/sonner.tsx";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";

const Index = lazy(() => import("./pages/Index.tsx"));
const FAQ = lazy(() => import("./pages/FAQ.tsx"));
const Cursos = lazy(() => import("./pages/Cursos.tsx"));
const CursoDetalhe = lazy(() => import("./pages/CursoDetalhe.tsx"));
const AdminLogin = lazy(() => import("./pages/AdminLogin.tsx"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout.tsx"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard.tsx"));
const CoursesHubPage = lazy(() => import("./pages/admin/CoursesHubPage.tsx"));
const SettingsHubPage = lazy(() => import("./pages/admin/SettingsHubPage.tsx"));
const FilesManager = lazy(() => import("./pages/admin/FilesManager.tsx"));
const ConnectionsManager = lazy(() => import("./pages/admin/ConnectionsManager.tsx"));
const CertificatesManager = lazy(() => import("./pages/admin/CertificatesManager.tsx"));
const CertificadoPublico = lazy(() => import("./pages/CertificadoPublico.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-background text-sm font-medium text-muted-foreground">
    Carregando FAESDE...
  </div>
);

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const AnalyticsPageView = () => {
  const location = useLocation();

  useEffect(() => {
    window.gtag?.("event", "page_view", {
      page_path: `${location.pathname}${location.search}`,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location.pathname, location.search]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnalyticsPageView />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/cursos" element={<Cursos />} />
            <Route path="/cursos/:categorySlug" element={<Cursos />} />
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
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
