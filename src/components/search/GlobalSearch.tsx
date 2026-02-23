import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Scale,
  ClipboardList,
  CalendarDays,
  LayoutDashboard,
  BarChart3,
  Bell,
  Users,
  UserCheck,
  Building2,
  FileText,
  Search,
  Gavel,
  Clock,
} from "lucide-react";
import {
  mockCases,
  mockTasks,
  mockHearings,
  mockDeadlines,
  statusLabels,
  priorityLabels,
} from "@/data/mock";

const pages = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Processos", path: "/processos", icon: Scale },
  { label: "Tarefas", path: "/tarefas", icon: ClipboardList },
  { label: "Agenda", path: "/agenda", icon: CalendarDays },
  { label: "Relatórios", path: "/relatorios", icon: BarChart3 },
  { label: "Alertas", path: "/alertas", icon: Bell },
  { label: "Responsáveis", path: "/responsaveis", icon: UserCheck },
  { label: "Usuários", path: "/usuarios", icon: Users },
  { label: "Empresas", path: "/empresas", icon: Building2 },
];

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        // Don't trigger if user is typing in an input/textarea
        const el = document.activeElement;
        if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || (el as HTMLElement).isContentEditable)) {
          if (e.key === "/") return;
        }
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const cases = useMemo(() => mockCases.slice(0, 20), []);
  const tasks = useMemo(() => mockTasks.slice(0, 15), []);
  const hearings = useMemo(
    () => mockHearings.filter((h) => h.status === "agendada").slice(0, 10),
    []
  );
  const deadlines = useMemo(
    () => mockDeadlines.filter((d) => d.status === "pendente").slice(0, 10),
    []
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar processos, tarefas, páginas..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

        <CommandGroup heading="Páginas">
          {pages.map((p) => (
            <CommandItem key={p.path} onSelect={() => go(p.path)}>
              <p.icon className="mr-2 h-4 w-4 text-muted-foreground" />
              {p.label}
            </CommandItem>
          ))}
        </CommandGroup>

        {cases.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Processos">
              {cases.map((c) => (
                <CommandItem key={c.id} onSelect={() => go(`/processos/${c.id}`)}>
                  <Scale className="mr-2 h-4 w-4 text-primary" />
                  <span className="flex-1 truncate">
                    {c.case_number} — {c.employee}
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {statusLabels[c.status]}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {tasks.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Tarefas">
              {tasks.map((t) => (
                <CommandItem key={t.id} onSelect={() => go("/tarefas")}>
                  <ClipboardList className="mr-2 h-4 w-4 text-success" />
                  <span className="flex-1 truncate">{t.title}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {priorityLabels[t.priority]}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {hearings.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Audiências">
              {hearings.map((h) => (
                <CommandItem key={h.id} onSelect={() => go(`/processos/${h.case_id}`)}>
                  <Gavel className="mr-2 h-4 w-4 text-warning" />
                  <span className="flex-1 truncate">
                    {h.type} — {h.employee}
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {new Date(h.date).toLocaleDateString("pt-BR")}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {deadlines.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Prazos Pendentes">
              {deadlines.map((d) => (
                <CommandItem key={d.id} onSelect={() => go(`/processos/${d.case_id}`)}>
                  <Clock className="mr-2 h-4 w-4 text-destructive" />
                  <span className="flex-1 truncate">{d.title}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {new Date(d.due_at).toLocaleDateString("pt-BR")}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
