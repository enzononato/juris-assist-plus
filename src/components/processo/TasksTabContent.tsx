import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Lock, Edit, Clock, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { taskStatusLabels, priorityLabels } from "@/data/mock";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { AppRole } from "@/contexts/AuthContext";

interface TasksTabContentProps {
  tasks: any[];
  isEncerrado: boolean;
  userRole?: AppRole;
  currentUserName: string;
  onTaskUpdated: () => void;
}

export default function TasksTabContent({
  tasks,
  isEncerrado,
  userRole,
  currentUserName,
  onTaskUpdated,
}: TasksTabContentProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTime, setEditTime] = useState("");
  const [saving, setSaving] = useState(false);

  const canEditTime = (task: any) => {
    if (isEncerrado) return false;
    // Admin can always edit
    if (userRole === "admin") return true;
    // DP/RH can edit (they are typically the creators)
    if (userRole === "dp" || userRole === "rh") return true;
    // Responsavel juridico interno (director) can edit
    if (userRole === "responsavel_juridico_interno") return true;
    return false;
  };

  const startEditing = (task: any) => {
    const currentTime = task.due_at
      ? new Date(task.due_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false })
      : "09:00";
    setEditTime(currentTime);
    setEditingId(task.id);
  };

  const saveTime = async (task: any) => {
    setSaving(true);
    try {
      const currentDueAt = task.due_at ? new Date(task.due_at) : new Date();
      const [hours, minutes] = editTime.split(":").map(Number);
      currentDueAt.setHours(hours, minutes, 0, 0);

      const { error } = await supabase
        .from("tasks")
        .update({ due_at: currentDueAt.toISOString() })
        .eq("id", task.id);

      if (error) throw error;
      toast({ title: "Horário atualizado com sucesso." });
      onTaskUpdated();
    } catch (err) {
      toast({ title: "Erro ao atualizar horário", variant: "destructive" });
    } finally {
      setSaving(false);
      setEditingId(null);
    }
  };

  const formatTime = (dueAt: string | null) => {
    if (!dueAt) return null;
    return new Date(dueAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-3">
      {!isEncerrado ? (
        <div className="flex justify-end">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" asChild>
            <Link to="/tarefas/nova"><Plus className="h-3.5 w-3.5" /> Nova Tarefa</Link>
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 px-4 py-2.5">
          <Lock className="h-3.5 w-3.5 text-muted-foreground/60" />
          <p className="text-xs text-muted-foreground/70">Criação de tarefas bloqueada para processos encerrados.</p>
        </div>
      )}
      {tasks.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma tarefa vinculada.</p>}
      {tasks.map((t) => (
        <div key={t.id} className={cn("flex items-center gap-3 rounded-lg border bg-card p-4", isEncerrado && "opacity-75")}>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{t.title}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              <Badge variant="outline" className="text-[10px]">
                {taskStatusLabels[t.status as keyof typeof taskStatusLabels] ?? t.status}
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                {priorityLabels[t.priority as keyof typeof priorityLabels] ?? t.priority}
              </Badge>
              {t.due_at && editingId !== t.id && (
                <Badge variant="outline" className="text-[10px] gap-1">
                  <Clock className="h-2.5 w-2.5" />
                  {new Date(t.due_at).toLocaleDateString("pt-BR")}
                  {formatTime(t.due_at) && ` às ${formatTime(t.due_at)}`}
                </Badge>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{(t.assignees ?? []).join(", ")}</p>
          </div>

          {/* Time editing */}
          {editingId === t.id ? (
            <div className="flex items-center gap-1.5">
              <Input
                type="time"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                className="h-8 w-28 text-xs"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-success"
                disabled={saving}
                onClick={() => saveTime(t)}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground"
                onClick={() => setEditingId(null)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            canEditTime(t) && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                title="Editar horário"
                onClick={() => startEditing(t)}
              >
                <Clock className="h-3.5 w-3.5" />
              </Button>
            )
          )}
        </div>
      ))}
    </div>
  );
}
