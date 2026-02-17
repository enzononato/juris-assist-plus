import { useState } from "react";
import { CalendarDays, Clock, User, Phone, Mail, MessageCircle, Plus, X, UserCheck, Pencil, Check as CheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { mockResponsaveis, type Case, type Responsavel } from "@/data/mock";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

function ScaleIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>;
}

function Info({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      {icon && <span className="mt-0.5 text-muted-foreground">{icon}</span>}
      <div>
        <span className="text-muted-foreground">{label}: </span>
        <span className="font-medium">{value}</span>
      </div>
    </div>
  );
}

interface Props {
  caso: Case;
}

export default function ProcessoResumoTab({ caso }: Props) {
  // Editable responsible & lawyer
  const [responsible, setResponsible] = useState(caso.responsible);
  const [lawyer, setLawyer] = useState(caso.lawyer);
  const [editingField, setEditingField] = useState<"responsible" | "lawyer" | null>(null);

  // Initialize linked responsáveis from caso's responsible + lawyer
  const initialLinked = [
    mockResponsaveis.find((r) => r.name === caso.responsible),
    mockResponsaveis.find((r) => r.name === caso.lawyer),
  ].filter((r): r is Responsavel => r !== undefined);

  // Deduplicate by id
  const uniqueInitial = Array.from(new Map(initialLinked.map((r) => [r.id, r])).values());

  const [linkedIds, setLinkedIds] = useState<string[]>(uniqueInitial.map((r) => r.id));
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const linkedResponsaveis = linkedIds
    .map((id) => mockResponsaveis.find((r) => r.id === id))
    .filter((r): r is Responsavel => r !== undefined);

  const availableToAdd = mockResponsaveis.filter(
    (r) => r.active && !linkedIds.includes(r.id)
  );

  const filteredAvailable = availableToAdd.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleLink = (id: string) => {
    const r = mockResponsaveis.find((r) => r.id === id);
    setLinkedIds((prev) => [...prev, id]);
    toast({ title: `${r?.name} vinculado ao processo` });
    setAddDialogOpen(false);
    setSearch("");
  };

  const confirmUnlink = () => {
    if (!removeId) return;
    const r = mockResponsaveis.find((r) => r.id === removeId);
    setLinkedIds((prev) => prev.filter((id) => id !== removeId));
    toast({ title: `${r?.name} desvinculado do processo` });
    setRemoveId(null);
  };

  const handleFieldChange = (field: "responsible" | "lawyer", value: string) => {
    if (field === "responsible") {
      setResponsible(value);
      toast({ title: `Responsável alterado para ${value}` });
    } else {
      setLawyer(value);
      toast({ title: `Advogado(a) alterado(a) para ${value}` });
    }
    setEditingField(null);
  };

  const removeTarget = mockResponsaveis.find((r) => r.id === removeId);

  // Unique names for selects
  const uniqueResponsavelNames = Array.from(new Set(mockResponsaveis.filter((r) => r.active).map((r) => r.name)));

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold">Dados do Processo</h3>
          <Info icon={<ScaleIcon />} label="Tribunal" value={caso.court} />

          {/* Responsável editável */}
          <div className="flex items-start gap-2 text-sm">
            <span className="mt-0.5 text-muted-foreground"><User className="h-4 w-4" /></span>
            <div className="flex-1">
              <span className="text-muted-foreground">Responsável: </span>
              {editingField === "responsible" ? (
                <Select value={responsible} onValueChange={(v) => handleFieldChange("responsible", v)}>
                  <SelectTrigger className="mt-1 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueResponsavelNames.map((name) => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="font-medium">
                  {responsible}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-1 h-5 w-5 text-muted-foreground hover:text-primary"
                    onClick={() => setEditingField("responsible")}
                    title="Alterar responsável"
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                </span>
              )}
            </div>
          </div>

          {/* Advogado editável */}
          <div className="flex items-start gap-2 text-sm">
            <span className="mt-0.5 text-muted-foreground"><User className="h-4 w-4" /></span>
            <div className="flex-1">
              <span className="text-muted-foreground">Advogado(a): </span>
              {editingField === "lawyer" ? (
                <Select value={lawyer} onValueChange={(v) => handleFieldChange("lawyer", v)}>
                  <SelectTrigger className="mt-1 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueResponsavelNames.map((name) => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="font-medium">
                  {lawyer}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-1 h-5 w-5 text-muted-foreground hover:text-primary"
                    onClick={() => setEditingField("lawyer")}
                    title="Alterar advogado(a)"
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                </span>
              )}
            </div>
          </div>

          <Info label="Tema" value={caso.theme} />
          {caso.amount != null && (
            <Info label="Valor da Causa" value={caso.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
          )}
          <Info label="Ajuizamento" value={new Date(caso.filed_at).toLocaleDateString("pt-BR")} />
        </div>
        <div className="space-y-4">
          {caso.next_hearing && (
            <div className="rounded-lg border bg-card p-4">
              <h3 className="mb-2 text-sm font-semibold flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" /> Próxima Audiência</h3>
              <p className="text-sm">{new Date(caso.next_hearing).toLocaleString("pt-BR")}</p>
            </div>
          )}
          {caso.next_deadline && (
            <div className="rounded-lg border bg-card p-4">
              <h3 className="mb-2 text-sm font-semibold flex items-center gap-2"><Clock className="h-4 w-4 text-warning" /> Próximo Prazo</h3>
              <p className="text-sm">{new Date(caso.next_deadline).toLocaleDateString("pt-BR")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Responsáveis vinculados */}
      <div className="mt-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-primary" />
            Responsáveis Vinculados ({linkedResponsaveis.length})
          </h3>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => setAddDialogOpen(true)}
            disabled={availableToAdd.length === 0}
          >
            <Plus className="h-3.5 w-3.5" />
            Vincular
          </Button>
        </div>

        {linkedResponsaveis.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Nenhum responsável vinculado a este processo.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {linkedResponsaveis.map((r) => (
              <div key={r.id} className="group relative rounded-xl border bg-card p-4 shadow-soft transition-all hover:shadow-card">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  onClick={() => setRemoveId(r.id)}
                  title="Desvincular responsável"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.role}</p>
                    <div className="mt-2 space-y-1">
                      <a
                        href={`tel:${r.phone.replace(/\D/g, '')}`}
                        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Phone className="h-3 w-3" />
                        {r.phone}
                      </a>
                      {r.email && (
                        <a
                          href={`mailto:${r.email}`}
                          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Mail className="h-3 w-3" />
                          {r.email}
                        </a>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {r.alerts_whatsapp && (
                        <a
                          href={`https://wa.me/55${r.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Badge className="gap-1 text-[10px] bg-success/15 text-success border-0 cursor-pointer hover:bg-success/25">
                            <MessageCircle className="h-2.5 w-2.5" /> WhatsApp
                          </Badge>
                        </a>
                      )}
                      {r.alerts_email && (
                        <Badge className="text-[10px] bg-info/15 text-info border-0">
                          <Mail className="mr-1 h-2.5 w-2.5" /> E-mail ativo
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog para vincular responsável */}
      <Dialog open={addDialogOpen} onOpenChange={(open) => { setAddDialogOpen(open); if (!open) setSearch(""); }}>
        <DialogContent className="max-h-[80vh] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Vincular Responsável</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Buscar por nome ou função..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-2"
          />
          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
            {filteredAvailable.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nenhum responsável disponível.
              </p>
            ) : (
              filteredAvailable.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleLink(r.id)}
                  className="flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left transition-all hover:bg-accent/50 hover:shadow-soft"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">{r.phone}</p>
                    {r.email && <p className="text-[10px] text-muted-foreground">{r.email}</p>}
                  </div>
                </button>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddDialogOpen(false); setSearch(""); }}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de desvinculação */}
      <AlertDialog open={!!removeId} onOpenChange={(open) => !open && setRemoveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desvincular responsável?</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja remover <strong>{removeTarget?.name}</strong> deste processo? O responsável não será excluído do sistema, apenas desvinculado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUnlink} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Desvincular
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
