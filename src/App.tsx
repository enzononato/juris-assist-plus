import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Index from "@/pages/Index";
import Processos from "@/pages/Processos";
import ProcessoDetalhe from "@/pages/ProcessoDetalhe";
import NovoProcesso from "@/pages/NovoProcesso";
import Tarefas from "@/pages/Tarefas";
import NovaTarefa from "@/pages/NovaTarefa";
import Agenda from "@/pages/Agenda";
import Alertas from "@/pages/Alertas";
import Responsaveis from "@/pages/Responsaveis";
import Integracoes from "@/pages/Integracoes";
import Relatorios from "@/pages/Relatorios";
import Auditoria from "@/pages/Auditoria";
import Empresas from "@/pages/Empresas";
import UsuariosPermissoes from "@/pages/UsuariosPermissoes";
import ChecklistTemplates from "@/pages/ChecklistTemplates";
import RegrasAlertas from "@/pages/RegrasAlertas";
import MenuPage from "@/pages/MenuPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/*"
            element={
              <AppLayout>
                <Routes>
                  <Route path="dashboard" element={<Index />} />
                  <Route path="processos" element={<Processos />} />
                  <Route path="processos/novo" element={<NovoProcesso />} />
                  <Route path="processos/:id" element={<ProcessoDetalhe />} />
                  <Route path="tarefas" element={<Tarefas />} />
                  <Route path="tarefas/nova" element={<NovaTarefa />} />
                  <Route path="agenda" element={<Agenda />} />
                  <Route path="responsaveis" element={<Responsaveis />} />
                  <Route path="alertas" element={<Alertas />} />
                  <Route path="integracoes" element={<Integracoes />} />
                  <Route path="relatorios" element={<Relatorios />} />
                  <Route path="auditoria" element={<Auditoria />} />
                  <Route path="empresas" element={<Empresas />} />
                  <Route path="usuarios" element={<UsuariosPermissoes />} />
                  <Route path="checklists-templates" element={<ChecklistTemplates />} />
                  <Route path="regras-alertas" element={<RegrasAlertas />} />
                  <Route path="menu" element={<MenuPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
