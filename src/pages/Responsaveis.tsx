import { useState } from "react";
import { Plus, Phone, Bell, BellOff, Pencil, Trash2, UserCheck, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { mockCompanies, mockResponsaveis as initialResponsaveis, type Responsavel } from "@/data/mock";
import { toast } from "@/hooks/use-toast";

const emptyForm: Omit<Responsavel, "id"> = {
  name: "",
  phone: "",
  email: "",
  role: "",
  company_id: "all",
  alerts_audiencias: true,
  alerts_prazos: true,
  alerts_tarefas: true,
  alerts_whatsapp: true,
  alerts_email: true,
  active: true,
};

export default function Responsaveis() {
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>(initialResponsaveis);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Responsavel, "id">>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = responsaveis.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search) ||
      r.role.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (r: Responsavel) => {
    const { id, ...rest } = r;
    setForm(rest);
    setEditingId(id);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast({ title: "Preencha nome e telefone", variant: "destructive" });
      return;
    }
    if (editingId) {
      setResponsaveis((prev) => prev.map((r) => (r.id === editingId ? { ...form, id: editingId } : r)));
      toast({ title: "Responsável atualizado" });
    } else {
      const newR: Responsavel = { ...form, id: `r${Date.now()}` };
      setResponsaveis((prev) => [...prev, newR]);
      toast({ title: "Responsável cadastrado" });
    }
    setDialogOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    setResponsaveis((prev) => prev.filter((r) => r.id !== deleteId));
    toast({ title: "Responsável removido" });
    setDeleteId(null);
  };

  const getCompanyName = (cid: string) => {
    if (cid === "all") return "Todas as unidades";
    return mockCompanies.find((c) => c.id === cid)?.name || cid;
  };

  const activeAlerts = (r: Responsavel) => {
    const alerts: string[] = [];
    if (r.alerts_audiencias) alerts.push("Audiências");
    if (r.alerts_prazos) alerts.push("Prazos");
    if (r.alerts_tarefas) alerts.push("Tarefas");
    return alerts;
  };

  const activeChannels = (r: Responsavel) => {
    const ch: string[] = [];
    if (r.alerts_whatsapp) ch.push("WhatsApp");
    if (r.alerts_email) ch.push("E-mail");
    return ch;
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Responsáveis</h1>
          <p className="text-sm text-muted-foreground font-medium">
            <span className="text-foreground font-semibold">{filtered.length}</span> responsável(is)
          </p>
        </div>
        <Button onClick={openNew} size="sm" className="gap-2 rounded-xl shadow-glow-primary transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]" style={{ background: "var(--gradient-primary)" }}>
          <Plus className="h-4 w-4" />
          Novo Responsável
        </Button>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, telefone ou função..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11 rounded-xl border-input/60 bg-background/50 transition-all focus:border-primary focus:shadow-glow-primary/10"
          aria-label="Buscar responsáveis"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((r, index) => (
          <div key={r.id} className="group rounded-xl border bg-card p-4 shadow-soft transition-all duration-200 hover:shadow-card hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${index * 40}ms` }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <UserCheck className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{r.name}</p>
                    {!r.active && <Badge variant="secondary" className="text-[10px]">Inativo</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{r.role}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {r.phone}
                    </span>
                    {r.email && <span>{r.email}</span>}
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {getCompanyName(r.company_id)}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {activeAlerts(r).map((a) => (
                      <Badge key={a} variant="outline" className="gap-1 text-[10px]">
                        <Bell className="h-2.5 w-2.5" /> {a}
                      </Badge>
                    ))}
                    {activeAlerts(r).length === 0 && (
                      <Badge variant="secondary" className="gap-1 text-[10px]">
                        <BellOff className="h-2.5 w-2.5" /> Sem alertas
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {activeChannels(r).map((c) => (
                      <Badge key={c} className="bg-success/15 text-success text-[10px] border-0">{c}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground" onClick={() => openEdit(r)} aria-label="Editar responsável">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive" onClick={() => setDeleteId(r.id)} aria-label="Excluir responsável">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed p-12 text-center animate-in fade-in duration-300">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60">
              <UserCheck className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground">Nenhum responsável encontrado</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Tente ajustar a busca ou cadastre um novo</p>
          </div>
        )}
      </div>

      {/* Dialog de cadastro/edição */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Responsável" : "Novo Responsável"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome completo" />
            </div>
            <div>
              <Label>Telefone (WhatsApp) *</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(00) 00000-0000" />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" />
            </div>
            <div>
              <Label>Função</Label>
              <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Ex: Advogado, DP, Jurídico" />
            </div>
            <div>
              <Label>Unidade</Label>
              <Select value={form.company_id} onValueChange={(v) => setForm({ ...form, company_id: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as unidades</SelectItem>
                  {mockCompanies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border p-3">
              <p className="mb-2 text-sm font-medium">Receber alertas de:</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-normal">Audiências</Label>
                  <Switch checked={form.alerts_audiencias} onCheckedChange={(v) => setForm({ ...form, alerts_audiencias: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-normal">Prazos</Label>
                  <Switch checked={form.alerts_prazos} onCheckedChange={(v) => setForm({ ...form, alerts_prazos: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-normal">Tarefas</Label>
                  <Switch checked={form.alerts_tarefas} onCheckedChange={(v) => setForm({ ...form, alerts_tarefas: v })} />
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <p className="mb-2 text-sm font-medium">Canais de notificação:</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-normal">WhatsApp</Label>
                  <Switch checked={form.alerts_whatsapp} onCheckedChange={(v) => setForm({ ...form, alerts_whatsapp: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-normal">E-mail</Label>
                  <Switch checked={form.alerts_email} onCheckedChange={(v) => setForm({ ...form, alerts_email: v })} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-normal">Ativo</Label>
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editingId ? "Salvar" : "Cadastrar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de exclusão */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este responsável? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
