import {
  Building2, Users, Settings, Shield, FileText, LogOut, Plug, CalendarDays,
  UserCheck, BarChart3, Bell, ShieldCheck, GanttChart, BookOpen, LayoutDashboard,
  FolderKanban, ListTodo, AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MenuItem {
  label: string;
  icon: React.ElementType;
  description: string;
  path?: string;
  color: string;
  bgColor: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const sections: MenuSection[] = [
  {
    title: "Principal",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, description: "Visão geral do sistema", path: "/dashboard", color: "text-primary", bgColor: "bg-primary/10" },
      { label: "Processos", icon: FolderKanban, description: "Gerenciar processos trabalhistas", path: "/processos", color: "text-info", bgColor: "bg-info/10" },
      { label: "Tarefas", icon: ListTodo, description: "Acompanhar atividades pendentes", path: "/tarefas", color: "text-success", bgColor: "bg-success/10" },
      { label: "Agenda", icon: CalendarDays, description: "Calendário unificado", path: "/agenda", color: "text-warning", bgColor: "bg-warning/10" },
      { label: "Alertas", icon: AlertTriangle, description: "Notificações e avisos críticos", path: "/alertas", color: "text-destructive", bgColor: "bg-destructive/10" },
    ],
  },
  {
    title: "Gestão",
    items: [
      { label: "Cronograma", icon: GanttChart, description: "Fases do projeto", path: "/cronograma", color: "text-primary", bgColor: "bg-primary/10" },
      { label: "Relatórios", icon: BarChart3, description: "KPIs e dashboards", path: "/relatorios", color: "text-info", bgColor: "bg-info/10" },
      { label: "Responsáveis", icon: UserCheck, description: "Gerenciar contatos", path: "/responsaveis", color: "text-success", bgColor: "bg-success/10" },
      { label: "Empresas e Filiais", icon: Building2, description: "Gerenciar organizações", path: "/empresas", color: "text-warning", bgColor: "bg-warning/10" },
    ],
  },
  {
    title: "Configuração",
    items: [
      { label: "Usuários e Permissões", icon: Users, description: "Controle de acesso", path: "/usuarios", color: "text-primary", bgColor: "bg-primary/10" },
      { label: "Templates de Checklists", icon: FileText, description: "Modelos parametrizáveis", path: "/checklists-templates", color: "text-info", bgColor: "bg-info/10" },
      { label: "Regras de Alertas", icon: Bell, description: "Offsets, SLAs e escalonamento", path: "/regras-alertas", color: "text-warning", bgColor: "bg-warning/10" },
      { label: "Integrações", icon: Plug, description: "WhatsApp, E-mail, Drive, IA", path: "/integracoes", color: "text-success", bgColor: "bg-success/10" },
    ],
  },
  {
    title: "Avançado",
    items: [
      { label: "Logs de Auditoria", icon: ShieldCheck, description: "Ações críticas do sistema", path: "/auditoria", color: "text-info", bgColor: "bg-info/10" },
      { label: "Casos Sigilosos", icon: Shield, description: "Sala segura", color: "text-destructive", bgColor: "bg-destructive/10" },
      { label: "Documentação & Go-Live", icon: BookOpen, description: "Treinamento, docs e checklist", path: "/documentacao", color: "text-primary", bgColor: "bg-primary/10" },
      { label: "Configurações", icon: Settings, description: "Preferências do sistema", color: "text-muted-foreground", bgColor: "bg-muted" },
    ],
  },
];

function MenuCard({ item }: { item: MenuItem }) {
  const Wrapper = item.path ? Link : "div";
  const wrapperProps = item.path ? { to: item.path } : {};

  return (
    <Wrapper
      {...(wrapperProps as any)}
      className={cn(
        "group flex flex-col items-center gap-3 rounded-2xl border bg-card p-5 text-center transition-all",
        "hover:shadow-card hover:-translate-y-1 hover:border-primary/20",
        item.path ? "cursor-pointer" : "cursor-default opacity-60",
      )}
    >
      <div className={cn(
        "flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
        item.bgColor,
      )}>
        <item.icon className={cn("h-6 w-6", item.color)} />
      </div>
      <div>
        <p className="text-sm font-semibold">{item.label}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground leading-tight">{item.description}</p>
      </div>
    </Wrapper>
  );
}

export default function MenuPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Menu</h1>
        <p className="text-sm text-muted-foreground mt-1">Acesse todas as funcionalidades do SIAG</p>
      </div>

      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 px-1">
              {section.title}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {section.items.map((item) => (
                <MenuCard key={item.label} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 border-t pt-6">
        <button className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10">
          <LogOut className="h-4 w-4" />
          Sair do Sistema
        </button>
      </div>
    </div>
  );
}
