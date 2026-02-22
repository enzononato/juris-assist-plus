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
import { mockCases, mockTasks, type Task } from "@/data/mock";
import { useMockData } from "@/contexts/MockDataContext";
import { availableMockUsers } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useNotificationsContext } from "@/contexts/NotificationsContext";
import { cn } from "@/lib/utils";

const ALL_USERS = availableMockUsers.map((u) => u.name);

export default function NovaTarefa() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifyChange } = useMockData();
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

  const selectedCase = selectedCaseId ? mockCases.find((c) => c.id === selectedCaseId) : null;

  const filteredCases = useMemo(() => {
    const q = caseSearch.toLowerCase();
    return mockCases.filter(
      (c) =>
        c.case_number.toLowerCase().includes(q) ||
        c.employee.toLowerCase().includes(q) ||
        c.theme.toLowerCase().includes(q)
    );
  }, [caseSearch]);

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

  const handleSubmit = (e: React.FormEvent) => {
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

    const responsavelNames = selectedUsers.join(", ");
    const caseLabel = selectedCase ? ` · ${selectedCase.case_number}` : "";

    // Persist task into mock array so it survives navigation
    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: description.trim(),
      case_id: selectedCaseId ?? undefined,
      case_number: selectedCase?.case_number,
      employee: selectedCase?.employee,
      assignees: [...selectedUsers],
      due_at: date!.toISOString().split("T")[0] + (allDay ? "T23:59:00" : `T${time}:00`),
      priority: priority as Task["priority"],
      status: "aberta",
      show_in_calendar: showInCalendar,
      all_day: allDay,
    };
    mockTasks.push(newTask);
    notifyChange();

    // Dispara notificação in-app global
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
                  ? <span className="truncate">{selectedCase.employee} · {selectedCase.case_number}</span>
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
                      <p className="text-sm font-medium">{c.employee}</p>
                      <p className="text-xs text-muted-foreground">{c.case_number} · {c.theme}</p>
                    </button>
                  ))
                )}
              </div>
              {selectedCase && (
                <div className="border-t p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-muted-foreground"
                    onClick={() => { setSelectedCaseId(null); setCasePopoverOpen(false); }}
                  >
                    <X className="h-3 w-3 mr-1" /> Remover vínculo
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
          {selectedCase && (
            <div className="rounded-lg bg-primary/5 border border-primary/20 px-3 py-2 text-xs text-primary flex items-center justify-between gap-2">
              <span className="font-medium truncate">{selectedCase.case_number} · {selectedCase.theme}</span>
              <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0" onClick={() => setSelectedCaseId(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Responsáveis */}
        <div className="space-y-2">
          <Label>Adicionar responsáveis *</Label>
          <Popover open={userPopoverOpen} onOpenChange={setUserPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-10 text-muted-foreground",
                  errors.users && "border-destructive"
                )}
              >
                <Users className="mr-2 h-4 w-4" />
                Buscar usuário...
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <div className="p-3 border-b">
                <Input
                  placeholder="Nome do usuário..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  autoFocus
                  className="h-8 text-sm"
                />
              </div>
              <div className="max-h-40 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <p className="p-4 text-center text-sm text-muted-foreground">Nenhum usuário encontrado</p>
                ) : (
                  filteredUsers.map((u) => (
                    <button
                      key={u}
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-accent transition-colors"
                      onClick={() => { addUser(u); setUserPopoverOpen(false); }}
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {u[0]}
                      </div>
                      <span className="text-sm">{u}</span>
                    </button>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
          {errors.users && <p className="text-xs text-destructive">{errors.users}</p>}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedUsers.map((u) => (
                <Badge key={u} variant="secondary" className="gap-1 pr-1">
                  <User className="h-3 w-3" />
                  {u}
                  <button type="button" onClick={() => removeUser(u)} className="ml-0.5 rounded-sm hover:bg-destructive/20 p-0.5">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Gestor responsável */}
        <div className="space-y-2">
          <Label>Gestor responsável</Label>
          <Select value={manager} onValueChange={setManager}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o gestor (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nenhum">Nenhum</SelectItem>
              {ALL_USERS.map((u) => (
                <SelectItem key={u} value={u}>{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">O gestor receberá notificação in-app ao criar esta tarefa.</p>
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <Label>Tarefa *</Label>
          <Textarea
            placeholder="O que essa pessoa irá fazer?"
            rows={3}
            value={description}
            onChange={(e) => { setDescription(e.target.value); if (e.target.value.trim()) setErrors((p) => ({ ...p, description: "" })); }}
            className={cn(errors.description && "border-destructive")}
          />
          {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
        </div>

        {/* Data e Hora */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Data *</Label>
            <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                    errors.date && "border-destructive"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd/MM/yyyy") : "Selecionar"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => { setDate(d); setDatePopoverOpen(false); setErrors((p) => ({ ...p, date: "" })); }}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
          </div>
          <div className="space-y-2">
            <Label>Hora {!allDay && "*"}</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => { setTime(e.target.value); setErrors((p) => ({ ...p, time: "" })); }}
              disabled={allDay}
              className={cn(allDay ? "opacity-40" : "", errors.time && "border-destructive")}
            />
            {errors.time && <p className="text-xs text-destructive">{errors.time}</p>}
          </div>
        </div>

        {/* Prioridade */}
        <div className="space-y-2">
          <Label>Prioridade</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger>
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

        {/* Opções */}
        <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Opções</p>
          <div className="flex items-center gap-2">
            <Checkbox
              id="cal"
              checked={showInCalendar}
              onCheckedChange={(v) => setShowInCalendar(!!v)}
            />
            <Label htmlFor="cal" className="text-sm font-normal cursor-pointer">Mostrar na agenda</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="allday"
              checked={allDay}
              onCheckedChange={(v) => setAllDay(!!v)}
            />
            <Label htmlFor="allday" className="text-sm font-normal cursor-pointer">Dia inteiro</Label>
          </div>
        </div>

        {/* Resumo da notificação */}
        {selectedUsers.length > 0 && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-primary">
            <p className="font-semibold mb-0.5">📬 Notificações in-app serão enviadas para:</p>
            <p className="text-primary/80">
              {selectedUsers.join(", ")}{manager && manager !== "nenhum" ? ` e gestor ${manager}` : ""}
            </p>
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-11 font-semibold text-sm"
          style={{ background: "var(--gradient-primary)" }}
        >
          Criar Tarefa
        </Button>
      </form>
    </div>
  );
}
