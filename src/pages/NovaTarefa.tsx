import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, X, User, Users, CheckSquare } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { availableMockUsers } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useNotificationsContext } from "@/contexts/NotificationsContext";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const ALL_USERS = availableMockUsers.map((u) => u.name);

export default function NovaTarefa() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationsContext();

  // Processo
  const [caseSearch, setCaseSearch] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [casePopoverOpen, setCasePopoverOpen] = useState(false);

  // Responsáveis
  const [userSearch, setUserSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>(user ? [user.name] : []);
  const [userPopoverOpen, setUserPopoverOpen] = useState(false);

  // Gestor
  const [manager, setManager] = useState("nenhum");

  // Tarefa
  const [description, setDescription] = useState("");

  // Data / Hora
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("");
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  // Opções
  const [showInCalendar, setShowInCalendar] = useState(true);
  const [allDay, setAllDay] = useState(false);

  // Priority
  const [priority, setPriority] = useState("media");

  const [submitting, setSubmitting] = useState(false);

  // Fetch cases from Supabase
  const { data: cases = [] } = useQuery({
    queryKey: ["all-cases-for-task"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select("id, case_number, employee_name, theme")
        .order("case_number");
      if (error) throw error;
      return data ?? [];
    },
  });

  const selectedCase = selectedCaseId ? cases.find((c) => c.id === selectedCaseId) : null;

  const filteredCases = useMemo(() => {
    const q = caseSearch.toLowerCase();
    return cases.filter(
      (c) =>
        c.case_number.toLowerCase().includes(q) ||
        (c.employee_name ?? "").toLowerCase().includes(q) ||
        (c.theme ?? "").toLowerCase().includes(q)
    );
  }, [caseSearch, cases]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.toLowerCase();
    return ALL_USERS.filter((u) => u.toLowerCase().includes(q) && !selectedUsers.includes(u));
  }, [userSearch, selectedUsers]);

  const addUser = (name: string) => {
    setSelectedUsers((prev) => [...prev, name]);
    setUserSearch("");
  };

  const removeUser = (name: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u !== name));
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (selectedUsers.length === 0) newErrors.users = "Adicione ao menos um responsável.";
    if (!description.trim()) newErrors.description = "Descreva a tarefa.";
    if (!date) newErrors.date = "Selecione uma data.";
    if (!allDay && !time) newErrors.time = "Informe a hora ou marque 'Dia inteiro'.";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const responsavelNames = selectedUsers.join(", ");
      const caseLabel = selectedCase ? ` · ${selectedCase.case_number}` : "";
      const dueAt = date!.toISOString().split("T")[0] + (allDay ? "T23:59:00" : `T${time}:00`);

      const { error } = await supabase.from("tasks").insert({
        title: description.trim(),
        case_id: selectedCaseId || null,
        assignees: [...selectedUsers],
        due_at: dueAt,
        priority: priority as any,
        status: "aberta" as any,
        show_in_calendar: showInCalendar,
        all_day: allDay,
      });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["agenda-tasks"] });

      addNotification({
        title: `Tarefa atribuída a você${caseLabel}`,
        description: description.trim().slice(0, 80) + (description.length > 80 ? "…" : ""),
        type: "tarefa",
      });

      toast({
        title: "✅ Tarefa criada!",
        description: `Notificação enviada para ${responsavelNames}${manager && manager !== "nenhum" ? ` e gestor ${manager}` : ""}.`,
      });
      navigate("/tarefas");
    } catch (err: any) {
      toast({ title: "Erro ao criar tarefa", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Button variant="ghost" size="sm" asChild className="mb-4 gap-1 text-muted-foreground">
        <Link to="/tarefas"><ArrowLeft className="h-4 w-4" /> Voltar</Link>
      </Button>

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
          <CheckSquare className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Criar nova tarefa</h1>
          <p className="text-xs text-muted-foreground">Preencha os dados e atribua ao responsável</p>
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>

        {/* Processo ou caso */}
        <div className="space-y-2">
          <Label>Processo ou caso</Label>
          <Popover open={casePopoverOpen} onOpenChange={setCasePopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-10",
                  !selectedCase && "text-muted-foreground"
                )}
              >
                <Search className="mr-2 h-4 w-4 shrink-0" />
                {selectedCase
                  ? <span className="truncate">{selectedCase.employee_name} · {selectedCase.case_number}</span>
                  : "Buscar por nome do colaborador ou nº do processo"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[360px] p-0" align="start">
              <div className="p-3 border-b">
                <Input
                  placeholder="Buscar..."
                  value={caseSearch}
                  onChange={(e) => setCaseSearch(e.target.value)}
                  autoFocus
                  className="h-8 text-sm"
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredCases.length === 0 ? (
                  <p className="p-4 text-center text-sm text-muted-foreground">Nenhum processo encontrado</p>
                ) : (
                  filteredCases.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="w-full px-3 py-2.5 text-left hover:bg-accent transition-colors"
                      onClick={() => {
                        setSelectedCaseId(c.id);
                        setCasePopoverOpen(false);
                        setCaseSearch("");
                      }}
                    >
                      <p className="text-sm font-medium">{c.employee_name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{c.case_number} · {c.theme ?? ""}</p>
                    </button>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
          {selectedCase && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
              <span className="font-medium text-foreground">{selectedCase.employee_name}</span>
              <span>·</span>
              <span>{selectedCase.case_number}</span>
              <button type="button" className="ml-auto text-muted-foreground hover:text-destructive" onClick={() => setSelectedCaseId(null)}>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Responsáveis */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            Responsáveis *
          </Label>
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {selectedUsers.map((u) => (
              <Badge key={u} variant="secondary" className="gap-1 text-xs font-medium pr-1">
                <User className="h-3 w-3" />
                {u}
                <button type="button" onClick={() => removeUser(u)} className="ml-0.5 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <Popover open={userPopoverOpen} onOpenChange={setUserPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 font-normal" type="button">
                <Search className="h-3 w-3" /> Adicionar responsável
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0" align="start">
              <div className="p-3 border-b">
                <Input
                  placeholder="Buscar nome..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  autoFocus
                  className="h-8 text-sm"
                />
              </div>
              <div className="max-h-40 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <p className="p-3 text-center text-sm text-muted-foreground">Nenhum usuário</p>
                ) : (
                  filteredUsers.map((u) => (
                    <button
                      key={u}
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2"
                      onClick={() => { addUser(u); setUserPopoverOpen(false); }}
                    >
                      <User className="h-3.5 w-3.5 text-muted-foreground" /> {u}
                    </button>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
          {errors.users && <p className="text-xs text-destructive">{errors.users}</p>}
        </div>

        {/* Gestor responsável */}
        <div className="space-y-2">
          <Label>Gestor responsável</Label>
          <Select value={manager} onValueChange={setManager}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Selecione o gestor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nenhum">Nenhum</SelectItem>
              {ALL_USERS.map((u) => (
                <SelectItem key={u} value={u}>{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground">O gestor receberá notificações sobre atualizações desta tarefa.</p>
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <Label>Descrição da tarefa *</Label>
          <Textarea
            placeholder="Descreva a tarefa..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
          {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
        </div>

        {/* Data */}
        <div className="space-y-2">
          <Label>Data de vencimento *</Label>
          <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start h-10 text-left font-normal", !date && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP", { locale: ptBR }) : "Selecionar data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={(d) => { setDate(d); setDatePopoverOpen(false); }} locale={ptBR} />
            </PopoverContent>
          </Popover>
          {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
        </div>

        {/* Hora + dia inteiro */}
        <div className="flex items-end gap-4">
          <div className="flex-1 space-y-2">
            <Label>Hora</Label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-10" disabled={allDay} />
            {errors.time && <p className="text-xs text-destructive">{errors.time}</p>}
          </div>
          <div className="flex items-center gap-2 pb-2">
            <Checkbox id="all-day" checked={allDay} onCheckedChange={(v) => setAllDay(!!v)} />
            <Label htmlFor="all-day" className="text-xs cursor-pointer">Dia inteiro</Label>
          </div>
        </div>

        {/* Prioridade */}
        <div className="space-y-2">
          <Label>Prioridade</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="baixa">Baixa</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="critica">Crítica</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Exibir na agenda */}
        <div className="flex items-center gap-2">
          <Checkbox id="show-calendar" checked={showInCalendar} onCheckedChange={(v) => setShowInCalendar(!!v)} />
          <Label htmlFor="show-calendar" className="text-xs cursor-pointer">Exibir na agenda</Label>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <Button type="submit" className="gap-2 flex-1" style={{ background: "var(--gradient-primary)" }} disabled={submitting}>
            {submitting ? "Criando..." : "Criar Tarefa"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to="/tarefas">Cancelar</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
