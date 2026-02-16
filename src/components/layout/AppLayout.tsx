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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { label: "Tarefas", icon: ClipboardList, path: "/tarefas" },
  { label: "Agenda", icon: CalendarDays, path: "/agenda" },
  { label: "Processos", icon: Scale, path: "/processos" },
  { label: "Responsáveis", icon: UserCheck, path: "/responsaveis" },
  { label: "Alertas", icon: Bell, path: "/alertas" },
  { label: "Menu", icon: Menu, path: "/menu" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isMobile = useIsMobile();

  const isActive = (path: string) => location.pathname.startsWith(path);

  if (isMobile) {
    return (
      <div className="flex min-h-svh flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card px-4">
          <h1 className="text-lg font-bold tracking-tight text-foreground">SIAG</h1>
          <span className="text-xs font-medium text-muted-foreground">Trabalhista</span>
        </header>
        <main className="flex-1 overflow-auto pb-20">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-card">
          <div className="flex h-16 items-center justify-around">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1 text-[11px] font-medium transition-colors",
                  isActive(item.path)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
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

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
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
              AJ
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">Ana Jurídico</p>
              <p className="truncate text-[11px] text-sidebar-foreground/50">
                Resp. Jurídico Interno
              </p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
