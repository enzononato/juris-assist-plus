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
  Search,
  Gavel,
  Clock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const statusLabels: Record<string, string> = {
  novo: "Novo", em_andamento: "Em Andamento", audiencia_marcada: "Audiência Marcada",
  sentenca: "Sentença", recurso: "Recurso", encerrado: "Encerrado",
};

const priorityLabels: Record<string, string> = {
  baixa: "Baixa", media: "Média", alta: "Alta", critica: "Crítica",
};

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

  const { data: cases = [] } = useQuery({
    queryKey: ["search-cases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select("id, case_number, employee_name, status")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["search-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("id, title, priority")
        .order("created_at", { ascending: false })
        .limit(15);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: hearings = [] } = useQuery({
    queryKey: ["search-hearings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hearings")
        .select("id, case_id, type, date, cases(employee_name)")
        .eq("status", "agendada" as any)
        .order("date")
        .limit(10);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: deadlines = [] } = useQuery({
    queryKey: ["search-deadlines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deadlines")
        .select("id, case_id, title, due_at")
        .eq("status", "pendente" as any)
        .order("due_at")
        .limit(10);
      if (error) throw error;
      return data ?? [];
    },
  });

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
              {cases.map((c: any) => (
                <CommandItem key={c.id} onSelect={() => go(`/processos/${c.id}`)}>
                  <Scale className="mr-2 h-4 w-4 text-primary" />
                  <span className="flex-1 truncate">
                    {c.case_number} — {c.employee_name ?? "—"}
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {statusLabels[c.status] ?? c.status}
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
              {tasks.map((t: any) => (
                <CommandItem key={t.id} onSelect={() => go("/tarefas")}>
                  <ClipboardList className="mr-2 h-4 w-4 text-success" />
                  <span className="flex-1 truncate">{t.title}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {priorityLabels[t.priority] ?? t.priority}
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
              {hearings.map((h: any) => (
                <CommandItem key={h.id} onSelect={() => go(`/processos/${h.case_id}`)}>
                  <Gavel className="mr-2 h-4 w-4 text-warning" />
                  <span className="flex-1 truncate">
                    {h.type} — {h.cases?.employee_name ?? "—"}
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
              {deadlines.map((d: any) => (
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
