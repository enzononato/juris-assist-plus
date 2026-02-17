import { ReactNode } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  ClipboardList,
  CalendarDays,
  Scale,
  Bell,
  Menu,
  Plus,
  UserCheck,
  LayoutDashboard,
  BarChart3,
  LogOut,
  Building2,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth, roleLabels } from "@/contexts/AuthContext";
import JuriaChatButton from "@/components/ai/JuriaChatButton";

const navItems = [
  { label: "Dashboard", mobileLabel: "Home", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Tarefas", mobileLabel: "Tarefas", icon: ClipboardList, path: "/tarefas" },
  { label: "Agenda", mobileLabel: "Agenda", icon: CalendarDays, path: "/agenda" },
  { label: "Processos", mobileLabel: "Processos", icon: Scale, path: "/processos" },
  { label: "Responsáveis", mobileLabel: "Resp.", icon: UserCheck, path: "/responsaveis" },
  { label: "Relatórios", mobileLabel: "Relatórios", icon: BarChart3, path: "/relatorios" },
  { label: "Alertas", mobileLabel: "Alertas", icon: Bell, path: "/alertas" },
  { label: "Menu", mobileLabel: "Menu", icon: Menu, path: "/menu" },
];

const mobileNavItems = navItems.filter((i) =>
  ["/dashboard", "/tarefas", "/processos", "/alertas", "/menu"].includes(i.path)
);

export default function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path || (path !== "/dashboard" && location.pathname.startsWith(path));

  const initials = user ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "??";

  if (isMobile) {
    return (
      <div className="flex min-h-svh flex-col bg-background">
        <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b bg-card/95 px-4 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-primary" />
            <h1 className="text-base font-bold tracking-tight text-foreground">SIAG</h1>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <Badge variant="outline" className="text-[9px] gap-1">
                <Shield className="h-2.5 w-2.5" />
                {roleLabels[user.role]}
              </Badge>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={logout}>
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto pb-[68px]">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 backdrop-blur-sm safe-area-pb">
          <div className="flex h-[60px] items-center justify-around px-1">
            {mobileNavItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-all",
                    active ? "text-primary" : "text-muted-foreground active:text-foreground"
                  )}
                >
                  <div className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full transition-all",
                    active && "bg-primary/10"
                  )}>
                    <item.icon className={cn("h-4 w-4", active && "scale-110")} />
                  </div>
                  {item.mobileLabel}
                </Link>
              );
            })}
          </div>
        </nav>
        <JuriaChatButton />
      </div>
    );
  }

  return (
    <div className="flex min-h-svh">
      <aside className="sticky top-0 flex h-svh w-60 flex-col border-r bg-sidebar text-sidebar-foreground">
        <div className="flex h-16 items-center gap-2 px-5">
          <Scale className="h-6 w-6 text-sidebar-primary" />
          <div>
            <h1 className="text-sm font-bold tracking-tight">SIAG</h1>
            <p className="text-[10px] font-medium text-sidebar-foreground/60">
              Trabalhista – DP/Jurídico
            </p>
          </div>
        </div>

        <div className="px-3 pb-2">
          <Button asChild className="w-full gap-2" size="sm">
            <Link to="/tarefas/nova">
              <Plus className="h-4 w-4" />
              Criar
            </Link>
          </Button>
        </div>

        <nav className="flex-1 space-y-0.5 px-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(item.path)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.name}</p>
              <p className="truncate text-[11px] text-sidebar-foreground/50">
                {user ? roleLabels[user.role] : ""}
              </p>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-sidebar-foreground/50 hover:text-sidebar-foreground" onClick={logout}>
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
          {user && user.company_id !== "all" && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-sidebar-foreground/50">
              <Building2 className="h-3 w-3" />
              {user.company_name}
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
      <JuriaChatButton />
    </div>
  );
}
