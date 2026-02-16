import { Building2, Users, Settings, Shield, FileText, LogOut, Plug, CalendarDays, UserCheck, BarChart3, Bell, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const menuItems = [
  { label: "Relatórios", icon: BarChart3, description: "KPIs e dashboards visuais", path: "/relatorios" },
  { label: "Integrações", icon: Plug, description: "WhatsApp, E-mail, Drive, IA", path: "/integracoes" },
  { label: "Agenda", icon: CalendarDays, description: "Calendário unificado", path: "/agenda" },
  { label: "Responsáveis", icon: UserCheck, description: "Gerenciar contatos", path: "/responsaveis" },
  { label: "Logs de Auditoria", icon: ShieldCheck, description: "Ações críticas do sistema", path: "/auditoria" },
  { label: "Empresas e Filiais", icon: Building2, description: "Gerenciar organizações", path: "/empresas" },
  { label: "Usuários e Permissões", icon: Users, description: "Controle de acesso", path: "/usuarios" },
  { label: "Templates de Checklists", icon: FileText, description: "Modelos parametrizáveis", path: "/checklists-templates" },
  { label: "Regras de Alertas", icon: Bell, description: "Offsets, SLAs e escalonamento", path: "/regras-alertas" },
  { label: "Casos Sigilosos", icon: Shield, description: "Sala segura" },
  { label: "Configurações", icon: Settings, description: "Preferências do sistema" },
];

export default function MenuPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Menu</h1>

      <div className="space-y-2">
        {menuItems.map((item) => {
          const Wrapper = item.path ? Link : "button";
          const wrapperProps = item.path ? { to: item.path } : {};
          return (
            <Wrapper
              key={item.label}
              {...(wrapperProps as any)}
              className="flex w-full items-center gap-4 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-accent/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </Wrapper>
          );
        })}
      </div>

      <button className="mt-8 flex items-center gap-3 text-sm text-destructive hover:underline">
        <LogOut className="h-4 w-4" />
        Sair
      </button>
    </div>
  );
}
