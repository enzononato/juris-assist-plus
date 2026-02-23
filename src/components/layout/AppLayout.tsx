import { ReactNode, useState } from "react";
import PageTransition from "@/components/layout/PageTransition";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  ClipboardList,
  CalendarDays,
  Scale,
  Bell,
  Menu,
  Plus,
  UserCheck,
  Users,
  LayoutDashboard,
  BarChart3,
  LogOut,
  Building2,
  Shield,
  FileText,
  CheckSquare,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth, roleLabels } from "@/contexts/AuthContext";
import { useAlerts } from "@/contexts/AlertsContext";
import JuriaChatButton from "@/components/ai/JuriaChatButton";
import ThemeToggle from "@/components/theme/ThemeToggle";
import InAppNotificationBell from "@/components/notifications/InAppNotificationBell";
import ProfileDialog, { getUserAvatar } from "@/components/profile/ProfileDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const allNavItems = [
  { label: "Dashboard", mobileLabel: "Home", icon: LayoutDashboard, path: "/dashboard", external: true, adminOnly: false },
  { label: "Tarefas", mobileLabel: "Tarefas", icon: ClipboardList, path: "/tarefas", external: true, adminOnly: false },
  { label: "Agenda", mobileLabel: "Agenda", icon: CalendarDays, path: "/agenda", external: true, adminOnly: false },
  { label: "Processos", mobileLabel: "Processos", icon: Scale, path: "/processos", external: true, adminOnly: false },
  { label: "Responsáveis", mobileLabel: "Resp.", icon: UserCheck, path: "/responsaveis", external: false, adminOnly: true },
  { label: "Usuários e Permissões", mobileLabel: "Usuários", icon: Users, path: "/usuarios", external: false, adminOnly: true },
  { label: "Relatórios", mobileLabel: "Relatórios", icon: BarChart3, path: "/relatorios", external: false, adminOnly: false },
  { label: "Alertas", mobileLabel: "Alertas", icon: Bell, path: "/alertas", external: true, adminOnly: true },
  { label: "Menu", mobileLabel: "Menu", icon: Menu, path: "/menu", external: false, adminOnly: true },
];

// ─── Botão Criar com Dropdown ─────────────────────────────────────────────────
function CreateButton({ className }: { className?: string }) {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={cn(
            "gap-2 rounded-xl font-semibold shadow-glow-primary/50 transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]",
            className
          )}
          style={{ background: "var(--gradient-primary)" }}
        >
          <Plus className="h-4 w-4" />
          Criar
          <ChevronDown className="h-3 w-3 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer"
          onSelect={() => navigate("/processos/novo")}
        >
          <FileText className="h-4 w-4 text-primary" />
          <span>Criar Processo</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer"
          onSelect={() => navigate("/tarefas/nova")}
        >
          <CheckSquare className="h-4 w-4 text-success" />
          <span>Criar Tarefa</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Layout Principal ─────────────────────────────────────────────────────────
export default function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { user, logout, hasRole } = useAuth();
  const { untreatedCount } = useAlerts();
  const [profileOpen, setProfileOpen] = useState(false);
  const avatarUrl = user ? getUserAvatar(user.id) : null;

  const isExternal = hasRole(["advogado_externo"]);
  const isAdmin = hasRole(["admin"]);
  const navItems = allNavItems.filter((i) => {
    if (isExternal && !i.external) return false;
    if (i.adminOnly && !isAdmin) return false;
    return true;
  });
  const mobileNavItems = navItems.filter((i) =>
    ["/dashboard", "/tarefas", "/processos", "/alertas", "/menu"].includes(i.path)
  );

  const isActive = (path: string) => location.pathname === path || (path !== "/dashboard" && location.pathname.startsWith(path));

  const initials = user ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "??";

  if (isMobile) {
    return (
      <div className="flex min-h-svh flex-col bg-background">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b glass-strong px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "var(--gradient-primary)" }}>
              <Scale className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <h1 className="text-sm font-extrabold tracking-tighter text-foreground">SIAG</h1>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <button
                onClick={() => setProfileOpen(true)}
                className="shrink-0 rounded-full overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={user.name} className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                    {initials}
                  </div>
                )}
              </button>
            )}
            <ThemeToggle className="h-7 w-7 text-muted-foreground" />
            <InAppNotificationBell />
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={logout}>
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto pb-[72px]"><PageTransition>{children}</PageTransition></main>
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t glass-strong safe-area-pb">
          <div className="flex h-[64px] items-center justify-around px-1">
            {mobileNavItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-semibold transition-all",
                    active ? "text-primary" : "text-muted-foreground active:text-foreground"
                  )}
                >
                  <div className={cn(
                    "relative flex h-7 w-7 items-center justify-center rounded-xl transition-all duration-200",
                    active && "bg-primary/10 scale-110"
                  )}>
                    <item.icon className={cn("h-[18px] w-[18px] transition-all", active && "text-primary")} />
                    {item.path === "/alertas" && untreatedCount > 0 && (
                      <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[8px] font-bold text-destructive-foreground shadow-sm">
                        {untreatedCount}
                      </span>
                    )}
                  </div>
                  {item.mobileLabel}
                </Link>
              );
            })}
          </div>
        </nav>
        <JuriaChatButton />
        <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      </div>
    );
  }

  return (
    <div className="flex min-h-svh">
      <aside className="sticky top-0 flex h-svh w-[240px] flex-col bg-sidebar text-sidebar-foreground">
        {/* Brand */}
        <div className="flex h-16 items-center gap-3 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl shadow-sm" style={{ background: "var(--gradient-primary)" }}>
            <Scale className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tighter">SIAG</h1>
            <p className="text-[10px] font-medium text-sidebar-foreground/50">
              Trabalhista – DP/Jurídico
            </p>
          </div>
        </div>

        {/* Create button */}
        <div className="px-3 pb-3">
          <CreateButton className="w-full h-10" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-3 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all duration-200",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
                )}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full" style={{ background: "var(--gradient-primary)" }} />
                )}
                <item.icon className={cn("h-4 w-4 transition-all duration-200", active ? "text-sidebar-primary" : "group-hover:text-sidebar-foreground/80")} />
                <span className="flex-1">{item.label}</span>
                {item.path === "/alertas" && untreatedCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-destructive-foreground shadow-sm" style={{ background: "var(--gradient-danger)" }}>
                    {untreatedCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setProfileOpen(true)}
              className="shrink-0 rounded-xl overflow-hidden hover:ring-2 hover:ring-sidebar-primary/50 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={user?.name} className="h-9 w-9 rounded-xl object-cover" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold text-sidebar-primary-foreground shadow-sm" style={{ background: "var(--gradient-primary)" }}>
                  {initials}
                </div>
              )}
            </button>
            <button
              onClick={() => setProfileOpen(true)}
              className="min-w-0 flex-1 text-left hover:opacity-80 transition-opacity focus:outline-none"
            >
              <p className="truncate text-sm font-semibold">{user?.name}</p>
              <p className="truncate text-[11px] text-sidebar-foreground/40 font-medium">
                {user ? roleLabels[user.role] : ""}
              </p>
            </button>
            <InAppNotificationBell />
            <ThemeToggle className="h-8 w-8 rounded-xl text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all" />
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all" onClick={logout}>
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
          {user && user.company_id !== "all" && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-sidebar-foreground/40 font-medium">
              <Building2 className="h-3 w-3" />
              {user.company_name}
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-background"><PageTransition>{children}</PageTransition></main>
      <JuriaChatButton />
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </div>
  );
}
