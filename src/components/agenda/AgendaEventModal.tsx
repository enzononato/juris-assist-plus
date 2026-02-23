import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, X, Pencil, Check, CalendarDays, Gavel, ExternalLink, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { CalendarEvent } from "./agendaHelpers";

function eventTypeLabel(type: string) {
  return type === "audiencia" ? "Audiência" : type === "prazo" ? "Prazo" : "Tarefa";
}

function eventTypeIcon(type: string) {
  if (type === "audiencia") return <Gavel className="h-3.5 w-3.5" />;
  if (type === "prazo") return <Clock className="h-3.5 w-3.5" />;
  return <ListTodo className="h-3.5 w-3.5" />;
}

export function EventModal({ event, onClose, onSaveTime }: {
  event: CalendarEvent;
  onClose: () => void;
  onSaveTime: (eventKey: string, newTime: string) => void;
}) {
  const [editingTime, setEditingTime] = useState(false);
  const [editHour, setEditHour] = useState(event.time ? event.time.split(":")[0] : "08");
  const [editMin, setEditMin] = useState(event.time ? event.time.split(":")[1] : "00");

  const eventKey = `${event.type}::${event.title}::${event.date}`;

  const handleSave = () => {
    const newTime = `${editHour.padStart(2,"0")}:${editMin.padStart(2,"0")}`;
    onSaveTime(eventKey, newTime);
    setEditingTime(false);
    toast({ title: "Horário atualizado", description: `Novo horário: ${newTime}` });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border bg-card p-5 shadow-elevated animate-in fade-in slide-in-from-bottom-4 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-3">
          <Badge className={cn(
            "text-[10px] gap-1 border-0",
            event.type === "audiencia" ? "bg-primary/15 text-primary" :
            event.type === "prazo" ? "bg-warning/15 text-warning" :
            "bg-success/15 text-success"
          )}>
            {eventTypeIcon(event.type)}
            {eventTypeLabel(event.type)}
          </Badge>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <h3 className="text-sm font-bold mb-3">{event.title}</h3>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
            {editingTime ? (
              <div className="flex items-center gap-1">
                <select
                  value={editHour}
                  onChange={(e) => setEditHour(e.target.value)}
                  className="h-7 w-14 rounded-md border bg-background px-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {Array.from({ length: 24 }, (_, i) => String(i).padStart(2,"0")).map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <span className="text-xs font-bold text-muted-foreground">:</span>
                <select
                  value={editMin}
                  onChange={(e) => setEditMin(e.target.value)}
                  className="h-7 w-14 rounded-md border bg-background px-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {["00","05","10","15","20","25","30","35","40","45","50","55"].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <button
                  onClick={handleSave}
                  className="ml-1 flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setEditingTime(false)}
                  className="flex h-6 w-6 items-center justify-center rounded-md border text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 group/time">
                <span className="text-xs text-muted-foreground">{event.time ?? "Sem horário"}</span>
                <button
                  onClick={() => setEditingTime(true)}
                  className="opacity-0 group-hover/time:opacity-100 transition-opacity flex h-5 w-5 items-center justify-center rounded hover:bg-accent"
                >
                  <Pencil className="h-3 w-3 text-muted-foreground" />
                </button>
              </div>
            )}
          </div>
          {event.employee && <p className="text-xs text-muted-foreground flex items-center gap-1.5"><CalendarDays className="h-3 w-3" /> {event.employee}</p>}
          {event.detail && <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Gavel className="h-3 w-3" /> {event.detail}</p>}
          {event.caseNumber && <p className="text-xs text-muted-foreground font-mono">{event.caseNumber}</p>}
          {event.assignees && <p className="text-xs text-muted-foreground">👥 {event.assignees.join(", ")}</p>}
        </div>
        {event.caseId && (
          <Button asChild size="sm" className="w-full mt-4 gap-2 rounded-xl" style={{ background: "var(--gradient-primary)" }}>
            <Link to={`/processos/${event.caseId}`}>
              <ExternalLink className="h-3.5 w-3.5" /> Ver Processo
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
