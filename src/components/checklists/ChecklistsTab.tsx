import { useState } from "react";
import { CheckCircle2, Circle, Plus, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { type CaseChecklist, checklistTypeLabels, mockChecklistTemplates } from "@/data/mock";
import { cn } from "@/lib/utils";

interface Props {
  checklists: CaseChecklist[];
}

export default function ChecklistsTab({ checklists: initialChecklists }: Props) {
  const [checklists, setChecklists] = useState(initialChecklists);
  const [applyOpen, setApplyOpen] = useState(false);

  const toggleItem = (checklistId: string, itemId: string) => {
    setChecklists((prev) =>
      prev.map((cl) =>
        cl.id === checklistId
          ? {
              ...cl,
              items: cl.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      checked: !item.checked,
                      checked_by: !item.checked ? "Ana Jurídico" : undefined,
                      checked_at: !item.checked ? new Date().toISOString() : undefined,
                    }
                  : item
              ),
            }
          : cl
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Checklists do Processo</h3>
        <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Aplicar Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Aplicar Checklist</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setApplyOpen(false); }}>
              <div className="space-y-2">
                <Label>Template</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Selecione um template..." /></SelectTrigger>
                  <SelectContent>
                    {mockChecklistTemplates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} ({checklistTypeLabels[t.type]})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Aplicar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {checklists.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <ClipboardList className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Nenhum checklist aplicado a este processo.</p>
          <p className="text-xs text-muted-foreground">Clique em "Aplicar Template" para adicionar.</p>
        </div>
      )}

      {checklists.map((cl) => {
        const checkedCount = cl.items.filter((i) => i.checked).length;
        const totalCount = cl.items.length;
        const percent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

        return (
          <div key={cl.id} className="rounded-lg border bg-card">
            <div className="flex items-center justify-between border-b p-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{cl.template_name}</p>
                  <Badge variant="secondary" className="text-[10px]">
                    {checklistTypeLabels[cl.type]}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {checkedCount}/{totalCount} itens · {percent}% concluído
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full transition-all",
                      percent === 100 ? "bg-success" : percent > 50 ? "bg-primary" : "bg-warning"
                    )}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{percent}%</span>
              </div>
            </div>

            <div className="divide-y">
              {cl.items.map((item) => (
                <button
                  key={item.id}
                  className="flex w-full items-start gap-3 p-3 px-4 text-left transition-colors hover:bg-accent/30"
                  onClick={() => toggleItem(cl.id, item.id)}
                >
                  {item.checked ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  ) : (
                    <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm", item.checked && "text-muted-foreground line-through")}>
                      {item.text}
                    </p>
                    {item.checked && item.checked_by && (
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        ✓ {item.checked_by} · {item.checked_at && new Date(item.checked_at).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Templates disponíveis */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Templates Disponíveis</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {mockChecklistTemplates.map((t) => (
            <div key={t.id} className="rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">{t.name}</p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {checklistTypeLabels[t.type]} · {t.items.length} itens
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
