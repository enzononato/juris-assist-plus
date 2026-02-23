import { useState } from "react";
import { X, Gavel, Clock, ListTodo, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

type EventType = "audiencia" | "prazo" | "tarefa";

const typeConfig: Record<EventType, { label: string; icon: React.ReactNode; color: string }> = {
  audiencia: { label: "Audiência", icon: <Gavel className="h-4 w-4" />, color: "bg-primary/10 text-primary border-primary/30" },
  prazo: { label: "Prazo", icon: <Clock className="h-4 w-4" />, color: "bg-warning/10 text-warning border-warning/30" },
  tarefa: { label: "Tarefa", icon: <ListTodo className="h-4 w-4" />, color: "bg-success/10 text-success border-success/30" },
};

export function CreateAgendaEventDialog({ initialDate, initialHour, onClose }: {
  initialDate: Date;
  initialHour?: number;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [eventType, setEventType] = useState<EventType>("tarefa");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(format(initialDate, "yyyy-MM-dd"));
  const [time, setTime] = useState(initialHour ? `${String(initialHour).padStart(2, "0")}:00` : "09:00");
  const [caseId, setCaseId] = useState<string>("");
  const [assignee, setAssignee] = useState("");

  const { data: cases = [] } = useQuery({
    queryKey: ["agenda-cases-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select("id, case_number, employee_name")
        .neq("status", "encerrado")
        .order("case_number");
      if (error) throw error;
      return data ?? [];
    },
  });

  const createEvent = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error("Título obrigatório");

      if (eventType === "tarefa") {
        const { error } = await supabase.from("tasks").insert({
          title,
          due_at: `${date}T${time}:00`,
          case_id: caseId || null,
          assignees: assignee ? [assignee] : [],
          show_in_calendar: true,
          status: "aberta" as any,
          priority: "media" as any,
        });
        if (error) throw error;
      } else if (eventType === "prazo") {
        if (!caseId) throw new Error("Selecione um processo para prazos");
        const { error } = await supabase.from("deadlines").insert({
          title,
          due_at: `${date}T${time}:00`,
          case_id: caseId,
          status: "pendente" as any,
        });
        if (error) throw error;
      } else {
        if (!caseId) throw new Error("Selecione um processo para audiências");
        const { error } = await supabase.from("hearings").insert({
          type: title,
          date,
          time,
          case_id: caseId,
          status: "agendada" as any,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agenda-hearings"] });
      queryClient.invalidateQueries({ queryKey: ["agenda-deadlines"] });
      queryClient.invalidateQueries({ queryKey: ["agenda-tasks"] });
      toast({ title: `${typeConfig[eventType].label} criada com sucesso ✓` });
      onClose();
    },
    onError: (err: Error) => {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-elevated animate-in fade-in slide-in-from-bottom-4 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold">Novo Evento</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Type selector */}
        <div className="flex gap-2 mb-5">
          {(Object.entries(typeConfig) as [EventType, typeof typeConfig[EventType]][]).map(([type, cfg]) => (
            <button
              key={type}
              onClick={() => setEventType(type)}
              className={cn(
                "flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all",
                eventType === type ? cfg.color : "border-border text-muted-foreground hover:border-foreground/20"
              )}
            >
              {cfg.icon}
              {cfg.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-xs font-semibold">
              {eventType === "audiencia" ? "Tipo da Audiência" : "Título"}
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={eventType === "audiencia" ? "Ex: Instrução e Julgamento" : "Ex: Preparar defesa"}
              className="mt-1 h-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Data</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 h-9" />
            </div>
            <div>
              <Label className="text-xs font-semibold">Horário</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 h-9" />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">
              Processo {eventType !== "tarefa" && <span className="text-destructive">*</span>}
            </Label>
            <Select value={caseId} onValueChange={setCaseId}>
              <SelectTrigger className="mt-1 h-9 text-xs">
                <SelectValue placeholder="Selecionar processo..." />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {eventType === "tarefa" && <SelectItem value="none">Sem processo</SelectItem>}
                {cases.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">
                    {c.case_number} · {c.employee_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {eventType === "tarefa" && (
            <div>
              <Label className="text-xs font-semibold">Responsável</Label>
              <Input
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Nome do responsável"
                className="mt-1 h-9"
              />
            </div>
          )}
        </div>

        <Button
          className="w-full mt-6 gap-2 rounded-xl"
          style={{ background: "var(--gradient-primary)" }}
          disabled={createEvent.isPending || !title.trim()}
          onClick={() => createEvent.mutate()}
        >
          {createEvent.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Criar {typeConfig[eventType].label}
        </Button>
      </div>
    </div>
  );
}
